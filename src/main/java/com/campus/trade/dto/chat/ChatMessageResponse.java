package com.campus.trade.dto.chat;

import java.time.LocalDateTime;

public record ChatMessageResponse(
        Long id,
        Long senderId,
        Long receiverId,
        Long itemId,
        String content,
        LocalDateTime createdAt
) {
}
