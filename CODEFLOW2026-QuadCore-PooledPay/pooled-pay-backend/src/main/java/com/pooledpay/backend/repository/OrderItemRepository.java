package com.pooledpay.backend.repository;

import com.pooledpay.backend.model.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    List<OrderItem> findByRetailerId(Long retailerId);
    List<OrderItem> findByPoolOrderId(Long poolOrderId);
}
