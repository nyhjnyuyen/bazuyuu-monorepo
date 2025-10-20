package com.example.bazuuyu.service;

import org.springframework.stereotype.Service;

import java.security.SecureRandom;

@Service
public class TokenService {
    private static final SecureRandom RNG = new SecureRandom();
    public String newTokenHex(int bytes) {
        byte[] buf = new byte[bytes];
        RNG.nextBytes(buf);
        StringBuilder sb = new StringBuilder(bytes * 2);
        for (byte b : buf) sb.append(String.format("%02x", b));
        return sb.toString(); // 32 bytes → 64 hex chars
    }
}
