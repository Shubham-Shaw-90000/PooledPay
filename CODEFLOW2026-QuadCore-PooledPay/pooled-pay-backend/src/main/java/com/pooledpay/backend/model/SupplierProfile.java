package com.pooledpay.backend.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "supplier_profiles")
public class SupplierProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private Long supplierId;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String category; // Pharma, FMCG, Grocery

    @Column(nullable = false)
    private Double rating;

    @Column(nullable = false)
    private Integer capacity; // Original max orders per day/week

    @Column(nullable = false)
    private Integer maxConcurrentOrders; // New field for business logic

    @Column(nullable = false)
    private Integer activeOrdersCount = 0; // Busy level
}
