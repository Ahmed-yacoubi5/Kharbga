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
import { Language, Difficulty, BoardSize, GameMode } from './types';
import { SoundManager } from './services/soundService';

export default function App() {
  const [view, setView] = useState<'home' | 'modeSelection' | 'game'>('home');
  const [isVsAI, setIsVsAI] = useState(true);
  const [language, setLanguage] = useState<Language>('ar');
  const [difficulty, setDifficulty] = useState<Difficulty>('hard');
  const [gameMode, setGameMode] = useState<GameMode>('classic');
  const [boardSize, setBoardSize] = useState<BoardSize>(7);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [musicEnabled, setMusicEnabled] = useState(false);

  useEffect(() => {
    if (musicEnabled) {
      SoundManager.playMusic();
    } else {
      SoundManager.stopMusic();
    }
  }, [musicEnabled]);

  const handleSoundToggle = () => {
    const newState = !soundEnabled;
    setSoundEnabled(newState);
    SoundManager.setEnabled(newState);
  };

  return (
    <div 
      className="relative min-h-screen font-sans selection:bg-tunisian-gold selection:text-tunisian-dark-blue overflow-hidden" 
      dir={language === 'ar' ? 'rtl' : 'ltr'}
    >
      <ZelligeBackground />
      
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
              soundEnabled={soundEnabled}
              onSoundToggle={handleSoundToggle}
              musicEnabled={musicEnabled}
              onMusicToggle={() => setMusicEnabled(!musicEnabled)}
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
                setBoardSize(mode === 'khamoussiya' ? 5 : 7);
                setIsVsAI(vsAI);
                setView('game');
              }}
              onBack={() => setView('home')}
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
              size={boardSize}
              mode={gameMode}
              onBack={() => setView('modeSelection')}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

