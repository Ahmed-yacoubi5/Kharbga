
export type BoardSize = 5 | 7;
export type Player = 1 | 2;
export type GamePhase = 'placement' | 'movement' | 'gameOver';
export type Difficulty = 'easy' | 'hard';
export type Language = 'en' | 'fr' | 'ar';
export type GameMode = 'classic' | 'khamoussiya' | 'sabouiya';

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
    selectMode: "Select Mode",
    classicName: "Classic Sabou'iya",
    classicDesc: "Traditional 7x7 strategy",
    khamoussiyaName: "Al-Khamoussiya",
    khamoussiyaDesc: "Fast 5x5 with 'Ghor' move",
    sabouiyaName: "Advanced Sabou'iya",
    sabouiyaDesc: "7x7 with strategic counters",
    playVsAI: "Play vs AI",
    playVsFriend: "Local Multiplayer",
    settings: "Settings",
    rules: "Rules",
    turn: "Turn",
    winner: "Winner",
    placementPhase: "Placement Phase: Alternate 2 pieces",
    movementPhase: "Movement Phase: Move to vacancy",
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
    rulesContent: [
      "Kharbga is a North African strategy game.",
      "Placement: Players alternate placing 2 pieces. Center square remains empty.",
      "Movement: Move a piece into the adjacent empty square.",
      "Capture: Sandwich an opponent piece between two of your own (horizontally/vertically).",
      "Win: Have the most pieces remaining or capture all opponent pieces."
    ]
  },
  fr: {
    title: "KHARBGA",
    start: "Commencer",
    selectMode: "Choisir le Mode",
    classicName: "Sabou'iya Classique",
    classicDesc: "Stratégie traditionnelle 7x7",
    khamoussiyaName: "Al-Khamoussiya",
    khamoussiyaDesc: "Rapide 5x5 avec coup 'Ghor'",
    sabouiyaName: "Sabou'iya Avancée",
    sabouiyaDesc: "7x7 avec analyse stratégique",
    playVsAI: "IA",
    playVsFriend: "Multijoueur",
    settings: "Paramètres",
    rules: "Règles",
    turn: "Tour",
    winner: "Gagnant",
    placementPhase: "Phase de placement: 2 pièces",
    movementPhase: "Phase de mouvement: Glissement",
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
    rulesContent: [
      "La Kharbga est un jeu de stratégie nord-africain.",
      "Placement : Les joueurs placent 2 pièces à tour de rôle. Le centre reste vide.",
      "Mouvement : Déplacez une pièce vers la case vide adjacente.",
      "Capture : Prenez en sandwich une pièce adverse entre deux des vôtres.",
      "Victoire : Le joueur avec le plus de pièces restantes gagne."
    ]
  },
  ar: {
    title: "الخربقة",
    start: "ابدأ اللعبة",
    selectMode: "اختر النمط",
    classicName: "الخربقة الكلاسيكية",
    classicDesc: "استراتيجية تقليدية 7x7",
    khamoussiyaName: "الخموسية",
    khamoussiyaDesc: "سريعة 5x5 مع حركة الغور",
    sabouiyaName: "السبوعية المتقدمة",
    sabouiyaDesc: "7x7 مع عداد التحركات",
    playVsAI: "ضد الحاسوب",
    playVsFriend: "لعب محلي",
    settings: "الإعدادات",
    rules: "القواعد",
    turn: "دور",
    winner: "الفائز",
    placementPhase: "مرحلة الوضع: ضع قطعتين",
    movementPhase: "مرحلة التحريك: حرك لخانة فارغة",
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
    rulesContent: [
      "الخربقة هي لعبة استراتيجية من شمال أفريقيا.",
      "مرحلة الوضع: يضع اللاعبون قطعتين في كل دور. تظل خانة الوسط فارغة.",
      "مرحلة التحريك: حرك قطعة واحدة إلى الخانة المجاورة الفارغة.",
      "الأسر: يتم أسر قطعة الخصم إذا وقعت بين قطعتين من لونك (أفقي أو عمودي).",
      "الفوز: اللاعب الذي يملك أكبر عدد من القطع في النهاية هو الفائز."
    ]
  }
};
