
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Player, GameState, GamePhase, Difficulty, Language, BoardSize,
  TRANSLATIONS, getCenterIndex, getPiecesPerPlayer
} from '../types';
import { Cell } from './BoardElements';
import { getNeighbors, checkCaptures, getValidMoves, minimax } from '../logic/engine';
import { Trophy, RefreshCw, Undo2, ArrowLeft, Settings as SettingsIcon, Info } from 'lucide-react';
import { SoundManager } from '../services/soundService';

interface GameViewProps {
  difficulty: Difficulty;
  language: Language;
  onBack: () => void;
  isVsAI: boolean;
  size: BoardSize;
}

export const GameView: React.FC<GameViewProps> = ({ difficulty, language, onBack, isVsAI, size }) => {
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
  const [placementCount, setPlacementCount] = useState(0); // 0 or 1 for current turn's placements
  const [selectedPiece, setSelectedPiece] = useState<number | null>(null);
  const [winner, setWinner] = useState<Player | null>(null);

  const validMoves = useMemo(() => {
    if (phase !== 'movement' || selectedPiece === null) return [];
    return getNeighbors(selectedPiece, size).filter(idx => board[idx] === null);
  }, [board, phase, selectedPiece, size]);

  const checkWinCondition = useCallback((currentBoard: (Player | null)[]) => {
    const p1Count = currentBoard.filter(p => p === 1).length;
    const p2Count = currentBoard.filter(p => p === 2).length;
    
    if (phase === 'movement') {
      if (p1Count === 0) return 2;
      if (p2Count === 0) return 1;
      
      // Check if current player is blocked
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
        // Switch turn after 2 placements
        setPlacementCount(0);
        setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
      } else {
        setPlacementCount(1);
      }

      setBoard(newBoard);
      setPiecesLeftToPlace(newPiecesLeft);

      // Check if all pieces placed
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
    if (captured.length > 0) {
      SoundManager.playCapture();
      captured.forEach(idx => newBoard[idx] = null);
    } else {
      SoundManager.playPlace();
    }
    
    setBoard(newBoard);
    setSelectedPiece(null);
    
    const win = checkWinCondition(newBoard);
    if (win) {
      SoundManager.playWin();
      setWinner(win);
      setPhase('gameOver');
    } else {
      setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
    }
  };

  // AI Turn
  useEffect(() => {
    if (isVsAI && currentPlayer === 2 && !winner) {
      const timeout = setTimeout(() => {
        if (phase === 'placement') {
          // AI Placement - Simple Random valid placement
          const emptyIndices = board.map((p, i) => (p === null && i !== centerIndex) ? i : null).filter(i => i !== null) as number[];
          if (emptyIndices.length > 0) {
            const idx = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
            handleCellClick(idx, true);
          }
        } else if (phase === 'movement') {
          // AI Minimax Movement
          const depth = difficulty === 'easy' ? (size === 7 ? 1 : 2) : (size === 7 ? 2 : 4);
          const result = minimax(board, depth, -Infinity, Infinity, true, 2, size);
          if (result.move) {
            movePiece(result.move.from, result.move.to);
          } else {
            // No moves available
            setWinner(1);
          }
        }
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [currentPlayer, phase, board, isVsAI, winner, difficulty, size, centerIndex]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 max-w-lg mx-auto">
      {/* Header Info */}
      <div className="w-full flex justify-between items-center mb-6 px-2">
        <button onClick={onBack} className="p-2 rounded-full bg-white/50 shadow-sm border border-[#e6d5b8]">
          <ArrowLeft size={24} />
        </button>
        <div className="text-center font-bold text-xl text-[#4A2C2A] font-serif">
          {winner ? `🏆 ${t.winner}: ${winner === 1 ? t.title : "AI"}` : `${t.turn}: ${currentPlayer === 1 ? t.title : (isVsAI ? "AI" : t.title + " 2")}`}
        </div>
        <div className="flex gap-2">
            <button className="p-2 rounded-full bg-white/50 shadow-sm border border-[#e6d5b8]">
              <Undo2 size={24} className="opacity-50" />
            </button>
        </div>
      </div>

      {/* Game Phase Indicator */}
      <div className="mb-4 text-sm font-medium text-[#9c4221] bg-[#9c4221]/5 px-4 py-1 rounded-full border border-[#9c4221]/20">
        {phase === 'placement' ? t.placementPhase : t.movementPhase}
      </div>

      {/* Board */}
      <div 
        className="grid gap-1 w-full aspect-square bg-[#9c4221]/10 p-2 rounded-lg shadow-2xl border-4 border-[#4A2C2A]"
        style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
      >
        {board.map((player, i) => (
          <Cell 
            key={i}
            index={i}
            player={player}
            isCenter={i === centerIndex}
            isValidMove={validMoves.includes(i)}
            onClick={() => handleCellClick(i)}
          />
        ))}
      </div>

      {/* Player Stats / Pieces Left */}
      <div className="w-full mt-8 grid grid-cols-2 gap-4">
        <div className={`p-4 rounded-xl border-2 transition-all ${currentPlayer === 1 ? 'border-[#d97706] bg-[#d97706]/5 scale-105' : 'border-transparent bg-white/50'}`}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-4 h-4 rounded-full bg-[#d97706]" />
            <span className="font-bold text-[#4A2C2A]">{language === 'ar' ? "اللاعب 1" : "Player 1"}</span>
          </div>
          {phase === 'placement' && (
            <div className="text-xs text-[#9c4221]">{piecesLeftToPlace[1]} pieces left</div>
          )}
          <div className="text-2xl font-bold">{board.filter(p => p === 1).length}</div>
        </div>
        <div className={`p-4 rounded-xl border-2 transition-all ${currentPlayer === 2 ? 'border-[#1e40af] bg-[#1e40af]/5 scale-105' : 'border-transparent bg-white/50'}`}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-4 h-4 rounded-full bg-[#1e40af]" />
            <span className="font-bold text-[#4A2C2A]">{isVsAI ? "AI Opponent" : (language === 'ar' ? "اللاعب 2" : "Player 2")}</span>
          </div>
          {phase === 'placement' && (
            <div className="text-xs text-[#1e40af]">{piecesLeftToPlace[2]} pieces left</div>
          )}
          <div className="text-2xl font-bold">{board.filter(p => p === 2).length}</div>
        </div>
      </div>

      {/* Game Over Modal */}
      <AnimatePresence>
        {winner && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-6"
          >
            <motion.div 
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-[#fdfaf5] rounded-3xl p-8 w-full max-w-sm text-center border-4 border-[#d97706] bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]"
            >
              <Trophy size={64} className="mx-auto mb-4 text-[#d97706]" />
              <h2 className="text-3xl font-serif font-bold text-[#4A2C2A] mb-2">{t.winner}!</h2>
              <p className="text-xl mb-8 text-[#9c4221]">
                {winner === 1 ? (language === 'ar' ? "لقد فزت!" : "You Won!") : (isVsAI ? "AI Won!" : "Player 2 Won!")}
              </p>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => window.location.reload()}
                  className="bg-[#d97706] text-white py-3 px-6 rounded-xl font-bold flex items-center justify-center gap-2"
                >
                  <RefreshCw size={20} /> {t.restart}
                </button>
                <button 
                  onClick={onBack}
                  className="bg-white border-2 border-[#e6d5b8] text-[#4A2C2A] py-3 px-6 rounded-xl font-bold"
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
