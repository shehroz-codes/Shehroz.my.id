/** Replace this adapter with authenticated Firestore reads/writes when configured.
 * This contract stores a visitor's preference, never an aggregate popularity count.
 */
export interface LikePersistence {
  load(): Promise<boolean>;
  save(liked: boolean): Promise<void>;
}
const key = "shehroz:portfolio:liked";
export const localLikePersistence: LikePersistence = {
  async load() {
    try { return localStorage.getItem(key) === "true"; }
    catch { return false; }
  },
  async save(liked) {
    try { localStorage.setItem(key, String(liked)); }
    catch { /* Keep the button usable when storage is unavailable. */ }
  },
};
