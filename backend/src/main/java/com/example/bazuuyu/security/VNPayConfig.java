package com.example.bazuuyu.security;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Value;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.InetAddress;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.*;

@Component
public class VNPayConfig {

    @Value("${vnpay.pay-url:https://sandbox.vnpayment.vn/paymentv2/vpcpay.html}")
    private String vnp_PayUrl;

    @Value("${vnpay.return-url}")
    private String vnp_Returnurl;

    @Value("${vnpay.tmn-code}")
    private String vnp_TmnCode;

    @Value("${vnpay.hash-secret}")
    private String vnp_HashSecret;

    // getters if you need to read these elsewhere
    public String getVnp_PayUrl()     { return vnp_PayUrl; }
    public String getVnp_Returnurl()  { return vnp_Returnurl; }
    public String getVnp_TmnCode()    { return vnp_TmnCode; }
    public String getVnp_HashSecret() { return vnp_HashSecret; }

    // --- utilities that don't need Spring fields can stay static ---
    public static String md5(String message) {
        try {
            MessageDigest md = MessageDigest.getInstance("MD5");
            byte[] hash = md.digest(message.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder(2 * hash.length);
            for (byte b : hash) sb.append(String.format("%02x", b & 0xff));
            return sb.toString();
        } catch (Exception ex) {
            return "";
        }
    }

    public static String sha256(String message) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] hash = md.digest(message.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder(2 * hash.length);
            for (byte b : hash) sb.append(String.format("%02x", b & 0xff));
            return sb.toString();
        } catch (Exception ex) {
            return "";
        }
    }

    // ---- NON-STATIC: needs the injected secret ----
    public String hashAllFields(Map<String, String> fields) {
        List<String> fieldNames = new ArrayList<>(fields.keySet());
        Collections.sort(fieldNames);

        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < fieldNames.size(); i++) {
            String k = fieldNames.get(i);
            String v = fields.get(k);
            if (v != null && !v.isEmpty()) {
                sb.append(k).append('=').append(v);
                if (i < fieldNames.size() - 1) sb.append('&');
            }
        }
        return hmacSHA512(vnp_HashSecret, sb.toString());
    }

    // can be static or not; leaving non-static is fine
    public String hmacSHA512(final String key, final String data) {
        try {
            Mac hmac512 = Mac.getInstance("HmacSHA512");
            hmac512.init(new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512"));
            byte[] result = hmac512.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder(2 * result.length);
            for (byte b : result) sb.append(String.format("%02x", b & 0xff));
            return sb.toString();
        } catch (Exception ex) {
            return "";
        }
    }

    public static String getIpAddress(HttpServletRequest request) {
        // Prefer X-Forwarded-For if behind proxy; fall back to remote addr
        String ip = request.getHeader("X-FORWARDED-FOR");
        if (ip == null || ip.isBlank()) ip = request.getRemoteAddr();
        return ip;
    }

    public static String getRandomNumber(int len) {
        Random rnd = new Random();
        String digits = "0123456789";
        StringBuilder sb = new StringBuilder(len);
        for (int i = 0; i < len; i++) sb.append(digits.charAt(rnd.nextInt(digits.length())));
        return sb.toString();
    }
}
