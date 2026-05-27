package com.pooledpay.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "merchant_risk_assessments")
public class MerchantRiskAssessment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    private LocalDateTime createdAt = LocalDateTime.now();

    // The core 20 input features stored
    private Integer rev;

    @JsonProperty("pay_due")
    private Integer payDue;

    private Integer gst;
    private Integer sales;

    @JsonProperty("rep_score")
    private Integer repScore;

    @JsonProperty("miss_pay")
    private Integer missPay;

    @JsonProperty("cash_bal")
    private Integer cashBal;

    @JsonProperty("up_orders")
    private Integer upOrders;

    @JsonProperty("ord_freq")
    private Integer ordFreq;

    @JsonProperty("credit_used")
    private Integer creditUsed;

    @JsonProperty("upi_vol")
    private Integer upiVol;

    @JsonProperty("ret_rate")
    private Integer retRate;

    @JsonProperty("pool_save")
    private Integer poolSave;

    @JsonProperty("inv_turn")
    private Integer invTurn;

    @JsonProperty("grp_ord")
    private Integer grpOrd;

    @JsonProperty("pay_delay")
    private Integer payDelay;

    @JsonProperty("season_idx")
    private Integer seasonIdx;

    @JsonProperty("supp_rate")
    private Double suppRate;

    @JsonProperty("credit_ratio")
    private Integer creditRatio;

    @JsonProperty("cust_growth")
    private Integer custGrowth;

    // AI Prediction Results
    @JsonProperty("risk_score")
    private Integer riskScore;

    @JsonProperty("risk_level")
    private String riskLevel;

    private Double confidence;

    // We can store reasons and suggestions as a single JSON or comma-separated string
    @Column(columnDefinition = "TEXT")
    private String reasons;

    @Column(columnDefinition = "TEXT")
    private String suggestions;
}
