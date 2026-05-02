
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Language, TRANSLATIONS } from '../types';
import { Globe, Volume2, Music as MusicIcon, Info, X } from 'lucide-react';

interface MenuProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onStart: () => void;
  soundEnabled: boolean;
  onSoundToggle: () => void;
  musicEnabled: boolean;
  onMusicToggle: () => void;
}

export const Menu: React.FC<MenuProps> = ({ 
  language, onLanguageChange, onStart, 
  soundEnabled, onSoundToggle, musicEnabled, onMusicToggle 
}) => {
  const t = TRANSLATIONS[language];
  const [showRules, setShowRules] = useState(false);

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

        {/* Rules Button - Now more obvious */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowRules(true)}
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

      {/* Rules Modal */}
      <AnimatePresence>
        {showRules && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowRules(false)}
              className="absolute inset-0 bg-tunisian-dark-blue/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-tunisian-white w-full max-w-lg rounded-[2.5rem] border-8 border-tunisian-gold shadow-2xl p-10 overflow-hidden"
            >
              <div className="absolute top-4 right-4 rtl:left-4 rtl:right-auto">
                <button 
                  onClick={() => setShowRules(false)}
                  className="p-2 rounded-full hover:bg-tunisian-gold/10 text-tunisian-dark-blue transition-all"
                >
                  <X size={24} />
                </button>
              </div>

              <h2 className="text-4xl font-serif font-black text-tunisian-red mb-8 border-b-4 border-tunisian-gold/20 pb-4 inline-block">
                {t.rules}
              </h2>

              <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-4 custom-scrollbar">
                {t.rulesContent.map((rule, idx) => (
                  <div key={idx} className="flex gap-4 items-start">
                    <div className="w-8 h-8 rounded-xl bg-tunisian-gold flex items-center justify-center text-white font-black shrink-0">
                      {idx + 1}
                    </div>
                    <p className="text-lg text-tunisian-dark-blue font-medium leading-relaxed">
                      {rule}
                    </p>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => setShowRules(false)}
                className="mt-10 w-full py-4 rounded-2xl bg-tunisian-dark-blue text-white font-bold tracking-widest uppercase hover:bg-tunisian-blue transition-all shadow-xl"
              >
                {language === 'ar' ? "فهمت" : (language === 'fr' ? "Compris" : "Understood")}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Decorative footer elements */}
      <div className="mt-16 opacity-20 text-tunisian-dark-blue font-serif tracking-widest text-sm pointer-events-none">
        SIDI BOU SAID • MEDINA • CARTHAGE
      </div>
    </div>
  );
};
