package com.campus.trade.controller;

import com.campus.trade.common.ApiResponse;
import com.campus.trade.dto.item.ItemResponse;
import com.campus.trade.model.enums.ItemStatus;
import com.campus.trade.model.Report;
import com.campus.trade.model.User;
import com.campus.trade.model.enums.ReportStatus;
import com.campus.trade.service.AdminService;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @PatchMapping("/users/{id}/status")
    public ApiResponse<User> toggleUser(@PathVariable Long id, @RequestParam boolean enabled) {
        return ApiResponse.ok("用户状态更新成功", adminService.toggleUser(id, enabled));
    }

    @PatchMapping("/items/{id}/approve")
    public ApiResponse<?> approveItem(@PathVariable Long id) {
        return ApiResponse.ok("商品审核通过", adminService.itemService().approve(id));
    }

    @PatchMapping("/items/{id}/offline")
    public ApiResponse<?> offlineItem(@PathVariable Long id) {
        return ApiResponse.ok("商品已下架", adminService.itemService().rejectOrOffline(id));
    }

    @PatchMapping("/reports/{id}")
    public ApiResponse<Report> handleReport(@PathVariable Long id,
                                            @RequestParam ReportStatus status,
                                            @RequestParam(required = false) String remark) {
        return ApiResponse.ok("举报处理完成", adminService.handleReport(id, status, remark));
    }

    @GetMapping("/stats")
    public ApiResponse<Map<String, Long>> stats() {
        return ApiResponse.ok("查询成功", adminService.stats());
    }

    @GetMapping("/items")
    public ApiResponse<Page<ItemResponse>> itemsByStatus(@RequestParam ItemStatus status,
                                                         @RequestParam(defaultValue = "0") int page,
                                                         @RequestParam(defaultValue = "10") int size) {
        return ApiResponse.ok("查询成功", adminService.itemService().listByStatus(status, page, size));
    }
}
