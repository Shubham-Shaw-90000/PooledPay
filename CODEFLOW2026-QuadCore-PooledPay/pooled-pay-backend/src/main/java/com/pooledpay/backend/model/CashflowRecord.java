package com.pooledpay.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "cashflow_records")
public class CashflowRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long retailerId;

    @Column(nullable = false)
    private BigDecimal amount;

    @Column(nullable = false)
    private String type; // INFLOW or OUTFLOW

    @Column(nullable = false)
    private String description;

    private LocalDateTime createdAt = LocalDateTime.now();
}
