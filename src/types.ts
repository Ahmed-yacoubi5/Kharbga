
export type BoardSize = 5 | 7;
export type Player = 1 | 2;
export type GamePhase = 'placement' | 'movement' | 'gameOver';
export type Difficulty = 'easy' | 'hard';
export type Language = 'en' | 'fr' | 'ar';

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
    title: "Kharbga",
    playVsAI: "Play vs AI",
    playVsFriend: "Local Multiplayer",
    leaderboard: "Leaderboard",
    settings: "Settings",
    howToPlay: "How to Play",
    rules: "Rules",
    undo: "Undo",
    resign: "Resign",
    easy: "Easy",
    hard: "Hard",
    turn: "Turn",
    winner: "Winner",
    placementPhase: "Placement Phase: Place 2 pieces",
    movementPhase: "Movement Phase: Move to adjacent",
    lang: "Language",
    difficulty: "Difficulty",
    boardSize: "Board Size",
    sound: "Sound FX",
    music: "Music",
    home: "Home",
    restart: "Restart",
    back: "Back",
    rulesContent: [
      "Kharbga is played on a 5x5 or 7x7 grid.",
      "Phase 1 (Placement): Players place 2 pieces at a time. The center square remains empty.",
      "Phase 2 (Movement): Players move one piece to an adjacent empty square (no diagonals).",
      "Capture: A piece is captured when sandwiched between two opponent pieces.",
      "Win: Capture all opponent pieces or block them entirely."
    ]
  },
  fr: {
    title: "Kharbga",
    playVsAI: "Jouer contre l'IA",
    playVsFriend: "Multijoueur Local",
    leaderboard: "Classement",
    settings: "Paramètres",
    howToPlay: "Comment jouer",
    rules: "Règles",
    undo: "Annuler",
    resign: "Abandonner",
    easy: "Facile",
    hard: "Difficile",
    turn: "Tour",
    winner: "Gagnant",
    placementPhase: "Phase de placement: Placez 2 pièces",
    movementPhase: "Phase de mouvement: Déplacez une pièce",
    lang: "Langue",
    difficulty: "Difficulté",
    boardSize: "Taille du plateau",
    sound: "Effets Sonores",
    music: "Musique",
    home: "Accueil",
    restart: "Recommencer",
    back: "Retour",
    rulesContent: [
      "Kharbga se joue sur une grille 5x5 ou 7x7.",
      "Phase 1 (Placement) : Les joueurs placent 2 pièces à la fois. La case centrale reste vide.",
      "Phase 2 (Mouvement) : Déplacez une pièce vers une case adjacente vide (pas de diagonales).",
      "Capture : Une pièce est capturée si elle est prise en sandwich entre deux pièces adverses.",
      "Victoire : Capturez toutes les pièces adverses ou bloquez-les."
    ]
  },
  ar: {
    title: "الخربقة",
    playVsAI: "لعب ضد الذكاء الاصطناعي",
    playVsFriend: "لعب محلي",
    leaderboard: "لوحة الصدارة",
    settings: "الإعدادات",
    howToPlay: "كيفية اللعب",
    rules: "القواعد",
    undo: "تراجع",
    resign: "انسحاب",
    easy: "سهل",
    hard: "صعب",
    turn: "دور",
    winner: "الفائز",
    placementPhase: "مرحلة الوضع: ضع قطعتين",
    movementPhase: "مرحلة التحريك: حرك لخانة مجاورة",
    lang: "اللغة",
    difficulty: "الصعوبة",
    boardSize: "حجم اللوحة",
    sound: "المؤثرات الصوتية",
    music: "الموسيقى",
    home: "الرئيسية",
    restart: "إعادة اللعب",
    back: "عودة",
    rulesContent: [
      "تُلعب الخربقة على شبكة 5x5 أو 7x7.",
      "المرحلة 1 (الوضع): يضع اللاعبون قطعتين في كل دور. تبقى الخانة الوسطى فارغة.",
      "المرحلة 2 (التحريك): يحرك اللاعبون قطعة واحدة إلى خانة مجاورة فارغة (بدون قطري).",
      "الأسر: يتم أسر القطعة إذا وقعت بين قطعتين للخصم.",
      "الفوز: أسر جميع قطع الخصم أو محاصرتها بالكامل."
    ]
  }
};
