
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Player, GamePhase, Difficulty, Language, BoardSize, GameMode,
  TRANSLATIONS, getCenterIndex, getPiecesPerPlayer
} from '../types';
import { Cell } from './BoardElements';
import { getNeighbors, checkCaptures, getValidMoves, minimax, getAwshPieces } from '../logic/engine';
import { Trophy, ArrowLeft, RefreshCw, Sparkles, AlertTriangle } from 'lucide-react';
import { SoundManager } from '../services/soundService';

interface GameViewProps {
  difficulty: Difficulty;
  language: Language;
  onBack: () => void;
  isVsAI: boolean;
  size: BoardSize;
  mode: GameMode;
}

export const GameView: React.FC<GameViewProps> = ({ difficulty, language, onBack, isVsAI, size, mode }) => {
  const t = TRANSLATIONS[language];
  const centerIndex = getCenterIndex(size);
  const totalPieces = getPiecesPerPlayer(size);
  
  const [board, setBoard] = useState<(Player | null)[]>(Array(size * size).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<Player>(1);
  const [phase, setPhase] = useState<GamePhase>('placement');
  const [piecesLeftToPlace, setPiecesLeftToPlace] = useState<{ 1: number; 2: number }>({ 
    1: totalPieces, 
    2: totalPieces 
  });
  const [placementCount, setPlacementCount] = useState(0);
  const [selectedPiece, setSelectedPiece] = useState<number | null>(null);
  const [winner, setWinner] = useState<Player | null>(null);
  
  // Stats
  const [moveCount, setMoveCount] = useState(0);
  const [showGhor, setShowGhor] = useState(false);
  const [mzaqraMove, setMzaqraMove] = useState(false);
  
  // Awsh detection
  const awshPieces = useMemo(() => {
    if (phase !== 'movement') return [];
    return getAwshPieces(board, currentPlayer, size);
  }, [board, currentPlayer, phase, size]);

  const validMoves = useMemo(() => {
    if (phase !== 'movement' || selectedPiece === null) return [];
    return getNeighbors(selectedPiece, size).filter(idx => board[idx] === null);
  }, [board, phase, selectedPiece, size]);

  const complexityLevel = useMemo(() => {
    if (phase === 'placement') return 5;
    const mobility = getValidMoves(board, 1, size).length + getValidMoves(board, 2, size).length;
    return Math.min(100, moveCount + mobility * 2);
  }, [board, moveCount, phase, size]);

  const checkWinCondition = useCallback((currentBoard: (Player | null)[]) => {
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
  }, [phase, currentPlayer, size]);

  const handleCellClick = (index: number, isAIAction = false) => {
    if (winner) return;
    if (isVsAI && currentPlayer === 2 && !isAIAction) return;

    if (phase === 'placement') {
      if (index === centerIndex || board[index] !== null) return;
      if (piecesLeftToPlace[currentPlayer] <= 0) return;

      const newBoard = [...board];
      newBoard[index] = currentPlayer;
      
      const newPiecesLeft = { ...piecesLeftToPlace, [currentPlayer]: piecesLeftToPlace[currentPlayer] - 1 };
      
      SoundManager.playPlace();

      if (placementCount === 1 || (newPiecesLeft[1] === 0 && newPiecesLeft[2] === 0)) {
        setPlacementCount(0);
        setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
      } else {
        setPlacementCount(1);
      }

      setBoard(newBoard);
      setPiecesLeftToPlace(newPiecesLeft);

      if (newPiecesLeft[1] === 0 && newPiecesLeft[2] === 0) {
        setPhase('movement');
      }
    } else if (phase === 'movement') {
      if (board[index] === currentPlayer) {
        setSelectedPiece(index);
      } else if (selectedPiece !== null && validMoves.includes(index)) {
        movePiece(selectedPiece, index);
      }
    }
  };

  const movePiece = (from: number, to: number) => {
    const newBoard = [...board];
    newBoard[to] = currentPlayer;
    newBoard[from] = null;
    
    const captured = checkCaptures(newBoard, to, currentPlayer, size);
    
    // Al-Khamoussiya Ghor detection (capturing 3)
    if (mode === 'khamoussiya' && captured.length >= 3) {
      setShowGhor(true);
      setTimeout(() => setShowGhor(false), 2000);
    }
    
    // Al-Sabou'iya Mzaqra detection (no captures)
    if (mode === 'sabouiya' && captured.length === 0) {
      setMzaqraMove(true);
      setTimeout(() => setMzaqraMove(false), 2000);
    }

    if (captured.length > 0) {
      SoundManager.playCapture();
      captured.forEach(idx => newBoard[idx] = null);
    } else {
      SoundManager.playPlace();
    }
    
    setBoard(newBoard);
    setSelectedPiece(null);
    setMoveCount(prev => prev + 1);
    
    const win = checkWinCondition(newBoard);
    if (win) {
      SoundManager.playWin();
      setWinner(win);
      setPhase('gameOver');
    } else {
      setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
    }
  };

  useEffect(() => {
    if (isVsAI && currentPlayer === 2 && !winner) {
      const timeout = setTimeout(() => {
        if (phase === 'placement') {
          const emptyIndices = board.map((p, i) => (p === null && i !== centerIndex) ? i : null).filter(i => i !== null) as number[];
          if (emptyIndices.length > 0) {
            const idx = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
            handleCellClick(idx, true);
          }
        } else if (phase === 'movement') {
          const depth = difficulty === 'easy' ? 1 : 2;
          const result = minimax(board, depth, -Infinity, Infinity, true, 2, size);
          if (result.move) {
            movePiece(result.move.from, result.move.to);
          } else {
            setWinner(1);
          }
        }
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [currentPlayer, phase, winner, isVsAI, difficulty, size, placementCount]);

  return (
    <div className="min-h-screen flex flex-col md:flex-row items-center justify-center p-4 md:p-8 bg-[#E5D5B8]/30 overflow-y-auto pt-12 pb-24">
      
      {/* Sidebar - Stats */}
      <div className="w-full md:w-80 h-full flex flex-col gap-6 order-2 md:order-1 mt-8 md:mt-0 md:mr-8">
        <div className="tunisian-tile p-6 border-2 border-tunisian-gold bg-white shadow-xl rounded-[2rem]">
          <div className="flex items-center justify-between mb-8">
            <button onClick={onBack} className="p-3 rounded-2xl bg-tunisian-sandy text-tunisian-dark-blue hover:bg-white transition-all shadow-md">
              <ArrowLeft size={20} />
            </button>
            <h2 className="font-serif font-black text-2xl text-tunisian-red">{mode === 'khamoussiya' ? t.khamoussiyaName : t.classicName}</h2>
          </div>

          <div className="space-y-6">
            {/* Player 1 Card */}
            <div className={`p-4 rounded-2xl border-4 transition-all ${currentPlayer === 1 ? 'border-tunisian-blue bg-tunisian-blue/5 scale-105' : 'border-transparent opacity-50'}`}>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-6 h-6 rounded-full bg-tunisian-white border-2 border-tunisian-blue" />
                <span className="font-bold text-tunisian-dark-blue text-lg">{t.turn} {language === 'ar' ? "1" : "1"}</span>
              </div>
              <div className="flex justify-between items-end">
                <span className="text-3xl font-black text-tunisian-dark-blue">{board.filter(p => p === 1).length}</span>
                {phase === 'placement' && <span className="text-xs font-bold text-tunisian-blue">{piecesLeftToPlace[1]} left</span>}
              </div>
            </div>

            {/* Player 2 Card */}
            <div className={`p-4 rounded-2xl border-4 transition-all ${currentPlayer === 2 ? 'border-tunisian-red bg-tunisian-red/5 scale-105' : 'border-transparent opacity-50'}`}>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-6 h-6 rounded-full bg-tunisian-red border-2 border-tunisian-gold" />
                <span className="font-bold text-tunisian-dark-blue text-lg">{isVsAI ? "AI" : (t.turn + " 2")}</span>
              </div>
              <div className="flex justify-between items-end">
                <span className="text-3xl font-black text-tunisian-dark-blue">{board.filter(p => p === 2).length}</span>
                {phase === 'placement' && <span className="text-xs font-bold text-tunisian-red">{piecesLeftToPlace[2]} left</span>}
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t-2 border-tunisian-gold/20 flex flex-col gap-4">
             <div className="flex justify-between items-center text-sm font-bold text-tunisian-dark-blue/60 uppercase">
                <span>{t.moves}</span>
                <span className="text-tunisian-dark-blue">{moveCount}</span>
             </div>
             <div>
                <div className="flex justify-between items-center text-[10px] font-bold text-tunisian-dark-blue/60 uppercase mb-2">
                  <span>{t.complexity}</span>
                  <span>{complexityLevel}%</span>
                </div>
                <div className="w-full h-2 bg-tunisian-sandy rounded-full overflow-hidden">
                   <motion.div 
                     animate={{ width: `${complexityLevel}%` }}
                     className="h-full bg-tunisian-gold" 
                   />
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="relative flex-1 flex flex-col items-center justify-center order-1 md:order-2">
        <AnimatePresence mode="popLayout">
           {showGhor && (
             <motion.div 
               initial={{ opacity: 0, scale: 0.5 }}
               animate={{ opacity: 1, scale: 1.2 }}
               exit={{ opacity: 0, scale: 2 }}
               className="ghor-burst z-50 text-tunisian-gold flex flex-col items-center animate-bounce pt-8"
             >
                <Sparkles size={120} />
                <h1 className="text-6xl font-serif font-black text-tunisian-red drop-shadow-xl">{t.ghor}</h1>
             </motion.div>
           )}
           {awshPieces.length > 0 && !winner && (
             <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0 }}
               className="absolute top-0 flex items-center gap-2 px-6 py-2 bg-tunisian-gold rounded-full text-white font-black shadow-lg shadow-tunisian-gold/30 z-20"
             >
                <AlertTriangle size={20} />
                <span>{t.awsh}</span>
             </motion.div>
           )}
           {mzaqraMove && (
             <motion.div 
               initial={{ opacity: 0, scale: 0.8 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0 }}
               className="absolute bottom-[-60px] flex items-center gap-2 text-tunisian-olive font-black text-xl"
             >
                <span>{t.mzaqra}</span>
             </motion.div>
           )}
        </AnimatePresence>

        <div className="relative p-4 md:p-8 tunisian-tile border-8 border-tunisian-gold shadow-2xl bg-[#5D4037]">
          {/* Board Grid */}
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

        <div className="mt-8 text-center bg-tunisian-white/50 px-8 py-2 rounded-full border-2 border-tunisian-gold font-bold text-tunisian-dark-blue">
            {phase === 'placement' ? t.placementPhase : t.movementPhase}
        </div>
      </div>

      {/* Winner Modal */}
      <AnimatePresence>
        {winner && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-tunisian-dark-blue/80 backdrop-blur-md flex items-center justify-center z-50 p-6"
          >
            <motion.div 
              initial={{ scale: 0.5, y: 100 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-tunisian-white max-w-sm w-full p-10 rounded-[3rem] border-8 border-tunisian-gold text-center relative"
            >
              <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-32 h-32 bg-tunisian-gold rounded-full border-8 border-tunisian-white flex items-center justify-center text-white shadow-2xl">
                <Trophy size={64} />
              </div>
              <h2 className="text-4xl font-serif font-black text-tunisian-dark-blue mt-12 mb-2">{t.winner}!</h2>
              <p className="text-2xl font-bold text-tunisian-red mb-12">
                {winner === 1 ? (language === 'ar' ? "مبروك! اللاعب 1" : "Player 1 Wins!") : (isVsAI ? "AI Defeated You!" : "Player 2 Wins!")}
              </p>
              
              <div className="flex flex-col gap-4">
                <button 
                  onClick={() => window.location.reload()}
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
