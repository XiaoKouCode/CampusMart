package com.campus.trade.dto.auth;

public record AuthResponse(Long userId, String email, String token) {
}
