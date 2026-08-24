import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  collection, query, where, onSnapshot, addDoc, updateDoc, doc, serverTimestamp, getDocs
} from 'firebase/firestore';
import { db, auth, ensureAuth, handleFirestoreError, OperationType, loginWithGoogle } from '../lib/firebase';
import { Language, TRANSLATIONS, LobbyData, GameMode, GAME_VARIANTS, GameVariantInfo } from '../types';
import { 
  Plus, Users, Lock, Unlock, ArrowLeft, RefreshCw, 
  Shield, User as UserIcon, Signal, AlertCircle, LogIn, Trophy, 
  Edit2, Check, Sparkles, Swords, Award, Percent
} from 'lucide-react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { StatsService, PlayerStats } from '../services/statsService';

interface MultiplayerViewProps {
  language: Language;
  pieceAppearance: 'seashell' | 'default';
  onBack: () => void;
  onJoinLobby: (lobby: LobbyData) => void;
}

export const MultiplayerView: React.FC<MultiplayerViewProps> = ({ 
  language, pieceAppearance, onBack, onJoinLobby 
}) => {
  const t = TRANSLATIONS[language];
  const [view, setView] = useState<'browser' | 'create' | 'enterPin'>('browser');
  const [lobbies, setLobbies] = useState<LobbyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(auth.currentUser);
  
  // Nickname State
  const [nickname, setNickname] = useState(() => {
    const saved = localStorage.getItem('kharbga_player_name');
    if (saved) return saved;
    return `Player_${Math.floor(1000 + Math.random() * 9000)}`;
  });
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [tempNickname, setTempNickname] = useState(nickname);

  // Stats State
  const [stats, setStats] = useState<PlayerStats>(() => StatsService.getLocalStats());

  // Lobby Creation State
  const [lobbyName, setLobbyName] = useState(`${nickname}'s Arena`);
  const [selectedMode, setSelectedMode] = useState<GameMode>('sabouiya_standard');
  const [isPublic, setIsPublic] = useState(true);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [joiningLobby, setJoiningLobby] = useState<LobbyData | null>(null);

  // Auth & Lobbies Subscription
  useEffect(() => {
    let unsubAuth: (() => void) | undefined;
    let unsubLobbies: (() => void) | undefined;

    // Ensure session is initialized
    ensureAuth().then((user) => {
      setCurrentUser(user);
      if (user.displayName && !localStorage.getItem('kharbga_player_name')) {
        const cleanName = user.displayName.split(' ')[0];
        setNickname(cleanName);
        setTempNickname(cleanName);
        localStorage.setItem('kharbga_player_name', cleanName);
      }
      // Load server stats and sync
      StatsService.fetchServerStats(user.uid).then((srvStats) => {
        if (srvStats) {
          setStats(srvStats);
        }
      });
      StatsService.syncNickname(user.uid, nickname);
    }).catch((err) => {
      console.warn("Auth initialization notice:", err);
    });

    unsubAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        StatsService.fetchServerStats(user.uid).then((srvStats) => {
          if (srvStats) setStats(srvStats);
        });
      }
    });

    // Real-time listen to waiting lobbies
    const q = query(
      collection(db, 'lobbies'), 
      where('status', '==', 'waiting')
    );
    
    unsubLobbies = onSnapshot(q, (snapshot) => {
      const lobbyList = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      })) as LobbyData[];
      setLobbies(lobbyList);
      setLoading(false);
    }, (err) => {
      console.warn("Lobbies fetch notice:", err);
      setLoading(false);
    });

    return () => {
      if (unsubAuth) unsubAuth();
      if (unsubLobbies) unsubLobbies();
    };
  }, []);

  const handleSaveNickname = async () => {
    const trimmed = tempNickname.trim().slice(0, 30);
    if (!trimmed) return;
    setNickname(trimmed);
    setTempNickname(trimmed);
    localStorage.setItem('kharbga_player_name', trimmed);
    setIsEditingNickname(false);
    
    if (currentUser) {
      await StatsService.syncNickname(currentUser.uid, trimmed);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const user = await loginWithGoogle();
      setCurrentUser(user);
      if (user.displayName) {
        const name = user.displayName.split(' ')[0];
        setNickname(name);
        setTempNickname(name);
        localStorage.setItem('kharbga_player_name', name);
        await StatsService.syncNickname(user.uid, name);
      }
      const srvStats = await StatsService.fetchServerStats(user.uid);
      if (srvStats) setStats(srvStats);
    } catch (err: any) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const variantList = Object.values(GAME_VARIANTS);

  const handleCreateLobby = async () => {
    setError('');
    const cleanNick = nickname.trim() || 'Player';
    const cleanLobbyName = lobbyName.trim() || `${cleanNick}'s Arena`;

    if (!isPublic) {
      if (!pin || pin.length !== 5 || !/^\d{5}$/.test(pin)) {
        setError(t.invalidPin || "5-digit PIN required");
        return;
      }
    }

    try {
      const user = await ensureAuth();
      const variant = GAME_VARIANTS[selectedMode];
      const boardSize = selectedMode === 'tleisha' ? 7 : variant.size * variant.size;
      
      const newLobby = {
        name: cleanLobbyName,
        mode: selectedMode,
        status: 'waiting',
        isPublic,
        pin: isPublic ? null : pin,
        hostId: user.uid,
        hostName: cleanNick,
        playerCount: 1,
        players: {
          [user.uid]: { name: cleanNick, isHost: true, lastSeen: Date.now() }
        },
        board: Array(boardSize).fill(null),
        currentPlayer: 1,
        phase: variant.id === 'sabouiya_guettar' ? 'movement' : 'placement',
        piecesLeftToPlace: { 1: variant.pieces, 2: variant.pieces },
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
    setError('');
    setJoiningLobby(lobby);
    if (!lobby.isPublic) {
      setPin('');
      setView('enterPin');
    } else {
      performJoin(lobby);
    }
  };

  const performJoin = async (lobby: LobbyData, inputPin?: string) => {
    setError('');
    if (!lobby.isPublic && lobby.pin !== inputPin) {
      setError(t.invalidPin);
      return;
    }

    try {
      const user = await ensureAuth();
      const lobbyRef = doc(db, 'lobbies', lobby.id);
      const cleanNick = nickname.trim() || 'Player';
      
      await updateDoc(lobbyRef, {
        playerCount: 2,
        [`players.${user.uid}`]: { name: cleanNick, isHost: false, lastSeen: Date.now() }
      });

      onJoinLobby(lobby);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `lobbies/${lobby.id}`);
    }
  };

  return (
    <div className="max-w-4xl w-full px-4 sm:px-6 py-8 md:py-16 min-h-screen overflow-y-auto">
      {/* Top Navigation */}
      <div className="flex items-center justify-between mb-8">
        <button 
          onClick={onBack} 
          className="p-3 rounded-2xl bg-white/80 hover:bg-white text-tunisian-dark-blue shadow-md transition-all flex items-center gap-2 font-bold"
        >
          <ArrowLeft size={20} />
          <span className="hidden sm:inline">{t.back}</span>
        </button>
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-serif font-black text-tunisian-dark-blue flex items-center justify-center gap-3">
            <Swords className="text-tunisian-red" size={32} />
            {t.onlineMultiplayer}
          </h1>
          <p className="text-xs text-tunisian-dark-blue/60 font-bold mt-1">
            {t.clientCosmeticsNote}
          </p>
        </div>
        <div className="w-12 h-12 flex items-center justify-end">
          {currentUser && (
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" title="Online" />
          )}
        </div>
      </div>

      {/* Player Identity & Win/Loss Record Bar */}
      <div className="bg-white/95 backdrop-blur-md rounded-3xl border-4 border-tunisian-gold/50 shadow-xl p-5 mb-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Editable Nickname */}
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-tunisian-blue to-tunisian-dark-blue text-white flex items-center justify-center shadow-md shrink-0">
              <UserIcon size={28} />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-tunisian-dark-blue/50">
                  {t.nickname}
                </span>
                {currentUser?.isAnonymous && (
                  <span className="text-[10px] bg-tunisian-sandy text-tunisian-dark-blue px-2 py-0.5 rounded-full font-bold">
                    Guest
                  </span>
                )}
              </div>

              {isEditingNickname ? (
                <div className="flex items-center gap-2 mt-1">
                  <input 
                    type="text"
                    maxLength={30}
                    value={tempNickname}
                    onChange={(e) => setTempNickname(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveNickname()}
                    autoFocus
                    className="px-3 py-1.5 rounded-xl border-2 border-tunisian-blue bg-white text-tunisian-dark-blue font-bold text-lg outline-none w-48 shadow-inner"
                  />
                  <button 
                    onClick={handleSaveNickname}
                    className="p-2 rounded-xl bg-tunisian-blue text-white hover:bg-tunisian-dark-blue shadow transition-all"
                    title={t.saveNickname}
                  >
                    <Check size={18} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xl md:text-2xl font-black text-tunisian-dark-blue">
                    {nickname}
                  </span>
                  <button 
                    onClick={() => { setTempNickname(nickname); setIsEditingNickname(true); }}
                    className="p-1.5 rounded-lg hover:bg-tunisian-sandy/50 text-tunisian-dark-blue/50 hover:text-tunisian-dark-blue transition-all"
                    title={t.changeNickname}
                  >
                    <Edit2 size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Stats Bar */}
          <div className="flex items-center gap-4 bg-tunisian-sandy/30 border border-tunisian-gold/30 px-5 py-3 rounded-2xl w-full md:w-auto justify-around">
            <div className="text-center">
              <div className="text-xs font-bold text-tunisian-dark-blue/50 uppercase">{t.wins}</div>
              <div className="text-xl font-black text-green-600 flex items-center justify-center gap-1">
                <Trophy size={16} /> {stats.wins}
              </div>
            </div>
            <div className="w-[1px] h-8 bg-tunisian-dark-blue/15" />
            <div className="text-center">
              <div className="text-xs font-bold text-tunisian-dark-blue/50 uppercase">{t.losses}</div>
              <div className="text-xl font-black text-tunisian-red flex items-center justify-center gap-1">
                <Shield size={16} /> {stats.losses}
              </div>
            </div>
            <div className="w-[1px] h-8 bg-tunisian-dark-blue/15" />
            <div className="text-center">
              <div className="text-xs font-bold text-tunisian-dark-blue/50 uppercase">{t.winRate}</div>
              <div className="text-xl font-black text-tunisian-blue flex items-center justify-center gap-1">
                <Percent size={16} /> {stats.winRate}%
              </div>
            </div>
          </div>

          {/* Optional Google Sign-In */}
          {!currentUser || currentUser.isAnonymous ? (
            <button
              onClick={handleGoogleLogin}
              className="px-4 py-2.5 rounded-xl bg-white border-2 border-tunisian-gold hover:border-tunisian-blue text-xs font-bold text-tunisian-dark-blue flex items-center gap-2 shadow-sm transition-all shrink-0 hover:scale-105"
            >
              <LogIn size={14} className="text-tunisian-blue" />
              <span>{language === 'ar' ? 'ربط بحساب Google' : (language === 'fr' ? 'Lier compte Google' : 'Sign in with Google')}</span>
            </button>
          ) : (
            <div className="text-xs font-bold text-green-700 bg-green-50 px-3 py-1.5 rounded-xl border border-green-200 flex items-center gap-1.5">
              <Check size={14} /> Google Connected
            </div>
          )}
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white/90 backdrop-blur-md rounded-[2.5rem] border-8 border-tunisian-gold shadow-2xl p-6 sm:p-8 relative">
        <AnimatePresence mode="wait">
          {view === 'browser' && (
            <motion.div 
              key="browser"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-serif font-black text-tunisian-dark-blue flex items-center gap-2">
                    <Signal size={22} className="text-tunisian-blue" />
                    {t.lobbies}
                  </h2>
                  <p className="text-xs text-tunisian-dark-blue/50 font-bold">
                    {lobbies.length} {lobbies.length === 1 ? 'hall waiting' : 'halls waiting'}
                  </p>
                </div>
                
                <button 
                  onClick={() => setView('create')}
                  className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-tunisian-red to-tunisian-dark-blue text-white rounded-2xl font-black text-base hover:shadow-xl hover:scale-105 active:scale-95 transition-all shadow-md w-full sm:w-auto justify-center"
                >
                  <Plus size={20} /> {t.createLobby}
                </button>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-4 bg-tunisian-red/10 border-2 border-tunisian-red text-tunisian-red rounded-2xl font-bold text-sm">
                  <AlertCircle size={20} className="shrink-0" />
                  {error}
                </div>
              )}

              {/* Lobbies List */}
              <div className="space-y-4 max-h-[480px] overflow-y-auto pr-1">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-20 text-tunisian-dark-blue/40">
                    <RefreshCw size={40} className="animate-spin mb-3 text-tunisian-gold" />
                    <span className="font-bold">Gathering open halls in the Medina...</span>
                  </div>
                ) : lobbies.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center text-tunisian-dark-blue/40 border-4 border-dashed border-tunisian-gold/30 rounded-3xl p-8">
                    <Users size={56} className="mb-3 text-tunisian-gold/60" />
                    <p className="text-lg font-bold text-tunisian-dark-blue/70 mb-2">{t.noLobbies}</p>
                    <button
                      onClick={() => setView('create')}
                      className="mt-2 px-6 py-2.5 rounded-xl bg-tunisian-blue text-white font-bold text-sm hover:bg-tunisian-dark-blue transition-all"
                    >
                      {t.createLobby}
                    </button>
                  </div>
                ) : (
                  lobbies.map((lobby) => {
                    const variant = GAME_VARIANTS[lobby.mode] || GAME_VARIANTS.sabouiya_standard;
                    return (
                      <div 
                        key={lobby.id}
                        className="bg-white rounded-2xl border-2 border-tunisian-sandy hover:border-tunisian-gold p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all shadow-sm hover:shadow-md group"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center shrink-0 font-black shadow-inner ${
                            variant.size === 3 
                              ? 'bg-amber-100 text-amber-800' 
                              : variant.size === 5 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            <span className="text-xs opacity-75">{variant.boardType === 'circular' ? '○' : `${variant.size}x${variant.size}`}</span>
                            <span className="text-[11px] uppercase tracking-tighter leading-none">{variant.capture === 'none' ? 'Line' : 'War'}</span>
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-lg text-tunisian-dark-blue group-hover:text-tunisian-blue transition-colors">
                                {lobby.name}
                              </h3>
                              {!lobby.isPublic && (
                                <span className="inline-flex items-center gap-1 text-[11px] bg-red-50 text-tunisian-red border border-red-200 px-2 py-0.5 rounded-md font-bold">
                                  <Lock size={12} /> 5-PIN
                                </span>
                              )}
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-3 text-xs text-tunisian-dark-blue/60 font-semibold mt-1">
                              <span className="text-tunisian-red font-bold">
                                {t[variant.nameKey as keyof typeof t] || variant.nameKey}
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <UserIcon size={13} /> {lobby.hostName}
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Users size={13} /> {lobby.playerCount}/2
                              </span>
                            </div>
                          </div>
                        </div>

                        <button 
                          onClick={() => handleJoinClick(lobby)}
                          className="px-6 py-3 rounded-xl bg-tunisian-dark-blue hover:bg-tunisian-red text-white font-bold text-sm transition-all shadow hover:scale-105 active:scale-95 text-center shrink-0"
                        >
                          {t.joinLobby}
                        </button>
                      </div>
                    );
                  })
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
              className="space-y-6"
            >
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => { setView('browser'); setError(''); }} 
                  className="p-2 hover:bg-tunisian-sandy rounded-xl text-tunisian-dark-blue transition-all"
                >
                  <ArrowLeft size={22} />
                </button>
                <h2 className="text-2xl font-serif font-black text-tunisian-dark-blue">
                  {t.createLobby}
                </h2>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Left Column: Lobby Name & Variant */}
                <div className="space-y-5">
                  <div>
                    <label className="text-xs font-black text-tunisian-dark-blue/70 mb-1.5 block uppercase tracking-wider">
                      {t.lobbyName}
                    </label>
                    <input 
                      type="text" 
                      maxLength={50}
                      value={lobbyName}
                      onChange={(e) => setLobbyName(e.target.value)}
                      placeholder={`${nickname}'s Arena`}
                      className="w-full p-3.5 rounded-xl border-2 border-tunisian-sandy bg-white focus:border-tunisian-blue outline-none font-bold text-tunisian-dark-blue shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-black text-tunisian-dark-blue/70 mb-1.5 block uppercase tracking-wider">
                      {t.selectMode}
                    </label>
                    <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto p-1 border border-tunisian-sandy rounded-xl bg-tunisian-sandy/20">
                      {variantList.map((v: GameVariantInfo) => (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => setSelectedMode(v.id)}
                          className={`p-3 rounded-xl border-2 font-bold transition-all text-left flex flex-col justify-between ${
                            selectedMode === v.id 
                              ? 'border-tunisian-blue bg-white shadow-md text-tunisian-blue scale-[1.02]' 
                              : 'border-transparent bg-white/70 text-tunisian-dark-blue/70 hover:bg-white'
                          }`}
                        >
                          <span className="text-xs font-black line-clamp-1">
                            {t[v.nameKey as keyof typeof t] || v.nameKey}
                          </span>
                          <span className="text-[10px] opacity-60 mt-1">
                            {v.boardType === 'circular' ? 'Circular' : `${v.size}x${v.size}`} • {v.pieces} pcs
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column: Privacy & 5-Digit PIN */}
                <div className="space-y-5">
                  <div>
                    <label className="text-xs font-black text-tunisian-dark-blue/70 mb-1.5 block uppercase tracking-wider">
                      Privacy & Access
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        type="button"
                        onClick={() => setIsPublic(true)}
                        className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${
                          isPublic 
                            ? 'border-tunisian-blue bg-white shadow-md text-tunisian-blue' 
                            : 'border-tunisian-sandy bg-white/50 text-tunisian-dark-blue/40 hover:bg-white'
                        }`}
                      >
                        <Unlock size={24} className="mb-1.5" />
                        <span className="font-black text-sm">{t.public}</span>
                        <span className="text-[10px] opacity-60">Anyone can join</span>
                      </button>

                      <button 
                        type="button"
                        onClick={() => setIsPublic(false)}
                        className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${
                          !isPublic 
                            ? 'border-tunisian-red bg-white shadow-md text-tunisian-red' 
                            : 'border-tunisian-sandy bg-white/50 text-tunisian-dark-blue/40 hover:bg-white'
                        }`}
                      >
                        <Lock size={24} className="mb-1.5" />
                        <span className="font-black text-sm">{t.private}</span>
                        <span className="text-[10px] opacity-60">5-Digit Code</span>
                      </button>
                    </div>
                  </div>

                  {!isPublic && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }} 
                      animate={{ opacity: 1, height: 'auto' }}
                      className="bg-tunisian-red/5 p-4 rounded-2xl border-2 border-tunisian-red/20 space-y-2"
                    >
                      <label className="text-xs font-black text-tunisian-red block uppercase tracking-wider">
                        {t.pin} (5 digits)
                      </label>
                      <input 
                        type="text" 
                        inputMode="numeric"
                        maxLength={5}
                        value={pin}
                        onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 5))}
                        placeholder="12345"
                        className="w-full p-3.5 rounded-xl border-2 border-tunisian-red/40 bg-white focus:border-tunisian-red outline-none font-mono font-black text-center text-3xl tracking-[0.5em] text-tunisian-dark-blue shadow-inner"
                      />
                      <p className="text-[11px] text-tunisian-dark-blue/60 font-semibold text-center">
                        Share this 5-digit code with your friend to let them enter.
                      </p>
                    </motion.div>
                  )}
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-4 bg-tunisian-red/10 border-2 border-tunisian-red text-tunisian-red rounded-xl font-bold text-sm">
                  <AlertCircle size={20} className="shrink-0" />
                  {error}
                </div>
              )}

              <div className="pt-4">
                <button 
                  onClick={handleCreateLobby}
                  className="w-full py-5 rounded-2xl bg-gradient-to-r from-tunisian-red to-tunisian-dark-blue text-white text-xl font-black shadow-xl hover:shadow-2xl hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-3"
                >
                  <Plus size={24} /> {t.createLobby}
                </button>
              </div>
            </motion.div>
          )}

          {view === 'enterPin' && (
            <motion.div 
              key="enterPin"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="py-6 text-center max-w-md mx-auto"
            >
              <div className="w-16 h-16 bg-tunisian-red/10 text-tunisian-red rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield size={36} />
              </div>
              <h3 className="text-2xl font-serif font-black text-tunisian-dark-blue mb-1">
                {t.pinRequired}
              </h3>
              <p className="text-sm text-tunisian-dark-blue/60 mb-6 font-semibold">
                {t.enterPin} ({joiningLobby?.name})
              </p>
              
              <input 
                type="text" 
                inputMode="numeric"
                maxLength={5}
                autoFocus
                value={pin}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 5);
                  setPin(val);
                  if (val.length === 5 && joiningLobby) {
                    performJoin(joiningLobby, val);
                  }
                }}
                placeholder="•••••"
                className="w-56 p-4 rounded-2xl border-4 border-tunisian-gold bg-white focus:border-tunisian-blue outline-none font-mono font-black text-center text-3xl tracking-[0.4em] mb-6 shadow-inner"
              />

              {error && (
                <div className="flex items-center justify-center gap-2 p-3 mb-6 bg-tunisian-red/10 border border-tunisian-red text-tunisian-red rounded-xl font-bold text-xs">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => performJoin(joiningLobby!, pin)}
                  disabled={pin.length !== 5}
                  className="w-full py-4 rounded-xl bg-tunisian-blue hover:bg-tunisian-dark-blue text-white font-bold transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t.joinLobby}
                </button>
                <button 
                  onClick={() => { setView('browser'); setPin(''); setError(''); }}
                  className="py-2.5 text-tunisian-dark-blue/50 font-bold hover:text-tunisian-dark-blue transition-colors text-sm"
                >
                  {t.back}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
