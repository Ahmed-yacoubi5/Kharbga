import { Player, GameMode, GAME_VARIANTS } from '../types';

export const getNeighbors = (index: number, mode: GameMode): number[] => {
  const variant = GAME_VARIANTS[mode];
  const size = variant.size;

  if (variant.boardType === 'circular') {
    // Tleisha circular board: Center + 6 perimeter points
    // Let's define center as index 0, perimeter 1-6
    if (index === 0) return [1, 2, 3, 4, 5, 6];
    const prev = index === 1 ? 6 : index - 1;
    const next = index === 6 ? 1 : index + 1;
    return [0, prev, next];
  }

  const row = Math.floor(index / size);
  const col = index % size;
  const neighbors: number[] = [];

  // Vertical & Horizontal
  if (row > 0) neighbors.push(index - size); // Up
  if (row < size - 1) neighbors.push(index + size); // Down
  if (col > 0) neighbors.push(index - 1); // Left
  if (col < size - 1) neighbors.push(index + 1); // Right

  // Al-Thalouthiya and Tasha Method 2 allow diagonals
  if (mode === 'thalouthiya') {
    if (row > 0 && col > 0) neighbors.push(index - size - 1); // Up-Left
    if (row > 0 && col < size - 1) neighbors.push(index - size + 1); // Up-Right
    if (row < size - 1 && col > 0) neighbors.push(index + size - 1); // Down-Left
    if (row < size - 1 && col < size - 1) neighbors.push(index + size + 1); // Down-Right
  }

  return neighbors;
};

export const checkCapturesEncircle = (board: (Player | null)[], lastMoveIdx: number, player: Player, mode: GameMode): number[] => {
  const variant = GAME_VARIANTS[mode];
  if (variant.capture !== 'encircle') return [];

  const size = variant.size;
  const opponent = player === 1 ? 2 : 1;
  const row = Math.floor(lastMoveIdx / size);
  const col = lastMoveIdx % size;
  const captured: number[] = [];

  const checkLine = (dr: number, dc: number) => {
    let potential: number[] = [];
    for (let i = 1; i <= 3; i++) { // Khamoussiya supports up to 3 captures (Ghor)
      const r = row + i * dr;
      const c = col + i * dc;
      if (r < 0 || r >= size || c < 0 || c >= size) break;
      const idx = r * size + c;
      if (board[idx] === opponent) potential.push(idx);
      else if (board[idx] === player) {
        captured.push(...potential);
        break;
      } else break;
    }
  };

  // Horizontal Left/Right
  checkLine(0, 1); checkLine(0, -1);
  // Vertical Up/Down
  checkLine(1, 0); checkLine(-1, 0);

  return captured;
};

export const getJumpMoves = (board: (Player | null)[], player: Player, from: number, mode: GameMode): number[] => {
  const variant = GAME_VARIANTS[mode];
  if (variant.capture !== 'jump') return [];
  
  const size = variant.size;
  const opponent = player === 1 ? 2 : 1;
  const row = Math.floor(from / size);
  const col = indexToCol(from, size); // helper
  const jumps: number[] = [];

  const directions = [[0,1], [0,-1], [1,0], [-1,0]];
  for (const [dr, dc] of directions) {
    const midR = row + dr;
    const midC = col + dc;
    const endR = row + 2 * dr;
    const endC = col + 2 * dc;

    if (endR >= 0 && endR < size && endC >= 0 && endC < size) {
      const midIdx = midR * size + midC;
      const endIdx = endR * size + endC;
      if (board[midIdx] === opponent && board[endIdx] === null) {
        jumps.push(endIdx);
      }
    }
  }
  return jumps;
};

const indexToCol = (idx: number, size: number) => idx % size;

export const checkWinAlignment = (board: (Player | null)[], mode: GameMode): Player | null => {
  if (mode === 'thalouthiya' || mode === 'tasha') {
    const size = 3;
    const lines = [
      [0,1,2], [3,4,5], [6,7,8], // Rows
      [0,3,6], [1,4,7], [2,5,8], // Cols
      [0,4,8], [2,4,6] // Diagonals
    ];
    for (const line of lines) {
      const [a, b, c] = line;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
    }
  }
  if (mode === 'tleisha') {
    const diameters = [[1, 0, 4], [2, 0, 5], [3, 0, 6]];
    for (const dia of diameters) {
      const [a, b, c] = dia;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
    }
  }
  return null;
};

export const getValidMoves = (board: (Player | null)[], player: Player, mode: GameMode): { from: number; to: number }[] => {
  const moves: { from: number; to: number }[] = [];
  const variant = GAME_VARIANTS[mode];

  board.forEach((p, from) => {
    if (p === player) {
      // Regular moves
      getNeighbors(from, mode).forEach((to) => {
        if (board[to] === null) moves.push({ from, to });
      });

      // Jump moves (if applicable)
      if (variant.capture === 'jump') {
        getJumpMoves(board, player, from, mode).forEach(to => {
          moves.push({ from, to });
        });
      }
    }
  });

  return moves;
};

// Simplified AI evaluation for all variants
export const evaluateBoard = (board: (Player | null)[], player: Player, mode: GameMode): number => {
  const opponent = player === 1 ? 2 : 1;
  const win = checkWinAlignment(board, mode);
  if (win === player) return 1000;
  if (win === opponent) return -1000;

  // Count pieces
  const myPieces = board.filter(p => p === player).length;
  const oppPieces = board.filter(p => p === opponent).length;
  
  let score = (myPieces - oppPieces) * 20;

  // Mobility
  const myMoves = getValidMoves(board, player, mode);
  const oppMoves = getValidMoves(board, opponent, mode);
  
  score += myMoves.length;
  score -= oppMoves.length;

  return score;
};

export const minimax = (
  board: (Player | null)[],
  depth: number,
  isMaximizing: boolean,
  player: Player,
  mode: GameMode,
  alpha: number = -Infinity,
  beta: number = Infinity
): { score: number; move: { from: number; to: number } | null } => {
  const opponent = player === 1 ? 2 : 1;
  const currentPlayer = isMaximizing ? player : opponent;
  const winner = checkWinAlignment(board, mode);
  
  if (winner === player) return { score: 1000 + depth, move: null };
  if (winner === opponent) return { score: -1000 - depth, move: null };
  if (depth === 0) return { score: evaluateBoard(board, player, mode), move: null };

  const moves = getValidMoves(board, currentPlayer, mode);
  if (moves.length === 0) return { score: isMaximizing ? -1000 : 1000, move: null };

  let bestMove: { from: number; to: number } | null = null;

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      const nextBoard = [...board];
      nextBoard[move.to] = player;
      nextBoard[move.from] = null;
      // Handle captures in evaluation if needed
      const evalRes = minimax(nextBoard, depth - 1, false, player, mode, alpha, beta);
      if (evalRes.score > maxEval) {
        maxEval = evalRes.score;
        bestMove = move;
      }
      alpha = Math.max(alpha, evalRes.score);
      if (beta <= alpha) break;
    }
    return { score: maxEval, move: bestMove };
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      const nextBoard = [...board];
      nextBoard[move.to] = opponent;
      nextBoard[move.from] = null;
      const evalRes = minimax(nextBoard, depth - 1, true, player, mode, alpha, beta);
      if (evalRes.score < minEval) {
        minEval = evalRes.score;
        bestMove = move;
      }
      beta = Math.min(beta, evalRes.score);
      if (beta <= alpha) break;
    }
    return { score: minEval, move: bestMove };
  }
};

export const getAwshPieces = (board: (Player | null)[], targetPlayer: Player, mode: GameMode): number[] => {
  const awsh: number[] = [];
  const opponent = targetPlayer === 1 ? 2 : 1;
  const variant = GAME_VARIANTS[mode];
  
  board.forEach((p, idx) => {
    if (p === targetPlayer) {
      const neighbors = getNeighbors(idx, mode);
      if (neighbors.some(n => board[n] === opponent)) {
        awsh.push(idx);
      }
    }
  });
  
  return awsh;
};
