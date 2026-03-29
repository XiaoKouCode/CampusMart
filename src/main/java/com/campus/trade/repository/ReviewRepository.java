package com.campus.trade.repository;

import com.campus.trade.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByToUserId(Long toUserId);
}
