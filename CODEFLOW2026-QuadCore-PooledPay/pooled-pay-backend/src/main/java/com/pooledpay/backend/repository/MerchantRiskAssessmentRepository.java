package com.pooledpay.backend.repository;

import com.pooledpay.backend.model.MerchantRiskAssessment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MerchantRiskAssessmentRepository extends JpaRepository<MerchantRiskAssessment, Long> {
    List<MerchantRiskAssessment> findByUserIdOrderByCreatedAtDesc(Long userId);
}
