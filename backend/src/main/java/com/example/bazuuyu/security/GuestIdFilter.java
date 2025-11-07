// src/main/java/com/example/bazuuyu/security/GuestIdFilter.java
package com.example.bazuuyu.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.UUID;

@Component
public class GuestIdFilter extends OncePerRequestFilter {

    public static final String COOKIE_NAME = "GUEST_ID";
    public static final int MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
            throws ServletException, IOException {

        boolean hasCookie = false;
        if (req.getCookies() != null) {
            hasCookie = Arrays.stream(req.getCookies())
                    .anyMatch(c -> COOKIE_NAME.equals(c.getName()) && c.getValue() != null && !c.getValue().isBlank());
        }

        if (!hasCookie) {
            String gid = UUID.randomUUID().toString();
            Cookie cookie = new Cookie(COOKIE_NAME, gid);
            cookie.setPath("/");
            cookie.setMaxAge(MAX_AGE_SECONDS);
            cookie.setHttpOnly(true);
            cookie.setSecure(true); // you’re on https via Netlify
            // Lax is fine for same-site; if you embed cross-site, set SameSite=None via response header on your CDN
            res.addCookie(cookie);
        }

        chain.doFilter(req, res);
    }
}
