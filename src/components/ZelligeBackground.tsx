
import React from 'react';

export const ZelligeBackground: React.FC = () => {
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
};
