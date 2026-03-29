package com.campus.trade.repository;

import com.campus.trade.model.TradeOrder;
import com.campus.trade.model.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TradeOrderRepository extends JpaRepository<TradeOrder, Long> {
    Page<TradeOrder> findByBuyerIdAndStatus(Long buyerId, OrderStatus status, Pageable pageable);

    Page<TradeOrder> findBySellerIdAndStatus(Long sellerId, OrderStatus status, Pageable pageable);
}
