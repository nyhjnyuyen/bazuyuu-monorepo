// v1 keys (bump version later if structure changes)
const CART_KEY = 'guest_cart_v1';

function read() {
    try { return JSON.parse(localStorage.getItem(CART_KEY)) ?? []; }
    catch { return []; }
}
function write(items) { localStorage.setItem(CART_KEY, JSON.stringify(items)); }

export function addToLocalCart(productId, quantity = 1) {
    const items = read();
    const i = items.findIndex(x => x.productId === productId);
    if (i >= 0) items[i].quantity += quantity; else items.push({ productId, quantity });
    write(items);
    window.dispatchEvent(new Event('cart-updated'));
}

export function removeFromLocalCart(productId) {
    write(read().filter(x => x.productId !== productId));
    window.dispatchEvent(new Event('cart-updated'));
}

export function getLocalCart() { return read(); }
export function clearLocalCart() { write([]); window.dispatchEvent(new Event('cart-updated')); }
export function localCartCount() { return read().reduce((s,x)=>s + (x.quantity||0), 0); }
export function isInLocalCart(productId) { return read().some(x => x.productId === productId); }
