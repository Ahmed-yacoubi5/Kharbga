import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'motion/react';
import { SoundManager } from '../services/soundService';

interface IntroSplashProps {
  onFinish: () => void;
}

export const IntroSplash: React.FC<IntroSplashProps> = ({ onFinish }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const soundPlayedRef = useRef(false);

  useEffect(() => {
    // Play PS2-inspired atmospheric intro sound
    if (!soundPlayedRef.current) {
      SoundManager.playPS2Intro();
      soundPlayedRef.current = true;
    }

    // Attempt playback on first user gesture if browser autoplay suspended audio
    const handleGesture = () => {
      SoundManager.playPS2Intro();
    };
    window.addEventListener('pointerdown', handleGesture, { once: true });

    // Transition to main menu after the intro animation finishes
    const timer = setTimeout(() => {
      onFinish();
    }, 4200);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('pointerdown', handleGesture);
    };
  }, [onFinish]);

  return (
    <motion.div
      key="intro-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.03 }}
      transition={{ duration: 0.6, ease: 'easeInOut' }}
      onClick={onFinish}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center cursor-pointer select-none overflow-hidden bg-[#FAF0DC]"
      style={{
        background: 'radial-gradient(circle at center, #FFF9F0 0%, #FAF0DC 55%, #F0DFBF 100%)'
      }}
    >
      {/* Rotating Background Ambient Rays / Sunbeams */}
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
        className="absolute w-[700px] h-[700px] sm:w-[950px] sm:h-[950px] pointer-events-none opacity-25"
        style={{
          background: 'conic-gradient(from 0deg, rgba(212,172,13,0.4) 0deg, transparent 35deg, rgba(192,57,43,0.3) 75deg, transparent 115deg, rgba(26,82,118,0.35) 160deg, transparent 200deg, rgba(212,172,13,0.4) 245deg, transparent 285deg, rgba(192,57,43,0.25) 325deg, transparent 360deg)'
        }}
      />

      {/* Subtle traditional Tunisian Zellige geometric background dots */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage: `
            radial-gradient(circle, #C0392B 2px, transparent 2px),
            radial-gradient(circle, #1A5276 2px, transparent 2px)
          `,
          backgroundSize: '40px 40px',
          backgroundPosition: '0 0, 20px 20px'
        }}
      />

      {/* Skip Button */}
      <motion.button
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        onClick={(e) => {
          e.stopPropagation();
          onFinish();
        }}
        className="absolute top-5 right-5 sm:top-7 sm:right-7 z-30 px-4 py-2 rounded-full bg-white/85 hover:bg-white text-tunisian-dark-blue font-bold text-xs sm:text-sm border-2 border-tunisian-gold/50 shadow-md backdrop-blur-sm transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5"
      >
        <span>تخطي</span>
        <span className="opacity-30">/</span>
        <span>Skip</span>
      </motion.button>

      {/* Main Content Area */}
      <div className="relative z-10 flex flex-col items-center justify-center max-w-sm sm:max-w-md px-4 text-center">
        
        {/* 1. SQUARE WOODEN BOARD WITH ROTATING SWEEP ANIMATION */}
        <motion.div
          initial={{ 
            opacity: 0, 
            scale: 0.25, 
            rotate: -180, 
            filter: 'blur(10px)' 
          }}
          animate={{ 
            opacity: 1, 
            scale: 1, 
            rotate: 0, 
            filter: 'blur(0px)' 
          }}
          transition={{ 
            duration: 1.15, 
            ease: [0.16, 1, 0.3, 1] 
          }}
          className="relative flex items-center justify-center"
        >
          {/* Transparent Board Cutout - Completely seamless without any background */}
          <div className="relative flex items-center justify-center">
            <img 
              src="/kharbga_board_nobg.png?v=3"
              alt="Kharbga Board"
              referrerPolicy="no-referrer"
              className="w-52 h-52 sm:w-64 sm:h-64 md:w-72 md:h-72 object-contain select-none"
              style={{
                filter: 'drop-shadow(0 20px 24px rgba(21, 67, 96, 0.22)) drop-shadow(0 4px 8px rgba(0, 0, 0, 0.12))'
              }}
            />
          </div>
        </motion.div>

        {/* 2. THE WORD "Kharbga" DIRECTLY UNDER THE BOARD */}
        <motion.div
          initial={{ opacity: 0, y: 22, scale: 0.85 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ 
            delay: 0.75, 
            duration: 0.75, 
            ease: [0.16, 1, 0.3, 1] 
          }}
          className="mt-5 sm:mt-6"
        >
          <h1 
            style={{ fontFamily: "'Philosopher', 'Amiri', 'Georgia', serif" }}
            className="text-4xl sm:text-5xl md:text-6xl font-black tracking-widest text-tunisian-blue drop-shadow-md select-none uppercase"
          >
            Kharbga
          </h1>
        </motion.div>

        {/* 3. ARABIC PHRASE "محلاها قعيدة" DIRECTLY UNDER "Kharbga" */}
        <motion.div
          initial={{ 
            opacity: 0, 
            scale: 0.65, 
            rotate: 8, 
            y: 20 
          }}
          animate={{ 
            opacity: 1, 
            scale: 1, 
            rotate: 0, 
            y: 0 
          }}
          transition={{ 
            delay: 1.15, 
            duration: 0.85, 
            ease: [0.16, 1, 0.3, 1] 
          }}
          className="mt-2.5 sm:mt-3 flex flex-col items-center"
        >
          <div className="flex items-center justify-center gap-2 sm:gap-4 w-full">
            <motion.span 
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 1.35, duration: 0.6 }}
              className="h-[2px] w-8 sm:w-14 bg-gradient-to-r from-transparent via-tunisian-gold to-tunisian-gold rounded-full origin-right" 
            />
            
            {/* Spinning decorative star */}
            <motion.span 
              initial={{ rotate: -180, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ delay: 1.35, duration: 0.6 }}
              className="text-tunisian-gold text-base sm:text-xl inline-block"
            >
              ❖
            </motion.span>

            <h2 
              style={{ 
                fontFamily: "'Aref Ruqaa', 'El Messiri', 'Amiri', 'Tajawal', serif",
                textShadow: '0 3px 14px rgba(192, 57, 43, 0.3)'
              }}
              className="text-4xl sm:text-5xl md:text-6xl font-black text-tunisian-red tracking-wide px-3 select-none"
              dir="rtl"
            >
              محلاها قعيدة
            </h2>

            <motion.span 
              initial={{ rotate: 180, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ delay: 1.35, duration: 0.6 }}
              className="text-tunisian-gold text-base sm:text-xl inline-block"
            >
              ❖
            </motion.span>
            
            <motion.span 
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 1.35, duration: 0.6 }}
              className="h-[2px] w-8 sm:w-14 bg-gradient-to-l from-transparent via-tunisian-gold to-tunisian-gold rounded-full origin-left" 
            />
          </div>
        </motion.div>
      </div>

      {/* Interactive prompt at the bottom */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.7, 0.3, 0.7] }}
        transition={{ delay: 1.9, duration: 2.2, repeat: Infinity }}
        className="absolute bottom-6 sm:bottom-8 text-xs text-tunisian-dark-blue/60 font-semibold tracking-wider flex items-center gap-2"
      >
        <span>انقر للمتابعة</span>
        <span>•</span>
        <span>Tap anywhere to continue</span>
      </motion.div>
    </motion.div>
  );
};
