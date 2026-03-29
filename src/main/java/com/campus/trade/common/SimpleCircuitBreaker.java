package com.campus.trade.common;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.function.Supplier;

@Component
public class SimpleCircuitBreaker {

    private static final Logger log = LoggerFactory.getLogger(SimpleCircuitBreaker.class);
    private final AtomicInteger failures = new AtomicInteger(0);
    private volatile Instant openedAt;

    public <T> T run(Supplier<T> supplier, Supplier<T> fallback) {
        if (openedAt != null && Duration.between(openedAt, Instant.now()).getSeconds() < 10) {
            log.warn("Circuit breaker is OPEN, returning fallback");
            return fallback.get();
        }
        try {
            T value = supplier.get();
            failures.set(0);
            openedAt = null;
            return value;
        } catch (Exception e) {
            log.error("Circuit breaker caught exception: {}", e.getMessage(), e);
            int count = failures.incrementAndGet();
            if (count >= 5) {
                openedAt = Instant.now();
                log.warn("Circuit breaker OPENED after {} failures", count);
            }
            return fallback.get();
        }
    }
}
