
import React from 'react';
import { motion } from 'motion/react';
import { MUSIC_TRACKS, MusicTrack } from '../constants';
import { Music, Play, Pause } from 'lucide-react';
import { Language, TRANSLATIONS } from '../types';

interface MusicSelectorProps {
  currentTrackId: string;
  onTrackSelect: (track: MusicTrack) => void;
  musicEnabled: boolean;
  language: Language;
}

export const MusicSelector: React.FC<MusicSelectorProps> = ({ 
  currentTrackId, onTrackSelect, musicEnabled, language 
}) => {
  const t = TRANSLATIONS[language];

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center gap-2 text-tunisian-dark-blue/60 font-bold uppercase text-xs">
        <Music size={14} />
        <span>{language === 'ar' ? 'اختر الموسيقى' : (language === 'fr' ? 'Choisir la Musique' : 'Select Atmosphere')}</span>
      </div>
      
      <div className="grid grid-cols-1 gap-2">
        {MUSIC_TRACKS.map((track) => (
          <motion.button
            key={track.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onTrackSelect(track)}
            className={`
              flex items-center justify-between p-4 rounded-xl border-2 transition-all
              ${currentTrackId === track.id 
                ? 'border-tunisian-gold bg-tunisian-gold/10 text-tunisian-dark-blue shadow-md' 
                : 'border-tunisian-gold/20 bg-white/50 text-tunisian-dark-blue/70 hover:bg-white'}
            `}
          >
            <div className="flex flex-col items-start">
              <span className="font-bold flex items-center gap-2">
                {track.name}
              </span>
            </div>
            
            {currentTrackId === track.id && musicEnabled ? (
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="w-8 h-8 rounded-full bg-tunisian-gold flex items-center justify-center text-white"
              >
                <Play size={16} fill="currentColor" />
              </motion.div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-tunisian-dark-blue/5 flex items-center justify-center">
                <Music size={16} className="opacity-40" />
              </div>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
};
