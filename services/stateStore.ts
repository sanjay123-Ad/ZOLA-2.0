/**
 * Persistent state storage service
 * Uses localStorage instead of sessionStorage to persist across logouts
 * State is user-specific using user ID in keys
 */

/**
 * Save state to persistent storage (localStorage)
 * @param key - Storage key (should include user ID)
 * @param value - Value to store (will be JSON stringified)
 */
export function saveState(key: string, value: any): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Failed to save state for key ${key}:`, error);
    // If localStorage is full, try to clear old data
    if (error instanceof DOMException && error.code === 22) {
      console.warn('LocalStorage is full. Consider clearing old data.');
    }
  }
}

/**
 * Load state from persistent storage (localStorage)
 * @param key - Storage key (should include user ID)
 * @returns Parsed value or null if not found
 */
export function loadState<T>(key: string): T | null {
  try {
    const item = localStorage.getItem(key);
    if (!item) return null;
    return JSON.parse(item) as T;
  } catch (error) {
    console.error(`Failed to load state for key ${key}:`, error);
    return null;
  }
}

/**
 * Remove state from persistent storage
 * @param key - Storage key to remove
 */
export function removeState(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Failed to remove state for key ${key}:`, error);
  }
}

/**
 * Clear all state for a specific user
 * @param userId - User ID to clear state for
 */
export function clearUserState(userId: string): void {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.includes(userId)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error(`Failed to clear state for user ${userId}:`, error);
  }
}

/**
 * Check if state exists for a key
 * @param key - Storage key to check
 * @returns true if state exists
 */
export function hasState(key: string): boolean {
  return localStorage.getItem(key) !== null;
}

