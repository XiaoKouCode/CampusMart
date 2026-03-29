package com.campus.trade.repository;

import com.campus.trade.model.Item;
import com.campus.trade.model.enums.ItemStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public interface ItemRepository extends JpaRepository<Item, Long> {

    @Query("""
            select i from Item i
            where i.status = :status
              and (:keyword is null or i.title like concat('%', :keyword, '%') or i.description like concat('%', :keyword, '%'))
              and (:category is null or i.category = :category)
              and (:minPrice is null or i.price >= :minPrice)
              and (:maxPrice is null or i.price <= :maxPrice)
              and (:publishAfter is null or i.createdAt >= :publishAfter)
            """)
    Page<Item> search(ItemStatus status, String keyword, String category, BigDecimal minPrice, BigDecimal maxPrice, LocalDateTime publishAfter, Pageable pageable);

    Page<Item> findBySellerId(Long sellerId, Pageable pageable);

    Page<Item> findByStatus(ItemStatus status, Pageable pageable);
}
