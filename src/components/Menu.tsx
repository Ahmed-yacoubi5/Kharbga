
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Language, TRANSLATIONS } from '../types';
import { Globe, Volume2, Music as MusicIcon, Info, X } from 'lucide-react';
import { MusicSelector } from './MusicSelector';
import { MusicTrack } from '../constants';


interface MenuProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onStart: () => void;
  onMultiplayerSelect: () => void;
  onRulesSelect: () => void;
  soundEnabled: boolean;
  onSoundToggle: () => void;
  musicEnabled: boolean;
  onMusicToggle: () => void;
  currentTrackId: string;
  onTrackSelect: (track: MusicTrack) => void;
  pieceAppearance: 'seashell' | 'default';
  onPieceAppearanceChange: (appearance: 'seashell' | 'default') => void;
}

export const Menu: React.FC<MenuProps> = ({ 
  language, onLanguageChange, onStart, onMultiplayerSelect, onRulesSelect,
  soundEnabled, onSoundToggle, musicEnabled, onMusicToggle,
  currentTrackId, onTrackSelect, pieceAppearance, onPieceAppearanceChange
}) => {
  const t = TRANSLATIONS[language];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full px-6 py-12 md:py-20 overflow-y-auto">
      {/* Decorative Title Area */}
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative mb-14 flex flex-col items-center"
      >
        <div className="flex items-center gap-4 md:gap-8 relative z-10">
          <h1 
            id="menu-title-heading"
            style={{ fontFamily: "'Comic Neue', sans-serif", fontSize: '97px', lineHeight: '97px', fontWeight: 'bold', fontStyle: 'normal' }}
            className="text-tunisian-red drop-shadow-2xl mb-4 relative z-10 transition-all"
          >
            {t.title}
          </h1>
        </div>
        <div className="p-2 px-8 bg-tunisian-gold rounded-full shadow-lg relative z-10 w-fit">
          <span className="text-[24px] leading-[24px] font-bold text-white tracking-widest uppercase">
            {t.subtitle}
          </span>
        </div>
      </motion.div>

      <div className="max-w-md w-full flex flex-col gap-5">
        {/* Play Offline / Mode Selection Button */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onStart}
          className="w-full py-5 rounded-3xl bg-tunisian-blue text-white text-2xl md:text-3xl font-black shadow-2xl hover:bg-tunisian-dark-blue transition-all border-b-8 border-black/20"
        >
          {t.start}
        </motion.button>

        {/* Play Online / Multiplayer Button */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onMultiplayerSelect}
          className="w-full py-5 rounded-3xl bg-gradient-to-r from-tunisian-red via-red-600 to-tunisian-dark-blue text-white text-xl md:text-2xl font-black shadow-2xl hover:brightness-110 transition-all border-b-8 border-black/20 flex items-center justify-center gap-3"
        >
          <span className="text-2xl">🌐</span>
          <span>{t.onlineMultiplayer || t.playOnline}</span>
        </motion.button>

        {/* Rules Button - Navigates to Rules Page */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onRulesSelect}
          className="w-full py-4 rounded-2xl bg-tunisian-gold text-tunisian-dark-blue text-lg font-black shadow-lg hover:brightness-110 transition-all border-b-4 border-black/10 flex items-center justify-center gap-3"
        >
          <Info size={22} /> {t.rules}
        </motion.button>

        {/* Quick Settings Grid */}
        <div className="grid grid-cols-2 gap-3 mt-2">
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

        {/* Piece Appearance Settings */}
        <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border-2 border-tunisian-gold flex flex-col items-center gap-2">
          <label className="text-xs font-bold text-tunisian-dark-blue opacity-60 uppercase flex items-center gap-1.5">
            ✨ {t.pieceStyle}
          </label>
          <div className="flex gap-2 w-full">
            <button
              id="btn-appearance-seashell"
              onClick={() => onPieceAppearanceChange('seashell')}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${pieceAppearance === 'seashell' ? 'bg-tunisian-gold text-white shadow-md' : 'hover:bg-tunisian-sandy/30 text-tunisian-dark-blue/60'}`}
            >
              <span>🐚</span>
              <span>{t.seashell}</span>
            </button>
            <button
              id="btn-appearance-classic"
              onClick={() => onPieceAppearanceChange('default')}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${pieceAppearance === 'default' ? 'bg-tunisian-gold text-white shadow-md' : 'hover:bg-tunisian-sandy/30 text-tunisian-dark-blue/60'}`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-tunisian-blue to-tunisian-red" />
              <span>{t.classic}</span>
            </button>
          </div>
        </div>

        {/* Music selector - if music is enabled or just to show choice */}
        {musicEnabled && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="overflow-hidden"
          >
            <MusicSelector 
              language={language}
              musicEnabled={musicEnabled}
              currentTrackId={currentTrackId}
              onTrackSelect={onTrackSelect}
            />
          </motion.div>
        )}

      </div>

      {/* Decorative footer elements */}
      <div className="mt-16 opacity-20 text-tunisian-dark-blue font-serif tracking-widest text-sm pointer-events-none">
        SIDI BOU SAID • MEDINA • CARTHAGE
      </div>
    </div>
  );
};
