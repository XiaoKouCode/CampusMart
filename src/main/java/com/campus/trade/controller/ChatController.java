package com.campus.trade.controller;

import com.campus.trade.common.ApiResponse;
import com.campus.trade.dto.chat.ChatMessageRequest;
import com.campus.trade.dto.chat.ChatMessageResponse;
import com.campus.trade.model.ChatMessage;
import com.campus.trade.service.ChatService;
import jakarta.validation.Valid;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.security.Principal;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;

    public ChatController(ChatService chatService, SimpMessagingTemplate messagingTemplate) {
        this.chatService = chatService;
        this.messagingTemplate = messagingTemplate;
    }

    @PostMapping("/send")
    public ApiResponse<ChatMessageResponse> send(@Valid @RequestBody ChatMessageRequest request) {
        ChatMessage message = chatService.store(request);
        ChatMessageResponse response = toResponse(message);
        messagingTemplate.convertAndSendToUser(String.valueOf(request.receiverId()), "/queue/messages", response);
        return ApiResponse.ok("发送成功", response);
    }

    @GetMapping("/history/{userId}")
    public ApiResponse<List<ChatMessageResponse>> history(@PathVariable Long userId) {
        List<ChatMessageResponse> list = chatService.history(userId).stream().map(this::toResponse).toList();
        return ApiResponse.ok("查询成功", list);
    }

    @MessageMapping("/chat.send")
    public void sendByWs(ChatMessageRequest request, Principal principal) {
        Long senderId;
        try {
            senderId = Long.parseLong(principal.getName());
        } catch (Exception e) {
            return;
        }
        ChatMessage saved = chatService.storeBySenderId(senderId, request);
        ChatMessageResponse response = toResponse(saved);
        messagingTemplate.convertAndSendToUser(String.valueOf(request.receiverId()), "/queue/messages", response);
        messagingTemplate.convertAndSendToUser(String.valueOf(senderId), "/queue/messages", response);
    }

    private ChatMessageResponse toResponse(ChatMessage message) {
        return new ChatMessageResponse(
                message.getId(),
                message.getSender().getId(),
                message.getReceiver().getId(),
                message.getItem() == null ? null : message.getItem().getId(),
                message.getContent(),
                message.getCreatedAt()
        );
    }
}
