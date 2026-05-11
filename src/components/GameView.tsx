import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Player, GamePhase, Difficulty, Language, GameMode,
  TRANSLATIONS, GAME_VARIANTS
} from '../types';
import { BoardCell, CircularBoard } from './BoardElements';
import { 
  getNeighbors, checkCapturesEncircle, getValidMoves, getAwshPieces, 
  checkWinAlignment, getJumpMoves, minimax
} from '../logic/engine';
import { Trophy, ArrowLeft, RefreshCw, Sparkles, AlertTriangle, BookOpen, HelpCircle, Users, Shield } from 'lucide-react';
import { SoundManager } from '../services/soundService';

interface GameViewProps {
  difficulty: Difficulty;
  language: Language;
  onBack: () => void;
  onShowRules: (mode: GameMode) => void;
  isVsAI: boolean;
  mode: GameMode;
}

export const GameView: React.FC<GameViewProps> = ({ difficulty, language, onBack, onShowRules, isVsAI, mode }) => {
  const t = TRANSLATIONS[language];
  const variant = GAME_VARIANTS[mode];
  const size = variant.size;
  const totalPieces = variant.pieces;
  
  // Special case for Al-Tleisha: 7 points (0 center, 1-6 perimeter)
  const boardSize = mode === 'tleisha' ? 7 : size * size;
  const centerIndex = mode === 'tleisha' ? 0 : Math.floor((size * size) / 2);

  const [board, setBoard] = useState<(Player | null)[]>(Array(boardSize).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<Player>(1);
  const [phase, setPhase] = useState<GamePhase>('placement'); // All variants start with placement now
  const [piecesLeftToPlace, setPiecesLeftToPlace] = useState<{ 1: number; 2: number }>({ 
    1: totalPieces, 
    2: totalPieces 
  });
  const [placementCount, setPlacementCount] = useState(0);
  const [selectedPiece, setSelectedPiece] = useState<number | null>(null);
  const [winner, setWinner] = useState<Player | 0 | null>(null); // 0 for draw
  const [capturedCount, setCapturedCount] = useState<{ 1: number; 2: number }>({ 1: 0, 2: 0 }); // Pieces captured BY player 1/2
  
  const [moveCount, setMoveCount] = useState(0);
  const [showGhor, setShowGhor] = useState(false);
  const [isAiThinking, setIsAiThinking] = useState(false);

  const awshPieces = useMemo(() => {
    if (phase !== 'movement' || variant.capture === 'none') return [];
    return getAwshPieces(board, currentPlayer, mode);
  }, [board, currentPlayer, phase, mode, variant.capture]);

  const validMoves = useMemo(() => {
    if (phase !== 'movement' || selectedPiece === null) return [];
    const moves = getValidMoves(board, currentPlayer, mode);
    return moves.filter(m => m.from === selectedPiece).map(m => m.to);
  }, [board, currentPlayer, phase, selectedPiece, mode]);

  const checkGameEnd = useCallback((currentBoard: (Player | null)[]) => {
    // 1. Alignment check (for Class I)
    const alignWinner = checkWinAlignment(currentBoard, mode);
    if (alignWinner) return alignWinner;

    // 2. Count check (for Class II)
    if (variant.capture !== 'none' && phase === 'movement') {
      const p1Count = currentBoard.filter(p => p === 1).length;
      const p2Count = currentBoard.filter(p => p === 2).length;
      
      // Safety: Don't end game if no pieces have been placed yet (e.g. just switched to movement)
      if (p1Count === 0 && p2Count === 0) return null;

      // Minimum pieces to continue is usually 2 or 3 depending on rules, 
      // but here we check for total block
      if (p1Count === 0) return 2;
      if (p2Count === 0) return 1;

      // Mobility check
      const p1Moves = getValidMoves(currentBoard, 1, mode);
      const p2Moves = getValidMoves(currentBoard, 2, mode);
      
      // If BOTH players are blocked
      if (p1Moves.length === 0 && p2Moves.length === 0) {
        if (p1Count > p2Count) return 1;
        if (p2Count > p1Count) return 2;
        return 0; // Draw
      }

      // If only CURRENT player is blocked
      if (currentPlayer === 1 && p1Moves.length === 0) return 2;
      if (currentPlayer === 2 && p2Moves.length === 0) return 1;
    }
    return null;
  }, [phase, currentPlayer, mode, variant.capture]);

  // Game Over Effect
  useEffect(() => {
    if (winner) return;
    const result = checkGameEnd(board);
    if (result !== null) {
      setWinner(result);
      setPhase('gameOver');
      SoundManager.playWin();
    }
  }, [board, currentPlayer, phase, checkGameEnd, winner]);

  // AI Effect
  useEffect(() => {
    if (isVsAI && currentPlayer === 2 && !winner) {
      setIsAiThinking(true);
      const timer = setTimeout(() => {
        if (phase === 'placement') {
          const empty = board.map((p, i) => p === null ? i : -1).filter(i => i !== -1);
          // AI Placement - Avoid center if complex
          const filtered = variant.capture !== 'none' ? empty.filter(i => i !== centerIndex) : empty;
          const randomIdx = filtered[Math.floor(Math.random() * filtered.length)];
          if (randomIdx !== undefined) {
            executePlacement(randomIdx);
          } else {
            // No placement possible? Should not happen if placement phase is active
            setCurrentPlayer(1);
          }
        } else if (phase === 'movement') {
          // AI Movement - Minimax
          const depth = difficulty === 'hard' ? 3 : 1;
          const { move } = minimax(board, depth, true, 2, mode);
          if (move) {
            movePiece(move.from, move.to);
          } else {
            // AI is blocked but checkGameEnd didn't catch it? 
            // Force turn back or let checkGameEnd handle it
            setCurrentPlayer(1);
          }
        }
        setIsAiThinking(false);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [currentPlayer, phase, isVsAI, winner, difficulty, mode, board, centerIndex, variant.capture]);

  const handleCellClick = (index: number) => {
    if (winner) return;
    if (isVsAI && currentPlayer === 2) return;

    if (phase === 'placement') {
      executePlacement(index);
    } else {
      executeMovement(index);
    }
  };

  const executePlacement = (index: number) => {
    if (board[index] !== null) return;
    // Almost all variants keep center relative empty during placement except Class I
    if (variant.capture !== 'none' && index === centerIndex) return;

    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    const newPiecesLeft = { ...piecesLeftToPlace, [currentPlayer]: piecesLeftToPlace[currentPlayer] - 1 };
    
    SoundManager.playPlace();

    // In Class II games (except Guettar), players place 2 pieces per turn
    const isSabouiyaOrKhamoussiya = variant.size >= 5 && mode !== 'sabouiya_guettar';
    const piecesPerTurn = isSabouiyaOrKhamoussiya ? 2 : 1;

    setBoard(newBoard);
    setPiecesLeftToPlace(newPiecesLeft);

    const doneWithPlacing = newPiecesLeft[1] === 0 && newPiecesLeft[2] === 0;

    if (doneWithPlacing) {
      setPhase('movement');
      setCurrentPlayer(1);
    } else {
      const nextCount = placementCount + 1;
      if (nextCount < piecesPerTurn) {
        setPlacementCount(nextCount);
      } else {
        setPlacementCount(0);
        setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
      }
    }
  };

  const executeMovement = (index: number) => {
    if (board[index] === currentPlayer) {
      setSelectedPiece(index);
      SoundManager.playPlace();
    } else if (selectedPiece !== null && validMoves.includes(index)) {
      movePiece(selectedPiece, index);
    }
  };

  const movePiece = (from: number, to: number) => {
    const newBoard = [...board];
    newBoard[to] = currentPlayer;
    newBoard[from] = null;
    
    let captured: number[] = [];

    if (variant.capture === 'encircle') {
      captured = checkCapturesEncircle(newBoard, to, currentPlayer, mode);
      if (captured.length >= 3) {
        setShowGhor(true);
        setTimeout(() => setShowGhor(false), 2000);
      }
    } else if (variant.capture === 'jump') {
      const midIdx = (from + to) / 2;
      // In jump mode, moves can be length 1 (slide) or length 2 (jump)
      // Check if it was a jump
      if (Math.abs(from - to) > 1 && Math.abs(from - to) !== size) {
         // It's a jump
         captured = [midIdx];
      }
    }

    if (captured.length > 0) {
      SoundManager.playCapture();
      captured.forEach(idx => newBoard[idx] = null);
      setCapturedCount(prev => ({
        ...prev,
        [currentPlayer]: prev[currentPlayer] + captured.length
      }));
    } else {
      SoundManager.playPlace();
    }
    
    setBoard(newBoard);
    setSelectedPiece(null);
    setMoveCount(prev => prev + 1);
    
    // Multiple jumps logic for Khamoussiya Jump
    const canJumpAgain = variant.capture === 'jump' && captured.length > 0 && getJumpMoves(newBoard, currentPlayer, to, mode).length > 0;
    if (!canJumpAgain) {
      setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
    } else {
      setSelectedPiece(to); // Keep turn for consecutive jump
    }
  };

  const restartGame = () => {
    setBoard(Array(boardSize).fill(null));
    setCurrentPlayer(1);
    setPhase('placement');
    setPiecesLeftToPlace({ 1: totalPieces, 2: totalPieces });
    setPlacementCount(0);
    setWinner(null);
    setMoveCount(0);
    setCapturedCount({ 1: 0, 2: 0 });
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row items-center justify-center p-4 md:p-8 bg-tunisian-white/30 overflow-y-auto pt-12 pb-24">
      
      {/* Sidebar - Stats */}
      <div className="w-full md:w-80 h-full flex flex-col gap-6 order-2 md:order-1 mt-8 md:mt-0 md:mr-8">
        <div className="tunisian-tile p-6 border-2 border-tunisian-gold bg-white shadow-xl rounded-[2rem]">
          <div className="flex items-center justify-between mb-8">
            <button onClick={onBack} className="p-3 rounded-2xl bg-tunisian-sandy text-tunisian-dark-blue hover:bg-white transition-all shadow-md">
              <ArrowLeft size={20} />
            </button>
            <h2 className="font-serif font-black text-xl text-tunisian-red">{t[variant.nameKey as keyof typeof t]}</h2>
            <button 
              onClick={() => onShowRules(mode)}
              className="p-3 rounded-2xl bg-tunisian-blue/10 text-tunisian-blue hover:bg-tunisian-blue hover:text-white transition-all"
            >
              <HelpCircle size={20} />
            </button>
          </div>

          <div className="space-y-6">
            <div className={`p-4 rounded-2xl border-4 transition-all relative ${currentPlayer === 1 ? 'border-tunisian-blue bg-tunisian-blue/5 scale-105' : 'border-transparent opacity-50'}`}>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-6 h-6 rounded-full bg-tunisian-white border-2 border-tunisian-blue" />
                <span className="font-bold text-tunisian-dark-blue text-lg">Player 1</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-xs font-black text-tunisian-dark-blue/40 uppercase">On Board</span>
                  <span className="text-3xl font-black text-tunisian-dark-blue">{board.filter(p => p === 1).length}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xs font-black text-tunisian-red/40 uppercase">Captured</span>
                  <span className="text-2xl font-black text-tunisian-red">{capturedCount[1]}</span>
                </div>
              </div>
              {currentPlayer === 1 && !winner && <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-tunisian-blue rounded-full animate-ping" />}
            </div>

            <div className={`p-4 rounded-2xl border-4 transition-all relative ${currentPlayer === 2 ? 'border-tunisian-red bg-tunisian-red/5 scale-105' : 'border-transparent opacity-50'}`}>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-6 h-6 rounded-full bg-tunisian-red border-2 border-tunisian-gold" />
                <span className="font-bold text-tunisian-dark-blue text-lg">{isVsAI ? "AI Challenger" : "Player 2"}</span>
                {isAiThinking && <RefreshCw size={16} className="animate-spin text-tunisian-red" />}
              </div>
              <div className="flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-xs font-black text-tunisian-dark-blue/40 uppercase">On Board</span>
                  <span className="text-3xl font-black text-tunisian-dark-blue">{board.filter(p => p === 2).length}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xs font-black text-tunisian-blue/40 uppercase">Captured</span>
                  <span className="text-2xl font-black text-tunisian-blue">{capturedCount[2]}</span>
                </div>
              </div>
              {currentPlayer === 2 && !winner && <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-tunisian-red rounded-full animate-ping" />}
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t-2 border-tunisian-gold/20 flex flex-col gap-4">
             <div className="flex justify-between items-center text-sm font-bold text-tunisian-dark-blue/60 uppercase">
                <span>Game Mode</span>
                <span className="text-tunisian-dark-blue flex items-center gap-2">
                  {isVsAI ? <Shield size={14} /> : <Users size={14} />}
                  {isVsAI ? "AI" : "Local PvP"}
                </span>
             </div>
             <div className="flex justify-between items-center text-sm font-bold text-tunisian-dark-blue/60 uppercase">
                <span>Total Moves</span>
                <span className="text-tunisian-dark-blue">{moveCount}</span>
             </div>
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
        </AnimatePresence>

        <div className="relative p-2 md:p-8 tunisian-tile border-8 border-tunisian-gold shadow-2xl bg-[#5D4037]">
          <div 
            className="relative"
            style={{ 
              width: 'min(85vw, 600px)',
              height: 'min(85vw, 600px)'
            }}
          >
            {variant.boardType === 'circular' ? (
              <CircularBoard 
                board={board} 
                validMoves={validMoves} 
                selectedPiece={selectedPiece} 
                onCellClick={handleCellClick} 
              />
            ) : (
              <div 
                className="grid gap-[2px] bg-tunisian-dark-blue p-[2px] shadow-inner w-full h-full"
                style={{ 
                  gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
                }}
              >
                {board.map((player, i) => (
                  <BoardCell 
                    key={i}
                    index={i}
                    player={player}
                    mode={mode}
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

        <div className="mt-8 text-center bg-tunisian-white/50 px-8 py-2 rounded-full border-2 border-tunisian-gold font-bold text-tunisian-dark-blue">
            {phase === 'placement' ? t.placementPhase : (winner ? t.gameOver : t.movementPhase)}
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
              <h2 className="text-4xl font-serif font-black text-tunisian-dark-blue mt-12 mb-2">
                {winner === 0 ? t.draw : `${t.winner}!`}
              </h2>
              <p className="text-2xl font-bold text-tunisian-red mb-12">
                {winner === 1 ? "Player 1 Wins!" : (winner === 2 ? (isVsAI ? "AI Wins!" : "Player 2 Wins!") : t.stalemate)}
              </p>
              
              <div className="flex flex-col gap-4">
                <button 
                  onClick={restartGame}
                  className="w-full py-4 rounded-2xl bg-tunisian-blue text-white font-bold flex items-center justify-center gap-2 shadow-lg"
                >
                  <RefreshCw size={20} /> {t.restart}
                </button>
                <button 
                  onClick={onBack}
                  className="w-full py-4 rounded-2xl border-4 border-tunisian-blue text-tunisian-blue font-bold font-serif"
                >
                  {t.home}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
