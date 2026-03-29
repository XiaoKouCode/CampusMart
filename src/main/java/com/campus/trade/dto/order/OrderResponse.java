package com.campus.trade.dto.order;

import com.campus.trade.model.enums.OrderStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record OrderResponse(
        Long id,
        Long itemId,
        String itemTitle,
        Long buyerId,
        Long sellerId,
        BigDecimal amount,
        OrderStatus status,
        LocalDateTime createdAt
) {
}
