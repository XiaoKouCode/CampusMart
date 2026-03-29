package com.campus.trade.dto.chat;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ChatMessageRequest(
        @NotNull(message = "接收方不能为空") Long receiverId,
        Long itemId,
        @NotBlank(message = "消息不能为空") String content
) {
}
