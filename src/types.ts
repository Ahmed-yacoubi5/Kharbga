
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
  forfeitBy?: string;
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
    subtitle: "Tunisian Strategy",
    start: "Start Game",
    playOnline: "Online Arena",
    onlineMultiplayer: "Play Online (Multiplayer)",
    createLobby: "Host a Lobby",
    joinLobby: "Join Lobby",
    lobbyName: "Lobby Name",
    nickname: "Your Name / Nickname",
    changeNickname: "Edit Name",
    saveNickname: "Save Name",
    lobbies: "Active Lobbies",
    noLobbies: "No open lobbies right now... host one!",
    public: "Open / Public",
    private: "PIN Protected",
    pin: "5-Digit Numeric PIN",
    pinPlaceholder: "5 digits (e.g. 12345)",
    waitingForPlayer: "Waiting for a challenger to join...",
    startGame: "Start Match",
    reconnecting: "Seeking connection...",
    opponentDisconnected: "Opponent lost in the Medina",
    pinRequired: "PIN Required",
    enterPin: "Enter 5-digit PIN code",
    invalidPin: "Incorrect 5-digit PIN code",
    selectMode: "Select Game Mode",
    stats: "Player Statistics",
    wins: "Wins",
    losses: "Losses",
    draws: "Draws",
    winRate: "Win Rate",
    totalGames: "Matches",
    forfeit: "Resign / Leave",
    forfeitConfirm: "Are you sure you want to forfeit this match?",
    opponentForfeited: "Opponent resigned! You win!",
    youForfeited: "You forfeited the game.",
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
    rules: "Game Rules",
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
    undo: "Undo",
    gameOver: "Game Over",
    stalemate: "Stalemate!",
    draw: "It's a Draw!",
    nicknameRequired: "Nickname required",
    pieceStyle: "Piece Style",
    seashell: "Seashells",
    classic: "Classic",
    clientCosmeticsNote: "Themes, piece style & music are personalized to your screen",
  },
  fr: {
    title: "KHARBGA",
    subtitle: "Tunisian Strategy",
    start: "Commencer",
    playOnline: "Arène en Ligne",
    onlineMultiplayer: "Jouer en Ligne (Multijoueur)",
    createLobby: "Créer un Salon",
    joinLobby: "Rejoindre",
    lobbyName: "Nom du Salon",
    nickname: "Votre Pseudo",
    changeNickname: "Modifier le pseudo",
    saveNickname: "Enregistrer",
    lobbies: "Salons Actifs",
    noLobbies: "Aucun salon ouvert... créez le vôtre !",
    public: "Ouvert / Public",
    private: "Protégé par PIN",
    pin: "Code PIN (5 chiffres)",
    pinPlaceholder: "5 chiffres (ex: 12345)",
    waitingForPlayer: "En attente d'un adversaire...",
    startGame: "Commencer la Partie",
    reconnecting: "Recherche de connexion...",
    opponentDisconnected: "L'adversaire s'est déconnecté",
    pinRequired: "Code PIN Requis",
    enterPin: "Entrez le code à 5 chiffres",
    invalidPin: "Code PIN à 5 chiffres incorrect",
    selectMode: "Choisir le Mode",
    stats: "Statistiques",
    wins: "Victoires",
    losses: "Défaites",
    draws: "Nuls",
    winRate: "Taux de Victoire",
    totalGames: "Parties",
    forfeit: "Abandonner",
    forfeitConfirm: "Voulez-vous vraiment déclarer forfait ?",
    opponentForfeited: "L'adversaire a abandonné ! Vous gagnez !",
    youForfeited: "Vous avez abandonné la partie.",
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
    rules: "Règles du jeu",
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
    undo: "Annuler",
    gameOver: "Fin de partie",
    stalemate: "Pat !",
    draw: "Match nul !",
    nicknameRequired: "Pseudo requis",
    pieceStyle: "Style des pièces",
    seashell: "Coquillages",
    classic: "Classique",
    clientCosmeticsNote: "Les thèmes, pièces et musiques sont propres à votre écran",
  },
  ar: {
    title: "الخربڨة",
    subtitle: "تكتيك تونسي",
    start: "ابدأ اللعبة",
    playOnline: "الساحة العالمية",
    onlineMultiplayer: "اللعب عبر الإنترنت (أونلاين)",
    createLobby: "إنشاء مجلس / غرفة",
    joinLobby: "دخول المجلس",
    lobbyName: "اسم المجلس",
    nickname: "لقبك / اسمك",
    changeNickname: "تغيير اللقب",
    saveNickname: "حفظ",
    lobbies: "المجالس النشطة",
    noLobbies: "لا توجد مجالس مفتوحة حالياً... أنشئ مجلساً جديداً!",
    public: "مفتوح / عام",
    private: "برمز سري (خاص)",
    pin: "رمز سري (5 أرقام)",
    pinPlaceholder: "5 أرقام (مثال: 12345)",
    waitingForPlayer: "في انتظار انضمام المنافس...",
    startGame: "بدء المعركة",
    reconnecting: "البحث عن اتصال...",
    opponentDisconnected: "المنافس غادر المجلس",
    pinRequired: "الرمز السري مطلوب",
    enterPin: "أدخل الرمز السري المتكون من 5 أرقام",
    invalidPin: "الرمز السري المكون من 5 أرقام غير صحيح",
    selectMode: "اختر النمط",
    stats: "إحصائيات اللاعب",
    wins: "الفوز",
    losses: "الخسارة",
    draws: "التعادل",
    winRate: "نسبة الفوز",
    totalGames: "المباريات",
    forfeit: "استسلام / انسحاب",
    forfeitConfirm: "هل أنت متأكد من الاستسلام والانسحاب من المباراة؟",
    opponentForfeited: "استسلم المنافس! لقد فزت بالمباراة!",
    youForfeited: "لقد أعلنت استسلامك.",
    thalouthName: "الثلوثية",
    thalouthDesc: "اصطفاف رصيف سريع 3x3",
    tleishaName: "تليشة",
    tleishaDesc: "خربڨة دائرية تقليدية من الرقاب",
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
    history: "تاريخ الخربڨة",
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
    undo: "تراجع",
    gameOver: "انتهت اللعبة",
    stalemate: "انسداد اللعب!",
    draw: "تعادل!",
    nicknameRequired: "اللقب مطلوب",
    pieceStyle: "مظهر الحجارة",
    seashell: "الودع (البحر)",
    classic: "الخزف التقليدي",
    clientCosmeticsNote: "المظهر، القطع والموسيقى مخصصة لجهازك فقط بحرية",
  }
};
