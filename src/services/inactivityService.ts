import { auth, logoutUser } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const LAST_ACTIVE_KEY = 'kharbga_last_user_activity';
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

/**
 * Service to manage auto-logout after 7 consecutive days of inactivity.
 * When logging out (or upon 7-day expiration), all session data, temporary
 * tokens, and cached credentials are purged while strictly preserving win/loss stats.
 */
export class InactivityService {
  private static listenerAttached = false;

  /**
   * Cleans up all session-related storage while preserving the user's permanent win/loss stats.
   */
  public static purgeSessionPreservingStats(userId?: string) {
    if (typeof window === 'undefined') return;

    // Keys to preserve
    const STATS_KEY = 'kharbga_player_stats_v1';
    const preservedStats = localStorage.getItem(STATS_KEY);

    // List of keys to clear
    const targetUserId = userId || auth.currentUser?.uid;
    const keysToRemove: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;

      // Do NOT remove the player win/loss rate stats
      if (key === STATS_KEY) continue;

      // Remove activity timestamps, lobby states, session drafts, player name cache, etc.
      if (
        key.startsWith('kharbga_last_user_activity') ||
        key.startsWith('firebase:authUser') ||
        key.startsWith('kharbga_player_name') ||
        (targetUserId && key.includes(targetUserId))
      ) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach(k => localStorage.removeItem(k));

    // Clear session storage completely
    try {
      sessionStorage.clear();
    } catch (e) {
      console.warn('Could not clear sessionStorage:', e);
    }

    // Ensure stats are firmly retained
    if (preservedStats) {
      localStorage.setItem(STATS_KEY, preservedStats);
    }
  }

  /**
   * Initializes inactivity tracking and checks if 7 days have passed since last active time.
   */
  public static init() {
    // Check inactivity on startup and whenever auth state changes
    onAuthStateChanged(auth, async (user) => {
      if (user && !user.isAnonymous) {
        this.checkInactivity(user.uid);
      }
    });

    if (!this.listenerAttached && typeof window !== 'undefined') {
      this.listenerAttached = true;
      
      const recordActivity = () => {
        if (auth.currentUser && !auth.currentUser.isAnonymous) {
          this.updateActivity();
        }
      };

      // Throttle user interaction listeners
      const events = ['mousedown', 'keydown', 'touchstart', 'scroll'];
      let lastRecorded = 0;
      const throttledRecord = () => {
        const now = Date.now();
        if (now - lastRecorded > 60000) { // update at most once per minute
          lastRecorded = now;
          recordActivity();
        }
      };

      events.forEach(event => {
        window.addEventListener(event, throttledRecord, { passive: true });
      });

      // Also record when app initializes
      this.updateActivity();
    }
  }

  /**
   * Check if the user has been inactive for >= 7 days.
   */
  public static async checkInactivity(userId: string): Promise<boolean> {
    const rawTimestamp = localStorage.getItem(`${LAST_ACTIVE_KEY}_${userId}`);
    const now = Date.now();

    if (rawTimestamp) {
      const lastActive = parseInt(rawTimestamp, 10);
      if (!isNaN(lastActive)) {
        const elapsed = now - lastActive;
        if (elapsed >= SEVEN_DAYS_MS) {
          console.warn(`User inactive for ${(elapsed / (1000 * 60 * 60 * 24)).toFixed(1)} days. Purging session except win/loss stats.`);
          this.purgeSessionPreservingStats(userId);
          await logoutUser();
          return true; // Logged out
        }
      }
    }

    // Still valid, record current time as active
    this.updateActivity(userId);
    return false;
  }

  /**
   * Records the current timestamp as the latest active moment.
   */
  public static updateActivity(userId?: string) {
    const uid = userId || auth.currentUser?.uid;
    if (uid && auth.currentUser && !auth.currentUser.isAnonymous) {
      localStorage.setItem(`${LAST_ACTIVE_KEY}_${uid}`, Date.now().toString());
    }
  }

  /**
   * Clear recorded activity & purge session on explicit logout while preserving win/loss stats.
   */
  public static clearActivity(userId?: string) {
    this.purgeSessionPreservingStats(userId);
  }
}

