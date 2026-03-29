package com.campus.trade.service;

import com.campus.trade.common.BusinessException;
import com.campus.trade.common.SimpleCircuitBreaker;
import com.campus.trade.dto.item.CreateItemRequest;
import com.campus.trade.dto.item.ItemResponse;
import com.campus.trade.model.Item;
import com.campus.trade.model.User;
import com.campus.trade.model.enums.ItemStatus;
import com.campus.trade.repository.ItemRepository;
import com.campus.trade.security.SecurityUtils;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
public class ItemService {

    private final ItemRepository itemRepository;
    private final SimpleCircuitBreaker simpleCircuitBreaker;

    public ItemService(ItemRepository itemRepository, SimpleCircuitBreaker simpleCircuitBreaker) {
        this.itemRepository = itemRepository;
        this.simpleCircuitBreaker = simpleCircuitBreaker;
    }

    @Transactional
    @CacheEvict(cacheNames = "item:list", allEntries = true)
    public ItemResponse create(CreateItemRequest request) {
        User seller = SecurityUtils.currentUser();
        Item item = new Item();
        item.setTitle(request.title());
        item.setDescription(request.description());
        item.setPrice(request.price());
        item.setConditionLevel(request.conditionLevel());
        item.setCategory(request.category());
        item.setImageUrls(request.imageUrls());
        item.setSeller(seller);
        return toResponse(itemRepository.save(item));
    }

    @Cacheable(cacheNames = "item:detail", key = "#id")
    public ItemResponse detail(Long id) {
        Item item = itemRepository.findById(id).orElseThrow(() -> new BusinessException("商品不存在"));
        return toResponse(item);
    }

    @Cacheable(cacheNames = "item:list", key = "T(java.util.Objects).hash(#keyword, #category, #minPrice, #maxPrice, #publishAfter, #page, #size, #sortBy)")
    public Page<ItemResponse> search(String keyword, String category, BigDecimal minPrice, BigDecimal maxPrice, LocalDateTime publishAfter,
                                     int page, int size, String sortBy) {
        Sort sort = sortBy.equalsIgnoreCase("price") ? Sort.by(Sort.Direction.ASC, "price") : Sort.by(Sort.Direction.DESC, "createdAt");
        Pageable pageable = PageRequest.of(page, size, sort);
        return simpleCircuitBreaker.run(
                () -> itemRepository.search(ItemStatus.ONLINE, keyword, category, minPrice, maxPrice, publishAfter, pageable).map(this::toResponse),
                Page::empty
        );
    }

    @Transactional
    @CacheEvict(cacheNames = {"item:list", "item:detail"}, allEntries = true)
    public ItemResponse approve(Long itemId) {
        Item item = itemRepository.findById(itemId).orElseThrow(() -> new BusinessException("商品不存在"));
        item.setStatus(ItemStatus.ONLINE);
        return toResponse(item);
    }

    @Transactional
    @CacheEvict(cacheNames = {"item:list", "item:detail"}, allEntries = true)
    public ItemResponse rejectOrOffline(Long itemId) {
        Item item = itemRepository.findById(itemId).orElseThrow(() -> new BusinessException("商品不存在"));
        item.setStatus(ItemStatus.OFFLINE);
        return toResponse(item);
    }

    public Item getById(Long itemId) {
        return itemRepository.findById(itemId).orElseThrow(() -> new BusinessException("商品不存在"));
    }

    public Page<ItemResponse> listByStatus(ItemStatus status, int page, int size) {
        return itemRepository.findByStatus(status, PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")))
                .map(this::toResponse);
    }

    public ItemResponse toResponse(Item item) {
        return new ItemResponse(
                item.getId(), item.getTitle(), item.getDescription(), item.getPrice(), item.getConditionLevel(), item.getCategory(),
                item.getImageUrls(), item.getStatus(), item.getSeller().getId(), item.getSeller().getNickname(), item.getSeller().getCreditScore(),
                item.getCreatedAt()
        );
    }
}
