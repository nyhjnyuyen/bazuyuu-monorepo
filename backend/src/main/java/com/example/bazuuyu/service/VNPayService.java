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
    public String createPaymentUrl(long totalVnd, String orderCode, String orderInfo, String clientIp, String returnUrlOverride) {
        String vnpVersion = "2.1.0";
        String vnpCommand = "pay";
        String vnpTxnRef  = orderCode;
        String vnpTmnCode = cfg.getVnp_TmnCode();
        String vnpLocale  = "vn";
        String vnpCurr    = "VND";

        // times in GMT+7 formatted yyyyMMddHHmmss
        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        SimpleDateFormat fmt = new SimpleDateFormat("yyyyMMddHHmmss");
        String vnpCreate = fmt.format(cld.getTime());
        cld.add(Calendar.MINUTE, 15);
        String vnpExpire = fmt.format(cld.getTime());

        Map<String, String> params = new HashMap<>();
        params.put("vnp_Version",     vnpVersion);
        params.put("vnp_Command",     vnpCommand);
        params.put("vnp_TmnCode",     vnpTmnCode);
        params.put("vnp_Amount",      String.valueOf(totalVnd * 100)); // *100 required
        params.put("vnp_CurrCode",    vnpCurr);
        params.put("vnp_TxnRef",      vnpTxnRef);
        params.put("vnp_OrderInfo",   orderInfo);
        params.put("vnp_OrderType",   "other");
        params.put("vnp_Locale",      vnpLocale);
        params.put("vnp_ReturnUrl",   returnUrlOverride != null ? returnUrlOverride : cfg.getVnp_Returnurl());
        params.put("vnp_IpAddr",      clientIp == null ? "127.0.0.1" : clientIp);
        params.put("vnp_CreateDate",  vnpCreate);
        params.put("vnp_ExpireDate",  vnpExpire);

        // sort keys and build hashData & query
        List<String> keys = new ArrayList<>(params.keySet());
        Collections.sort(keys);

        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();
        for (int i = 0; i < keys.size(); i++) {
            String k = keys.get(i);
            String v = params.get(k);
            if (v == null || v.isEmpty()) continue;

            if (i > 0) { hashData.append('&'); query.append('&'); }
            hashData.append(k).append('=').append(urlEncode(v));
            query.append(urlEncode(k)).append('=').append(urlEncode(v));
        }

        // sign
        String secureHash = cfg.hmacSHA512(cfg.getVnp_HashSecret(), hashData.toString());
        query.append("&vnp_SecureHash=").append(secureHash);

        return cfg.getVnp_PayUrl() + "?" + query;
    }

    /** Verify VNPay return/IPN signature and status. */
    public VerifyResult verifyReturn(Map<String, String[]> requestParams) {
        // flatten multi-value map → single
        Map<String, String> flat = new HashMap<>();
        requestParams.forEach((k, v) -> flat.put(k, (v != null && v.length > 0) ? v[0] : null));

        String receivedHash = flat.get("vnp_SecureHash");
        if (receivedHash == null) return new VerifyResult(false, "Missing vnp_SecureHash", null);

        // build data string without hash fields
        Map<String, String> toSign = new HashMap<>(flat);
        toSign.remove("vnp_SecureHashType");
        toSign.remove("vnp_SecureHash");

        List<String> keys = new ArrayList<>(toSign.keySet());
        Collections.sort(keys);

        StringBuilder hashData = new StringBuilder();
        for (int i = 0; i < keys.size(); i++) {
            String k = keys.get(i);
            String v = toSign.get(k);
            if (v == null || v.isEmpty()) continue;
            if (i > 0) hashData.append('&');
            hashData.append(k).append('=').append(v);
        }

        String calc = cfg.hmacSHA512(cfg.getVnp_HashSecret(), hashData.toString());
        boolean ok = calc.equalsIgnoreCase(receivedHash);
        String code = flat.getOrDefault("vnp_ResponseCode", flat.get("vnp_TransactionStatus"));
        return new VerifyResult(ok, code, flat.get("vnp_TxnRef"));
    }

    private static String urlEncode(String s) {
        return URLEncoder.encode(s, StandardCharsets.US_ASCII);
    }

    // tiny DTO for verification outcome
    public record VerifyResult(boolean signatureValid, String code, String txnRef) {}
}
