package com.campus.trade.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank(message = "学号不能为空") String studentNo,
        @NotBlank(message = "昵称不能为空") String nickname,
        @Email(message = "邮箱格式错误") String email,
        @Pattern(regexp = "^1\\d{10}$", message = "手机号格式错误") String phone,
        @Size(min = 6, max = 20, message = "密码长度需为6-20位") String password
) {
}
