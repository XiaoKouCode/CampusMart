package com.campus.trade.service;

import com.campus.trade.common.BusinessException;
import com.campus.trade.dto.review.CreateReviewRequest;
import com.campus.trade.dto.review.ReviewResponse;
import com.campus.trade.model.Review;
import com.campus.trade.model.TradeOrder;
import com.campus.trade.model.User;
import com.campus.trade.model.enums.OrderStatus;
import com.campus.trade.model.enums.RatingLevel;
import com.campus.trade.repository.ReviewRepository;
import com.campus.trade.security.SecurityUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final OrderService orderService;
    private final UserService userService;

    public ReviewService(ReviewRepository reviewRepository, OrderService orderService, UserService userService) {
        this.reviewRepository = reviewRepository;
        this.orderService = orderService;
        this.userService = userService;
    }

    @Transactional
    public ReviewResponse create(CreateReviewRequest request) {
        TradeOrder order = orderService.findById(request.orderId());
        if (!OrderStatus.COMPLETED.equals(order.getStatus())) {
            throw new BusinessException("只有已完成订单可评价");
        }
        User me = SecurityUtils.currentUser();
        User target;
        if (me.getId().equals(order.getBuyer().getId())) {
            target = order.getSeller();
        } else if (me.getId().equals(order.getSeller().getId())) {
            target = order.getBuyer();
        } else {
            throw new BusinessException("无权限评价该订单");
        }
        Review review = new Review();
        review.setOrder(order);
        review.setFromUser(me);
        review.setToUser(target);
        review.setLevel(request.level());
        review.setContent(request.content());
        adjustCredit(target, request.level());
        Review saved = reviewRepository.save(review);
        return new ReviewResponse(
                saved.getId(),
                order.getId(),
                me.getId(),
                target.getId(),
                request.level(),
                request.content(),
                saved.getCreatedAt().toString()
        );
    }

    private void adjustCredit(User user, RatingLevel level) {
        if (RatingLevel.GOOD.equals(level)) {
            userService.adjustCredit(user, 5);
        } else if (RatingLevel.BAD.equals(level)) {
            userService.adjustCredit(user, -10);
        }
    }
}
