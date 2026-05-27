package com.pooledpay.backend.controller;

import com.pooledpay.backend.model.Role;
import com.pooledpay.backend.model.User;
import com.pooledpay.backend.model.SupplierProfile;
import com.pooledpay.backend.repository.UserRepository;
import com.pooledpay.backend.repository.SupplierProfileRepository;
import com.pooledpay.backend.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SupplierProfileRepository supplierProfileRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody Map<String, String> request) {
        if(userRepository.findByUsername(request.get("username")).isPresent()) {
            return ResponseEntity.badRequest().body("Username already exists");
        }

        User user = new User();
        user.setUsername(request.get("username"));
        user.setPassword(passwordEncoder.encode(request.get("password")));
        user.setLocation(request.getOrDefault("location", "Mumbai")); // Default location for demo
        
        try {
            user.setRole(Role.valueOf(request.get("role").toUpperCase()));
        } catch (Exception e) {
            user.setRole(Role.RETAILER);
        }
        
        User savedUser = userRepository.save(user);

        if (savedUser.getRole() == Role.SUPPLIER) {
            SupplierProfile profile = new SupplierProfile();
            profile.setSupplierId(savedUser.getId());
            profile.setName(savedUser.getUsername());
            profile.setCategory("Pharma"); // Default category
            profile.setRating(5.0); // Start with a 5.0 rating
            profile.setCapacity(50); // Default capacity
            profile.setMaxConcurrentOrders(50);
            profile.setActiveOrdersCount(0);
            supplierProfileRepository.save(profile);
        }

        return ResponseEntity.ok("User registered successfully");
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        User user = userRepository.findByUsername(request.get("username"))
                .orElse(null);

        if (user != null && passwordEncoder.matches(request.get("password"), user.getPassword())) {
            String token = jwtUtil.generateToken(user.getUsername(), user.getRole().name());
            Map<String, String> response = new HashMap<>();
            response.put("token", token);
            response.put("username", user.getUsername());
            response.put("role", user.getRole().name());
            response.put("userId", String.valueOf(user.getId()));
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.status(401).body("Invalid credentials");
    }
}
