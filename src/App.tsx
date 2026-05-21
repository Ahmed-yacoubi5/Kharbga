/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ZelligeBackground } from './components/ZelligeBackground';
import { Menu } from './components/Menu';
import { GameView } from './components/GameView';
import { ModeSelection } from './components/ModeSelection';
import { Language, Difficulty, GameMode } from './types';
import { SoundManager } from './services/soundService';
import { RulesPage } from './components/RulesPage';

import { MusicTrack, MUSIC_TRACKS } from './constants';

export default function App() {
  const [view, setView] = useState<'home' | 'modeSelection' | 'game' | 'rules'>('home');
  const [rulesInitialVariant, setRulesInitialVariant] = useState<GameMode | undefined>();
  const [isVsAI, setIsVsAI] = useState(true);
  const [language, setLanguage] = useState<Language>('ar');
  const [difficulty, setDifficulty] = useState<Difficulty>('hard');
  const [gameMode, setGameMode] = useState<GameMode>('sabouiya_standard');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [musicEnabled, setMusicEnabled] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<MusicTrack>(MUSIC_TRACKS[0]);
  const [isTunisianTheme, setIsTunisianTheme] = useState(() => {
    const saved = localStorage.getItem('theme-tunisian-active');
    return saved !== null ? saved === 'true' : true;
  });
  const [pieceAppearance, setPieceAppearance] = useState<'seashell' | 'default'>(() => {
    const saved = localStorage.getItem('piece-appearance');
    return saved === 'default' ? 'default' : 'seashell';
  });

  useEffect(() => {
    if (isTunisianTheme) {
      document.body.classList.add('theme-tunisian');
    } else {
      document.body.classList.remove('theme-tunisian');
    }
    localStorage.setItem('theme-tunisian-active', String(isTunisianTheme));
  }, [isTunisianTheme]);

  useEffect(() => {
    if (musicEnabled) {
      SoundManager.playMusic(currentTrack.path, currentTrack.id);
    } else {
      SoundManager.stopMusic();
    }
  }, [musicEnabled, currentTrack]);

  const handleSoundToggle = () => {
    const newState = !soundEnabled;
    setSoundEnabled(newState);
    SoundManager.setEnabled(newState);
  };

  const handlePieceAppearanceChange = (appearance: 'seashell' | 'default') => {
    setPieceAppearance(appearance);
    localStorage.setItem('piece-appearance', appearance);
  };

  return (
    <div 
      className="relative min-h-screen font-sans selection:bg-tunisian-gold selection:text-tunisian-dark-blue" 
      dir={language === 'ar' ? 'rtl' : 'ltr'}
    >
      <ZelligeBackground isTunisian={isTunisianTheme} />

      {/* Theme Toggle Button */}
      <button 
        onClick={() => setIsTunisianTheme(!isTunisianTheme)}
        className="fixed top-4 right-4 z-50 px-4 py-2.5 rounded-full font-serif font-black border-2 shadow-lg transition-all flex items-center gap-2 text-sm bg-white hover:scale-105 active:scale-95 duration-200"
        style={{
          borderColor: isTunisianTheme ? '#2E6FD4' : '#C0392B',
          color: isTunisianTheme ? '#1B4FBF' : '#154360'
        }}
        title="Toggle Tunisian Style / Default Theme"
      >
        <span className="text-base">🇹🇳</span>
        <span className="hidden sm:inline">{isTunisianTheme ? 'النمط التونسي' : 'النمط الأصلي'}</span>
        <span className="hidden sm:inline opacity-30">/</span>
        <span className="text-xs uppercase font-sans tracking-wider font-semibold">{isTunisianTheme ? 'Tunisian' : 'Default'}</span>
      </button>
      
      <AnimatePresence mode="wait">
        {view === 'home' && (
          <motion.div
            key="home"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="relative z-10 w-full h-full flex items-center justify-center min-h-screen"
          >
            <Menu 
              language={language}
              onLanguageChange={setLanguage}
              onStart={() => setView('modeSelection')}
              onRulesSelect={() => setView('rules')}
              soundEnabled={soundEnabled}
              onSoundToggle={handleSoundToggle}
              musicEnabled={musicEnabled}
              onMusicToggle={() => setMusicEnabled(!musicEnabled)}
              currentTrackId={currentTrack.id}
              onTrackSelect={setCurrentTrack}
              pieceAppearance={pieceAppearance}
              onPieceAppearanceChange={handlePieceAppearanceChange}
            />
          </motion.div>
        )}

        {view === 'modeSelection' && (
          <motion.div
            key="mode-selection"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="relative z-10 w-full h-full flex items-center justify-center min-h-screen"
          >
            <ModeSelection 
              language={language}
              onSelect={(mode, vsAI) => {
                setGameMode(mode);
                setIsVsAI(vsAI);
                setView('game');
              }}
              onRulesSelect={(mode) => {
                setRulesInitialVariant(mode);
                setView('rules');
              }}
              onBack={() => setView('home')}
            />
          </motion.div>
        )}

        {view === 'rules' && (
          <motion.div
            key="rules"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative z-10 w-full h-full"
          >
            <RulesPage 
              language={language}
              initialVariant={rulesInitialVariant}
              onBack={() => setView('modeSelection')}
            />
          </motion.div>
        )}

        {view === 'game' && (
          <motion.div
            key="game"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="relative z-10 w-full h-full"
          >
            <GameView 
              difficulty={difficulty}
              language={language}
              isVsAI={isVsAI}
              mode={gameMode}
              pieceAppearance={pieceAppearance}
              onShowRules={(mode) => {
                setRulesInitialVariant(mode);
                setView('rules');
              }}
              onBack={() => setView('modeSelection')}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

