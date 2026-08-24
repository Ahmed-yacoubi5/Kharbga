import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { LobbyData } from '../types';

export const INACTIVITY_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes of inactivity (600,000 ms)

/**
 * Parses any timestamp representation into milliseconds.
 */
function parseTimestampToMs(timestamp: any): number {
  if (!timestamp) return 0;
  if (typeof timestamp === 'number') return timestamp;
  if (typeof timestamp.toMillis === 'function') return timestamp.toMillis();
  if (typeof timestamp.seconds === 'number') return timestamp.seconds * 1000;
  if (typeof timestamp === 'string') {
    const parsed = Date.parse(timestamp);
    if (!isNaN(parsed)) return parsed;
  }
  return 0;
}

/**
 * Computes the timestamp of the latest activity in the hall across:
 * - Room creation timestamp
 * - Last game move timestamp
 * - Latest heartbeat (`lastSeen`) from any connected player
 */
export function getLobbyLatestActivityMs(lobby: Partial<LobbyData> & { createdAt?: any }): number {
  let latest = parseTimestampToMs(lobby.createdAt);

  if (lobby.lastMoveAt) {
    const moveTime = parseTimestampToMs(lobby.lastMoveAt);
    if (moveTime > latest) latest = moveTime;
  }

  if (lobby.players && typeof lobby.players === 'object') {
    const entries = Object.values(lobby.players);
    for (const player of entries) {
      if (player && typeof player.lastSeen === 'number') {
        if (player.lastSeen > latest) {
          latest = player.lastSeen;
        }
      }
    }
  }

  return latest || Date.now();
}

/**
 * Calculates remaining seconds of inactivity tolerance before the room is deemed abandoned (10 minutes max).
 */
export function getLobbyInactiveRemainingSeconds(lobby: Partial<LobbyData> & { createdAt?: any }): number {
  const latestActivity = getLobbyLatestActivityMs(lobby);
  const elapsed = Date.now() - latestActivity;
  const remaining = Math.max(0, Math.floor((INACTIVITY_TIMEOUT_MS - elapsed) / 1000));
  return remaining;
}

/**
 * Checks if a room is abandoned/inactive where neither player has interacted or sent a heartbeat for 10 straight minutes.
 */
export function isLobbyInactive(lobby: Partial<LobbyData> & { createdAt?: any }): boolean {
  // If player count is 0 or all players are gone, or no activity for 10 minutes
  const latestActivity = getLobbyLatestActivityMs(lobby);
  const elapsed = Date.now() - latestActivity;
  return elapsed >= INACTIVITY_TIMEOUT_MS;
}

/**
 * Formats seconds into MM:SS.
 */
export function formatTimeoutMMSS(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Safely purges an inactive/abandoned lobby from Firestore (server-side deletion).
 */
export async function purgeExpiredLobby(lobbyId: string): Promise<boolean> {
  try {
    await deleteDoc(doc(db, 'lobbies', lobbyId));
    return true;
  } catch (err) {
    // Might already be deleted or caught by rules
    return false;
  }
}
