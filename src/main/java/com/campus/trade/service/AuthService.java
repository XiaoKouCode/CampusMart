package com.campus.trade.service;

import com.campus.trade.common.BusinessException;
import com.campus.trade.dto.auth.AuthResponse;
import com.campus.trade.dto.auth.LoginRequest;
import com.campus.trade.dto.auth.RegisterRequest;
import com.campus.trade.dto.auth.ResetPasswordRequest;
import com.campus.trade.model.User;
import com.campus.trade.model.enums.Role;
import com.campus.trade.repository.UserRepository;
import com.campus.trade.security.JwtService;
import com.campus.trade.security.UserPrincipal;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.stream.Collectors;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, AuthenticationManager authenticationManager, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.findByEmail(request.email()).isPresent()) {
            throw new BusinessException("邮箱已注册");
        }
        if (userRepository.findByStudentNo(request.studentNo()).isPresent()) {
            throw new BusinessException("学号已注册");
        }
        User user = new User();
        user.setStudentNo(request.studentNo());
        user.setNickname(request.nickname());
        user.setEmail(request.email());
        user.setPhone(request.phone());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setVerified(request.email().endsWith(".edu.cn"));
        user.getRoles().add(Role.STUDENT);
        User saved = userRepository.save(user);
        String token = jwtService.generateToken(saved.getId(), saved.getEmail(), roleString(saved));
        return new AuthResponse(saved.getId(), saved.getEmail(), token);
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(request.email(), request.password()));
        User user = userRepository.findByEmail(request.email()).orElseThrow(() -> new BusinessException("用户不存在"));
        String token = jwtService.generateToken(user.getId(), user.getEmail(), roleString(user));
        return new AuthResponse(user.getId(), user.getEmail(), token);
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new BusinessException("该邮箱未注册"));
        user.setPassword(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
    }

    private String roleString(User user) {
        return user.getRoles().stream().map(Enum::name).collect(Collectors.joining(","));
    }
}
