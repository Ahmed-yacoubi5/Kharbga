
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Language, TRANSLATIONS } from '../types';
import { Globe, Volume2, Music as MusicIcon, Info, X } from 'lucide-react';

interface MenuProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onStart: () => void;
  onRulesSelect: () => void;
  soundEnabled: boolean;
  onSoundToggle: () => void;
  musicEnabled: boolean;
  onMusicToggle: () => void;
}

export const Menu: React.FC<MenuProps> = ({ 
  language, onLanguageChange, onStart, onRulesSelect,
  soundEnabled, onSoundToggle, musicEnabled, onMusicToggle 
}) => {
  const t = TRANSLATIONS[language];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full px-6 py-12 md:py-20 overflow-y-auto">
      {/* Decorative Title Area */}
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative mb-16 flex flex-col items-center"
      >
        <div className="absolute -inset-20 zellige-pattern rounded-full opacity-10 animate-spin-slow pointer-events-none" />
        
        <h1 className="text-8xl md:text-9xl font-serif font-black text-tunisian-red drop-shadow-2xl mb-4 relative z-10 transition-all">
          {t.title}
        </h1>
        <div className="p-2 px-8 bg-tunisian-gold rounded-full shadow-lg relative z-10">
          <span className="text-xl font-bold text-tunisian-dark-blue tracking-widest uppercase">
            Tunisian Strategy
          </span>
        </div>
      </motion.div>

      <div className="max-w-md w-full flex flex-col gap-8">
        {/* Play Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onStart}
          className="w-full py-6 rounded-3xl bg-tunisian-blue text-white text-3xl font-bold shadow-2xl hover:bg-tunisian-dark-blue transition-all border-b-8 border-black/20"
        >
          {t.start}
        </motion.button>

        {/* Rules Button - Now navigates to Rules Page */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onRulesSelect}
          className="w-full py-4 rounded-2xl bg-tunisian-gold text-tunisian-dark-blue text-xl font-bold shadow-lg hover:brightness-110 transition-all border-b-4 border-black/10 flex items-center justify-center gap-3"
        >
          <Info size={24} /> {t.rules}
        </motion.button>

        {/* Quick Settings Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Language Toggle */}
          <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border-2 border-tunisian-gold flex flex-col items-center gap-2">
            <label className="text-xs font-bold text-tunisian-dark-blue opacity-60 uppercase flex items-center gap-1">
              <Globe size={14} /> {language === 'ar' ? "اللغة" : "Language"}
            </label>
            <div className="flex gap-2 w-full">
              {(['ar', 'en', 'fr'] as Language[]).map(lang => (
                <button
                  key={lang}
                  onClick={() => onLanguageChange(lang)}
                  className={`flex-1 py-1 rounded-lg text-sm font-bold transition-all ${language === lang ? 'bg-tunisian-gold text-white shadow-md' : 'hover:bg-tunisian-sandy text-tunisian-dark-blue/60'}`}
                >
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Sound & Music */}
          <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border-2 border-tunisian-gold flex flex-col items-center justify-center gap-3">
             <div className="flex w-full gap-2">
                <button 
                  onClick={onSoundToggle}
                  className={`flex-1 p-2 rounded-xl border transition-all ${soundEnabled ? 'bg-tunisian-gold text-white border-tunisian-gold' : 'bg-transparent text-tunisian-dark-blue/40 border-tunisian-dark-blue/20'}`}
                >
                  <Volume2 size={20} className="mx-auto" />
                </button>
                <button 
                  onClick={onMusicToggle}
                  className={`flex-1 p-2 rounded-xl border transition-all ${musicEnabled ? 'bg-tunisian-gold text-white border-tunisian-gold' : 'bg-transparent text-tunisian-dark-blue/40 border-tunisian-dark-blue/20'}`}
                >
                  <MusicIcon size={20} className="mx-auto" />
                </button>
             </div>
             <span className="text-[10px] font-bold text-tunisian-dark-blue opacity-60 uppercase">Audio Controls</span>
          </div>
        </div>

      </div>

      {/* Decorative footer elements */}
      <div className="mt-16 opacity-20 text-tunisian-dark-blue font-serif tracking-widest text-sm pointer-events-none">
        SIDI BOU SAID • MEDINA • CARTHAGE
      </div>
    </div>
  );
};
