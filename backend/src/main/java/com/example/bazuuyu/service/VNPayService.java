package com.example.bazuuyu.service;

import com.example.bazuuyu.security.VNPayConfig;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

@Service
@RequiredArgsConstructor
public class VNPayService {

    private final VNPayConfig cfg; // injected

    /** Build a signed VNPay payment URL.
     * @param totalVnd amount in VND (e.g. 150000). VNPay requires x100 (no decimals)
     * @param orderInfo free text for display on VNPay
     * @param clientIp caller IP (store from request, e.g. X-Forwarded-For or remoteAddr)
     * @param returnUrlOverride if non-null, overrides vnp_return-url from properties
     */
    public String createPaymentUrl(long totalVnd,
                                   String orderCode,
                                   String orderInfo,
                                   String clientIp,
                                   String returnUrlOverride) {

        String vnpVersion = "2.1.0";
        String vnpCommand = "pay";
        // 🔴 IMPORTANT: ensure this is numeric-only and <= 20 chars
        String vnpTxnRef  = orderCode; // e.g. String.valueOf(orderId)
        String vnpTmnCode = cfg.getVnp_TmnCode();
        String vnpLocale  = "vn";
        String vnpCurr    = "VND";

        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
        SimpleDateFormat fmt = new SimpleDateFormat("yyyyMMddHHmmss");
        String vnpCreate = fmt.format(cld.getTime());
        cld.add(Calendar.MINUTE, 15);
        String vnpExpire = fmt.format(cld.getTime());

        Map<String, String> params = new HashMap<>();
        params.put("vnp_Version",     vnpVersion);
        params.put("vnp_Command",     vnpCommand);
        params.put("vnp_TmnCode",     vnpTmnCode);
        params.put("vnp_Amount",      String.valueOf(totalVnd * 100));
        params.put("vnp_CurrCode",    vnpCurr);
        params.put("vnp_TxnRef",      vnpTxnRef);
        params.put("vnp_OrderInfo",   orderInfo);
        params.put("vnp_OrderType",   "other");
        params.put("vnp_Locale",      vnpLocale);
        params.put("vnp_ReturnUrl",   returnUrlOverride != null ? returnUrlOverride : cfg.getVnp_Returnurl());
        params.put("vnp_IpAddr",      clientIp == null ? "127.0.0.1" : clientIp);
        params.put("vnp_CreateDate",  vnpCreate);
        params.put("vnp_ExpireDate",  vnpExpire);

        List<String> keys = new ArrayList<>(params.keySet());
        Collections.sort(keys);

        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();

        for (int i = 0; i < keys.size(); i++) {
            String k = keys.get(i);
            String v = params.get(k);
            if (v == null || v.isEmpty()) continue;

            // Append '&' only if this is NOT the first NON-EMPTY param
            if (hashData.length() > 0) {
                hashData.append('&');
                query.append('&');
            }

            hashData.append(k)
                    .append('=')
                    .append(urlEncodeUtf8(v));

            query.append(urlEncodeUtf8(k))
                    .append('=')
                    .append(urlEncodeUtf8(v));
        }

        String secureHash = cfg.hmacSHA512(cfg.getVnp_HashSecret(), hashData.toString());
        query.append("&vnp_SecureHash=").append(secureHash);

        String paymentUrl = cfg.getVnp_PayUrl() + "?" + query;
        // Log this once to see exactly what you're sending
        System.out.println("VNPay URL = " + paymentUrl);

        return paymentUrl;
    }

    private static String urlEncodeUtf8(String s) {
        return URLEncoder.encode(s, StandardCharsets.UTF_8);
    }

    // tiny DTO for verification outcome
    public record VerifyResult(boolean signatureValid, String code, String txnRef) {}
}
