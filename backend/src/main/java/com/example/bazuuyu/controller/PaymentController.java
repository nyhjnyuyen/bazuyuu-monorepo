package com.example.bazuuyu.controller;

import com.example.bazuuyu.entity.Order;
import com.example.bazuuyu.service.OrderService;
import com.example.bazuuyu.utils.MoneyUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.*;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final OrderService orderService;
    @Value("${vnpay.tmn-code}")   private String vnpTmnCode;
    @Value("${vnpay.hash-secret}")private String vnpHashSecret;
    @Value("${vnpay.pay-url}")    private String vnpPayUrl;
    @Value("${vnpay.return-url}") private String vnpReturnUrl;
    // ✅ COD checkout
    @PostMapping("/cod/{orderCode}")
    public ResponseEntity<String> payWithCod(@PathVariable String orderCode) {
        orderService.markCodPending(orderCode);
        return ResponseEntity.ok("Order placed with COD, awaiting delivery.");
    }

    // ✅ Start VNPAY payment (QR, Domestic, Intl)
    @GetMapping("/vnpay/{orderCode}")
    public ResponseEntity<String> payWithVnpay(
            @PathVariable String orderCode,
            @RequestParam Order.PaymentChannel channel,
            HttpServletRequest request
    ) {
        Order order = orderService.getOrderByCode(orderCode)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));

        // mark order awaiting payment
        orderService.markAwaitingPayment(orderCode, channel);

        // Build VNPAY URL
        String vnpUrl = buildVnpayUrl(order, channel, getIpAddress(request));

        return ResponseEntity.ok(vnpUrl);
    }

    // ✅ VNPAY IPN callback
    @GetMapping("/vnpay/ipn")
    public ResponseEntity<String> vnpayIpn(
            @RequestParam Map<String, String> params
    ) {
        String orderCode = params.get("vnp_TxnRef");
        String vnpTxnNo = params.get("vnp_TransactionNo");
        String rspCode  = params.get("vnp_ResponseCode");
        String amountStr = params.get("vnp_Amount");

        // verify amount matches
        Order order = orderService.getOrderByCode(orderCode)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));

        long expectedMinor = MoneyUtil.toVnpMinorUnits(order.getTotalAmount());
        long paidMinor = Long.parseLong(amountStr);

        if (paidMinor != expectedMinor) {
            return ResponseEntity.badRequest().body("INVALID_AMOUNT");
        }

        if ("00".equals(rspCode)) {
            orderService.markPaidByVnpay(orderCode, vnpTxnNo);
            return ResponseEntity.ok("OK");
        } else {
            return ResponseEntity.badRequest().body("FAILED_" + rspCode);
        }
    }

    // --- helpers ---

    private String buildVnpayUrl(Order order, Order.PaymentChannel channel, String clientIp) {
        long amountMinor = MoneyUtil.toVnpMinorUnits(order.getTotalAmount()); // amount * 100

        Map<String, String> vnp = new HashMap<>();
        vnp.put("vnp_Version", "2.1.0");
        vnp.put("vnp_Command", "pay");
        vnp.put("vnp_TmnCode", vnpTmnCode);
        vnp.put("vnp_Amount", String.valueOf(amountMinor));
        vnp.put("vnp_CurrCode", "VND");
        vnp.put("vnp_TxnRef", order.getOrderCode());
        vnp.put("vnp_OrderInfo", "Thanh toan don hang " + order.getOrderCode());
        vnp.put("vnp_OrderType", "other");
        vnp.put("vnp_Locale", "vn");
        vnp.put("vnp_ReturnUrl", vnpReturnUrl);
        vnp.put("vnp_IpAddr", clientIp);
        vnp.put("vnp_CreateDate", new java.text.SimpleDateFormat("yyyyMMddHHmmss").format(new Date()));
        // Optional: vnp.put("vnp_ExpireDate", ...);

        switch (channel) {
            case VNPAY_QR -> vnp.put("vnp_BankCode", "VNPAYQR");
            case VNPAY_DOMESTIC -> vnp.put("vnp_BankCode", "VNBANK");
            case VNPAY_INTL -> vnp.put("vnp_BankCode", "INTCARD");
        }

        List<String> fields = new ArrayList<>(vnp.keySet());
        Collections.sort(fields);

        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();
        for (Iterator<String> it = fields.iterator(); it.hasNext(); ) {
            String k = it.next(), val = vnp.get(k);
            hashData.append(k).append('=').append(val);
            query.append(URLEncoder.encode(k, java.nio.charset.StandardCharsets.US_ASCII))
                    .append('=')
                    .append(URLEncoder.encode(val, java.nio.charset.StandardCharsets.US_ASCII));
            if (it.hasNext()) { hashData.append('&'); query.append('&'); }
        }

        String secureHash = hmacSHA512(vnpHashSecret, hashData.toString());
        query.append("&vnp_SecureHash=").append(secureHash);
        return vnpPayUrl + "?" + query;
    }

    private String hmacSHA512(String key, String data) {
        try {
            javax.crypto.Mac hmac512 = javax.crypto.Mac.getInstance("HmacSHA512");
            javax.crypto.spec.SecretKeySpec secretKeySpec = new javax.crypto.spec.SecretKeySpec(key.getBytes(), "HmacSHA512");
            hmac512.init(secretKeySpec);
            byte[] hashBytes = hmac512.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder(2 * hashBytes.length);
            for (byte b : hashBytes) {
                sb.append(String.format("%02x", b & 0xff));
            }
            return sb.toString();
        } catch (Exception e) {
            throw new RuntimeException("Failed to HMAC SHA512", e);
        }
    }

    private String getIpAddress(HttpServletRequest request) {
        String ip = request.getHeader("X-FORWARDED-FOR");
        if (ip == null) ip = request.getRemoteAddr();
        return ip;
    }
}
