package com.campus.trade.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
        @Email(message = "邮箱格式错误") String email,
        @NotBlank(message = "密码不能为空") String password
) {
}
