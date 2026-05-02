
import React from 'react';
import { motion } from 'motion/react';
import { Language, TRANSLATIONS, GameMode } from '../types';
import { LayoutGrid, Grid3x3, ArrowLeft, Trophy, Globe } from 'lucide-react';

interface ModeSelectionProps {
  language: Language;
  onSelect: (mode: GameMode, vsAI: boolean) => void;
  onOnlineSelect: () => void;
  onBack: () => void;
}

export const ModeSelection: React.FC<ModeSelectionProps> = ({ language, onSelect, onOnlineSelect, onBack }) => {
  const t = TRANSLATIONS[language];

  const modes: { id: GameMode; name: string; desc: string; icon: React.ReactNode; size: string }[] = [
    { 
      id: 'classic', 
      name: t.classicName, 
      desc: t.classicDesc, 
      icon: <LayoutGrid size={32} className="text-tunisian-blue" />,
      size: "7x7"
    },
    { 
      id: 'khamoussiya', 
      name: t.khamoussiyaName, 
      desc: t.khamoussiyaDesc, 
      icon: <Grid3x3 size={32} className="text-tunisian-red" />,
      size: "5x5"
    },
    { 
      id: 'sabouiya', 
      name: t.sabouiyaName, 
      desc: t.sabouiyaDesc, 
      icon: <Trophy size={32} className="text-tunisian-gold" />,
      size: "7x7"
    },
  ];

  return (
    <div className="max-w-4xl w-full px-6 py-12 md:py-24 flex flex-col items-center min-h-screen overflow-y-auto">
      <div className="flex items-center justify-between w-full mb-12">
        <button 
          onClick={onBack}
          className="p-3 rounded-full bg-white/50 hover:bg-white text-tunisian-dark-blue transition-all"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-4xl font-serif font-bold text-tunisian-dark-blue flex-1 text-center">
          {t.selectMode}
        </h1>
        <div className="w-12 h-12" /> {/* Spacer */}
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onOnlineSelect}
        className="w-full mb-12 p-8 rounded-3xl bg-tunisian-gold text-tunisian-dark-blue flex items-center justify-between shadow-xl border-4 border-white/20 group"
      >
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center group-hover:rotate-12 transition-transform">
            <Globe size={48} />
          </div>
          <div className="text-left">
            <h2 className="text-3xl font-serif font-black">{t.playOnline}</h2>
            <p className="text-tunisian-dark-blue/60 font-bold">{language === 'ar' ? "واجه لاعبين من جميع أنحاء العالم" : "Face opponents from across the Medina"}</p>
          </div>
        </div>
        <ArrowLeft size={32} className="rotate-180 opacity-40 group-hover:translate-x-2 transition-transform" />
      </motion.button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
        {modes.map((mode, idx) => (
          <motion.div
            key={mode.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="flex flex-col gap-4"
          >
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl border-4 border-tunisian-gold p-6 flex flex-col items-center text-center shadow-xl hover:shadow-2xl transition-all group">
              <div className="w-16 h-16 rounded-2xl bg-tunisian-sandy flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {mode.icon}
              </div>
              <h3 className="text-2xl font-bold mb-2 text-tunisian-dark-blue">{mode.name}</h3>
              <p className="text-sm text-tunisian-dark-blue/60 mb-2">{mode.size}</p>
              <p className="text-sm text-tunisian-dark-blue/80 mb-8 min-h-[40px]">{mode.desc}</p>
              
              <div className="flex flex-col w-full gap-3">
                <button 
                  onClick={() => onSelect(mode.id, true)}
                  className="w-full py-3 rounded-xl bg-tunisian-blue text-white font-bold hover:bg-tunisian-dark-blue transition-all"
                >
                  {t.playVsAI}
                </button>
                <button 
                  onClick={() => onSelect(mode.id, false)}
                  className="w-full py-3 rounded-xl border-2 border-tunisian-blue text-tunisian-blue font-bold hover:bg-tunisian-blue hover:text-white transition-all"
                >
                  {t.playVsFriend}
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
