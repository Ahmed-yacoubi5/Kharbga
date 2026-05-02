import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { doc, onSnapshot, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { 
  Player, GamePhase, Language, BoardSize, GameMode,
  TRANSLATIONS, getCenterIndex, getPiecesPerPlayer, LobbyData
} from '../types';
import { Cell } from './BoardElements';
import { getNeighbors, checkCaptures, getValidMoves, getAwshPieces } from '../logic/engine';
import { Trophy, ArrowLeft, RefreshCw, Sparkles, AlertTriangle, Clock, WifiOff } from 'lucide-react';
import { SoundManager } from '../services/soundService';

interface OnlineGameViewProps {
  lobby: LobbyData;
  language: Language;
  onBack: () => void;
}

export const OnlineGameView: React.FC<OnlineGameViewProps> = ({ lobby: initialLobby, language, onBack }) => {
  const t = TRANSLATIONS[language];
  const [lobby, setLobby] = useState<LobbyData>(initialLobby);
  const [selectedPiece, setSelectedPiece] = useState<number | null>(null);
  const [showGhor, setShowGhor] = useState(false);
  const [mzaqraMove, setMzaqraMove] = useState(false);
  const [reconnectTime, setReconnectTime] = useState<number | null>(null);

  const myId = auth.currentUser?.uid;
  const isP1 = myId === lobby.hostId;
  const myPlayerRole: Player = isP1 ? 1 : 2;
  const size = lobby.mode === 'khamoussiya' ? 5 : 7;
  const centerIndex = getCenterIndex(size);

  const board = lobby.board;
  const currentPlayer = lobby.currentPlayer;
  const phase = lobby.phase;
  const winner = lobby.winner;

  // Sync with Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'lobbies', initialLobby.id), (snapshot) => {
      if (!snapshot.exists()) {
        onBack();
        return;
      }
      const data = { id: snapshot.id, ...snapshot.data() } as LobbyData;
      
      // Sound feedback on remote moves
      if (data.moveCount > lobby.moveCount) {
        SoundManager.playPlace();
      }

      setLobby(data);

      // Check for reconnection timer
      const now = Date.now();
      const opponentId = isP1 ? Object.keys(data.players || {}).find(id => id !== myId) : data.hostId;
      const opponent = opponentId ? data.players[opponentId] : null;
      
      if (opponent && now - (opponent.lastSeen || 0) > 5000 && data.status === 'playing' && !data.winner) {
        // Start reconnection countdown if not already there
        if (!data.reconnectUntil) {
           const until = new Date(now + 30000).toISOString();
           updateDoc(doc(db, 'lobbies', initialLobby.id), { reconnectUntil: until });
        }
      } else if (data.reconnectUntil && opponent && now - (opponent.lastSeen || 0) < 5000) {
          updateDoc(doc(db, 'lobbies', initialLobby.id), { reconnectUntil: null });
      }

    }, (err) => {
      handleFirestoreError(err, OperationType.GET, `lobbies/${initialLobby.id}`);
    });

    // Heartbeat
    const heartbeat = setInterval(() => {
      if (myId) {
        updateDoc(doc(db, 'lobbies', initialLobby.id), {
          [`players.${myId}.lastSeen`]: Date.now()
        });
      }
    }, 3000);

    return () => {
      unsubscribe();
      clearInterval(heartbeat);
    };
  }, [initialLobby.id, myId, isP1, lobby.moveCount]);

  // Handle reconnection timeout
  useEffect(() => {
    if (lobby.reconnectUntil && !lobby.winner) {
      const timer = setInterval(() => {
        const diff = new Date(lobby.reconnectUntil!).getTime() - Date.now();
        if (diff <= 0) {
          // Opponent lost by timeout
          updateDoc(doc(db, 'lobbies', lobby.id), { 
            winner: myPlayerRole === 1 ? 1 : 2,
            status: 'finished'
          });
          clearInterval(timer);
        } else {
          setReconnectTime(Math.ceil(diff / 1000));
        }
      }, 1000);
      return () => clearInterval(timer);
    } else {
      setReconnectTime(null);
    }
  }, [lobby.reconnectUntil, lobby.winner, lobby.id, myPlayerRole]);

  const awshPieces = useMemo(() => {
    if (phase !== 'movement') return [];
    return getAwshPieces(board, currentPlayer, size);
  }, [board, currentPlayer, phase, size]);

  const validMoves = useMemo(() => {
    if (phase !== 'movement' || selectedPiece === null) return [];
    return getNeighbors(selectedPiece, size).filter(idx => board[idx] === null);
  }, [board, phase, selectedPiece, size]);

  const checkWinCondition = (currentBoard: (Player | null)[]) => {
    const p1Count = currentBoard.filter(p => p === 1).length;
    const p2Count = currentBoard.filter(p => p === 2).length;
    
    if (phase === 'movement') {
      if (p1Count === 0) return 2;
      if (p2Count === 0) return 1;
      
      const p1Moves = getValidMoves(currentBoard, 1, size).length;
      const p2Moves = getValidMoves(currentBoard, 2, size).length;
      if (currentPlayer === 1 && p1Moves === 0) return 2;
      if (currentPlayer === 2 && p2Moves === 0) return 1;
    }
    return null;
  };

  const handleCellClick = async (idx: number) => {
    if (winner || currentPlayer !== myPlayerRole) return;

    if (phase === 'placement') {
      if (board[idx] !== null || idx === centerIndex) return;

      const newBoard = [...board];
      newBoard[idx] = currentPlayer;
      
      const newPiecesLeft = { ...lobby.piecesLeftToPlace };
      newPiecesLeft[currentPlayer]--;

      const nextPlacementCount = (lobby.moveCount + 1) % 2;
      const nextPlayer = nextPlacementCount === 0 ? (currentPlayer === 1 ? 2 : 1) : currentPlayer;
      
      const allPlaced = newPiecesLeft[1] === 0 && newPiecesLeft[2] === 0;

      try {
        await updateDoc(doc(db, 'lobbies', lobby.id), {
          board: newBoard,
          piecesLeftToPlace: newPiecesLeft,
          currentPlayer: allPlaced ? 1 : nextPlayer,
          phase: allPlaced ? 'movement' : 'placement',
          moveCount: lobby.moveCount + 1
        });
        SoundManager.playPlace();
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `lobbies/${lobby.id}`);
      }
    } else {
      // Movement Phase
      if (selectedPiece === null) {
        if (board[idx] === currentPlayer) {
          setSelectedPiece(idx);
          SoundManager.playSelect();
        }
      } else {
        if (validMoves.includes(idx)) {
          executeMove(selectedPiece, idx);
        } else if (board[idx] === currentPlayer) {
          setSelectedPiece(idx);
          SoundManager.playSelect();
        } else {
          setSelectedPiece(null);
        }
      }
    }
  };

  const executeMove = async (from: number, to: number) => {
    const newBoard = [...board];
    newBoard[to] = currentPlayer;
    newBoard[from] = null;
    
    const captured = checkCaptures(newBoard, to, currentPlayer, size);
    
    if (lobby.mode === 'khamoussiya' && captured.length >= 3) {
      setShowGhor(true);
      setTimeout(() => setShowGhor(false), 2000);
    }
    
    if (lobby.mode === 'sabouiya' && captured.length === 0) {
      setMzaqraMove(true);
      setTimeout(() => setMzaqraMove(false), 2000);
    }

    captured.forEach(idx => newBoard[idx] = null);
    
    const nextWinner = checkWinCondition(newBoard);

    try {
      await updateDoc(doc(db, 'lobbies', lobby.id), {
        board: newBoard,
        currentPlayer: captured.length > 0 ? currentPlayer : (currentPlayer === 1 ? 2 : 1),
        moveCount: lobby.moveCount + 1,
        winner: nextWinner,
        status: nextWinner ? 'finished' : 'playing',
        lastMoveAt: serverTimestamp()
      });
      setSelectedPiece(null);
      if (captured.length > 0) SoundManager.playCapture();
      else SoundManager.playPlace();
    } catch (err) {
       handleFirestoreError(err, OperationType.UPDATE, `lobbies/${lobby.id}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row items-center justify-center p-4 md:p-8 bg-[#E5D5B8]/30 overflow-y-auto pt-12 pb-24">
      
      {/* Sidebar - Stats */}
      <div className="w-full md:w-80 h-full flex flex-col gap-6 order-2 md:order-1 mt-8 md:mt-0 md:mr-8">
        <div className="tunisian-tile p-6 border-2 border-tunisian-gold bg-white shadow-xl rounded-[2rem]">
          <div className="flex items-center justify-between mb-8">
            <button onClick={onBack} className="p-3 rounded-2xl bg-tunisian-sandy text-tunisian-dark-blue hover:bg-white transition-all shadow-md">
              <ArrowLeft size={20} />
            </button>
            <h2 className="font-serif font-black text-2xl text-tunisian-red">{lobby.mode === 'khamoussiya' ? t.khamoussiyaName : t.classicName}</h2>
          </div>

          <div className="space-y-6">
            <div className={`p-4 rounded-2xl border-4 transition-all ${currentPlayer === 1 ? 'border-tunisian-blue bg-tunisian-blue/5 scale-105' : 'border-transparent opacity-50'}`}>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-6 h-6 rounded-full bg-tunisian-white border-2 border-tunisian-blue" />
                <span className="font-bold text-tunisian-dark-blue text-lg">
                  {lobby.hostName} {isP1 && "(You)"}
                </span>
              </div>
              <div className="flex justify-between items-end">
                <span className="text-3xl font-black text-tunisian-dark-blue">{board.filter(p => p === 1).length}</span>
              </div>
            </div>

            <div className={`p-4 rounded-2xl border-4 transition-all ${currentPlayer === 2 ? 'border-tunisian-red bg-tunisian-red/5 scale-105' : 'border-transparent opacity-50'}`}>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-6 h-6 rounded-full bg-tunisian-red border-2 border-tunisian-gold" />
                <span className="font-bold text-tunisian-dark-blue text-lg">
                   {(Object.values(lobby.players) as any[]).find(p => p && !p.isHost)?.name || "Challenger"} {!isP1 && "(You)"}
                </span>
              </div>
              <div className="flex justify-between items-end">
                <span className="text-3xl font-black text-tunisian-dark-blue">{board.filter(p => p === 2).length}</span>
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t-2 border-tunisian-gold/20 flex flex-col gap-4">
             <div className="flex justify-between items-center text-sm font-bold text-tunisian-dark-blue/60 uppercase">
                <span>{t.moves}</span>
                <span className="text-tunisian-dark-blue">{lobby.moveCount}</span>
             </div>
             
             {reconnectTime !== null && (
               <div className="p-4 bg-tunisian-red/10 rounded-2xl flex flex-col items-center gap-2">
                  <WifiOff size={24} className="text-tunisian-red animate-pulse" />
                  <p className="text-xs font-black text-tunisian-red uppercase">{t.reconnecting}</p>
                  <p className="text-2xl font-black text-tunisian-red">{reconnectTime}s</p>
               </div>
             )}
          </div>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="relative flex-1 flex flex-col items-center justify-center order-1 md:order-2">
        <AnimatePresence mode="popLayout">
           {showGhor && (
             <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1.2 }} exit={{ opacity: 0, scale: 2 }} className="ghor-burst z-50 text-tunisian-gold flex flex-col items-center animate-bounce pt-8">
                <Sparkles size={120} />
                <h1 className="text-6xl font-serif font-black text-tunisian-red drop-shadow-xl">{t.ghor}</h1>
             </motion.div>
           )}
           {awshPieces.length > 0 && !winner && (
             <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute top-0 flex items-center gap-2 px-6 py-2 bg-tunisian-gold rounded-full text-white font-black shadow-lg shadow-tunisian-gold/30 z-20">
                <AlertTriangle size={20} />
                <span>{t.awsh}</span>
             </motion.div>
           )}
           {currentPlayer === myPlayerRole && !winner && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute top-[-40px] px-4 py-1 bg-tunisian-blue text-white rounded-full font-black text-xs uppercase tracking-widest">
                 Your Turn
              </motion.div>
           )}
        </AnimatePresence>

        <div className="relative p-4 md:p-8 tunisian-tile border-8 border-tunisian-gold shadow-2xl bg-[#5D4037]">
          <div 
            className="grid gap-[2px] bg-tunisian-dark-blue p-[2px] shadow-inner"
            style={{ 
              gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
              width: 'min(90vw, 600px)',
              height: 'min(90vw, 600px)'
            }}
          >
            {board.map((player, i) => (
              <Cell 
                key={i}
                index={i}
                player={player}
                isCenter={i === centerIndex}
                isValidMove={validMoves.includes(i)}
                isDanger={awshPieces.includes(i)}
                onClick={() => handleCellClick(i)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Winner Modal */}
      <AnimatePresence>
        {winner && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-tunisian-dark-blue/80 backdrop-blur-md flex items-center justify-center z-50 p-6">
            <motion.div initial={{ scale: 0.5, y: 100 }} animate={{ scale: 1, y: 0 }} className="bg-tunisian-white max-w-sm w-full p-10 rounded-[3rem] border-8 border-tunisian-gold text-center relative">
              <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-32 h-32 bg-tunisian-gold rounded-full border-8 border-tunisian-white flex items-center justify-center text-white shadow-2xl">
                <Trophy size={64} />
              </div>
              <h2 className="text-4xl font-serif font-black text-tunisian-dark-blue mt-12 mb-2">{t.winner}!</h2>
              <p className="text-2xl font-bold text-tunisian-red mb-12">
                {winner === myPlayerRole ? "Victorious!" : "Defeated!"}
              </p>
              
              <button 
                onClick={onBack}
                className="w-full py-4 rounded-2xl border-4 border-tunisian-blue text-tunisian-blue font-bold font-serif"
              >
                Back to Medina
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
