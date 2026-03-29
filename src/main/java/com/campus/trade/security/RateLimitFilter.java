package com.campus.trade.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private final int loginPerMinute;
    private final int orderPerMinute;
    private final Map<String, LocalWindowBucket> buckets = new ConcurrentHashMap<>();

    public RateLimitFilter(@Value("${app.rate-limit.login-per-minute:30}") int loginPerMinute,
                           @Value("${app.rate-limit.order-per-minute:50}") int orderPerMinute) {
        this.loginPerMinute = loginPerMinute;
        this.orderPerMinute = orderPerMinute;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String uri = request.getRequestURI();
        if (uri.equals("/api/auth/login")) {
            if (!resolveBucket(request.getRemoteAddr() + ":login", loginPerMinute).tryConsume()) {
                response.setStatus(429);
                response.getWriter().write("请求过于频繁");
                return;
            }
        }
        if (uri.equals("/api/orders") && "POST".equalsIgnoreCase(request.getMethod())) {
            if (!resolveBucket(request.getRemoteAddr() + ":order", orderPerMinute).tryConsume()) {
                response.setStatus(429);
                response.getWriter().write("下单过于频繁");
                return;
            }
        }
        filterChain.doFilter(request, response);
    }

    private LocalWindowBucket resolveBucket(String key, int limit) {
        return buckets.computeIfAbsent(key, k -> new LocalWindowBucket(limit, Duration.ofMinutes(1)));
    }

    private static class LocalWindowBucket {
        private final int limit;
        private final Duration duration;
        private final AtomicInteger counter = new AtomicInteger(0);
        private volatile Instant startAt = Instant.now();

        private LocalWindowBucket(int limit, Duration duration) {
            this.limit = limit;
            this.duration = duration;
        }

        private synchronized boolean tryConsume() {
            Instant now = Instant.now();
            if (Duration.between(startAt, now).compareTo(duration) >= 0) {
                startAt = now;
                counter.set(0);
            }
            if (counter.get() >= limit) {
                return false;
            }
            counter.incrementAndGet();
            return true;
        }
    }
}
