/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ZelligeBackground } from './components/ZelligeBackground';
import { Menu } from './components/Menu';
import { GameView } from './components/GameView';
import { Language, Difficulty, BoardSize } from './types';
import { SoundManager } from './services/soundService';

export default function App() {
  const [view, setView] = useState<'menu' | 'game'>('menu');
  const [isVsAI, setIsVsAI] = useState(true);
  const [language, setLanguage] = useState<Language>('en');
  const [difficulty, setDifficulty] = useState<Difficulty>('hard');
  const [boardSize, setBoardSize] = useState<BoardSize>(5);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [musicEnabled, setMusicEnabled] = useState(false);

  const handleStartGame = (vsAI: boolean) => {
    setIsVsAI(vsAI);
    setView('game');
  };

  const handleSoundToggle = () => {
    const newState = !soundEnabled;
    setSoundEnabled(newState);
    SoundManager.setEnabled(newState);
  };

  useEffect(() => {
    if (musicEnabled) {
      SoundManager.playMusic();
    } else {
      SoundManager.stopMusic();
    }
  }, [musicEnabled]);

  return (
    <div className="relative min-h-screen font-sans selection:bg-amber-200">
      <ZelligeBackground />
      
      <AnimatePresence mode="wait">
        {view === 'menu' ? (
          <motion.div
            key="menu"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <Menu 
              onStartGame={handleStartGame}
              language={language}
              onLanguageChange={setLanguage}
              difficulty={difficulty}
              onDifficultyChange={setDifficulty}
              boardSize={boardSize}
              onBoardSizeChange={setBoardSize}
              soundEnabled={soundEnabled}
              onSoundToggle={handleSoundToggle}
              musicEnabled={musicEnabled}
              onMusicToggle={() => setMusicEnabled(!musicEnabled)}
            />
          </motion.div>
        ) : (
          <motion.div
            key="game"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <GameView 
              difficulty={difficulty}
              language={language}
              isVsAI={isVsAI}
              size={boardSize}
              onBack={() => setView('menu')}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

