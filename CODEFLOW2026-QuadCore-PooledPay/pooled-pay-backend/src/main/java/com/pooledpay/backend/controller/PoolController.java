package com.pooledpay.backend.controller;

import com.pooledpay.backend.model.PoolOrder;
import com.pooledpay.backend.model.Product;
import com.pooledpay.backend.model.User;
import com.pooledpay.backend.repository.PoolOrderRepository;
import com.pooledpay.backend.repository.ProductRepository;
import com.pooledpay.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Pool Lifecycle:
 *
 *  ACTIVE  ──► CLOSED (max qty reached or 24h deadline hit)
 *  CLOSED  ──► PENDING_ADMIN_APPROVAL  (wholesaler clicks "Accept Bulk Order")
 *  PENDING_ADMIN_APPROVAL ──► SUPPLIER_ASSIGNED + paymentStatus=PAID (admin approves & pays)
 *  SUPPLIER_ASSIGNED ──► deliveryStatus: PREPARING → SHIPPED → DELIVERED
 */
@RestController
@RequestMapping("/api/pools")
@CrossOrigin(origins = "*")
public class PoolController {

    @Autowired private PoolOrderRepository poolOrderRepository;
    @Autowired private ProductRepository productRepository;
    @Autowired private UserRepository userRepository;

    // ── GET all pools ────────────────────────────────────────────────
    @GetMapping
    public List<PoolOrder> getAllPools() {
        return poolOrderRepository.findAll();
    }

    // ── GET active pools for a product ──────────────────────────────
    @GetMapping("/product/{productId}")
    public List<PoolOrder> getPoolsByProduct(@PathVariable Long productId) {
        return poolOrderRepository.findByProductIdAndStatus(productId, "ACTIVE");
    }

    // ── GET pools for a supplier ─────────────────────────────────────
    @GetMapping("/supplier/{supplierId}")
    public List<PoolOrder> getPoolsBySupplierId(@PathVariable Long supplierId) {
        return poolOrderRepository.findBySupplierId(supplierId);
    }

    // ── POST: Create or join a pool ──────────────────────────────────
    @PostMapping("/order")
    public ResponseEntity<?> placeOrder(@RequestBody Map<String, Object> orderRequest) {
        Long userId    = Long.valueOf(orderRequest.get("userId").toString());
        Long productId = Long.valueOf(orderRequest.get("productId").toString());
        Integer quantity = Integer.valueOf(orderRequest.get("quantity").toString());

        Long poolId = null;
        if (orderRequest.containsKey("poolId") && orderRequest.get("poolId") != null) {
            try { poolId = Long.valueOf(orderRequest.get("poolId").toString()); }
            catch (Exception ignored) {}
        }

        User user       = userRepository.findById(userId).orElse(null);
        Product product = productRepository.findById(productId).orElse(null);
        if (user == null || product == null) {
            return ResponseEntity.badRequest().body("User or Product not found");
        }

        // ── Validate per-retailer minimum quantity ───────────────────
        int minPerRetailer = product.getMinRetailerQuantity() != null
            ? product.getMinRetailerQuantity()
            : 1;
        if (quantity < minPerRetailer) {
            return ResponseEntity.badRequest().body(
                "You must order at least " + minPerRetailer + " " + product.getUnit()
                + " per order (wholesaler's minimum per retailer)."
            );
        }

        String location = user.getLocation() != null ? user.getLocation() : "Unknown";

        // ── Find or create pool ──────────────────────────────────────
        PoolOrder poolOrder = null;
        boolean joinedByPoolId = false;

        if (poolId != null) {
            PoolOrder found = poolOrderRepository.findById(poolId).orElse(null);
            if (found != null && "ACTIVE".equals(found.getStatus())) {
                int maxQty = found.getMaxQuantity() != null ? found.getMaxQuantity() : product.getTotalStockQuantity();
                int remaining = maxQty - found.getCurrentQuantity();
                if (quantity > remaining) {
                    return ResponseEntity.badRequest().body(
                        "Order quantity (" + quantity + ") exceeds the remaining pool capacity of " + remaining + " units."
                    );
                }
                poolOrder = found;
                joinedByPoolId = true;
            }
        }

        if (!joinedByPoolId) {
            // Find existing ACTIVE pool for the same product + location
            Optional<PoolOrder> existing = poolOrderRepository
                .findFirstByProductIdAndLocationAndStatus(productId, location, "ACTIVE");

            if (existing.isPresent()) {
                PoolOrder p = existing.get();
                int maxQty = p.getMaxQuantity() != null ? p.getMaxQuantity() : product.getTotalStockQuantity();
                int remaining = maxQty - p.getCurrentQuantity();
                if (quantity > remaining) {
                    return ResponseEntity.badRequest().body(
                        "Order quantity (" + quantity + ") exceeds the remaining pool capacity of " + remaining + " units."
                    );
                }
                poolOrder = p;
            } else {
                // Create brand-new pool
                int maxQty = product.getTotalStockQuantity() != null
                    ? product.getTotalStockQuantity()
                    : product.getAvailableQuantity();
                if (quantity > maxQty) {
                    return ResponseEntity.badRequest().body(
                        "Order quantity (" + quantity + ") exceeds the wholesaler's total stock of " + maxQty + " units."
                    );
                }
                poolOrder = new PoolOrder();
                poolOrder.setProductId(productId);
                poolOrder.setLocation(location);
                poolOrder.setStatus("ACTIVE");
                poolOrder.setCategory(product.getCategory());
                poolOrder.setParticipantsCount(0);   // incremented below
                poolOrder.setCurrentQuantity(0);     // incremented below
                poolOrder.setMaxQuantity(maxQty);
                poolOrder.setSupplierId(product.getSupplierId());
                poolOrder.setCreatedAt(LocalDateTime.now());
                poolOrder.setOrderStatus("PENDING_APPROVAL");
                poolOrder.setPaymentReleased(false);
                poolOrder.setDelivered(false);
            }
        }

        // ── Add this retailer's quantity ─────────────────────────────
        poolOrder.setParticipantsCount(poolOrder.getParticipantsCount() + 1);
        int newQty = poolOrder.getCurrentQuantity() + quantity;
        poolOrder.setCurrentQuantity(newQty);

        // ── Auto-close if max reached ────────────────────────────────
        int maxQty = poolOrder.getMaxQuantity() != null
            ? poolOrder.getMaxQuantity()
            : product.getTotalStockQuantity();
        if (newQty >= maxQty) {
            poolOrder.setStatus("CLOSED");
        }

        // ── Deduct stock ─────────────────────────────────────────────
        product.setAvailableQuantity(Math.max(0, product.getAvailableQuantity() - quantity));
        productRepository.save(product);

        return ResponseEntity.ok(poolOrderRepository.save(poolOrder));
    }

    // ── PATCH: Update pool status / delivery / payment ───────────────
    @PatchMapping("/{poolId}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long poolId,
                                          @RequestBody Map<String, String> body) {
        return poolOrderRepository.findById(poolId).map(pool -> {
            String newStatus = body.get("status");

            if ("PENDING_ADMIN_APPROVAL".equals(newStatus)) {
                // Wholesaler accepted — send to admin for approval
                pool.setStatus("PENDING_ADMIN_APPROVAL");
                pool.setSupplierStatus("ACCEPTED");

            } else if ("SUPPLIER_ASSIGNED".equals(newStatus)) {
                // Admin approved — mark paid and assign supplier
                pool.setStatus("SUPPLIER_ASSIGNED");
                pool.setPaymentStatus("PAID");
                pool.setDeliveryStatus("PREPARING");
                if (body.containsKey("supplierId")) {
                    pool.setSupplierId(Long.valueOf(body.get("supplierId")));
                }

            } else if (newStatus != null) {
                pool.setStatus(newStatus);
            }

            if (body.containsKey("deliveryStatus")) pool.setDeliveryStatus(body.get("deliveryStatus"));
            if (body.containsKey("paymentStatus"))  pool.setPaymentStatus(body.get("paymentStatus"));
            if (body.containsKey("supplierId") && !body.containsKey("status")) {
                pool.setSupplierId(Long.valueOf(body.get("supplierId")));
            }

            return ResponseEntity.ok(poolOrderRepository.save(pool));
        }).orElse(ResponseEntity.notFound().build());
    }
}
