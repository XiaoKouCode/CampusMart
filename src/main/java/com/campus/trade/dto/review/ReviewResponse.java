package com.campus.trade.dto.review;

import com.campus.trade.model.enums.RatingLevel;

public record ReviewResponse(
        Long id,
        Long orderId,
        Long fromUserId,
        Long toUserId,
        RatingLevel level,
        String content,
        String createdAt
) {
}