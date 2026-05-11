import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Player, GameMode, GAME_VARIANTS } from '../types';

interface PieceProps {
  player: Player;
  isSelected?: boolean;
  isDanger?: boolean;
  index?: number;
}

export const Piece: React.FC<PieceProps> = ({ player, isSelected, isDanger, index }) => {
  const isP1 = player === 1;
  
  return (
    <motion.div
      layoutId={index !== undefined ? `piece-${index}` : undefined}
      initial={{ scale: 0 }}
      animate={{ 
        scale: isSelected ? 1.15 : 1,
        y: isSelected ? -8 : 0,
        boxShadow: isSelected 
          ? "0 20px 25px -5px rgba(0, 0, 0, 0.3)" 
          : "0 4px 6px -1px rgba(0, 0, 0, 0.2)"
      }}
      className={`
        w-4/5 h-4/5 rounded-full border-4 flex items-center justify-center relative shadow-lg
        ${isP1 
          ? 'bg-tunisian-white border-tunisian-blue' 
          : 'bg-tunisian-red border-tunisian-gold'}
        ${isDanger ? 'awsh-glow' : ''}
      `}
    >
      <div className={`w-2/3 h-2/3 rounded-full border-2 opacity-20 scale-75 ${isP1 ? 'border-tunisian-blue' : 'border-tunisian-gold'}`} />
      {isDanger && (
        <div className="absolute inset-0 rounded-full bg-tunisian-gold/30 blur-md pointer-events-none" />
      )}
    </motion.div>
  );
};

interface CellProps {
  index: number;
  player: Player | null;
  isValidMove?: boolean;
  onClick: () => void;
  isCenter?: boolean;
  isDanger?: boolean;
  mode: GameMode;
  isSelected?: boolean;
}

export const BoardCell: React.FC<CellProps> = ({ 
  index, player, isValidMove, onClick, isCenter, isDanger, mode, isSelected 
}) => {
  const variant = GAME_VARIANTS[mode];
  const isHole = variant.boardType === 'holes';

  return (
    <div
      onClick={onClick}
      className={`
        relative aspect-square flex items-center justify-center
        cursor-pointer transition-all duration-300
        ${isHole ? 'bg-tunisian-sandy/30 rounded-full shadow-inner' : 'tunisian-tile'}
        ${isCenter && !isHole ? 'center-square' : ''}
        ${isValidMove ? 'ring-4 ring-tunisian-gold ring-inset z-10' : ''}
        ${isSelected ? 'bg-tunisian-blue/5' : ''}
      `}
    >
      {/* Grid lines for intersection boards */}
      {!isHole && variant.boardType === 'grid' && (
        <>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
            <div className="w-full h-[2px] bg-tunisian-dark-blue" />
            <div className="h-full w-[2px] bg-tunisian-dark-blue" />
          </div>
        </>
      )}

      <AnimatePresence>
        {player && <Piece key={index} player={player} index={index} isDanger={isDanger} isSelected={isSelected} />}
      </AnimatePresence>
      
      {isValidMove && !player && (
        <div className="w-4 h-4 rounded-full bg-tunisian-gold shadow-sm animate-pulse z-20" />
      )}
    </div>
  );
};

export const CircularBoard: React.FC<{
  board: (Player | null)[];
  validMoves: number[];
  selectedPiece: number | null;
  onCellClick: (idx: number) => void;
}> = ({ board, validMoves, selectedPiece, onCellClick }) => {
  // Center is index 0
  // Perimeter index 1-6
  const points = [
    { x: 50, y: 50 }, // Center
    { x: 50, y: 15 }, // Top
    { x: 80, y: 30 }, // Top-Right
    { x: 80, y: 70 }, // Bottom-Right
    { x: 50, y: 85 }, // Bottom
    { x: 20, y: 70 }, // Bottom-Left
    { x: 20, y: 30 }, // Top-Left
  ];

  return (
    <div className="relative w-full aspect-square max-w-[500px]">
      <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full stroke-tunisian-dark-blue opacity-20 pointer-events-none" fill="none">
        <circle cx="50" cy="50" r="35" />
        <line x1="50" y1="15" x2="50" y2="85" />
        <line x1="20" y1="30" x2="80" y2="70" />
        <line x1="80" y1="30" x2="20" y2="70" />
      </svg>
      {points.map((p, i) => (
        <div 
          key={i}
          onClick={() => onCellClick(i)}
          style={{ left: `${p.x}%`, top: `${p.y}%` }}
          className={`
            absolute -translate-x-1/2 -translate-y-1/2 w-[12%] h-[12%] rounded-full cursor-pointer flex items-center justify-center
            ${validMoves.includes(i) ? 'ring-4 ring-tunisian-gold' : ''}
            ${i === 0 ? 'bg-tunisian-gold/20' : 'bg-tunisian-sandy/20'}
          `}
        >
          {board[i] && <Piece key={i} index={i} player={board[i]!} isSelected={selectedPiece === i} />}
          {validMoves.includes(i) && !board[i] && (
            <div className="w-3 h-3 rounded-full bg-tunisian-gold animate-pulse" />
          )}
        </div>
      ))}
    </div>
  );
};
