
import { Player, BoardSize, getCenterIndex } from '../types';

export const getNeighbors = (index: number, size: BoardSize): number[] => {
  const row = Math.floor(index / size);
  const col = index % size;
  const neighbors: number[] = [];

  if (row > 0) neighbors.push(index - size);
  if (row < size - 1) neighbors.push(index + size);
  if (col > 0) neighbors.push(index - 1);
  if (col < size - 1) neighbors.push(index + 1);

  return neighbors;
};

export const checkCaptures = (board: (Player | null)[], lastMoveIndex: number, currentPlayer: Player, size: BoardSize): number[] => {
  const captured: number[] = [];
  const opponent = currentPlayer === 1 ? 2 : 1;
  const row = Math.floor(lastMoveIndex / size);
  const col = lastMoveIndex % size;

  const directions = [
    { dr: -1, dc: 0 }, // Up
    { dr: 1, dc: 0 },  // Down
    { dr: 0, dc: -1 }, // Left
    { dr: 0, dc: 1 },  // Right
  ];

  directions.forEach(({ dr, dc }) => {
    // Check for Ghor (3 captures) - Al-Khamoussiya specific but can be generalized
    // We check if there are 1, 2, or 3 opponent pieces followed by a friendly piece
    let potentialCaptures: number[] = [];
    for (let i = 1; i <= 3; i++) {
      const r = row + i * dr;
      const c = col + i * dc;
      if (r < 0 || r >= size || c < 0 || c >= size) break;
      
      const idx = r * size + c;
      if (board[idx] === opponent) {
        potentialCaptures.push(idx);
      } else if (board[idx] === currentPlayer) {
        // Found a flanking piece!
        captured.push(...potentialCaptures);
        break;
      } else {
        // Empty space or end of board
        break;
      }
    }
  });

  return captured;
};

/**
 * Checks which pieces of a specific player are in danger of being captured
 * by any legal move of the opponent.
 */
export const getAwshPieces = (board: (Player | null)[], targetPlayer: Player, size: BoardSize): number[] => {
  const inDanger: Set<number> = new Set();
  const opponent = targetPlayer === 1 ? 2 : 1;
  
  // For each legal move the opponent can make...
  const opponentMoves = getValidMoves(board, opponent, size);
  
  opponentMoves.forEach(move => {
    // Simulate the move
    const tempBoard = [...board];
    tempBoard[move.to] = opponent;
    tempBoard[move.from] = null;
    
    // Check if this move captures any targetPlayer pieces
    const captured = checkCaptures(tempBoard, move.to, opponent, size);
    captured.forEach(idx => inDanger.add(idx));
  });
  
  return Array.from(inDanger);
};

export const getValidMoves = (board: (Player | null)[], player: Player, size: BoardSize): { from: number; to: number }[] => {
  const moves: { from: number; to: number }[] = [];
  board.forEach((p, from) => {
    if (p === player) {
      getNeighbors(from, size).forEach((to) => {
        if (board[to] === null) {
          moves.push({ from, to });
        }
      });
    }
  });
  return moves;
};

// Minimax AI
export const minimax = (
  board: (Player | null)[],
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean,
  player: Player,
  size: BoardSize
): { score: number; move?: { from: number; to: number } } => {
  const opponent = player === 1 ? 2 : 1;
  const currentTurnPlayer = isMaximizing ? player : opponent;
  const moves = getValidMoves(board, currentTurnPlayer, size);

  // Terminal conditions
  if (depth === 0 || moves.length === 0) {
    const score = evaluateBoard(board, player, size);
    return { score };
  }

  let bestMove: { from: number; to: number } | undefined;
  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      const newBoard = [...board];
      newBoard[move.to] = player;
      newBoard[move.from] = null;
      const captured = checkCaptures(newBoard, move.to, player, size);
      captured.forEach(idx => newBoard[idx] = null);

      const evaluation = minimax(newBoard, depth - 1, alpha, beta, false, player, size).score;
      if (evaluation > maxEval) {
        maxEval = evaluation;
        bestMove = move;
      }
      alpha = Math.max(alpha, evaluation);
      if (beta <= alpha) break;
    }
    return { score: maxEval, move: bestMove };
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      const newBoard = [...board];
      newBoard[move.to] = opponent;
      newBoard[move.from] = null;
      const captured = checkCaptures(newBoard, move.to, opponent, size);
      captured.forEach(idx => newBoard[idx] = null);

      const evaluation = minimax(newBoard, depth - 1, alpha, beta, true, player, size).score;
      if (evaluation < minEval) {
        minEval = evaluation;
        bestMove = move;
      }
      beta = Math.min(beta, evaluation);
      if (beta <= alpha) break;
    }
    return { score: minEval, move: bestMove };
  }
};

const evaluateBoard = (board: (Player | null)[], player: Player, size: BoardSize): number => {
  const opponent = player === 1 ? 2 : 1;
  const centerIndex = getCenterIndex(size);
  let score = 0;
  board.forEach((p, i) => {
    if (p === player) {
      score += 10;
      // Bonus for center control
      if (i === centerIndex) score += 5;
    } else if (p === opponent) {
      score -= 10;
      if (i === centerIndex) score -= 5;
    }
  });
  
  // Bonus for mobility
  score += getValidMoves(board, player, size).length;
  score -= getValidMoves(board, opponent, size).length;
  
  return score;
};
