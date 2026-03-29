package com.campus.trade.service;

import com.campus.trade.common.BusinessException;
import com.campus.trade.dto.chat.ChatMessageRequest;
import com.campus.trade.model.ChatMessage;
import com.campus.trade.model.Item;
import com.campus.trade.model.User;
import com.campus.trade.repository.ChatMessageRepository;
import com.campus.trade.repository.UserRepository;
import com.campus.trade.security.SecurityUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ChatService {

    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;
    private final ItemService itemService;

    public ChatService(ChatMessageRepository chatMessageRepository, UserRepository userRepository, ItemService itemService) {
        this.chatMessageRepository = chatMessageRepository;
        this.userRepository = userRepository;
        this.itemService = itemService;
    }

    @Transactional
    public ChatMessage store(ChatMessageRequest request) {
        User sender = SecurityUtils.currentUser();
        return storeBySender(sender, request);
    }

    @Transactional
    public ChatMessage storeBySenderId(Long senderId, ChatMessageRequest request) {
        User sender = userRepository.findById(senderId).orElseThrow(() -> new BusinessException("发送方不存在"));
        return storeBySender(sender, request);
    }

    private ChatMessage storeBySender(User sender, ChatMessageRequest request) {
        User receiver = userRepository.findById(request.receiverId()).orElseThrow(() -> new BusinessException("接收方不存在"));
        ChatMessage message = new ChatMessage();
        message.setSender(sender);
        message.setReceiver(receiver);
        if (request.itemId() != null) {
            Item item = itemService.getById(request.itemId());
            message.setItem(item);
        }
        message.setContent(request.content());
        return chatMessageRepository.save(message);
    }

    public List<ChatMessage> history(Long userId) {
        Long me = SecurityUtils.currentUser().getId();
        return chatMessageRepository.findBySenderIdAndReceiverIdOrSenderIdAndReceiverIdOrderByCreatedAtAsc(me, userId, userId, me);
    }
}
