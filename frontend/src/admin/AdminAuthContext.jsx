// src/admin/AdminAuthContext.js
import React, {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

const AdminAuthContext = createContext(null);
export const useAdminAuth = () => useContext(AdminAuthContext);

// Decode a JWT payload safely (handles base64url)
function decodeJwt(token) {
    try {
        const parts = String(token).split(".");
        if (parts.length < 2) return null;
        const json = atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"));
        return JSON.parse(json);
    } catch {
        return null;
    }
}

export function AdminAuthProvider({ children }) {
    const [token, setToken] = useState(
        () =>
            localStorage.getItem("admin_jwt") ||
            localStorage.getItem("admin_token") ||
            ""
    );
    const [refreshToken, setRefreshToken] = useState(
        () => localStorage.getItem("admin_refresh") || ""
    );

    const claims = useMemo(() => (token ? decodeJwt(token) : null), [token]);

    // ---- NORMALISE ROLES FROM JWT --------------------------------
    const roles = useMemo(() => {
        if (!claims) return [];

        // backend might use "role", "roles", "authorities", or "scope"
        let raw =
            claims.role ||
            claims.roles ||
            claims.authorities ||
            claims.scope ||
            null;

        if (!raw) return [];

        // Array of strings or array of objects like { authority: "ROLE_SUPER_ADMIN" }
        if (Array.isArray(raw)) {
            return raw
                .map((r) => {
                    if (typeof r === "string") return r;
                    if (r && typeof r === "object") {
                        return r.authority || r.role || String(r);
                    }
                    return String(r);
                })
                .filter(Boolean);
        }

        // Single string: "SUPER_ADMIN" or "ROLE_SUPER_ADMIN" or "ADMIN SUPER_ADMIN"
        if (typeof raw === "string") {
            return raw.split(/[,\s]+/).filter(Boolean);
        }

        return [];
    }, [claims]);

    const primaryRole = roles[0] || null;

    const isSuperAdmin = roles.some(
        (r) =>
            r === "SUPER_ADMIN" ||
            r === "ROLE_SUPER_ADMIN" ||
            r.includes("SUPER_ADMIN")
    );

    const isAdmin =
        isSuperAdmin ||
        roles.some(
            (r) => r === "ADMIN" || r === "ROLE_ADMIN" || r.includes("ADMIN")
        );

    const username = claims?.sub || claims?.username || null;
    // we’ll use this when calling deleteAdmin(requesterId)
    const adminId =
        claims?.id || claims?.adminId || claims?.userId || claims?._id || null;

    const isAuthenticated = Boolean(token);

    // ---- persist tokens ------------------------------------------
    useEffect(() => {
        if (token) {
            localStorage.setItem("admin_jwt", String(token));
            localStorage.setItem("admin_token", String(token));
        } else {
            localStorage.removeItem("admin_jwt");
            localStorage.removeItem("admin_token");
        }
    }, [token]);

    useEffect(() => {
        if (refreshToken) {
            localStorage.setItem("admin_refresh", String(refreshToken));
        } else {
            localStorage.removeItem("admin_refresh");
        }
    }, [refreshToken]);

    const logout = () => {
        setToken("");
        setRefreshToken("");
    };

    const value = {
        token,
        setToken,
        refreshToken,
        setRefreshToken,
        roles,
        role: primaryRole,
        username,
        adminId,
        isAuthenticated,
        isAdmin,
        isSuperAdmin,
        logout,
    };

    return (
        <AdminAuthContext.Provider value={value}>
            {children}
        </AdminAuthContext.Provider>
    );
}
