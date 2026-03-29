package com.campus.trade.dto.user;

import jakarta.validation.constraints.NotBlank;

public record UpdateProfileRequest(
        @NotBlank(message = "昵称不能为空") String nickname,
        String avatarUrl,
        String phone
) {
}
