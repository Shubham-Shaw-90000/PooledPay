package com.pooledpay.backend.repository;

import com.pooledpay.backend.model.CashflowRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CashflowRecordRepository extends JpaRepository<CashflowRecord, Long> {
    List<CashflowRecord> findByRetailerIdOrderByCreatedAtDesc(Long retailerId);
}
