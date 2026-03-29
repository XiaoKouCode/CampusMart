package com.campus.trade.dto.review;

import com.campus.trade.model.enums.RatingLevel;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateReviewRequest(
        @NotNull(message = "订单不能为空") Long orderId,
        @NotNull(message = "评价等级不能为空") RatingLevel level,
        @NotBlank(message = "评价内容不能为空") String content
) {
}
