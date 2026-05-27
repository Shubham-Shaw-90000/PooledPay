package com.pooledpay.backend.repository;

import com.pooledpay.backend.model.PasswordResetToken;
import com.pooledpay.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.Modifying;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    Optional<PasswordResetToken> findByToken(String token);
    
    @Transactional
    @Modifying
    void deleteByUser(User user);
}
