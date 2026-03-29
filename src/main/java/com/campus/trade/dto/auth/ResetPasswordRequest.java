package com.campus.trade.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ResetPasswordRequest(
        @NotBlank(message = "邮箱不能为空") @Email(message = "邮箱格式不正确") String email,
        @NotBlank(message = "新密码不能为空") @Size(min = 6, max = 20, message = "密码长度需要在6-20之间") String newPassword
) {
}