package com.pooledpay.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "order_items")
public class OrderItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long poolOrderId;

    @Column(nullable = false)
    private Long retailerId;

    @Column(nullable = false)
    private String retailerUsername;

    @Column(nullable = false)
    private Integer quantity;

    @Column(nullable = false)
    private BigDecimal totalAmount;

    @Column(nullable = false)
    private String paymentMethod; // UPI or BNPL

    @Column(nullable = false)
    private String paymentStatus; // PENDING or PAID

    private LocalDateTime createdAt = LocalDateTime.now();
}
