import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { doc, onSnapshot, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { Language, TRANSLATIONS, LobbyData, GAME_VARIANTS } from '../types';
import { Users, User, ArrowLeft, Play, Shield, Loader2, Hourglass, Lock, Copy, Check, Sparkles } from 'lucide-react';

interface OnlineLobbyRoomProps {
  language: Language;
  lobbyId: string;
  onStartGame: () => void;
  onBack: () => void;
}

export const OnlineLobbyRoom: React.FC<OnlineLobbyRoomProps> = ({ 
  language, lobbyId, onStartGame, onBack 
}) => {
  const t = TRANSLATIONS[language];
  const [lobby, setLobby] = useState<LobbyData | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!lobbyId) return;

    const unsubscribe = onSnapshot(doc(db, 'lobbies', lobbyId), (snapshot) => {
      if (!snapshot.exists()) {
        onBack();
        return;
      }
      const data = { id: snapshot.id, ...snapshot.data() } as LobbyData;
      setLobby(data);
      setIsHost(data.hostId === auth.currentUser?.uid);

      if (data.status === 'playing') {
        onStartGame();
      }
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, `lobbies/${lobbyId}`);
    });

    return () => unsubscribe();
  }, [lobbyId]);

  const handleStart = async () => {
    if (!lobby || !isHost || lobby.playerCount < 2) return;
    
    try {
      await updateDoc(doc(db, 'lobbies', lobbyId), {
        status: 'playing',
        lastMoveAt: new Date().toISOString()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `lobbies/${lobbyId}`);
    }
  };

  const handleLeave = async () => {
    if (!lobby) {
      onBack();
      return;
    }
    
    try {
      if (isHost) {
        await deleteDoc(doc(db, 'lobbies', lobbyId));
      } else {
        const user = auth.currentUser;
        if (user) {
          await updateDoc(doc(db, 'lobbies', lobbyId), {
            playerCount: 1,
            [`players.${user.uid}`]: null
          });
        }
      }
      onBack();
    } catch (err) {
      onBack();
    }
  };

  const handleCopyPin = () => {
    if (lobby?.pin) {
      navigator.clipboard.writeText(lobby.pin);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!lobby) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-tunisian-gold mb-4" size={48} />
        <p className="text-tunisian-dark-blue font-bold">Connecting to Hall...</p>
      </div>
    );
  }

  const players = Object.values(lobby.players || {}).filter((p): p is { name: string; isHost: boolean; lastSeen: number } => !!p);
  const variant = GAME_VARIANTS[lobby.mode] || GAME_VARIANTS.sabouiya_standard;

  return (
    <div className="max-w-2xl w-full px-4 sm:px-6 py-8 md:py-16 min-h-screen overflow-y-auto">
      <div className="flex items-center justify-between mb-8">
        <button 
          onClick={handleLeave} 
          className="p-3 rounded-2xl bg-white/80 hover:bg-white text-tunisian-dark-blue shadow-md transition-all flex items-center gap-2 font-bold"
        >
          <ArrowLeft size={20} />
          <span className="hidden sm:inline">{t.back}</span>
        </button>
        
        <h1 className="text-2xl md:text-3xl font-serif font-black text-tunisian-dark-blue flex-1 text-center truncate px-2">
          {lobby.name}
        </h1>
        
        <div className="w-12 h-12" />
      </div>

      <div className="bg-white/90 backdrop-blur-md rounded-[2.5rem] border-8 border-tunisian-gold shadow-2xl p-6 sm:p-10">
        {/* Game Mode & Room Info */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-tunisian-sandy/50 border border-tunisian-gold/40 rounded-2xl mb-3 shadow-inner">
             <Sparkles size={16} className="text-tunisian-gold" />
             <span className="font-black text-tunisian-dark-blue uppercase tracking-wider text-sm">
                {t[variant.nameKey as keyof typeof t] || variant.nameKey}
             </span>
             <span className="text-xs text-tunisian-dark-blue/50 font-bold">
               ({variant.boardType === 'circular' ? 'Circular' : `${variant.size}x${variant.size}`})
             </span>
          </div>

          <div className="flex items-center justify-center gap-3">
            <span className="text-xs font-bold text-tunisian-dark-blue/60">
              {lobby.isPublic ? t.public : t.private}
            </span>

            {!lobby.isPublic && lobby.pin && (
              <button 
                onClick={handleCopyPin}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-tunisian-red/10 border border-tunisian-red/30 rounded-xl text-xs font-mono font-black text-tunisian-red hover:bg-tunisian-red/20 transition-all shadow-sm"
                title="Click to copy PIN code"
              >
                <Lock size={12} /> PIN: {lobby.pin}
                {copied ? <Check size={12} className="text-green-600" /> : <Copy size={12} />}
              </button>
            )}
          </div>
        </div>

        {/* Players List */}
        <div className="grid grid-cols-1 gap-4 mb-8">
           {players.map((player, idx) => (
             <motion.div 
               key={idx}
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               className={`flex items-center justify-between p-5 rounded-2xl border-4 ${
                 player.isHost 
                   ? 'border-tunisian-blue/50 bg-tunisian-blue/5' 
                   : 'border-tunisian-gold/50 bg-tunisian-gold/5'
               }`}
             >
               <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold shadow-md ${
                    player.isHost ? 'bg-tunisian-blue text-white' : 'bg-tunisian-gold text-tunisian-dark-blue'
                  }`}>
                    <User size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-tunisian-dark-blue flex items-center gap-2">
                      {player.name}
                      {player.isHost && (
                        <span className="text-[10px] uppercase tracking-wider bg-tunisian-blue text-white px-2 py-0.5 rounded-md font-bold">
                          Host (P1)
                        </span>
                      )}
                      {!player.isHost && (
                        <span className="text-[10px] uppercase tracking-wider bg-tunisian-gold text-tunisian-dark-blue px-2 py-0.5 rounded-md font-bold">
                          Player 2
                        </span>
                      )}
                    </h3>
                    <p className="text-xs font-bold text-tunisian-dark-blue/40">
                      {player.isHost ? "White / Blue pieces" : "Red / Terracotta pieces"}
                    </p>
                  </div>
               </div>
               {player.isHost ? (
                 <Shield size={22} className="text-tunisian-blue" />
               ) : (
                 <Users size={22} className="text-tunisian-gold" />
               )}
             </motion.div>
           ))}

           {players.length < 2 && (
             <div className="flex flex-col items-center justify-center p-8 border-4 border-dashed border-tunisian-gold/30 rounded-2xl text-tunisian-dark-blue/40 bg-white/40">
                <Hourglass size={36} className="animate-spin mb-3 text-tunisian-gold" />
                <p className="text-base font-bold text-center">{t.waitingForPlayer}</p>
                {!lobby.isPublic && lobby.pin && (
                  <p className="text-xs text-tunisian-dark-blue/60 mt-1 font-mono">
                    Share PIN: <strong className="text-tunisian-red text-sm">{lobby.pin}</strong>
                  </p>
                )}
             </div>
           )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          {isHost ? (
            <button 
              onClick={handleStart}
              disabled={players.length < 2}
              className={`w-full py-5 rounded-2xl font-black text-xl shadow-xl transition-all flex items-center justify-center gap-3 ${
                players.length >= 2 
                  ? 'bg-gradient-to-r from-tunisian-red to-tunisian-dark-blue text-white hover:scale-105 active:scale-95' 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Play size={24} /> {t.startGame}
            </button>
          ) : (
            <div className="w-full py-5 rounded-2xl bg-tunisian-gold/15 border-2 border-tunisian-gold text-tunisian-dark-blue text-center font-black text-base flex items-center justify-center gap-2.5">
              <Loader2 className="animate-spin text-tunisian-blue" size={20} />
              {t.waitingForPlayer}
            </div>
          )}
          
          <button 
            onClick={handleLeave}
            className="w-full py-3 text-tunisian-dark-blue/40 font-bold hover:text-tunisian-red transition-all text-sm"
          >
            {t.back}
          </button>
        </div>
      </div>
    </div>
  );
};
