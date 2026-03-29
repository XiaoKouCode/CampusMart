package com.campus.trade.controller;

import com.campus.trade.common.ApiResponse;
import com.campus.trade.dto.item.CreateItemRequest;
import com.campus.trade.dto.item.ItemResponse;
import com.campus.trade.service.ItemService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/items")
public class ItemController {

    private final ItemService itemService;

    public ItemController(ItemService itemService) {
        this.itemService = itemService;
    }

    @PostMapping
    public ApiResponse<ItemResponse> create(@Valid @RequestBody CreateItemRequest request) {
        return ApiResponse.ok("发布成功，等待审核", itemService.create(request));
    }

    @GetMapping("/{id}")
    public ApiResponse<ItemResponse> detail(@PathVariable Long id) {
        return ApiResponse.ok("查询成功", itemService.detail(id));
    }

    @GetMapping
    public ApiResponse<Page<ItemResponse>> search(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime publishAfter,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy) {
        return ApiResponse.ok("查询成功", itemService.search(keyword, category, minPrice, maxPrice, publishAfter, page, size, sortBy));
    }
}
