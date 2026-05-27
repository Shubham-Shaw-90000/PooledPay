package com.pooledpay.backend.controller;

import com.pooledpay.backend.model.SupplierProfile;
import com.pooledpay.backend.model.PoolOrder;
import com.pooledpay.backend.repository.SupplierProfileRepository;
import com.pooledpay.backend.repository.PoolOrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.annotation.PostConstruct;
import java.util.List;

@RestController
@RequestMapping("/api/supplier")
@CrossOrigin(origins = "*")
public class SupplierController {

    @Autowired
    private SupplierProfileRepository supplierProfileRepository;

    @Autowired
    private PoolOrderRepository poolOrderRepository;

    @PostConstruct
    public void seedSuppliers() {
        if (supplierProfileRepository.count() == 0) {
            SupplierProfile s1 = new SupplierProfile();
            s1.setSupplierId(101L);
            s1.setName("PharmaCorp India");
            s1.setCategory("Pharma");
            s1.setRating(4.8);
            s1.setCapacity(50);
            s1.setMaxConcurrentOrders(50);
            s1.setActiveOrdersCount(2);

            SupplierProfile s2 = new SupplierProfile();
            s2.setSupplierId(102L);
            s2.setName("Global BioPharma");
            s2.setCategory("Pharma");
            s2.setRating(4.5);
            s2.setCapacity(30);
            s2.setMaxConcurrentOrders(30);
            s2.setActiveOrdersCount(0);

            SupplierProfile s3 = new SupplierProfile();
            s3.setSupplierId(103L);
            s3.setName("Apex FMCG Distributors");
            s3.setCategory("FMCG");
            s3.setRating(4.9);
            s3.setCapacity(80);
            s3.setMaxConcurrentOrders(80);
            s3.setActiveOrdersCount(4);

            SupplierProfile s4 = new SupplierProfile();
            s4.setSupplierId(104L);
            s4.setName("Medix Wholesale");
            s4.setCategory("Pharma");
            s4.setRating(4.7);
            s4.setCapacity(40);
            s4.setMaxConcurrentOrders(40);
            s4.setActiveOrdersCount(1);

            supplierProfileRepository.saveAll(List.of(s1, s2, s3, s4));
        }
    }

    @GetMapping("/list")
    public List<SupplierProfile> listSuppliers() {
        return supplierProfileRepository.findAll();
    }

    @GetMapping("/orders/{supplierId}")
    public List<PoolOrder> getAssignedOrders(@PathVariable Long supplierId) {
        // Return pools where supplierId matches
        return poolOrderRepository.findAll().stream()
                .filter(p -> p.getSupplierId() != null && p.getSupplierId().equals(supplierId))
                .toList();
    }

    @PostMapping("/orders/{poolId}/respond")
    public ResponseEntity<?> respondToOrder(@PathVariable Long poolId, @RequestParam String response) {
        return poolOrderRepository.findById(poolId).map(pool -> {
            pool.setSupplierStatus(response.toUpperCase());
            if ("ACCEPTED".equalsIgnoreCase(response)) {
                pool.setDeliveryStatus("PREPARING");
            } else {
                pool.setSupplierId(null);
            }
            poolOrderRepository.save(pool);
            return ResponseEntity.ok(pool);
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/orders/{poolId}/status")
    public ResponseEntity<?> updateDeliveryStatus(@PathVariable Long poolId, @RequestParam String status) {
        return poolOrderRepository.findById(poolId).map(pool -> {
            pool.setDeliveryStatus(status.toUpperCase());
            if ("DELIVERED".equalsIgnoreCase(status)) {
                pool.setStatus("DELIVERED");
            }
            poolOrderRepository.save(pool);
            return ResponseEntity.ok(pool);
        }).orElse(ResponseEntity.notFound().build());
    }
}
