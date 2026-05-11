
export type BoardSize = 5 | 7;
export type Player = 1 | 2;
export type GamePhase = 'placement' | 'movement' | 'gameOver';
export type Difficulty = 'easy' | 'hard';
export type Language = 'en' | 'fr' | 'ar';
export type GameMode = 
  | 'thalouthiya' 
  | 'tleisha' 
  | 'tasha' 
  | 'khamoussiya_jump' 
  | 'khamoussiya_encircle' 
  | 'sadousiya' 
  | 'sabouiya_standard' 
  | 'sabouiya_guettar';

export interface GameVariantInfo {
  id: GameMode;
  nameKey: string;
  descKey: string;
  size: number;
  pieces: number;
  capture: 'none' | 'jump' | 'encircle';
  boardType: 'grid' | 'circular' | 'holes';
}

export const GAME_VARIANTS: Record<GameMode, GameVariantInfo> = {
  thalouthiya: { id: 'thalouthiya', nameKey: 'thalouthName', descKey: 'thalouthDesc', size: 3, pieces: 3, capture: 'none', boardType: 'grid' },
  tleisha: { id: 'tleisha', nameKey: 'tleishaName', descKey: 'tleishaDesc', size: 3, pieces: 3, capture: 'none', boardType: 'circular' },
  tasha: { id: 'tasha', nameKey: 'tashaName', descKey: 'tashaDesc', size: 3, pieces: 3, capture: 'none', boardType: 'holes' },
  khamoussiya_jump: { id: 'khamoussiya_jump', nameKey: 'khamoussiyaJumpName', descKey: 'khamoussiyaJumpDesc', size: 5, pieces: 12, capture: 'jump', boardType: 'grid' },
  khamoussiya_encircle: { id: 'khamoussiya_encircle', nameKey: 'khamoussiyaEncircleName', descKey: 'khamoussiyaEncircleDesc', size: 5, pieces: 12, capture: 'encircle', boardType: 'grid' },
  sadousiya: { id: 'sadousiya', nameKey: 'sadousiyaName', descKey: 'sadousiyaDesc', size: 6, pieces: 18, capture: 'encircle', boardType: 'grid' },
  sabouiya_standard: { id: 'sabouiya_standard', nameKey: 'sabouiyaName', descKey: 'sabouiyaDesc', size: 7, pieces: 24, capture: 'encircle', boardType: 'grid' },
  sabouiya_guettar: { id: 'sabouiya_guettar', nameKey: 'sabouiyaGuettarName', descKey: 'sabouiyaGuettarDesc', size: 7, pieces: 24, capture: 'encircle', boardType: 'grid' },
};

export interface LobbyData {
  id: string;
  name: string;
  mode: GameMode;
  status: 'waiting' | 'playing' | 'finished';
  isPublic: boolean;
  pin?: string;
  hostId: string;
  hostName: string;
  playerCount: number;
  players: Record<string, { name: string; isHost: boolean; lastSeen: number }>;
  board: (Player | null)[];
  currentPlayer: Player;
  phase: GamePhase;
  piecesLeftToPlace: Record<Player, number>;
  moveCount: number;
  winner: Player | null;
  lastMoveAt?: string;
  reconnectUntil?: string;
  createdAt: string;
}

export interface GameState {
  board: (Player | null)[];
  currentPlayer: Player;
  phase: GamePhase;
  piecesLeftToPlace: { 1: number; 2: number };
  winner: Player | null;
  history: (Player | null)[][];
}

export const getCenterIndex = (size: BoardSize) => Math.floor((size * size) / 2);
export const getPiecesPerPlayer = (size: BoardSize) => Math.floor((size * size - 1) / 2);

export const TRANSLATIONS = {
  en: {
    title: "KHARBGA",
    start: "Start Game",
    playOnline: "Online Arena",
    createLobby: "Open a Hall",
    joinLobby: "Enter Hall",
    lobbyName: "Hall Name",
    nickname: "Your Nickname",
    lobbies: "Active Halls",
    noLobbies: "The Medina is quiet... create a hall!",
    public: "Public",
    private: "Private",
    pin: "4-Digit PIN",
    waitingForPlayer: "Waiting for a challenger...",
    startGame: "Commence Battle",
    reconnecting: "Seeking connection...",
    opponentDisconnected: "Opponent lost in the Medina",
    pinRequired: "PIN Required",
    enterPin: "Enter the PIN code",
    invalidPin: "Incorrect sequence",
    selectMode: "Select Mode",
    thalouthName: "Al-Thalouthiya",
    thalouthDesc: "Fast 3x3 strategic alignment",
    tleishaName: "Al-Tleisha",
    tleishaDesc: "Traditional circular variant from Al-Raqab",
    tashaName: "Al-Tasha",
    tashaDesc: "The smallest variant using holes",
    khamoussiyaJumpName: "Khamoussiya - Jump",
    khamoussiyaJumpDesc: "Aggressive jump-capture system",
    khamoussiyaEncircleName: "Khamoussiya - Encircle",
    khamoussiyaEncircleDesc: "Strategic custodian capture",
    sadousiyaName: "Al-Sadousiya",
    sadousiyaDesc: "Advanced 6x6 encirclement",
    sabouiyaName: "Advanced Sabou'iya",
    sabouiyaDesc: "7x7 with strategic counters",
    sabouiyaGuettarName: "Sabou'iya - Guettar",
    sabouiyaGuettarDesc: "Single-phase capture method",
    rules: "Heritage Rules",
    history: "History & Background",
    backToGame: "Back to Game",
    learnVariant: "Learn this variant",
    playVsAI: "Play vs AI",
    playVsFriend: "Local Multiplayer",
    settings: "Settings",
    turn: "Turn",
    winner: "Winner",
    placementPhase: "Placement Phase",
    movementPhase: "Movement Phase",
    awsh: "Awsh! Piece in danger",
    ghor: "GHOR! Triple Capture!",
    mzaqra: "Mzaqra: Strategic Move",
    moves: "Moves",
    complexity: "Complexity",
    lang: "Language",
    difficulty: "Difficulty",
    home: "Home",
    restart: "Restart",
    back: "Back",
    gameOver: "Game Over",
    stalemate: "Stalemate!",
    draw: "It's a Draw!",
    nicknameRequired: "Nickname required",
  },
  fr: {
    title: "KHARBGA",
    start: "Commencer",
    playOnline: "Arène en Ligne",
    createLobby: "Ouvrir un Salon",
    joinLobby: "Rejoindre",
    lobbyName: "Nom du Salon",
    nickname: "Votre Pseudo",
    lobbies: "Salons Actifs",
    noLobbies: "La Médine est calme... ouvrez un salon !",
    public: "Public",
    private: "Privé",
    pin: "Code PIN (4 chiffres)",
    waitingForPlayer: "En attente d'un adversaire...",
    startGame: "Commencer la Bataille",
    reconnecting: "Recherche de connexion...",
    opponentDisconnected: "L'adversaire s'est égaré",
    pinRequired: "PIN Requis",
    enterPin: "Entrez le code PIN",
    invalidPin: "Code incorrect",
    selectMode: "Choisir le Mode",
    thalouthName: "Al-Thalouthiya",
    thalouthDesc: "Alignement stratégique rapide 3x3",
    tleishaName: "Al-Tleisha",
    tleishaDesc: "Variante circulaire d'Al-Raqab",
    tashaName: "Al-Tasha",
    tashaDesc: "La plus petite variante avec trous",
    khamoussiyaJumpName: "Khamoussiya - Saut",
    khamoussiyaJumpDesc: "Système de capture par saut agressif",
    khamoussiyaEncircleName: "Khamoussiya - Cercle",
    khamoussiyaEncircleDesc: "Capture stratégique par encerclement",
    sadousiyaName: "Al-Sadousiya",
    sadousiyaDesc: "Encerclement avancé 6x6",
    sabouiyaName: "Sabou'iya Avancée",
    sabouiyaDesc: "7x7 avec analyse stratégique",
    sabouiyaGuettarName: "Sabou'iya - Guettar",
    sabouiyaGuettarDesc: "Méthode de capture à phase unique",
    rules: "Règles du Patrimoine",
    history: "Histoire et Origines",
    backToGame: "Retour au Jeu",
    learnVariant: "Apprendre cette variante",
    playVsAI: "IA",
    playVsFriend: "Multijoueur",
    settings: "Paramètres",
    turn: "Tour",
    winner: "Gagnant",
    placementPhase: "Phase de placement",
    movementPhase: "Phase de mouvement",
    awsh: "Awsh! Pièce en danger",
    ghor: "GHOR! Triple Capture !",
    mzaqra: "Mzaqra: Mouvement Stratégique",
    moves: "Coups",
    complexity: "Complexité",
    lang: "Langue",
    difficulty: "Difficulté",
    home: "Accueil",
    restart: "Recommencer",
    back: "Retour",
    gameOver: "Fin de partie",
    stalemate: "Pat !",
    draw: "Match nul !",
    nicknameRequired: "Pseudo requis",
  },
  ar: {
    title: "الخربقة",
    start: "ابدأ اللعبة",
    playOnline: "الساحة العالمية",
    createLobby: "فتح مجلس",
    joinLobby: "دخول المجلس",
    lobbyName: "اسم المجلس",
    nickname: "لقبك",
    lobbies: "المجالس النشطة",
    noLobbies: "المدينة هادئة... افتح مجلساً!",
    public: "عام",
    private: "خاص",
    pin: "رمز سري (4 أرقام)",
    waitingForPlayer: "في انتظار المنافس...",
    startGame: "بدأ المعركة",
    reconnecting: "البحث عن اتصال...",
    opponentDisconnected: "المنافس تاه في المدينة",
    pinRequired: "الرمز مطلوب",
    enterPin: "أدخل الرمز السري",
    invalidPin: "الرمز غير صحيح",
    selectMode: "اختر النمط",
    thalouthName: "الثلوثية",
    thalouthDesc: "اصطفاف رصيف سريع 3x3",
    tleishaName: "تليشة",
    tleishaDesc: "خربقة دائرية تقليدية من الرقاب",
    tashaName: "طشة",
    tashaDesc: "أصغر أفراد العائلة - لعب بالبيوت",
    khamoussiyaJumpName: "الخموسية - القفز",
    khamoussiyaJumpDesc: "نظام قفز هجومي سريع",
    khamoussiyaEncircleName: "الخموسية - الحصر",
    khamoussiyaEncircleDesc: "حصر استراتيجي تقليدي",
    sadousiyaName: "السدوسية",
    sadousiyaDesc: "تحدي 6x6 المتقدم",
    sabouiyaName: "السبوعية المتقدمة",
    sabouiyaDesc: "7x7 مع عداد التحركات",
    sabouiyaGuettarName: "السبوعية - القطار",
    sabouiyaGuettarDesc: "طريقة الحصر الفوري واللعب المتواصل",
    rules: "دليل القواعد",
    history: "تاريخ الخربقة",
    backToGame: "العودة للعب",
    learnVariant: "تعلم القواعد",
    playVsAI: "ضد الحاسوب",
    playVsFriend: "لعب محلي",
    settings: "الإعدادات",
    turn: "دور",
    winner: "الفائز",
    placementPhase: "مرحلة الوضع",
    movementPhase: "مرحلة التحريك",
    awsh: "أوش! قطعة في خطر",
    ghor: "غور! ثلاثة أسرى!",
    mzaqra: "مزاقرة: تحرك استراتيجي",
    moves: "الحركات",
    complexity: "التعقيد",
    lang: "اللغة",
    difficulty: "الصعوبة",
    home: "الرئيسية",
    restart: "إعادة اللعب",
    back: "العودة",
    gameOver: "انتهت اللعبة",
    stalemate: "انسداد اللعب!",
    draw: "تعادل!",
    nicknameRequired: "اللقب مطلوب",
  }
};
