package com.example.bazuuyu;

import com.example.bazuuyu.security.VNPayConfig;
import com.example.bazuuyu.service.VNPayService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.*;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
class VNPayServiceTest {

    @Autowired
    private VNPayService vnpay;
    @Autowired
    private VNPayConfig cfg;

    @Test
    void testVerifyReturn_ok() {
        // 1. Build a fake param map similar to VNPay redirect
        Map<String, String> params = new LinkedHashMap<>();
        params.put("vnp_Amount",      "10000000");
        params.put("vnp_TmnCode",     cfg.getVnp_TmnCode());
        params.put("vnp_TxnRef",      "123456");
        params.put("vnp_ResponseCode","00");
        params.put("vnp_TransactionStatus", "00");
        params.put("vnp_OrderInfo",   "Test order 123456");
        params.put("vnp_BankCode",    "NCB");
        params.put("vnp_PayDate",     "20251126090000");
        // ... add other fields if you want

        // 2. Sign them exactly like VNPay would
        String secureHash = cfg.hmacSHA512(
                cfg.getVnp_HashSecret(),
                buildSignedData(params) // same logic as in verifyReturn, but without hash fields
        );
        params.put("vnp_SecureHash", secureHash);

        // 3. Convert to Map<String, String[]>, like HttpServletRequest#getParameterMap()
        Map<String, String[]> paramMap = new HashMap<>();
        params.forEach((k, v) -> paramMap.put(k, new String[]{ v }));

        // 4. Call verifyReturn
        VNPayService.VerifyResult result = vnpay.verifyReturn(paramMap);

        System.out.println(result);
        assertTrue(result.signatureValid());
        assertEquals("00", result.code());
        assertEquals("123456", result.txnRef());
    }

    private String buildSignedData(Map<String, String> flat) {
        Map<String, String> toSign = new HashMap<>(flat);
        toSign.remove("vnp_SecureHashType");
        toSign.remove("vnp_SecureHash");

        List<String> keys = new ArrayList<>(toSign.keySet());
        Collections.sort(keys);

        StringBuilder hashData = new StringBuilder();
        for (String k : keys) {
            String v = toSign.get(k);
            if (v == null || v.isEmpty()) continue;
            if (hashData.length() > 0) hashData.append('&');
            hashData.append(k).append('=').append(URLEncoder.encode(v, StandardCharsets.UTF_8));
        }
        return hashData.toString();
    }
}

