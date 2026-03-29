package com.campus.trade.service;

import com.campus.trade.common.BusinessException;
import com.campus.trade.dto.order.OrderResponse;
import com.campus.trade.model.Item;
import com.campus.trade.model.TradeOrder;
import com.campus.trade.model.User;
import com.campus.trade.model.enums.ItemStatus;
import com.campus.trade.model.enums.OrderStatus;
import com.campus.trade.repository.TradeOrderRepository;
import com.campus.trade.security.SecurityUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OrderService {

    private final TradeOrderRepository tradeOrderRepository;
    private final ItemService itemService;

    public OrderService(TradeOrderRepository tradeOrderRepository, ItemService itemService) {
        this.tradeOrderRepository = tradeOrderRepository;
        this.itemService = itemService;
    }

    @Transactional
    public OrderResponse create(Long itemId) {
        User buyer = SecurityUtils.currentUser();
        Item item = itemService.getById(itemId);
        if (!ItemStatus.ONLINE.equals(item.getStatus())) {
            throw new BusinessException("商品不可下单");
        }
        if (item.getSeller().getId().equals(buyer.getId())) {
            throw new BusinessException("不能购买自己的商品");
        }
        item.setStatus(ItemStatus.SOLD);
        TradeOrder order = new TradeOrder();
        order.setItem(item);
        order.setBuyer(buyer);
        order.setSeller(item.getSeller());
        order.setAmount(item.getPrice());
        order.setStatus(OrderStatus.PENDING_PAYMENT);
        return toResponse(tradeOrderRepository.save(order));
    }

    @Transactional
    public OrderResponse pay(Long orderId) {
        TradeOrder order = getMyOrder(orderId);
        if (!OrderStatus.PENDING_PAYMENT.equals(order.getStatus())) {
            throw new BusinessException("订单状态不允许支付");
        }
        order.setStatus(OrderStatus.WAITING_SELLER_CONFIRM);
        return toResponse(order);
    }

    @Transactional
    public OrderResponse sellerConfirm(Long orderId) {
        TradeOrder order = tradeOrderRepository.findById(orderId).orElseThrow(() -> new BusinessException("订单不存在"));
        if (!SecurityUtils.currentUser().getId().equals(order.getSeller().getId())) {
            throw new BusinessException("无权限");
        }
        if (!OrderStatus.WAITING_SELLER_CONFIRM.equals(order.getStatus())) {
            throw new BusinessException("订单状态不允许卖家确认");
        }
        order.setStatus(OrderStatus.WAITING_BUYER_RECEIVE);
        return toResponse(order);
    }

    @Transactional
    public OrderResponse buyerReceive(Long orderId) {
        TradeOrder order = getMyOrder(orderId);
        if (!OrderStatus.WAITING_BUYER_RECEIVE.equals(order.getStatus())) {
            throw new BusinessException("订单状态不允许收货");
        }
        order.setStatus(OrderStatus.COMPLETED);
        return toResponse(order);
    }

    @Transactional
    public OrderResponse cancel(Long orderId) {
        TradeOrder order = getMyOrder(orderId);
        if (OrderStatus.COMPLETED.equals(order.getStatus())) {
            throw new BusinessException("已完成订单不可取消");
        }
        order.setStatus(OrderStatus.CANCELED);
        order.getItem().setStatus(ItemStatus.ONLINE);
        return toResponse(order);
    }

    public Page<OrderResponse> buyerOrders(OrderStatus status, int page, int size) {
        return tradeOrderRepository.findByBuyerIdAndStatus(SecurityUtils.currentUser().getId(), status, PageRequest.of(page, size))
                .map(this::toResponse);
    }

    public Page<OrderResponse> sellerOrders(OrderStatus status, int page, int size) {
        return tradeOrderRepository.findBySellerIdAndStatus(SecurityUtils.currentUser().getId(), status, PageRequest.of(page, size))
                .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public TradeOrder findById(Long orderId) {
        return tradeOrderRepository.findById(orderId).orElseThrow(() -> new BusinessException("订单不存在"));
    }

    private TradeOrder getMyOrder(Long orderId) {
        TradeOrder order = findById(orderId);
        if (!SecurityUtils.currentUser().getId().equals(order.getBuyer().getId())) {
            throw new BusinessException("无权限");
        }
        return order;
    }

    private OrderResponse toResponse(TradeOrder order) {
        return new OrderResponse(
                order.getId(),
                order.getItem().getId(),
                order.getItem().getTitle(),
                order.getBuyer().getId(),
                order.getSeller().getId(),
                order.getAmount(),
                order.getStatus(),
                order.getCreatedAt()
        );
    }
}
