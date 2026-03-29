package com.campus.trade.config;

import org.springframework.boot.autoconfigure.data.redis.RedisProperties;
import org.springframework.cache.CacheManager;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.cache.interceptor.SimpleCacheErrorHandler;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;

import java.time.Duration;

@Configuration
public class CacheConfig {

    @Bean
    public CacheManager cacheManager(RedisConnectionFactory redisConnectionFactory, RedisProperties redisProperties) {
        if (redisProperties.getHost() == null || redisProperties.getHost().isBlank()) {
            return new ConcurrentMapCacheManager("item:list", "item:detail");
        }
        try {
            redisConnectionFactory.getConnection().ping();
            RedisCacheConfiguration config = RedisCacheConfiguration.defaultCacheConfig()
                    .entryTtl(Duration.ofMinutes(10))
                    .disableCachingNullValues();
            return RedisCacheManager.builder(redisConnectionFactory).cacheDefaults(config).build();
        } catch (Exception e) {
            return new ConcurrentMapCacheManager("item:list", "item:detail");
        }
    }

    @Bean
    public SimpleCacheErrorHandler simpleCacheErrorHandler() {
        return new SimpleCacheErrorHandler();
    }
}
