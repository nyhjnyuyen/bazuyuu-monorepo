const WL_KEY = 'guest_wishlist_v1';

function read() { try { return JSON.parse(localStorage.getItem(WL_KEY)) ?? []; } catch { return []; } }
function write(ids) { localStorage.setItem(WL_KEY, JSON.stringify(ids)); }

export function toggleLocalWishlist(productId) {
    const ids = new Set(read());
    if (ids.has(productId)) ids.delete(productId); else ids.add(productId);
    write([...ids]);
    window.dispatchEvent(new Event('wishlist-updated'));
}

export function isInLocalWishlist(productId) { return new Set(read()).has(productId); }
export function getLocalWishlist() { return read(); }
export function clearLocalWishlist() { write([]); window.dispatchEvent(new Event('wishlist-updated')); }
export function localWishlistCount() { return read().length; }
