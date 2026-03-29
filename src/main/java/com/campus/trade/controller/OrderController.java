package com.campus.trade.controller;

import com.campus.trade.common.ApiResponse;
import com.campus.trade.dto.order.CreateOrderRequest;
import com.campus.trade.dto.order.OrderResponse;
import com.campus.trade.model.enums.OrderStatus;
import com.campus.trade.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    public ApiResponse<OrderResponse> create(@Valid @RequestBody CreateOrderRequest request) {
        return ApiResponse.ok("下单成功", orderService.create(request.itemId()));
    }

    @PatchMapping("/{orderId}/pay")
    public ApiResponse<OrderResponse> pay(@PathVariable Long orderId) {
        return ApiResponse.ok("支付成功，资金已暂扣", orderService.pay(orderId));
    }

    @PatchMapping("/{orderId}/seller-confirm")
    public ApiResponse<OrderResponse> sellerConfirm(@PathVariable Long orderId) {
        return ApiResponse.ok("卖家已确认", orderService.sellerConfirm(orderId));
    }

    @PatchMapping("/{orderId}/buyer-receive")
    public ApiResponse<OrderResponse> buyerReceive(@PathVariable Long orderId) {
        return ApiResponse.ok("交易完成，平台已打款", orderService.buyerReceive(orderId));
    }

    @PatchMapping("/{orderId}/cancel")
    public ApiResponse<OrderResponse> cancel(@PathVariable Long orderId) {
        return ApiResponse.ok("订单已取消", orderService.cancel(orderId));
    }

    @GetMapping("/buyer")
    public ApiResponse<Page<OrderResponse>> buyerOrders(@RequestParam OrderStatus status,
                                                        @RequestParam(defaultValue = "0") int page,
                                                        @RequestParam(defaultValue = "10") int size) {
        return ApiResponse.ok("查询成功", orderService.buyerOrders(status, page, size));
    }

    @GetMapping("/seller")
    public ApiResponse<Page<OrderResponse>> sellerOrders(@RequestParam OrderStatus status,
                                                         @RequestParam(defaultValue = "0") int page,
                                                         @RequestParam(defaultValue = "10") int size) {
        return ApiResponse.ok("查询成功", orderService.sellerOrders(status, page, size));
    }
}
