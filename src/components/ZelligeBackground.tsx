import React from 'react';

interface ZelligeBackgroundProps {
  isTunisian?: boolean;
}

export const ZelligeBackground: React.FC<ZelligeBackgroundProps> = ({ isTunisian = true }) => {
  if (!isTunisian) {
    return (
      <div className="fixed inset-0 -z-10 bg-tunisian-sandy overflow-hidden">
        {/* Pattern Overlay */}
        <div className="absolute inset-0 zellige-pattern opacity-10" />
        
        {/* Subtle Texture Overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `url('https://www.transparenttextures.com/patterns/natural-paper.png')`,
          }}
        />
        
        {/* Sun/Light Gradient */}
        <div className="absolute inset-0 bg-gradient-to-tr from-tunisian-red/5 via-transparent to-tunisian-blue/10" />
        
        {/* Vignette */}
        <div className="absolute inset-0 shadow-[inset_0_0_150px_rgba(0,0,0,0.1)]" />
      </div>
    );
  }

  // Tunisian Hand-Painted Ceramic Tile Background Mode
  return (
    <div className="fixed inset-0 -z-10 bg-[#F5F0E8] overflow-hidden transition-colors duration-500">
      {/* Hand-painted Ceramic Tiles Grid Layer - lowered opacity to be a subtle watermark */}
      <div className="absolute inset-0 opacity-[0.05] md:opacity-[0.07] pointer-events-none">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="tunisianCeramicHandpainted" width="360" height="360" patternUnits="userSpaceOnUse">
              {/* Grout lines representing sand-cement between manual tiles */}
              <rect width="360" height="360" fill="#EADFCE" />
              
              {/* Cell A (0,0) */}
              <rect x="2" y="2" width="116" height="116" rx="2" fill="#F4EFE6" stroke="#D3C9B5" strokeWidth="1.5" />
              <rect x="12" y="12" width="96" height="96" rx="1.5" fill="none" stroke="#2E6FD4" strokeWidth="3" strokeLinejoin="round" />
              <rect x="22" y="22" width="76" height="76" rx="1" fill="none" stroke="#1B4FBF" strokeWidth="1.5" />
              <path d="M60 30 C54 44 46 54 60 60 C74 54 66 44 60 30 Z" fill="#1B4FBF" />
              <path d="M60 90 C54 76 46 66 60 60 C74 66 66 76 60 90 Z" fill="#1B4FBF" />
              <path d="M30 60 C44 54 54 46 60 60 C54 74 44 66 30 60 Z" fill="#1B4FBF" />
              <path d="M90 60 C76 54 66 46 60 60 C66 74 76 66 90 60 Z" fill="#1B4FBF" />
              <circle cx="60" cy="60" r="4.5" fill="#C1440E" />

              {/* Cell B (120,0) */}
              <rect x="122" y="2" width="116" height="116" rx="2" fill="#FAF7F2" stroke="#D3C9B5" strokeWidth="1.5" />
              <path d="M 122 60 L 180 2 L 238 60 L 180 118 Z" fill="none" stroke="#2E6FD4" strokeWidth="2" />
              <line x1="122" y1="60" x2="238" y2="60" stroke="#1B4FBF" strokeWidth="1.2" strokeDasharray="2 3" />
              <line x1="180" y1="2" x2="180" y2="118" stroke="#1B4FBF" strokeWidth="1.2" strokeDasharray="2 3" />
              <circle cx="180" cy="60" r="4" fill="#C1440E" />
              <circle cx="151" cy="31" r="2.5" fill="#1B4FBF" />
              <circle cx="209" cy="31" r="2.5" fill="#1B4FBF" />
              <circle cx="151" cy="89" r="2.5" fill="#1B4FBF" />
              <circle cx="209" cy="89" r="2.5" fill="#1B4FBF" />

              {/* Cell C (240,0) */}
              <rect x="242" y="2" width="116" height="116" rx="2" fill="#F4EFE6" stroke="#D3C9B5" strokeWidth="1.5" />
              <circle cx="300" cy="60" r="48" fill="none" stroke="#2E6FD4" strokeWidth="1.5" strokeDasharray="2 3" />
              <path d="M300 60 C294 40 294 20 300 12 C306 20 306 40 300 60 Z" fill="#1B4FBF" />
              <path d="M300 60 C294 80 294 100 300 108 C306 100 306 80 300 60 Z" fill="#1B4FBF" />
              <path d="M300 60 C280 54 260 54 252 60 C260 66 280 66 300 60 Z" fill="#1B4FBF" />
              <path d="M300 60 C320 54 340 54 348 60 C340 66 320 66 300 60 Z" fill="#1B4FBF" />
              <path d="M300 60 C285 45 272 32 266 26 C272 20 285 33 300 60 Z" fill="#2E6FD4" />
              <path d="M300 60 C315 45 328 32 334 26 C328 20 315 33 300 60 Z" fill="#2E6FD4" />
              <path d="M300 60 C285 75 272 88 266 94 C272 100 285 87 300 60 Z" fill="#2E6FD4" />
              <path d="M300 60 C315 75 328 88 334 94 C328 100 315 87 300 60 Z" fill="#2E6FD4" />
              <circle cx="300" cy="60" r="8" fill="#F4EFE6" stroke="#1B4FBF" strokeWidth="1.5" />
              <circle cx="300" cy="60" r="4.5" fill="#C1440E" />

              {/* Cell D (0,120) */}
              <rect x="2" y="122" width="116" height="116" rx="2" fill="#FAF7F2" stroke="#D3C9B5" strokeWidth="1.5" />
              <path d="M 60 128 L 112 180 L 60 232 L 8 180 Z" fill="none" stroke="#2E6FD4" strokeWidth="2.5" />
              <polygon points="60,126 78,144 60,162 42,144" fill="#1B4FBF" />
              <polygon points="60,198 78,216 60,234 42,216" fill="#1B4FBF" />
              <polygon points="24,162 42,180 24,198 6,180" fill="#1B4FBF" />
              <polygon points="96,162 114,180 96,198 78,180" fill="#1B4FBF" />
              <circle cx="60" cy="180" r="4" fill="#C1440E" />
              <circle cx="60" cy="168" r="1.5" fill="#1B4FBF" />
              <circle cx="60" cy="192" r="1.5" fill="#1B4FBF" />
              <circle cx="48" cy="180" r="1.5" fill="#1B4FBF" />
              <circle cx="72" cy="180" r="1.5" fill="#1B4FBF" />

              {/* Cell E (120,120) */}
              <rect x="122" y="122" width="116" height="116" rx="2" fill="#F4EFE6" stroke="#D3C9B5" strokeWidth="1.5" />
              <circle cx="180" cy="180" r="44" fill="none" stroke="#2E6FD4" strokeWidth="3" />
              <circle cx="180" cy="180" r="36" fill="none" stroke="#1B4FBF" strokeWidth="1.5" strokeDasharray="2 2" />
              <path d="M180 180 C165 150 195 150 180 180 Z" fill="#1B4FBF" stroke="#1B4FBF" strokeWidth="1" />
              <path d="M180 180 C165 210 195 210 180 180 Z" fill="#1B4FBF" stroke="#1B4FBF" strokeWidth="1" />
              <path d="M180 180 C150 165 150 195 180 180 Z" fill="#1B4FBF" stroke="#1B4FBF" strokeWidth="1" />
              <path d="M180 180 C210 165 210 195 180 180 Z" fill="#1B4FBF" stroke="#1B4FBF" strokeWidth="1" />
              <circle cx="180" cy="180" r="4.5" fill="#C1440E" />
              <path d="M130 130 C138 142 142 138 152 148 C144 148 138 144 130 130 Z" fill="#2E6FD4" />
              <path d="M230 130 C222 142 218 138 208 148 C216 148 222 144 230 130 Z" fill="#2E6FD4" />
              <path d="M130 230 C138 218 142 222 152 212 C144 212 138 216 130 230 Z" fill="#2E6FD4" />
              <path d="M230 230 C222 218 218 222 208 212 C216 212 222 216 230 230 Z" fill="#2E6FD4" />

              {/* Cell F (240,120) */}
              <rect x="242" y="122" width="116" height="116" rx="2" fill="#FAF7F2" stroke="#D3C9B5" strokeWidth="1.5" />
              <path d="M 242 180 A 58 58 0 0 1 300 122" fill="none" stroke="#2E6FD4" strokeWidth="2" />
              <path d="M 300 122 A 58 58 0 0 1 358 180" fill="none" stroke="#2E6FD4" strokeWidth="2" />
              <path d="M 358 180 A 58 58 0 0 1 300 238" fill="none" stroke="#2E6FD4" strokeWidth="2" />
              <path d="M 300 238 A 58 58 0 0 1 242 180" fill="none" stroke="#2E6FD4" strokeWidth="2" />
              <path d="M 242 122 A 58 58 0 0 0 358 238" fill="none" stroke="#1B4FBF" strokeWidth="1.5" strokeDasharray="2 2" />
              <path d="M 358 122 A 58 58 0 0 0 242 238" fill="none" stroke="#1B4FBF" strokeWidth="1.5" strokeDasharray="2 2" />
              <circle cx="300" cy="180" r="10" fill="#FAF7F2" stroke="#1B4FBF" strokeWidth="1.5" />
              <circle cx="300" cy="180" r="4.5" fill="#C1440E" />

              {/* Cell G (0,240) */}
              <rect x="2" y="242" width="116" height="116" rx="2" fill="#F4EFE6" stroke="#D3C9B5" strokeWidth="1.5" />
              <path d="M 60 246 L 114 300 L 60 354 L 6 300 Z" fill="none" stroke="#2E6FD4" strokeWidth="3" />
              <path d="M 60 256 L 104 300 L 60 344 L 16 300 Z" fill="none" stroke="#1B4FBF" strokeWidth="1.5" strokeDasharray="1 1" />
              <path d="M 60 278 L 65 295 L 82 300 L 65 305 L 60 322 L 55 305 L 38 300 L 55 295 Z" fill="#1B4FBF" />
              <circle cx="60" cy="300" r="3.5" fill="#C1440E" />
              <circle cx="20" cy="260" r="3" fill="#1B4FBF" />
              <circle cx="100" cy="260" r="3" fill="#1B4FBF" />
              <circle cx="20" cy="340" r="3" fill="#1B4FBF" />
              <circle cx="100" cy="340" r="3" fill="#1B4FBF" />

              {/* Cell H (120,240) */}
              <rect x="122" y="242" width="116" height="116" rx="2" fill="#FAF7F2" stroke="#D3C9B5" strokeWidth="1.5" />
              <line x1="124" y1="244" x2="236" y2="356" stroke="#D4B896" strokeWidth="1.8" />
              <line x1="152" y1="244" x2="236" y2="328" stroke="#D4B896" strokeWidth="1" />
              <line x1="124" y1="272" x2="208" y2="356" stroke="#D4B896" strokeWidth="1" />
              <line x1="236" y1="244" x2="124" y2="356" stroke="#D4B896" strokeWidth="1.8" />
              <line x1="208" y1="244" x2="124" y2="328" stroke="#D4B896" strokeWidth="1" />
              <line x1="236" y1="272" x2="152" y2="356" stroke="#D4B896" strokeWidth="1" />
              <polygon points="180,266 214,300 180,334 146,300" fill="#FFFFFF" stroke="#1B4FBF" strokeWidth="2.5" />
              <circle cx="180" cy="300" r="5" fill="#C1440E" />
              <path d="M180 295 L180 280 M180 305 L180 320 M175 300 L160 300 M185 300 L200 300" stroke="#1B4FBF" strokeWidth="2" strokeLinecap="round" />

              {/* Cell I (240,240) */}
              <rect x="242" y="242" width="116" height="116" rx="2" fill="#F4EFE6" stroke="#D3C9B5" strokeWidth="1.5" />
              <polygon points="300,248 316,284 352,300 316,316 300,352 284,316 248,300 284,284" fill="none" stroke="#2E6FD4" strokeWidth="2.5" />
              <circle cx="300" cy="300" r="22" fill="#1B4FBF" />
              <circle cx="300" cy="300" r="18" fill="#FFFFFF" />
              <polygon points="300,288 305,295 312,295 307,300 310,307 300,303 290,307 293,300 288,295 295,295" fill="#C1440E" />
              <circle cx="300" cy="272" r="2.5" fill="#C1440E" />
              <circle cx="300" cy="328" r="2.5" fill="#C1440E" />
              <circle cx="272" cy="300" r="2.5" fill="#C1440E" />
              <circle cx="328" cy="300" r="2.5" fill="#C1440E" />

            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#tunisianCeramicHandpainted)" />
        </svg>
      </div>

      {/* Elegant Stucco vignette overlays */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-[#1B4FBF]/5 pointer-events-none" />
      <div className="absolute inset-0 shadow-[inset_0_0_120px_rgba(27,79,191,0.08)] pointer-events-none" />
    </div>
  );
};
