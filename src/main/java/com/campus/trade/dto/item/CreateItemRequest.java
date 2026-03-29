package com.campus.trade.dto.item;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record CreateItemRequest(
        @NotBlank(message = "标题不能为空") String title,
        @NotBlank(message = "描述不能为空") String description,
        @NotNull(message = "价格不能为空") @DecimalMin(value = "0.01", message = "价格必须大于0") BigDecimal price,
        @NotBlank(message = "成色不能为空") String conditionLevel,
        @NotBlank(message = "分类不能为空") String category,
        @NotBlank(message = "图片不能为空") String imageUrls
) {
}
