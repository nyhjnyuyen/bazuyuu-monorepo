// robust JWT check (treat missing or expired as logged out)
export function getJwt() {
    try { return localStorage.getItem('jwt') || null; } catch { return null; }
}

export function isJwtValidNow() {
    const t = getJwt();
    if (!t) return false;
    const [, payload] = t.split('.');
    if (!payload) return false;
    try {
        const { exp } = JSON.parse(atob(payload));
        if (!Number.isFinite(exp)) return false;
        // a small 30s skew buffer
        return Date.now() < (exp * 1000 - 30_000);
    } catch {
        return false;
    }
}

export function ensureFreshJwtOrLogout() {
    if (!isJwtValidNow()) {
        localStorage.removeItem('jwt');
        return null;
    }
    return getJwt();
}
