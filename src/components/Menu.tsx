
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Language, Difficulty, BoardSize, TRANSLATIONS } from '../types';
import { Settings as SettingsIcon, Play, Users, Trophy, BookOpen, Globe, BrainCircuit, Volume2, Music as MusicIcon } from 'lucide-react';

interface MenuProps {
  onStartGame: (isVsAI: boolean) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  difficulty: Difficulty;
  onDifficultyChange: (diff: Difficulty) => void;
  boardSize: BoardSize;
  onBoardSizeChange: (size: BoardSize) => void;
  soundEnabled: boolean;
  onSoundToggle: () => void;
  musicEnabled: boolean;
  onMusicToggle: () => void;
}

export const Menu: React.FC<MenuProps> = ({ 
  onStartGame, language, onLanguageChange, difficulty, onDifficultyChange,
  boardSize, onBoardSizeChange, soundEnabled, onSoundToggle, musicEnabled, onMusicToggle
}) => {
  const t = TRANSLATIONS[language];
  const [showRules, setShowRules] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-[#4A2C2A] p-6 font-sans">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center mb-12"
      >
        <div className="flex justify-center mb-4">
          {/* Logo Placeholder - Hexagonal Geometric Shape */}
          <div className="relative w-24 h-24 flex items-center justify-center">
            <div className="absolute inset-0 bg-[#d97706] rotate-45 rounded-xl opacity-20 animate-pulse" />
            <div className="absolute inset-2 bg-[#d97706] rounded-lg shadow-lg flex items-center justify-center">
              <span className="text-4xl font-serif text-white">خ</span>
            </div>
          </div>
        </div>
        <h1 className="text-5xl font-serif font-black tracking-tight mb-2 uppercase">{t.title}</h1>
        <p className={`text-lg font-medium opacity-70 ${language === 'ar' ? 'font-serif' : ''}`}>
          {language === 'en' ? "Ancient Tunisian Strategy" : (language === 'fr' ? "Stratégie Tunisienne Ancestrale" : "لعبة استراتيجية تونسية قديمة")}
        </p>
      </motion.div>

      <div className="flex flex-col gap-4 w-full max-w-xs">
        <MenuButton 
          icon={<Play fill="currentColor" />} 
          label={t.playVsAI} 
          onClick={() => onStartGame(true)} 
          primary 
        />
        <MenuButton 
          icon={<Users />} 
          label={t.playVsFriend} 
          onClick={() => onStartGame(false)} 
        />
        <div className="grid grid-cols-2 gap-4">
          <MenuButton 
            small 
            icon={<BookOpen />} 
            label={t.howToPlay} 
            onClick={() => setShowRules(true)} 
          />
          <MenuButton 
            small 
            icon={<SettingsIcon />} 
            label={t.settings} 
            onClick={() => setShowSettings(true)} 
          />
        </div>
      </div>

      <div className="mt-12 opacity-50 text-sm font-medium">
        Made for the fans of Kharbga & Seega
      </div>

      {/* Rules Modal */}
      <AnimatePresence>
        {showRules && (
          <Modal title={t.rules} onClose={() => setShowRules(false)}>
            <div className={`space-y-4 ${language === 'ar' ? 'text-right' : ''}`}>
              {t.rulesContent.map((rule, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <div className="mt-1.5 w-2 h-2 rounded-full bg-[#d97706] shrink-0" />
                  <p className="text-[#4A2C2A]/80 font-medium">{rule}</p>
                </div>
              ))}
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <Modal title={t.settings} onClose={() => setShowSettings(false)}>
            <div className="space-y-6">
              <div>
                <label className="flex items-center gap-2 mb-3 font-bold text-[#4A2C2A]">
                  <Globe size={18} /> {t.lang}
                </label>
                <div className="flex gap-2">
                  {(['en', 'fr', 'ar'] as Language[]).map(l => (
                    <button 
                      key={l}
                      onClick={() => onLanguageChange(l)}
                      className={`flex-1 py-3 rounded-xl border-2 transition-all font-bold ${language === l ? 'border-[#d97706] bg-[#d97706]/10 text-[#d97706]' : 'border-[#e6d5b8] bg-white text-[#4A2C2A]/60'}`}
                    >
                      {l.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="flex items-center gap-2 mb-3 font-bold text-[#4A2C2A]">
                  <Trophy size={18} /> {t.boardSize}
                </label>
                <div className="flex gap-2">
                  {([5, 7] as BoardSize[]).map(s => (
                    <button 
                      key={s}
                      onClick={() => onBoardSizeChange(s)}
                      className={`flex-1 py-3 rounded-xl border-2 transition-all font-bold ${boardSize === s ? 'border-[#d97706] bg-[#d97706]/10 text-[#d97706]' : 'border-[#e6d5b8] bg-white text-[#4A2C2A]/60'}`}
                    >
                      {s}x{s}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                    <label className="flex items-center gap-2 mb-3 font-bold text-[#4A2C2A]">
                    <Volume2 size={18} /> {t.sound}
                    </label>
                    <button 
                    onClick={onSoundToggle}
                    className={`w-full py-3 rounded-xl border-2 transition-all font-bold ${soundEnabled ? 'border-green-600 bg-green-50 text-green-700' : 'border-gray-300 bg-gray-50 text-gray-400'}`}
                    >
                    {soundEnabled ? "ON" : "OFF"}
                    </button>
                </div>
                <div>
                    <label className="flex items-center gap-2 mb-3 font-bold text-[#4A2C2A]">
                    <MusicIcon size={18} /> {t.music}
                    </label>
                    <button 
                    onClick={onMusicToggle}
                    className={`w-full py-3 rounded-xl border-2 transition-all font-bold ${musicEnabled ? 'border-green-600 bg-green-50 text-green-700' : 'border-gray-300 bg-gray-50 text-gray-400'}`}
                    >
                    {musicEnabled ? "ON" : "OFF"}
                    </button>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 mb-3 font-bold text-[#4A2C2A]">
                  <BrainCircuit size={18} /> {t.difficulty}
                </label>
                <div className="flex gap-2">
                  {(['easy', 'hard'] as Difficulty[]).map(d => (
                    <button 
                      key={d}
                      onClick={() => onDifficultyChange(d)}
                      className={`flex-1 py-3 rounded-xl border-2 transition-all font-bold ${difficulty === d ? 'border-[#1e40af] bg-[#1e40af]/10 text-[#1e40af]' : 'border-[#e6d5b8] bg-white text-[#4A2C2A]/60'}`}
                    >
                      {t[d]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
};

interface MenuButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  primary?: boolean;
  small?: boolean;
}

const MenuButton: React.FC<MenuButtonProps> = ({ icon, label, onClick, primary, small }) => (
  <button 
    onClick={onClick}
    className={`
      flex items-center gap-3 justify-center rounded-2xl transition-all active:scale-95
      ${small ? 'py-4 flex-col text-xs' : 'py-5 text-base font-bold'}
      ${primary 
        ? 'bg-[#d97706] text-white shadow-lg shadow-amber-700/20' 
        : 'bg-white border-2 border-[#e6d5b8] text-[#4A2C2A] shadow-sm'
      }
    `}
  >
    <span className={small ? 'text-amber-600' : ''}>{icon}</span>
    {label}
  </button>
);

const Modal: React.FC<{ title: string; children: React.ReactNode; onClose: () => void }> = ({ title, children, onClose }) => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6"
    onClick={onClose}
  >
    <motion.div 
      initial={{ y: 50, scale: 0.9 }}
      animate={{ y: 0, scale: 1 }}
      exit={{ y: 50, scale: 0.9 }}
      className="bg-[#fdfaf5] w-full max-w-sm rounded-[2.5rem] p-8 relative shadow-2xl border-2 border-[#d97706] bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]"
      onClick={e => e.stopPropagation()}
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-serif font-black uppercase text-[#4A2C2A]">{title}</h2>
      </div>
      {children}
      <button 
        onClick={onClose}
        className="mt-8 w-full py-4 bg-[#4A2C2A] text-white rounded-2xl font-bold uppercase tracking-wider shadow-lg shadow-black/20"
      >
        Close
      </button>
    </motion.div>
  </motion.div>
);
