package com.pooledpay.backend.repository;

import com.pooledpay.backend.model.SupplierProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;

public interface SupplierProfileRepository extends JpaRepository<SupplierProfile, Long> {
    Optional<SupplierProfile> findBySupplierId(Long supplierId);
    List<SupplierProfile> findByCategoryIgnoreCase(String category);
}
