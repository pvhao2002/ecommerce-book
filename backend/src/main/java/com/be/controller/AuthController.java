package com.be.controller;

import com.be.dto.auth.LoginRequest;
import com.be.dto.auth.RefreshTokenRequest;
import com.be.dto.auth.RegisterRequest;
import com.be.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@Slf4j
@RequestMapping("auth")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public Object register(@Valid @RequestBody RegisterRequest request) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
        } catch (Exception e) {
            log.error("Registration failed for email {}: {}", request.getEmail(), e.getMessage());
            throw e;
        }
    }

    @PostMapping("/login")
    public Object loginUser(@Valid @RequestBody LoginRequest request) {
        try {
            return ResponseEntity.ok(authService.login(request, null));
        } catch (Exception e) {
            log.error("Login failed for email {}: {}", request.getEmail(), e.getMessage());
            throw e;
        }
    }

    @PostMapping("/login-admin")
    public Object loginAdmin(@Valid @RequestBody LoginRequest request) {
        try {
            return ResponseEntity.ok(authService.login(request, Boolean.TRUE));
        } catch (Exception e) {
            log.error("Login admin failed for email {}: {}", request.getEmail(), e.getMessage());
            throw e;
        }
    }

    @PostMapping("/refresh")
    public Object refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        try {
            return ResponseEntity.ok(authService.refreshToken(request.getRefreshToken()));
        } catch (Exception e) {
            log.error("Token refresh failed: {}", e.getMessage());
            throw e;
        }
    }
}