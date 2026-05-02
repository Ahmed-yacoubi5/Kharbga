import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { doc, onSnapshot, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { Language, TRANSLATIONS, LobbyData } from '../types';
import { Users, User, ArrowLeft, Play, Shield, Loader2, Hourglass } from 'lucide-react';

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

  if (!lobby) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-tunisian-gold mb-4" size={48} />
        <p className="text-tunisian-dark-blue font-bold">Entering Hall...</p>
      </div>
    );
  }

  const players = Object.values(lobby.players || {}).filter((p): p is { name: string; isHost: boolean; lastSeen: number } => !!p);

  return (
    <div className="max-w-2xl w-full px-6 py-12 md:py-24 min-h-screen overflow-y-auto">
      <div className="flex items-center justify-between mb-12">
        <button onClick={handleLeave} className="p-3 rounded-full bg-white/50 hover:bg-white text-tunisian-dark-blue transition-all">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-4xl font-serif font-black text-tunisian-dark-blue flex-1 text-center">
          {lobby.name}
        </h1>
        <div className="w-12 h-12" />
      </div>

      <div className="bg-white/90 backdrop-blur-md rounded-[3rem] border-8 border-tunisian-gold shadow-2xl p-10">
        <div className="text-center mb-10">
          <div className="inline-block p-4 bg-tunisian-sandy rounded-2xl mb-4">
             <span className="font-black text-tunisian-blue uppercase tracking-widest text-sm">
                {lobby.mode === 'khamoussiya' ? t.khamoussiyaName : t.classicName}
             </span>
          </div>
          <p className="text-tunisian-dark-blue/60 font-bold">
            {lobby.isPublic ? t.public : t.private} Hall
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 mb-12">
           {players.map((player, idx) => (
             <motion.div 
               key={idx}
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               className={`flex items-center justify-between p-6 rounded-3xl border-4 ${player.isHost ? 'border-tunisian-blue bg-tunisian-blue/5' : 'border-tunisian-gold bg-tunisian-gold/5'}`}
             >
               <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${player.isHost ? 'bg-tunisian-blue text-white' : 'bg-tunisian-gold text-white'}`}>
                    <User size={28} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-tunisian-dark-blue">{player.name}</h3>
                    <p className="text-xs font-bold uppercase tracking-widest opacity-40">
                       {player.isHost ? "Grand Master (Host)" : "Challenger"}
                    </p>
                  </div>
               </div>
               {player.isHost && <Shield size={24} className="text-tunisian-blue" />}
             </motion.div>
           ))}

           {players.length < 2 && (
             <div className="flex flex-col items-center justify-center p-10 border-4 border-dashed border-tunisian-gold/30 rounded-3xl text-tunisian-dark-blue/30">
                <Hourglass size={48} className="animate-spin-slow mb-4" />
                <p className="text-xl font-bold">{t.waitingForPlayer}</p>
             </div>
           )}
        </div>

        <div className="flex flex-col gap-4">
          {isHost ? (
            <button 
              onClick={handleStart}
              disabled={players.length < 2}
              className={`w-full py-6 rounded-2xl font-black text-2xl shadow-xl transition-all flex items-center justify-center gap-3 ${players.length >= 2 ? 'bg-tunisian-red text-white hover:scale-105 active:scale-95' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
            >
              <Play size={28} /> {t.startGame}
            </button>
          ) : (
            <div className="w-full py-6 rounded-2xl bg-tunisian-gold/10 border-2 border-tunisian-gold text-tunisian-gold text-center font-black text-xl flex items-center justify-center gap-3">
              <Loader2 className="animate-spin" />
              {t.waitingForPlayer}
            </div>
          )}
          
          <button 
            onClick={handleLeave}
            className="w-full py-4 text-tunisian-dark-blue/40 font-bold hover:text-tunisian-red transition-all"
          >
            Leave Hall
          </button>
        </div>
      </div>
    </div>
  );
};
