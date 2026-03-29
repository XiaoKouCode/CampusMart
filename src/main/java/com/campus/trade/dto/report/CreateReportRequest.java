package com.campus.trade.dto.report;

import jakarta.validation.constraints.NotBlank;

public record CreateReportRequest(
        Long targetUserId,
        Long targetItemId,
        @NotBlank(message = "举报原因不能为空") String reason
) {
}
