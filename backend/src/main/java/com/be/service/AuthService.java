package com.be.service;

import com.be.dto.auth.AuthResponse;
import com.be.dto.auth.LoginRequest;
import com.be.dto.auth.RegisterRequest;
import com.be.entity.Role;
import com.be.entity.User;
import com.be.exception.UnauthorizedException;
import com.be.exception.ValidationException;
import com.be.repository.UserRepository;
import com.be.security.JwtUtil;
import com.be.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;


    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmailIgnoreCase(request.getEmail())) {
            throw new ValidationException("Email is already registered");
        }

        // Create new user
        var user = User.builder()
                .email(request.getEmail().toLowerCase())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .address(request.getAddress())
                .role(Role.USER)
                .isActive(true)
                .build();

        var savedUser = userRepository.save(user);

        var userDetails = UserPrincipal.create(savedUser);
        var token = jwtUtil.generateToken(userDetails);
        var refreshToken = jwtUtil.generateRefreshToken(userDetails);

        return AuthResponse.builder()
                .token(token)
                .refreshToken(refreshToken)
                .type("Bearer")
                .id(savedUser.getId())
                .email(savedUser.getEmail())
                .fullName(savedUser.getFullName())
                .role(savedUser.getRole().name())
                .build();
    }

    public AuthResponse login(LoginRequest request, Boolean loginAdmin) {
        try {
            var authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail().toLowerCase(),
                            request.getPassword()
                    )
            );

            var userPrincipal = (UserPrincipal) authentication.getPrincipal();

            if (!userPrincipal.getIsActive()) {
                throw new UnauthorizedException("Account is deactivated");
            }

            if (loginAdmin != null && loginAdmin && !Role.ADMIN.equals(userPrincipal.getRole())) {
                throw new UnauthorizedException("Access denied");
            }

            var token = jwtUtil.generateToken(userPrincipal);
            var refreshToken = jwtUtil.generateRefreshToken(userPrincipal);

            return AuthResponse.builder()
                    .token(token)
                    .refreshToken(refreshToken)
                    .type("Bearer")
                    .id(userPrincipal.getId())
                    .email(userPrincipal.getEmail())
                    .fullName(userPrincipal.getFullName())
                    .role(userPrincipal.getRole().name())
                    .build();

        } catch (BadCredentialsException e) {
            throw new UnauthorizedException("Invalid email or password");
        }
    }

    public AuthResponse refreshToken(String refreshToken) {
        try {
            if (!jwtUtil.isTokenValid(refreshToken)) {
                throw new RuntimeException("Invalid refresh token");
            }

            var email = jwtUtil.getUsernameFromToken(refreshToken);
            var user = userRepository.findByEmailIgnoreCase(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            if (!user.getIsActive()) {
                throw new RuntimeException("Account is deactivated");
            }

            var userDetails = UserPrincipal.create(user);
            var newToken = jwtUtil.generateToken(userDetails);
            var newRefreshToken = jwtUtil.generateRefreshToken(userDetails);
            return AuthResponse.builder()
                    .token(newToken)
                    .refreshToken(newRefreshToken)
                    .type("Bearer")
                    .id(user.getId())
                    .email(user.getEmail())
                    .fullName(user.getFullName())
                    .role(user.getRole().name())
                    .build();

        } catch (Exception e) {
            log.error("Token refresh failed: {}", e.getMessage());
            throw new RuntimeException("Token refresh failed");
        }
    }
}