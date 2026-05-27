package com.pooledpay.backend.controller;

import com.pooledpay.backend.model.Product;
import com.pooledpay.backend.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*")
public class ProductController {

    @Autowired
    private ProductRepository productRepository;

    // All products (for retailer marketplace)
    @GetMapping
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    // Products by a specific supplier (for supplier "My Products" tab)
    @GetMapping("/supplier/{supplierId}")
    public List<Product> getProductsBySupplierId(@PathVariable Long supplierId) {
        return productRepository.findBySupplierId(supplierId);
    }

    // Add a new product
    @PostMapping("/add")
    public ResponseEntity<Product> addProduct(@RequestBody Product product) {
        Product saved = productRepository.save(product);
        return ResponseEntity.ok(saved);
    }

    // Update an existing product (supplier edits stock/price etc.)
    @PutMapping("/{id}")
    public ResponseEntity<?> updateProduct(@PathVariable Long id, @RequestBody Product updated) {
        return productRepository.findById(id).map(existing -> {
            existing.setName(updated.getName());
            existing.setCategory(updated.getCategory());
            existing.setDescription(updated.getDescription());
            existing.setUnit(updated.getUnit());
            existing.setBasePrice(updated.getBasePrice());
            existing.setGroupPrice(updated.getGroupPrice());
            existing.setTotalStockQuantity(updated.getTotalStockQuantity());
            existing.setMinOrderQuantity(updated.getMinOrderQuantity());
            existing.setAvailableQuantity(updated.getAvailableQuantity());
            existing.setDeliveryTimeEstimate(updated.getDeliveryTimeEstimate());
            existing.setBatchSize(updated.getBatchSize());
            return ResponseEntity.ok(productRepository.save(existing));
        }).orElse(ResponseEntity.notFound().build());
    }

    // Delete a product
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {
        if (!productRepository.existsById(id)) return ResponseEntity.notFound().build();
        productRepository.deleteById(id);
        return ResponseEntity.ok("Deleted");
    }
}
