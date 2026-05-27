package com.pooledpay.backend.controller;

import com.pooledpay.backend.model.PoolOrder;
import com.pooledpay.backend.repository.PoolOrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired
    private PoolOrderRepository poolOrderRepository;

    @GetMapping("/orders")
    public List<PoolOrder> getAllOrders() {
        return poolOrderRepository.findAll();
    }

    @PutMapping("/approve/{id}")
    public PoolOrder approveOrder(@PathVariable Long id) {

        PoolOrder order = poolOrderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        order.setOrderStatus("APPROVED");
        order.setPaymentReleased(true);
        order.setApprovedAt(LocalDateTime.now());
        
        order.setStatus("SUPPLIER_ASSIGNED");
        order.setPaymentStatus("PAID");
        order.setDeliveryStatus("PREPARING");

        String code = "PP-" + (1000 + new Random().nextInt(9000));
        order.setDeliveryCode(code);

        return poolOrderRepository.save(order);
    }

    @PutMapping("/ship/{id}")
    public PoolOrder shipOrder(@PathVariable Long id) {

        PoolOrder order = poolOrderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        order.setOrderStatus("SHIPPED");
        order.setDeliveryStatus("SHIPPED");

        return poolOrderRepository.save(order);
    }

    @PutMapping("/verify-delivery/{id}")
    public PoolOrder verifyDelivery(
            @PathVariable Long id,
            @RequestParam String code
    ) {

        PoolOrder order = poolOrderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if(order.getDeliveryCode().equals(code)) {

            order.setDelivered(true);
            order.setOrderStatus("DELIVERED");
            order.setDeliveredAt(LocalDateTime.now());
            order.setStatus("DELIVERED");
            order.setDeliveryStatus("DELIVERED");

        } else {
            throw new RuntimeException("Invalid delivery code");
        }

        return poolOrderRepository.save(order);
    }
}