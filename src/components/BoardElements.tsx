import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Player, GameMode, GAME_VARIANTS } from '../types';

export const SeashellIcon: React.FC<{ player: Player; className?: string }> = ({ player, className }) => {
  const isP1 = player === 1;
  return (
    <svg 
      viewBox="0 0 100 100" 
      className={`${className} w-full h-full drop-shadow-[0_4px_6px_rgba(0,0,0,0.15)]`}
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Gradients for authentic feel */}
        <radialGradient id={`p1-shell-grad-${player}`} cx="50%" cy="85%" r="85%" fx="50%" fy="85%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="75%" stopColor="#FAF7F2" />
          <stop offset="100%" stopColor="#E2E8F0" />
        </radialGradient>
        
        <radialGradient id={`p2-shell-grad-${player}`} cx="50%" cy="85%" r="85%" fx="50%" fy="85%">
          <stop offset="0%" stopColor="#FCA5A5" />
          <stop offset="65%" stopColor="#EF4444" />
          <stop offset="100%" stopColor="#991B1B" />
        </radialGradient>
      </defs>

      {/* Main shell body representing a fan-shaped scallop shell */}
      <path 
        d="M 50,88 
           C 44,88 38,84 34,78 
           L 24,78 
           C 22,78 21,77 21,75 
           L 23,65 
           C 12,58 6,45 8,32 
           C 10,16 28,8 50,8 
           C 72,8 90,16 92,32 
           C 94,45 88,58 77,65 
           L 79,75 
           C 79,77 78,78 76,78 
           L 66,78 
           C 62,84 56,88 50,88 Z"
        fill={isP1 ? `url(#p1-shell-grad-${player})` : `url(#p2-shell-grad-${player})`}
        stroke={isP1 ? "#1A5276" : "#7F1D1D"}
        strokeWidth="3.5"
        strokeLinejoin="round"
      />

      {/* Radiating ribs (ridges) from bottom center */}
      <g stroke={isP1 ? "#1A5276" : "#7F1D1D"} strokeWidth="2.5" strokeLinecap="round" opacity="0.8">
        {/* Vertical center rib */}
        <line x1="50" y1="82" x2="50" y2="10" />
        
        {/* Left curves */}
        <path d="M 50,82 C 43,65 34,44 32,18" />
        <path d="M 50,82 C 37,68 25,50 20,31" />
        <path d="M 50,82 C 31,73 17,58 13,44" />
        
        {/* Right curves */}
        <path d="M 50,82 C 57,65 66,44 68,18" />
        <path d="M 50,82 C 63,68 75,50 80,31" />
        <path d="M 50,82 C 69,73 83,58 87,44" />
      </g>
      
      {/* Bottom base accent/hinge definition */}
      <path 
        d="M 34,78 C 38,81 44,82 50,82 C 56,82 62,81 66,78" 
        stroke={isP1 ? "#1A5276" : "#7F1D1D"} 
        strokeWidth="3.5" 
        strokeLinecap="round"
      />
    </svg>
  );
};

export const PlayerPieceIcon: React.FC<{ player: Player; appearance?: 'seashell' | 'default'; className?: string }> = ({ player, appearance = 'seashell', className }) => {
  const isP1 = player === 1;
  const isDefault = appearance === 'default';

  if (isDefault) {
    return (
      <div 
        className={`${className || 'w-6 h-6'} rounded-full border-2 flex items-center justify-center relative shadow`}
        style={{
          aspectRatio: '1',
          background: isP1 
            ? 'radial-gradient(circle at 35% 35%, #FFFFFF 0%, #E5E9F0 60%, #C8D1E0 100%)' 
            : 'radial-gradient(circle at 35% 35%, #FF7F50 0%, #C1440E 70%, #8B2500 100%)',
          borderColor: isP1 ? '#1B4FBF' : '#F5F0E8',
          boxShadow: isP1 
            ? '0 2px 4px rgba(0,0,0,0.15), inset 0 1px 2px rgba(27, 79, 191, 0.25)' 
            : '0 2px 4px rgba(0,0,0,0.2), inset 0 1px 2px rgba(255, 255, 255, 0.35)',
        }}
      >
        <div className={`w-2/3 h-2/3 rounded-full border opacity-30 scale-75 ${isP1 ? 'border-1B4FBF' : 'border-white'}`} style={{ borderColor: isP1 ? '#1B4FBF' : '#FFFFFF' }} />
      </div>
    );
  }

  return <SeashellIcon player={player} className={className} />;
};

interface PieceProps {
  player: Player;
  isSelected?: boolean;
  isDanger?: boolean;
  index?: number;
  appearance?: 'seashell' | 'default';
}

export const Piece: React.FC<PieceProps> = ({ player, isSelected, isDanger, index, appearance = 'seashell' }) => {
  const isP1 = player === 1;
  const isDefault = appearance === 'default';

  return (
    <motion.div
      layoutId={index !== undefined ? `piece-${index}` : undefined}
      initial={{ scale: 0 }}
      animate={{ 
        scale: isSelected ? 1.2 : 1,
        y: isSelected ? -10 : 0,
      }}
      className="w-[85%] h-[85%] flex items-center justify-center relative select-none"
    >
      {/* Danger golden glow ring */}
      {isDanger && (
        <div className="absolute inset-0 rounded-full bg-tunisian-gold/30 blur-md pointer-events-none animate-pulse scale-110" />
      )}
      
      {/* Selection outline/indicator */}
      {isSelected && (
        <div className="absolute inset-0 rounded-full border-2 border-dashed border-tunisian-gold/60 animate-[spin_10s_linear_infinite]" />
      )}

      {isDefault ? (
        <div 
          className={`
            w-full h-full rounded-full border-4 flex items-center justify-center relative shadow-lg
            ${isP1 ? 'ceramic-piece-p1' : 'ceramic-piece-p2'}
          `}
        >
          <div className="w-1/2 h-1/2 rounded-full border-2 opacity-30 scale-75" />
        </div>
      ) : (
        /* Seashell Icon piece */
        <SeashellIcon player={player} />
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
  appearance?: 'seashell' | 'default';
}

export const BoardCell: React.FC<CellProps> = ({ 
  index, player, isValidMove, onClick, isCenter, isDanger, mode, isSelected, appearance = 'seashell' 
}) => {
  const variant = GAME_VARIANTS[mode];
  const isHole = variant.boardType === 'holes';

  return (
    <div
      onClick={onClick}
      className={`
        relative aspect-square flex items-center justify-center
        cursor-pointer transition-all duration-300
        ${isHole ? 'bg-tunisian-sandy/30 rounded-full shadow-inner' : 'tunisian-tile board-cell-tile'}
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
        {player && <Piece key={index} player={player} index={index} isDanger={isDanger} isSelected={isSelected} appearance={appearance} />}
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
  appearance?: 'seashell' | 'default';
}> = ({ board, validMoves, selectedPiece, onCellClick, appearance = 'seashell' }) => {
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
          {board[i] && <Piece key={i} index={i} player={board[i]!} isSelected={selectedPiece === i} appearance={appearance} />}
          {validMoves.includes(i) && !board[i] && (
            <div className="w-3 h-3 rounded-full bg-tunisian-gold animate-pulse" />
          )}
        </div>
      ))}
    </div>
  );
};
