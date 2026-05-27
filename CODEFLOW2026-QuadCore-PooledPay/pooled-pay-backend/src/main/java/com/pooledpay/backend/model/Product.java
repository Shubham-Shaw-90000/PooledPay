package com.pooledpay.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Entity
@Table(name = "products")
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String category;

    @Column(length = 1000)
    private String description;

    @Column(nullable = false)
    private String unit;

    @Column(nullable = false)
    private BigDecimal basePrice;

    @Column(nullable = false)
    private BigDecimal groupPrice;

    @Column(nullable = false)
    private Integer totalStockQuantity;

    /** Minimum TOTAL pool quantity (wholesaler threshold to accept bulk order) */
    @Column(nullable = false)
    private Integer minOrderQuantity;

    /** Minimum units each individual retailer must order when joining a pool */
    private Integer minRetailerQuantity;

    @Column(nullable = false)
    private Integer availableQuantity;

    private String deliveryTimeEstimate;

    private Integer batchSize;

    @Column(nullable = false)
    private Long supplierId;
}
