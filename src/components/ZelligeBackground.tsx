
import React from 'react';

export const ZelligeBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 -z-10 bg-[#fdfaf5] overflow-hidden">
      {/* Tunisian Geometric Pattern Background */}
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="zellige" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
            <path d="M50 0 L100 50 L50 100 L0 50 Z" fill="none" stroke="#e6d5b8" strokeWidth="0.5" />
            <rect x="45" y="45" width="10" height="10" fill="#2c5282" fillOpacity="0.05" transform="rotate(45 50 50)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#zellige)" />
      </svg>
      {/* Earthy Vignette */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[#9c4221]/10 via-transparent to-[#2c5282]/10" />
    </div>
  );
};
