package com.campus.trade.dto.user;

import java.util.Set;

public record UserProfileResponse(
        Long id,
        String studentNo,
        String nickname,
        String email,
        String phone,
        String avatarUrl,
        Integer creditScore,
        Boolean verified,
        Set<String> roles
) {
}
