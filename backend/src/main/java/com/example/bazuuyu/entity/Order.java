package com.example.bazuuyu.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import jakarta.persistence.*;

/**
 * A customer's full purchase.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "orders")
public class Order {
    public enum PaymentChannel { COD, VNPAY_QR, VNPAY_DOMESTIC,VNPAY_INTL }
    public enum OrderStatus { CREATED, AWAITING_PAYMENT, COD_PENDING, PAID, CANCELED, EXPIRED }
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String orderCode; //unique code sent to VNPAY (TxnRef)
    private LocalDateTime orderDate;

    @Column(precision = 18, scale = 2) // 16 digits + 2 decimals
    private BigDecimal totalAmount;

    @Enumerated(EnumType.STRING)
    private PaymentChannel paymentChannel;

    @Enumerated(EnumType.STRING)
    private OrderStatus status;

    private String paymentTxnId; //VNPAY transactionNo

    @Embedded
    private ShippingAddress shippingAddress;

    @ManyToOne
    @JoinColumn(name = "customer_id")
    private Customer customer; // kh da dat don

    @OneToMany(cascade = CascadeType.ALL)
    @JoinColumn(name = "order_id")
    private List<OrderItem> items; // danh sach cac muc trong don hang
}
