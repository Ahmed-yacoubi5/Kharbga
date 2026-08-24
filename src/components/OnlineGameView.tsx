import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { doc, onSnapshot, updateDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { 
  Player, GamePhase, Language, GameMode,
  TRANSLATIONS, LobbyData, GAME_VARIANTS
} from '../types';
import { BoardCell, CircularBoard, PlayerPieceIcon } from './BoardElements';
import { 
  getNeighbors, checkCapturesEncircle, getValidMoves, 
  getAwshPieces, checkWinAlignment, getJumpMoves 
} from '../logic/engine';
import { 
  Trophy, ArrowLeft, Sparkles, AlertTriangle, 
  WifiOff, HelpCircle, Flag, RotateCcw, ShieldAlert,
  Swords, CheckCircle, Flame
} from 'lucide-react';
import { SoundManager } from '../services/soundService';
import { StatsService } from '../services/statsService';

interface OnlineGameViewProps {
  lobby: LobbyData;
  language: Language;
  pieceAppearance: 'seashell' | 'default';
  onBack: () => void;
  onShowRules: (mode: GameMode) => void;
}

export const OnlineGameView: React.FC<OnlineGameViewProps> = ({ 
  lobby: initialLobby, language, pieceAppearance, onBack, onShowRules 
}) => {
  const t = TRANSLATIONS[language];
  const [lobby, setLobby] = useState<LobbyData>(initialLobby);
  const [selectedPiece, setSelectedPiece] = useState<number | null>(null);
  const [showGhor, setShowGhor] = useState(false);
  const [showForfeitModal, setShowForfeitModal] = useState(false);
  const [opponentInactive, setOpponentInactive] = useState(false);

  const statsRecordedRef = useRef(false);
  const previousMoveCountRef = useRef(initialLobby.moveCount);

  const myId = auth.currentUser?.uid;
  const isP1 = myId === lobby.hostId;
  const myPlayerRole: Player = isP1 ? 1 : 2;

  const opponentInfo = useMemo(() => {
    if (!lobby.players) return null;
    const entries = Object.entries(lobby.players) as [string, { name: string; isHost: boolean; lastSeen: number }][];
    const opponentEntry = entries.find(([uid, data]) => uid !== myId && Boolean(data));
    return opponentEntry && opponentEntry[1] 
      ? { uid: opponentEntry[0], name: opponentEntry[1].name, isHost: opponentEntry[1].isHost, lastSeen: opponentEntry[1].lastSeen } 
      : null;
  }, [lobby.players, myId]);
  
  const variant = GAME_VARIANTS[lobby.mode] || GAME_VARIANTS.sabouiya_standard;
  const size = variant.size;
  const centerIndex = variant.boardType === 'circular' ? 0 : Math.floor((size * size) / 2);

  const board = lobby.board;
  const currentPlayer = lobby.currentPlayer;
  const phase = lobby.phase;
  const winner = lobby.winner;

  // Real-time Lobby Subscription & Heartbeat
  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'lobbies', initialLobby.id), (snapshot) => {
      if (!snapshot.exists()) {
        onBack();
        return;
      }
      const data = { id: snapshot.id, ...snapshot.data() } as LobbyData;
      
      if (data.moveCount > previousMoveCountRef.current) {
        SoundManager.playPlace();
        previousMoveCountRef.current = data.moveCount;
      }
      
      setLobby(data);

      // Check opponent heartbeat
      if (myId && data.players) {
        const opp = Object.entries(data.players).find(([uid]) => uid !== myId);
        if (opp && opp[1]?.lastSeen) {
          const elapsed = Date.now() - opp[1].lastSeen;
          setOpponentInactive(elapsed > 35000);
        }
      }
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, `lobbies/${initialLobby.id}`);
    });

    const heartbeat = setInterval(() => {
      if (myId) {
        updateDoc(doc(db, 'lobbies', initialLobby.id), {
          [`players.${myId}.lastSeen`]: Date.now()
        }).catch(() => {});
      }
    }, 5000);

    return () => {
      unsubscribe();
      clearInterval(heartbeat);
    };
  }, [initialLobby.id, myId]);

  // Handle Win/Loss/Draw Stats Recording
  useEffect(() => {
    if (winner !== null && !statsRecordedRef.current) {
      statsRecordedRef.current = true;
      const playerName = localStorage.getItem('kharbga_player_name') || 'Player';
      
      if (winner === myPlayerRole) {
        SoundManager.playWin();
        StatsService.recordGameResult('win', playerName);
      } else {
        StatsService.recordGameResult('loss', playerName);
      }
    }
  }, [winner, myPlayerRole]);

  // Threatened (Awsh) Pieces
  const awshPieces = useMemo(() => {
    if (phase !== 'movement' || variant.capture === 'none') return [];
    return getAwshPieces(board, currentPlayer, lobby.mode);
  }, [board, currentPlayer, phase, lobby.mode, variant.capture]);

  // Valid Movement Targets
  const validMoves = useMemo(() => {
    if (phase !== 'movement' || selectedPiece === null || currentPlayer !== myPlayerRole) return [];
    const moves = getValidMoves(board, currentPlayer, lobby.mode);
    return moves.filter(m => m.from === selectedPiece).map(m => m.to);
  }, [board, currentPlayer, phase, selectedPiece, lobby.mode, myPlayerRole]);

  // Cell Click Handler (Placement & Movement)
  const handleCellClick = async (idx: number) => {
    if (winner !== null || currentPlayer !== myPlayerRole) return;

    if (phase === 'placement') {
      // Invalid placement conditions
      if (board[idx] !== null) return;
      if (variant.capture !== 'none' && idx === centerIndex) return;

      const newBoard = [...board];
      newBoard[idx] = currentPlayer;
      const newPiecesLeft = { ...lobby.piecesLeftToPlace };
      newPiecesLeft[currentPlayer] = Math.max(0, (newPiecesLeft[currentPlayer] || 0) - 1);

      // In complex modes (Khamoussiya 5x5, Sadousiya 6x6, Sabou'iya 7x7), 2 pieces are placed per turn (except 1st turn of P1)
      const isComplex = variant.size >= 5 && lobby.mode !== 'sabouiya_guettar';
      let nextPlayer: Player = currentPlayer;

      if (isComplex) {
        if (lobby.moveCount === 0) {
          // Player 1 places 1 piece on the opening turn
          nextPlayer = 2;
        } else {
          // Every subsequent turn, player places 2 pieces
          const turnStep = (lobby.moveCount + 1) % 2;
          nextPlayer = turnStep === 1 ? (currentPlayer === 1 ? 2 : 1) : currentPlayer;
        }
      } else {
        // Standard 1 piece per turn
        nextPlayer = currentPlayer === 1 ? 2 : 1;
      }

      const allPlaced = (newPiecesLeft[1] || 0) <= 0 && (newPiecesLeft[2] || 0) <= 0;

      // In 3x3 alignment modes, check if placement created 3-in-a-row
      let placementWinner: Player | null = null;
      if (variant.capture === 'none') {
        placementWinner = checkWinAlignment(newBoard, lobby.mode);
      }

      try {
        await updateDoc(doc(db, 'lobbies', lobby.id), {
          board: newBoard,
          piecesLeftToPlace: newPiecesLeft,
          currentPlayer: allPlaced ? 1 : nextPlayer,
          phase: allPlaced ? 'movement' : 'placement',
          moveCount: lobby.moveCount + 1,
          winner: placementWinner,
          status: placementWinner ? 'finished' : 'playing',
          lastMoveAt: new Date().toISOString()
        });
        SoundManager.playPlace();
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `lobbies/${lobby.id}`);
      }
    } else if (phase === 'movement') {
      if (board[idx] === currentPlayer) {
        setSelectedPiece(idx === selectedPiece ? null : idx);
      } else if (selectedPiece !== null && validMoves.includes(idx)) {
        await executeMove(selectedPiece, idx);
      }
    }
  };

  // Move Execution & Captures
  const executeMove = async (from: number, to: number) => {
    const newBoard = [...board];
    newBoard[to] = currentPlayer;
    newBoard[from] = null;
    
    let captured: number[] = [];
    if (variant.capture === 'encircle') {
      captured = checkCapturesEncircle(newBoard, to, currentPlayer, lobby.mode);
    } else if (variant.capture === 'jump') {
      if (Math.abs(from - to) > 1 && Math.abs(from - to) !== size) {
        const jumpedIdx = Math.floor((from + to) / 2);
        if (board[jumpedIdx] && board[jumpedIdx] !== currentPlayer) {
          captured = [jumpedIdx];
        }
      }
    }

    if (captured.length >= 3) {
      setShowGhor(true);
      setTimeout(() => setShowGhor(false), 2500);
      SoundManager.playCapture();
    } else if (captured.length > 0) {
      SoundManager.playCapture();
    } else {
      SoundManager.playPlace();
    }

    captured.forEach(idx => {
      newBoard[idx] = null;
    });

    const opponentRole: Player = currentPlayer === 1 ? 2 : 1;
    const opponentPiecesLeft = newBoard.filter(p => p === opponentRole).length;
    const myPiecesLeft = newBoard.filter(p => p === currentPlayer).length;

    // Check Win Conditions
    let nextWinner: Player | null = null;
    if (variant.capture === 'none') {
      nextWinner = checkWinAlignment(newBoard, lobby.mode);
    } else {
      // If opponent has <= 1 piece or no valid moves left (annihilation/stalemate)
      if (opponentPiecesLeft === 0 || (variant.size >= 5 && opponentPiecesLeft <= 1)) {
        nextWinner = currentPlayer;
      } else {
        const oppMoves = getValidMoves(newBoard, opponentRole, lobby.mode);
        if (oppMoves.length === 0) {
          nextWinner = currentPlayer;
        }
      }
    }

    // Jump capture combo rule: if jump captured and further jumps available from new position
    const hasMoreJumps = variant.capture === 'jump' && 
      captured.length > 0 && 
      getJumpMoves(newBoard, currentPlayer, to, lobby.mode).length > 0;

    const nextPlayer = hasMoreJumps ? currentPlayer : opponentRole;

    try {
      await updateDoc(doc(db, 'lobbies', lobby.id), {
        board: newBoard,
        currentPlayer: nextWinner ? currentPlayer : nextPlayer,
        moveCount: lobby.moveCount + 1,
        winner: nextWinner,
        status: nextWinner ? 'finished' : 'playing',
        lastMoveAt: new Date().toISOString()
      });
      setSelectedPiece(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `lobbies/${lobby.id}`);
    }
  };

  // Forfeit / Resign Handler
  const handleConfirmForfeit = async () => {
    setShowForfeitModal(false);
    const opponentRole: Player = myPlayerRole === 1 ? 2 : 1;
    try {
      await updateDoc(doc(db, 'lobbies', lobby.id), {
        winner: opponentRole,
        forfeitBy: myId,
        status: 'finished',
        lastMoveAt: new Date().toISOString()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `lobbies/${lobby.id}`);
    }
  };

  const p1PieceCount = board.filter(p => p === 1).length;
  const p2PieceCount = board.filter(p => p === 2).length;

  const myTurn = currentPlayer === myPlayerRole;

  return (
    <div className="min-h-screen flex flex-col items-center justify-between p-4 md:p-8 select-none">
      {/* Top Header */}
      <div className="w-full max-w-5xl flex items-center justify-between gap-4 mb-4">
        <button 
          onClick={() => setShowForfeitModal(true)} 
          className="px-4 py-2.5 rounded-2xl bg-white/90 hover:bg-white text-tunisian-red border border-tunisian-red/20 shadow-md font-bold text-sm flex items-center gap-2 transition-all hover:scale-105"
        >
          <Flag size={16} />
          <span>{t.forfeit}</span>
        </button>

        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/95 rounded-full border border-tunisian-gold/40 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-tunisian-gold animate-pulse" />
            <span className="font-serif font-black text-tunisian-dark-blue text-sm md:text-base">
              {t[variant.nameKey as keyof typeof t] || variant.nameKey}
            </span>
          </div>
          <p className="text-[11px] font-bold text-tunisian-dark-blue/60 mt-0.5">
            {phase === 'placement' ? t.placementPhase : t.movementPhase}
          </p>
        </div>

        <button 
          onClick={() => onShowRules(lobby.mode)} 
          className="p-2.5 rounded-2xl bg-white/90 text-tunisian-blue border border-tunisian-blue/20 shadow-md hover:bg-white transition-all"
          title={t.rules}
        >
          <HelpCircle size={20} />
        </button>
      </div>

      {/* Opponent Inactive Notice */}
      {opponentInactive && !winner && (
        <div className="w-full max-w-md mb-3 p-3 bg-amber-50 border-2 border-amber-400 text-amber-900 rounded-2xl flex items-center justify-between gap-2 text-xs font-bold shadow-md animate-pulse">
          <div className="flex items-center gap-2">
            <WifiOff size={16} />
            <span>{t.opponentDisconnected}</span>
          </div>
        </div>
      )}

      {/* Center Layout: Player 1, Board, Player 2 */}
      <div className="w-full max-w-5xl flex flex-col lg:flex-row items-center justify-center gap-6 my-auto">
        
        {/* Player 1 Card (Host - White / Tunisian Blue) */}
        <div className={`w-full lg:w-64 p-4 md:p-5 rounded-3xl border-4 transition-all duration-300 shadow-xl backdrop-blur-md ${
          currentPlayer === 1 
            ? 'bg-white/95 border-tunisian-blue scale-105 ring-4 ring-tunisian-blue/20' 
            : 'bg-white/70 border-tunisian-gold/30 opacity-75'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-tunisian-blue/10 border-2 border-tunisian-blue/30 flex items-center justify-center p-2 shadow-inner">
              <PlayerPieceIcon player={1} appearance={pieceAppearance} className="w-8 h-8" />
            </div>
            <div className="flex-1 truncate">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-tunisian-dark-blue text-base truncate">
                  {lobby.hostName}
                </span>
                {isP1 && (
                  <span className="text-[10px] bg-tunisian-blue text-white px-1.5 py-0.5 rounded font-bold">
                    You
                  </span>
                )}
              </div>
              <span className="text-xs font-bold text-tunisian-blue">
                Player 1 (White/Blue)
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-tunisian-dark-blue/10 flex items-center justify-between">
            <span className="text-xs font-bold text-tunisian-dark-blue/60">Pieces on Board</span>
            <span className="text-2xl font-black text-tunisian-dark-blue">{p1PieceCount}</span>
          </div>

          {phase === 'placement' && (
            <div className="mt-2 text-xs font-bold text-tunisian-blue flex justify-between">
              <span>Reserve to Place:</span>
              <span className="font-mono font-black">{lobby.piecesLeftToPlace?.[1] ?? 0}</span>
            </div>
          )}

          {currentPlayer === 1 && !winner && (
            <div className="mt-3 py-1 px-2.5 bg-tunisian-blue text-white text-center rounded-xl text-xs font-black animate-pulse flex items-center justify-center gap-1.5">
              <Sparkles size={13} /> {isP1 ? "Your Turn" : "Opponent's Turn"}
            </div>
          )}
        </div>

        {/* Board Container */}
        <div className="relative flex items-center justify-center">
          <div className="p-3 md:p-5 rounded-[2.5rem] border-8 border-tunisian-gold shadow-2xl bg-[#5D4037] relative">
            
            {/* GHOR Notification */}
            <AnimatePresence>
              {showGhor && (
                <motion.div 
                  initial={{ scale: 0, y: -20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0 }}
                  className="absolute z-30 inset-0 m-auto w-64 h-24 bg-gradient-to-r from-tunisian-red to-tunisian-dark-blue text-white rounded-3xl border-4 border-tunisian-gold flex flex-col items-center justify-center shadow-2xl"
                >
                  <Flame size={32} className="text-tunisian-gold animate-bounce" />
                  <span className="font-serif font-black text-2xl tracking-wider">GHOR! (غور)</span>
                  <span className="text-xs font-bold text-tunisian-gold">Triple Capture!</span>
                </motion.div>
              )}
            </AnimatePresence>

            {variant.boardType === 'circular' ? (
              <CircularBoard 
                board={board} 
                validMoves={validMoves} 
                selectedPiece={selectedPiece} 
                appearance={pieceAppearance}
                onCellClick={handleCellClick} 
              />
            ) : (
              <div 
                className="grid gap-[3px] bg-[#3E2723] p-[3px] rounded-2xl shadow-inner" 
                style={{ 
                  gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`, 
                  width: 'min(88vw, 480px)', 
                  height: 'min(88vw, 480px)' 
                }}
              >
                {board.map((player, i) => (
                  <BoardCell 
                    key={i} 
                    index={i} 
                    player={player} 
                    mode={lobby.mode} 
                    appearance={pieceAppearance}
                    isCenter={i === centerIndex} 
                    isValidMove={validMoves.includes(i)} 
                    isDanger={awshPieces.includes(i)} 
                    isSelected={selectedPiece === i} 
                    onClick={() => handleCellClick(i)} 
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Player 2 Card (Guest - Red / Terracotta) */}
        <div className={`w-full lg:w-64 p-4 md:p-5 rounded-3xl border-4 transition-all duration-300 shadow-xl backdrop-blur-md ${
          currentPlayer === 2 
            ? 'bg-white/95 border-tunisian-red scale-105 ring-4 ring-tunisian-red/20' 
            : 'bg-white/70 border-tunisian-gold/30 opacity-75'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-tunisian-red/10 border-2 border-tunisian-red/30 flex items-center justify-center p-2 shadow-inner">
              <PlayerPieceIcon player={2} appearance={pieceAppearance} className="w-8 h-8" />
            </div>
            <div className="flex-1 truncate">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-tunisian-dark-blue text-base truncate">
                  {opponentInfo ? (isP1 ? opponentInfo.name : lobby.players[myId]?.name || 'Player 2') : (isP1 ? "Challenger" : "You")}
                </span>
                {!isP1 && (
                  <span className="text-[10px] bg-tunisian-red text-white px-1.5 py-0.5 rounded font-bold">
                    You
                  </span>
                )}
              </div>
              <span className="text-xs font-bold text-tunisian-red">
                Player 2 (Red/Terracotta)
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-tunisian-dark-blue/10 flex items-center justify-between">
            <span className="text-xs font-bold text-tunisian-dark-blue/60">Pieces on Board</span>
            <span className="text-2xl font-black text-tunisian-dark-blue">{p2PieceCount}</span>
          </div>

          {phase === 'placement' && (
            <div className="mt-2 text-xs font-bold text-tunisian-red flex justify-between">
              <span>Reserve to Place:</span>
              <span className="font-mono font-black">{lobby.piecesLeftToPlace?.[2] ?? 0}</span>
            </div>
          )}

          {currentPlayer === 2 && !winner && (
            <div className="mt-3 py-1 px-2.5 bg-tunisian-red text-white text-center rounded-xl text-xs font-black animate-pulse flex items-center justify-center gap-1.5">
              <Sparkles size={13} /> {!isP1 ? "Your Turn" : "Opponent's Turn"}
            </div>
          )}
        </div>
      </div>

      {/* Awsh Alert Warning Banner */}
      {awshPieces.length > 0 && !winner && (
        <div className="mt-4 py-2 px-5 bg-tunisian-gold/20 border-2 border-tunisian-gold text-tunisian-dark-blue rounded-full font-black text-xs flex items-center gap-2 shadow-sm animate-pulse">
          <ShieldAlert size={16} className="text-tunisian-red" />
          <span>{t.awsh} ({awshPieces.length} pieces in danger)</span>
        </div>
      )}

      {/* Forfeit Confirmation Modal */}
      <AnimatePresence>
        {showForfeitModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <div className="bg-white rounded-3xl border-4 border-tunisian-red p-6 max-w-sm w-full text-center shadow-2xl">
              <AlertTriangle size={48} className="mx-auto mb-3 text-tunisian-red" />
              <h3 className="text-xl font-serif font-black text-tunisian-dark-blue mb-2">
                {t.forfeit}
              </h3>
              <p className="text-xs text-tunisian-dark-blue/70 mb-6 font-bold">
                {t.forfeitConfirm}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleConfirmForfeit}
                  className="flex-1 py-3 bg-tunisian-red text-white rounded-xl font-bold text-sm hover:bg-red-700 transition-all shadow"
                >
                  Yes, Forfeit
                </button>
                <button
                  onClick={() => setShowForfeitModal(false)}
                  className="flex-1 py-3 bg-tunisian-sandy/40 text-tunisian-dark-blue rounded-xl font-bold text-sm hover:bg-tunisian-sandy transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Winner / Game Over Modal */}
      <AnimatePresence>
        {winner !== null && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-tunisian-dark-blue/85 backdrop-blur-md flex items-center justify-center z-50 p-6"
          >
            <motion.div 
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white max-w-md w-full p-8 md:p-10 rounded-[2.5rem] border-8 border-tunisian-gold text-center shadow-2xl"
            >
              <div className="w-20 h-20 bg-tunisian-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy size={48} className="text-tunisian-gold" />
              </div>
              
              <h2 className="text-3xl md:text-4xl font-serif font-black text-tunisian-dark-blue mb-2">
                {winner === myPlayerRole ? "Victorious!" : "Defeat"}
              </h2>

              <p className="text-sm font-bold text-tunisian-dark-blue/70 mb-6">
                {lobby.forfeitBy 
                  ? (lobby.forfeitBy === myId ? t.youForfeited : t.opponentForfeited)
                  : (winner === myPlayerRole 
                      ? "Mastery achieved in the Medina! Match stats have been saved." 
                      : "Honorable contest! Match stats have been updated.")
                }
              </p>

              <div className="bg-tunisian-sandy/30 border border-tunisian-gold/30 rounded-2xl p-4 mb-6 flex justify-around text-xs font-bold text-tunisian-dark-blue">
                <div>
                  <span className="opacity-60 block text-[10px]">TOTAL MOVES</span>
                  <span className="text-lg font-black">{lobby.moveCount}</span>
                </div>
                <div className="w-[1px] bg-tunisian-gold/30" />
                <div>
                  <span className="opacity-60 block text-[10px]">OUTCOME</span>
                  <span className={`text-lg font-black ${winner === myPlayerRole ? 'text-green-600' : 'text-tunisian-red'}`}>
                    {winner === myPlayerRole ? '+1 Win' : '+1 Loss'}
                  </span>
                </div>
              </div>

              <button 
                onClick={onBack}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-tunisian-blue to-tunisian-dark-blue text-white font-black text-base shadow-xl hover:scale-105 active:scale-95 transition-all"
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
