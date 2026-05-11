import React from 'react';
import { motion } from 'motion/react';
import { Language, TRANSLATIONS, GameMode, GAME_VARIANTS } from '../types';
import { LayoutGrid, Grid3x3, ArrowLeft, Trophy, Globe, BookOpen, Shield, HelpCircle, Users } from 'lucide-react';

interface ModeSelectionProps {
  language: Language;
  onSelect: (mode: GameMode, vsAI: boolean) => void;
  onRulesSelect: (mode?: GameMode) => void;
  onBack: () => void;
}

export const ModeSelection: React.FC<ModeSelectionProps> = ({ 
  language, onSelect, onRulesSelect, onBack 
}) => {
  const t = TRANSLATIONS[language];

  const variants = Object.values(GAME_VARIANTS);

  return (
    <div className="max-w-6xl w-full px-6 py-12 md:py-24 flex flex-col items-center min-h-screen overflow-y-auto">
      <div className="flex items-center justify-between w-full mb-12">
        <button 
          onClick={onBack}
          className="p-4 rounded-2xl bg-white/50 text-tunisian-dark-blue hover:bg-white transition-all shadow-md"
        >
          <ArrowLeft size={24} className={language === 'ar' ? 'rotate-180' : ''} />
        </button>
        <h1 className="text-4xl md:text-6xl font-serif font-black text-tunisian-dark-blue drop-shadow-sm text-center">
          {t.selectMode}
        </h1>
        <button 
          onClick={() => onRulesSelect()}
          className="p-4 rounded-2xl bg-tunisian-blue text-white hover:bg-tunisian-dark-blue transition-all shadow-md group border-2 border-white/20"
        >
          <BookOpen size={24} className="group-hover:scale-110 transition-transform" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
        {variants.map((v, idx) => (
          <motion.div
            key={v.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="group relative"
          >
            <div className="w-full h-full p-8 rounded-[2.5rem] bg-white border-4 border-tunisian-gold/20 shadow-xl flex flex-col items-center text-center transition-all hover:shadow-2xl hover:border-tunisian-gold">
              <div className={`w-20 h-20 rounded-[1.5rem] mb-6 flex items-center justify-center ${v.size > 5 ? 'bg-tunisian-red/10 text-tunisian-red' : 'bg-tunisian-blue/10 text-tunisian-blue'}`}>
                {v.boardType === 'circular' ? <Globe size={40} /> : v.size === 3 ? <Grid3x3 size={40} /> : <LayoutGrid size={40} />}
              </div>
              <h3 className="text-2xl font-serif font-black text-tunisian-dark-blue mb-3">{t[v.nameKey as keyof typeof t] || v.nameKey}</h3>
              <p className="text-tunisian-dark-blue/50 font-bold text-sm leading-relaxed mb-6">
                {t[v.descKey as keyof typeof t] || v.descKey}
              </p>
              
              <div className="grid grid-cols-2 gap-3 w-full mb-6">
                <button 
                  onClick={() => onSelect(v.id, true)}
                  className="py-3 px-4 rounded-xl bg-tunisian-blue text-white font-black text-sm flex items-center justify-center gap-2 hover:bg-tunisian-dark-blue transition-all shadow-md"
                >
                  <Shield size={16} /> AI
                </button>
                <button 
                  onClick={() => onSelect(v.id, false)}
                  className="py-3 px-4 rounded-xl bg-tunisian-red text-white font-black text-sm flex items-center justify-center gap-2 hover:bg-tunisian-dark-blue transition-all shadow-md"
                >
                  <Users size={16} /> PvP
                </button>
              </div>

              <div className="mt-auto pt-4 border-t border-tunisian-sandy w-full flex justify-between items-center px-2">
                <span className="text-xs font-black uppercase text-tunisian-gold tracking-widest">{v.size}x{v.size}</span>
                <button 
                  onClick={() => onRulesSelect(v.id)}
                  className="p-2 rounded-lg bg-tunisian-sandy text-tunisian-dark-blue hover:bg-tunisian-blue hover:text-white transition-colors flex items-center gap-2 text-xs font-bold"
                >
                  <HelpCircle size={16} /> {t.learnVariant}
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
