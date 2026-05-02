
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Player } from '../types';

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
        w-4/5 h-4/5 rounded-full border-4 flex items-center justify-center relative
        ${isP1 
          ? 'bg-tunisian-white border-tunisian-blue' 
          : 'bg-tunisian-red border-tunisian-gold'}
        ${isDanger ? 'awsh-glow' : ''}
      `}
    >
      {/* Decorative inner pattern */}
      <div className={`w-2/3 h-2/3 rounded-full border-2 opacity-20 scale-75 ${isP1 ? 'border-tunisian-blue' : 'border-tunisian-gold'}`} />
      
      {/* Glow for Awsh warning */}
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
}

export const Cell: React.FC<CellProps> = ({ index, player, isValidMove, onClick, isCenter, isDanger }) => {
  return (
    <div
      onClick={onClick}
      className={`
        relative aspect-square flex items-center justify-center tunisian-tile
        cursor-pointer transition-all duration-300
        ${isCenter ? 'center-square' : ''}
        ${isValidMove ? 'ring-4 ring-tunisian-gold ring-inset z-10' : ''}
      `}
    >
      <AnimatePresence>
        {player && <Piece player={player} index={index} isDanger={isDanger} />}
      </AnimatePresence>
      
      {/* Empty slot indicator for moves */}
      {isValidMove && !player && (
        <div className="w-4 h-4 rounded-full bg-tunisian-gold shadow-sm animate-pulse" />
      )}
    </div>
  );
};
