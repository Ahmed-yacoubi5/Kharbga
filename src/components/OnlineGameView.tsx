import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { doc, onSnapshot, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { 
  Player, GamePhase, Language, GameMode,
  TRANSLATIONS, LobbyData, GAME_VARIANTS
} from '../types';
import { BoardCell, CircularBoard } from './BoardElements';
import { getNeighbors, checkCapturesEncircle, getValidMoves, getAwshPieces, checkWinAlignment, getJumpMoves } from '../logic/engine';
import { Trophy, ArrowLeft, RefreshCw, Sparkles, AlertTriangle, WifiOff, HelpCircle } from 'lucide-react';
import { SoundManager } from '../services/soundService';

interface OnlineGameViewProps {
  lobby: LobbyData;
  language: Language;
  onBack: () => void;
  onShowRules: (mode: GameMode) => void;
}

export const OnlineGameView: React.FC<OnlineGameViewProps> = ({ lobby: initialLobby, language, onBack, onShowRules }) => {
  const t = TRANSLATIONS[language];
  const [lobby, setLobby] = useState<LobbyData>(initialLobby);
  const [selectedPiece, setSelectedPiece] = useState<number | null>(null);
  const [showGhor, setShowGhor] = useState(false);
  const [reconnectTime, setReconnectTime] = useState<number | null>(null);

  const myId = auth.currentUser?.uid;
  const isP1 = myId === lobby.hostId;
  const myPlayerRole: Player = isP1 ? 1 : 2;
  
  const variant = GAME_VARIANTS[lobby.mode];
  const size = variant.size;
  const centerIndex = variant.boardType === 'circular' ? 0 : Math.floor((size * size) / 2);

  const board = lobby.board;
  const currentPlayer = lobby.currentPlayer;
  const phase = lobby.phase;
  const winner = lobby.winner;

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'lobbies', initialLobby.id), (snapshot) => {
      if (!snapshot.exists()) {
        onBack();
        return;
      }
      const data = { id: snapshot.id, ...snapshot.data() } as LobbyData;
      if (data.moveCount > lobby.moveCount) {
        SoundManager.playPlace();
      }
      setLobby(data);
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, `lobbies/${initialLobby.id}`);
    });

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

  const awshPieces = useMemo(() => {
    if (phase !== 'movement' || variant.capture === 'none') return [];
    return getAwshPieces(board, currentPlayer, lobby.mode);
  }, [board, currentPlayer, phase, lobby.mode, variant.capture]);

  const validMoves = useMemo(() => {
    if (phase !== 'movement' || selectedPiece === null || currentPlayer !== myPlayerRole) return [];
    const moves = getValidMoves(board, currentPlayer, lobby.mode);
    return moves.filter(m => m.from === selectedPiece).map(m => m.to);
  }, [board, currentPlayer, phase, selectedPiece, lobby.mode, myPlayerRole]);

  const handleCellClick = async (idx: number) => {
    if (winner || currentPlayer !== myPlayerRole) return;

    if (phase === 'placement') {
      if (board[idx] !== null || (variant.capture !== 'none' && idx === centerIndex)) return;

      const newBoard = [...board];
      newBoard[idx] = currentPlayer;
      const newPiecesLeft = { ...lobby.piecesLeftToPlace };
      newPiecesLeft[currentPlayer]--;

      const isComplex = variant.size >= 5 && lobby.mode !== 'sabouiya_guettar';
      const piecesPerTurn = isComplex ? 2 : 1;
      const nextCount = (lobby.moveCount + 1) % piecesPerTurn;
      const nextPlayer = nextCount === 0 ? (currentPlayer === 1 ? 2 : 1) : currentPlayer;
      const allPlaced = newPiecesLeft[1] === 0 && newPiecesLeft[2] === 0;

      await updateDoc(doc(db, 'lobbies', lobby.id), {
        board: newBoard,
        piecesLeftToPlace: newPiecesLeft,
        currentPlayer: allPlaced ? 1 : (allPlaced ? 1 : nextPlayer),
        phase: allPlaced ? 'movement' : 'placement',
        moveCount: lobby.moveCount + 1
      });
      SoundManager.playPlace();
    } else {
      if (board[idx] === currentPlayer) {
        setSelectedPiece(idx);
      } else if (selectedPiece !== null && validMoves.includes(idx)) {
        executeMove(selectedPiece, idx);
      }
    }
  };

  const executeMove = async (from: number, to: number) => {
    const newBoard = [...board];
    newBoard[to] = currentPlayer;
    newBoard[from] = null;
    
    let captured: number[] = [];
    if (variant.capture === 'encircle') {
      captured = checkCapturesEncircle(newBoard, to, currentPlayer, lobby.mode);
    } else if (variant.capture === 'jump') {
      if (Math.abs(from - to) > 1 && Math.abs(from - to) !== size) {
        captured = [(from + to) / 2];
      }
    }

    captured.forEach(idx => newBoard[idx] = null);
    const nextWinner = checkWinAlignment(newBoard, lobby.mode) || (variant.capture !== 'none' ? (newBoard.filter(p => p !== currentPlayer).length === 0 ? currentPlayer : null) : null);

    await updateDoc(doc(db, 'lobbies', lobby.id), {
      board: newBoard,
      currentPlayer: (variant.capture === 'jump' && captured.length > 0 && getJumpMoves(newBoard, currentPlayer, to, lobby.mode).length > 0) ? currentPlayer : (currentPlayer === 1 ? 2 : 1),
      moveCount: lobby.moveCount + 1,
      winner: nextWinner,
      status: nextWinner ? 'finished' : 'playing',
      lastMoveAt: serverTimestamp()
    });
    setSelectedPiece(null);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row items-center justify-center p-4 md:p-8 bg-tunisian-white/30 overflow-y-auto pt-12 pb-24">
      <div className="w-full md:w-80 h-full flex flex-col gap-6 order-2 md:order-1 mt-8 md:mt-0 md:mr-8">
        <div className="tunisian-tile p-6 border-2 border-tunisian-gold bg-white shadow-xl rounded-[2rem]">
          <div className="flex items-center justify-between mb-8">
            <button onClick={onBack} className="p-3 rounded-2xl bg-tunisian-sandy text-tunisian-dark-blue hover:bg-white transition-all shadow-md">
              <ArrowLeft size={20} />
            </button>
            <h2 className="font-serif font-black text-xl text-tunisian-red">{t[variant.nameKey as keyof typeof t]}</h2>
             <button onClick={() => onShowRules(lobby.mode)} className="p-3 rounded-2xl bg-tunisian-blue/10 text-tunisian-blue">
              <HelpCircle size={20} />
            </button>
          </div>
          <div className="space-y-6">
            <div className={`p-4 rounded-2xl border-4 transition-all ${currentPlayer === 1 ? 'border-tunisian-blue bg-tunisian-blue/5 scale-105' : 'border-transparent opacity-50'}`}>
              <span className="font-bold">{lobby.hostName}</span>
              <div className="text-3xl font-black">{board.filter(p => p === 1).length}</div>
            </div>
            <div className={`p-4 rounded-2xl border-4 transition-all ${currentPlayer === 2 ? 'border-tunisian-red bg-tunisian-red/5 scale-105' : 'border-transparent opacity-50'}`}>
              <span className="font-bold">{(Object.values(lobby.players) as any[]).find(p => p && !p.isHost)?.name || "Challenger"}</span>
              <div className="text-3xl font-black">{board.filter(p => p === 2).length}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative flex-1 flex flex-col items-center justify-center order-1 md:order-2">
        <div className="relative p-4 md:p-8 tunisian-tile border-8 border-tunisian-gold shadow-2xl bg-[#5D4037]">
          {variant.boardType === 'circular' ? (
            <CircularBoard board={board} validMoves={validMoves} selectedPiece={selectedPiece} onCellClick={handleCellClick} />
          ) : (
            <div className="grid gap-[2px] bg-tunisian-dark-blue p-[2px]" style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`, width: 'min(90vw, 600px)', height: 'min(90vw, 600px)' }}>
              {board.map((player, i) => (
                <BoardCell key={i} index={i} player={player} mode={lobby.mode} isCenter={i === centerIndex} isValidMove={validMoves.includes(i)} isDanger={awshPieces.includes(i)} isSelected={selectedPiece === i} onClick={() => handleCellClick(i)} />
              ))}
            </div>
          )}
        </div>
      </div>
      
      <AnimatePresence>
        {winner && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-tunisian-dark-blue/80 backdrop-blur-md flex items-center justify-center z-50 p-6">
            <div className="bg-tunisian-white max-w-sm w-full p-10 rounded-[3rem] border-8 border-tunisian-gold text-center">
              <Trophy size={64} className="mx-auto mb-6 text-tunisian-gold" />
              <h2 className="text-4xl font-black mb-12">{winner === myPlayerRole ? "Victorious!" : "Defeated!"}</h2>
              <button onClick={onBack} className="w-full py-4 rounded-2xl bg-tunisian-blue text-white font-bold">Back to Medina</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
