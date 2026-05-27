package com.pooledpay.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonFormat;

@Data
@Entity
@Table(name = "pool_orders")
public class PoolOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long productId;

    private String status; // OPEN, CLOSED, etc.

    private Integer participantsCount = 0;

    private Integer currentQuantity = 0;

    private String location;

    private Long supplierId;

    private String supplierStatus;

    private String deliveryStatus;

    private String category;

    private Integer maxQuantity;

    private String paymentStatus = "PENDING";

    /* ---------------- ADMIN WORKFLOW ---------------- */

    private String orderStatus;

    private boolean paymentReleased;

    private String deliveryCode;

    private boolean delivered;

    private LocalDateTime approvedAt;

    private LocalDateTime deliveredAt;

    /* ------------------------------------------------ */

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt = LocalDateTime.now();

    /* ---------------- GETTERS & SETTERS ---------------- */

    public String getOrderStatus() {
        return orderStatus;
    }

    public void setOrderStatus(String orderStatus) {
        this.orderStatus = orderStatus;
    }

    public boolean isPaymentReleased() {
        return paymentReleased;
    }

    public void setPaymentReleased(boolean paymentReleased) {
        this.paymentReleased = paymentReleased;
    }

    public String getDeliveryCode() {
        return deliveryCode;
    }

    public void setDeliveryCode(String deliveryCode) {
        this.deliveryCode = deliveryCode;
    }

    public boolean isDelivered() {
        return delivered;
    }

    public void setDelivered(boolean delivered) {
        this.delivered = delivered;
    }

    public LocalDateTime getApprovedAt() {
        return approvedAt;
    }

    public void setApprovedAt(LocalDateTime approvedAt) {
        this.approvedAt = approvedAt;
    }

    public LocalDateTime getDeliveredAt() {
        return deliveredAt;
    }

    public void setDeliveredAt(LocalDateTime deliveredAt) {
        this.deliveredAt = deliveredAt;
    }
}