import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';

export interface PlayerStats {
  wins: number;
  losses: number;
  draws: number;
  totalGames: number;
  winRate: number;
}

const LOCAL_STORAGE_KEY = 'kharbga_player_stats_v1';

export const StatsService = {
  getLocalStats(): PlayerStats {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const total = (parsed.wins || 0) + (parsed.losses || 0) + (parsed.draws || 0);
        return {
          wins: parsed.wins || 0,
          losses: parsed.losses || 0,
          draws: parsed.draws || 0,
          totalGames: total,
          winRate: total > 0 ? Math.round(((parsed.wins || 0) / total) * 100) : 0,
        };
      }
    } catch (e) {
      console.warn('Failed to parse local stats', e);
    }
    return { wins: 0, losses: 0, draws: 0, totalGames: 0, winRate: 0 };
  },

  saveLocalStats(stats: Partial<PlayerStats>) {
    const current = this.getLocalStats();
    const updated = {
      wins: (current.wins || 0) + (stats.wins || 0),
      losses: (current.losses || 0) + (stats.losses || 0),
      draws: (current.draws || 0) + (stats.draws || 0),
    };
    const total = updated.wins + updated.losses + updated.draws;
    const finalStats: PlayerStats = {
      ...updated,
      totalGames: total,
      winRate: total > 0 ? Math.round((updated.wins / total) * 100) : 0,
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(finalStats));
    return finalStats;
  },

  async fetchServerStats(userId: string): Promise<PlayerStats | null> {
    try {
      const userRef = doc(db, 'users', userId);
      const snapshot = await getDoc(userRef);
      if (snapshot.exists()) {
        const data = snapshot.data();
        const wins = data.wins || 0;
        const losses = data.losses || 0;
        const draws = data.draws || 0;
        const total = data.totalGames || (wins + losses + draws);
        return {
          wins,
          losses,
          draws,
          totalGames: total,
          winRate: total > 0 ? Math.round((wins / total) * 100) : 0,
        };
      }
    } catch (err) {
      console.warn('Could not fetch server stats:', err);
    }
    return null;
  },

  async syncNickname(userId: string, nickname: string) {
    try {
      const userRef = doc(db, 'users', userId);
      await setDoc(userRef, {
        nickname: nickname.trim().slice(0, 50),
        lastSeen: new Date().toISOString(),
      }, { merge: true });
    } catch (err) {
      console.warn('Could not sync nickname with server:', err);
    }
  },

  isGuest(): boolean {
    const user = auth.currentUser;
    return !user || user.isAnonymous;
  },

  async recordGameResult(outcome: 'win' | 'loss' | 'draw', nickname: string): Promise<{ stats: PlayerStats; isSaved: boolean }> {
    const delta = {
      wins: outcome === 'win' ? 1 : 0,
      losses: outcome === 'loss' ? 1 : 0,
      draws: outcome === 'draw' ? 1 : 0,
    };

    const user = auth.currentUser;
    const isGoogleUser = Boolean(user && !user.isAnonymous);

    if (isGoogleUser && user) {
      // 1. Permanently update local storage for authenticated user
      const newLocalStats = this.saveLocalStats(delta);

      // 2. Permanently update server side Firestore profile
      try {
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, {
          nickname: nickname.trim().slice(0, 50) || user.displayName || 'Player',
          wins: increment(delta.wins),
          losses: increment(delta.losses),
          draws: increment(delta.draws),
          totalGames: increment(1),
          updatedAt: new Date().toISOString(),
          lastSeen: new Date().toISOString(),
        }, { merge: true });
      } catch (err) {
        console.warn('Could not record server game result:', err);
      }

      return { stats: newLocalStats, isSaved: true };
    } else {
      // For Guests: Progress is transient and not saved to the cloud
      console.log('Guest match completed. Outcome is not saved to permanent cloud profile.');
      const currentStats = this.getLocalStats();
      return { 
        stats: {
          wins: currentStats.wins + delta.wins,
          losses: currentStats.losses + delta.losses,
          draws: currentStats.draws + delta.draws,
          totalGames: currentStats.totalGames + 1,
          winRate: (currentStats.totalGames + 1) > 0 ? Math.round(((currentStats.wins + delta.wins) / (currentStats.totalGames + 1)) * 100) : 0
        }, 
        isSaved: false 
      };
    }
  },
};
