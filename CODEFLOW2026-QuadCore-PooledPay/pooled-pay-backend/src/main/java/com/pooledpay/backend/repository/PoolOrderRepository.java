package com.pooledpay.backend.repository;

import com.pooledpay.backend.model.PoolOrder;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PoolOrderRepository extends JpaRepository<PoolOrder, Long> {
    Optional<PoolOrder> findFirstByProductIdAndLocationAndStatus(Long productId, String location, String status);
    List<PoolOrder> findByProductIdAndStatus(Long productId, String status);
    List<PoolOrder> findBySupplierId(Long supplierId);
}
