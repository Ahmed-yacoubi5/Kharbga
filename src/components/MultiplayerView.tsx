import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  collection, query, where, onSnapshot, addDoc, updateDoc, doc, serverTimestamp, 
  deleteDoc, getDocs, getDoc, arrayUnion
} from 'firebase/firestore';
import { db, auth, ensureAuth, handleFirestoreError, OperationType, loginWithGoogle } from '../lib/firebase';
import { Language, TRANSLATIONS, LobbyData, GameMode } from '../types';
import { 
  Plus, Users, Lock, Unlock, ArrowLeft, RefreshCw, 
  Play, Shield, User as UserIcon, Signal, AlertCircle, LogIn 
} from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';

interface MultiplayerViewProps {
  language: Language;
  onBack: () => void;
  onJoinLobby: (lobby: LobbyData) => void;
}

export const MultiplayerView: React.FC<MultiplayerViewProps> = ({ 
  language, onBack, onJoinLobby 
}) => {
  const t = TRANSLATIONS[language];
  const [view, setView] = useState<'browser' | 'create' | 'enterPin'>('browser');
  const [lobbies, setLobbies] = useState<LobbyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [nickname, setNickname] = useState(localStorage.getItem('nickname') || '');
  const [lobbyName, setLobbyName] = useState(`${nickname}'s Hall`);
  const [selectedMode, setSelectedMode] = useState<GameMode>('classic');
  const [isPublic, setIsPublic] = useState(true);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [joiningLobby, setJoiningLobby] = useState<LobbyData | null>(null);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      setAuthenticated(!!user);
      if (user && !nickname) {
        setNickname(user.displayName?.split(' ')[0] || '');
      }
    });

    let unsubLobbies: (() => void) | undefined;

    if (authenticated) {
      const q = query(
        collection(db, 'lobbies'), 
        where('status', '==', 'waiting')
      );
      
      unsubLobbies = onSnapshot(q, (snapshot) => {
        const lobbyList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as LobbyData[];
        setLobbies(lobbyList);
        setLoading(false);
      }, (err) => {
        handleFirestoreError(err, OperationType.LIST, 'lobbies');
      });
    }

    return () => {
      unsubAuth();
      if (unsubLobbies) unsubLobbies();
    };
  }, [authenticated]);

  const handleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (err) {
      setError("Login failed. Please try again.");
    }
  };

  const handleCreateLobby = async () => {
    if (!nickname.trim()) {
      setError(t.nicknameRequired || "Nickname required");
      return;
    }
    localStorage.setItem('nickname', nickname);
    
    try {
      const user = await ensureAuth();
      const newLobby = {
        name: lobbyName || `${nickname}'s Hall`,
        mode: selectedMode,
        status: 'waiting',
        isPublic,
        pin: isPublic ? null : pin,
        hostId: user.uid,
        hostName: nickname,
        playerCount: 1,
        players: {
          [user.uid]: { name: nickname, isHost: true, lastSeen: Date.now() }
        },
        board: Array(selectedMode === 'khamoussiya' ? 25 : 49).fill(null),
        currentPlayer: 1,
        phase: 'placement',
        piecesLeftToPlace: { 1: selectedMode === 'khamoussiya' ? 12 : 24, 2: selectedMode === 'khamoussiya' ? 12 : 24 },
        moveCount: 0,
        winner: null,
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'lobbies'), newLobby);
      onJoinLobby({ id: docRef.id, ...newLobby } as any);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'lobbies');
    }
  };

  const handleJoinClick = (lobby: LobbyData) => {
    if (!nickname.trim()) {
      setError(t.nicknameRequired || "Nickname required");
      return;
    }
    localStorage.setItem('nickname', nickname);

    if (!lobby.isPublic) {
      setJoiningLobby(lobby);
      setView('enterPin');
    } else {
      performJoin(lobby);
    }
  };

  const performJoin = async (lobby: LobbyData, inputPin?: string) => {
    if (!lobby.isPublic && lobby.pin !== inputPin) {
      setError(t.invalidPin);
      return;
    }

    try {
      const user = await ensureAuth();
      const lobbyRef = doc(db, 'lobbies', lobby.id);
      
      await updateDoc(lobbyRef, {
        playerCount: 2,
        [`players.${user.uid}`]: { name: nickname, isHost: false, lastSeen: Date.now() }
      });

      onJoinLobby(lobby);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `lobbies/${lobby.id}`);
    }
  };

  return (
    <div className="max-w-4xl w-full px-6 py-12">
      <div className="flex items-center justify-between mb-12">
        <button onClick={onBack} className="p-3 rounded-full bg-white/50 hover:bg-white text-tunisian-dark-blue transition-all">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-4xl font-serif font-black text-tunisian-dark-blue flex-1 text-center">
          {t.playOnline}
        </h1>
        <div className="w-12 h-12" />
      </div>

      <div className="bg-white/90 backdrop-blur-md rounded-[3rem] border-8 border-tunisian-gold shadow-2xl p-8 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Signal size={120} className="text-tunisian-blue" />
        </div>

        <div className="relative z-10">
          {!authenticated ? (
            <div className="py-20 text-center space-y-8">
              <div className="w-24 h-24 bg-tunisian-gold/10 text-tunisian-gold rounded-full flex items-center justify-center mx-auto">
                <LogIn size={48} />
              </div>
              <div>
                <h2 className="text-3xl font-serif font-black text-tunisian-dark-blue mb-2">Auth Required</h2>
                <p className="text-tunisian-dark-blue/60">Sign in with Google to enter the Global Arena</p>
              </div>
              <button 
                onClick={handleLogin}
                className="px-12 py-5 rounded-2xl bg-tunisian-red text-white text-xl font-black shadow-xl hover:bg-tunisian-dark-blue transition-all flex items-center gap-4 mx-auto"
              >
                <LogIn size={24} /> {language === 'ar' ? 'تسجيل الدخول' : (language === 'fr' ? 'Se connecter' : 'Sign in with Google')}
              </button>
            </div>
          ) : (
            <>
              {/* User Profile Hook */}
              <div className="flex gap-4 mb-10 items-center bg-tunisian-sandy p-4 rounded-2xl border-2 border-tunisian-gold/30">
                <div className="p-3 bg-white rounded-xl text-tunisian-blue">
                  <UserIcon size={24} />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] font-black text-tunisian-dark-blue/50 uppercase tracking-widest">{t.nickname}</label>
                  <input 
                    type="text" 
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder={t.nickname}
                    className="w-full bg-transparent border-none focus:ring-0 text-xl font-bold text-tunisian-dark-blue p-0"
                  />
                </div>
              </div>
              {/* Main Views */}
              <AnimatePresence mode="wait">
            {view === 'browser' && (
              <motion.div 
                key="browser"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-end">
                  <h3 className="text-2xl font-serif font-black text-tunisian-dark-blue">{t.lobbies}</h3>
                  <button 
                    onClick={() => setView('create')}
                    className="flex items-center gap-2 px-6 py-3 bg-tunisian-blue text-white rounded-xl font-bold hover:bg-tunisian-dark-blue transition-all shadow-lg"
                  >
                    <Plus size={20} /> {t.createLobby}
                  </button>
                </div>

                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {loading ? (
                    <div className="flex flex-col items-center py-20 text-tunisian-dark-blue/40">
                      <RefreshCw size={48} className="animate-spin mb-4" />
                      <span className="font-bold">Searching for halls...</span>
                    </div>
                  ) : lobbies.length === 0 ? (
                    <div className="flex flex-col items-center py-20 text-center opacity-40">
                      <Users size={64} className="mb-4" />
                      <p className="text-xl font-medium">{t.noLobbies}</p>
                    </div>
                  ) : (
                    lobbies.map(lobby => (
                      <div 
                        key={lobby.id}
                        className="bg-white rounded-2xl border-2 border-tunisian-sandy p-5 flex items-center justify-between hover:border-tunisian-gold transition-all group"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${lobby.mode === 'khamoussiya' ? 'bg-tunisian-red/10 text-tunisian-red' : 'bg-tunisian-blue/10 text-tunisian-blue'}`}>
                            <span className="font-black">{lobby.mode === 'khamoussiya' ? '5x5' : '7x7'}</span>
                          </div>
                          <div>
                            <h4 className="font-bold text-lg text-tunisian-dark-blue flex items-center gap-2">
                              {lobby.name}
                              {!lobby.isPublic && <Lock size={14} className="text-tunisian-red" />}
                            </h4>
                            <p className="text-sm text-tunisian-dark-blue/50 flex items-center gap-4">
                              <span className="flex items-center gap-1"><UserIcon size={14} /> {lobby.hostName}</span>
                              <span className="flex items-center gap-1"><Users size={14} /> {lobby.playerCount}/2</span>
                            </p>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleJoinClick(lobby)}
                          className="px-6 py-2 rounded-xl bg-tunisian-dark-blue text-white font-bold hover:bg-tunisian-red transition-all shadow-md group-hover:scale-105"
                        >
                          {t.joinLobby}
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}

            {view === 'create' && (
              <motion.div 
                key="create"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="flex items-center gap-4">
                  <button onClick={() => setView('browser')} className="p-2 hover:bg-tunisian-sandy rounded-lg">
                    <ArrowLeft size={20} />
                  </button>
                  <h3 className="text-2xl font-serif font-black text-tunisian-dark-blue">{t.createLobby}</h3>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <label className="text-sm font-black text-tunisian-dark-blue/60 mb-2 block uppercase">{t.lobbyName}</label>
                      <input 
                        type="text" 
                        value={lobbyName}
                        onChange={(e) => setLobbyName(e.target.value)}
                        className="w-full p-4 rounded-xl border-2 border-tunisian-sandy bg-white focus:border-tunisian-blue outline-none font-bold"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-black text-tunisian-dark-blue/60 mb-2 block uppercase">Mode</label>
                      <div className="grid grid-cols-2 gap-2">
                        {(['classic', 'khamoussiya'] as GameMode[]).map(mode => (
                          <button
                            key={mode}
                            onClick={() => setSelectedMode(mode)}
                            className={`p-4 rounded-xl border-2 font-bold transition-all ${selectedMode === mode ? 'border-tunisian-blue bg-tunisian-blue/5 text-tunisian-blue' : 'border-tunisian-sandy bg-white text-tunisian-dark-blue/40'}`}
                          >
                            {mode === 'khamoussiya' ? '5x5' : '7x7'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="text-sm font-black text-tunisian-dark-blue/60 mb-2 block uppercase">Privacy</label>
                      <div className="flex gap-4">
                        <button 
                          onClick={() => setIsPublic(true)}
                          className={`flex-1 flex flex-col items-center p-4 rounded-xl border-2 transition-all ${isPublic ? 'border-tunisian-blue bg-tunisian-blue/5 text-tunisian-blue' : 'border-tunisian-sandy text-tunisian-dark-blue/40'}`}
                        >
                          <Unlock size={24} className="mb-2" />
                          <span className="font-bold">{t.public}</span>
                        </button>
                        <button 
                          onClick={() => setIsPublic(false)}
                          className={`flex-1 flex flex-col items-center p-4 rounded-xl border-2 transition-all ${!isPublic ? 'border-tunisian-blue bg-tunisian-blue/5 text-tunisian-blue' : 'border-tunisian-sandy text-tunisian-dark-blue/40'}`}
                        >
                          <Lock size={24} className="mb-2" />
                          <span className="font-bold">{t.private}</span>
                        </button>
                      </div>
                    </div>

                    {!isPublic && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <label className="text-sm font-black text-tunisian-dark-blue/60 mb-2 block uppercase">{t.pin}</label>
                        <input 
                          type="text" 
                          maxLength={4}
                          value={pin}
                          onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                          placeholder="0000"
                          className="w-full p-4 rounded-xl border-2 border-tunisian-sandy bg-white focus:border-tunisian-blue outline-none font-bold text-center text-2xl tracking-[1em]"
                        />
                      </motion.div>
                    )}
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-4 bg-tunisian-red/10 text-tunisian-red rounded-xl font-bold">
                    <AlertCircle size={20} />
                    {error}
                  </div>
                )}

                <button 
                  onClick={handleCreateLobby}
                  className="w-full py-5 rounded-2xl bg-tunisian-red text-white text-2xl font-black shadow-xl hover:bg-tunisian-dark-blue transition-all"
                >
                  {t.createLobby}
                </button>
              </motion.div>
            )}

            {view === 'enterPin' && (
              <motion.div 
                key="pin"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="py-10 text-center"
              >
                <div className="w-20 h-20 bg-tunisian-red/10 text-tunisian-red rounded-full flex items-center justify-center mx-auto mb-6">
                  <Shield size={40} />
                </div>
                <h3 className="text-3xl font-serif font-black text-tunisian-dark-blue mb-2">{t.pinRequired}</h3>
                <p className="text-tunisian-dark-blue/60 mb-8">{t.enterPin} for "{joiningLobby?.name}"</p>
                
                <input 
                  type="text" 
                  maxLength={4}
                  autoFocus
                  value={pin}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    setPin(val);
                    if (val.length === 4 && joiningLobby) {
                      performJoin(joiningLobby, val);
                    }
                  }}
                  className="w-48 p-5 rounded-2xl border-4 border-tunisian-gold bg-white focus:border-tunisian-blue outline-none font-black text-center text-4xl tracking-[0.5em] mb-10"
                />

                <div className="flex flex-col gap-4 max-w-xs mx-auto">
                  <button 
                    onClick={() => performJoin(joiningLobby!, pin)}
                    className="w-full py-4 rounded-xl bg-tunisian-blue text-white font-bold"
                  >
                    {t.joinLobby}
                  </button>
                  <button 
                    onClick={() => { setView('browser'); setPin(''); setError(''); }}
                    className="text-tunisian-dark-blue/40 font-bold hover:text-tunisian-dark-blue"
                  >
                    {t.back}
                  </button>
                </div>

                {error && <p className="mt-4 text-tunisian-red font-bold">{error}</p>}
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
        </div>
      </div>
    </div>
  );
};
