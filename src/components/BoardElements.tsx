
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Player } from '../types';

interface PieceProps {
  player: Player;
  isSelected?: boolean;
}

export const Piece: React.FC<PieceProps & { index?: number }> = ({ player, isSelected, index }) => {
  return (
    <motion.div
      layoutId={index !== undefined ? `piece-${index}` : undefined}
      initial={{ scale: 0 }}
      animate={{ 
        scale: isSelected ? 1.15 : 1,
        y: isSelected ? -4 : 0,
        boxShadow: isSelected 
          ? "0 10px 15px -3px rgba(0, 0, 0, 0.2)" 
          : "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
      }}
      className={`
        w-4/5 h-4/5 rounded-full cursor-pointer
        transition-shadow duration-200
        ${player === 1 
          ? "bg-gradient-to-br from-[#d97706] to-[#92400e]" // Player 1 (Terracotta)
          : "bg-gradient-to-br from-[#1e40af] to-[#1e3a8a]" // Player 2 (Deep Blue)
        }
        border-b-4 border-black/20
      `}
    >
      <div className="w-full h-full rounded-full border border-white/20 flex items-center justify-center">
        <div className="w-2/3 h-2/3 rounded-full border border-black/10 opacity-30" />
      </div>
    </motion.div>
  );
};

interface CellProps {
  index: number;
  player: Player | null;
  isValidMove?: boolean;
  onClick: () => void;
  isCenter?: boolean;
}

export const Cell: React.FC<CellProps> = ({ index, player, isValidMove, onClick, isCenter }) => {
  return (
    <div
      onClick={onClick}
      className={`
        relative aspect-square flex items-center justify-center
        border border-[#e6d5b8] bg-[#faf3e0]/50
        cursor-pointer hover:bg-[#ffecc0]/50 transition-colors
        ${isValidMove ? 'ring-2 ring-inset ring-green-500/50 bg-green-50/30' : ''}
        ${isCenter ? 'bg-[#9c4221]/5' : ''}
      `}
    >
      {isCenter && !player && (
         <div className="absolute inset-0 flex items-center justify-center opacity-10">
           <div className="w-8 h-8 rotate-45 border-2 border-[#9c4221]" />
         </div>
      )}
      <AnimatePresence>
        {player && <Piece player={player} index={index} />}
      </AnimatePresence>
    </div>
  );
};
