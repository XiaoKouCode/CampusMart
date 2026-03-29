package com.campus.trade.dto.item;

import com.campus.trade.model.enums.ItemStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ItemResponse(
        Long id,
        String title,
        String description,
        BigDecimal price,
        String conditionLevel,
        String category,
        String imageUrls,
        ItemStatus status,
        Long sellerId,
        String sellerNickname,
        Integer sellerCredit,
        LocalDateTime createdAt
) implements java.io.Serializable {
}
