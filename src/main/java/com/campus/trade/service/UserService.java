package com.campus.trade.service;

import com.campus.trade.dto.user.UpdateProfileRequest;
import com.campus.trade.dto.user.UserProfileResponse;
import com.campus.trade.model.User;
import com.campus.trade.repository.UserRepository;
import com.campus.trade.security.SecurityUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public UserProfileResponse profile() {
        User user = SecurityUtils.currentUser();
        return toProfile(user);
    }

    @Transactional
    public UserProfileResponse updateProfile(UpdateProfileRequest request) {
        User user = userRepository.findById(SecurityUtils.currentUser().getId()).orElseThrow();
        user.setNickname(request.nickname());
        user.setAvatarUrl(request.avatarUrl());
        if (request.phone() != null && !request.phone().isBlank()) {
            user.setPhone(request.phone());
        }
        return toProfile(user);
    }

    public User findById(Long id) {
        return userRepository.findById(id).orElseThrow();
    }

    @Transactional
    public void adjustCredit(User user, int delta) {
        User managed = userRepository.findById(user.getId()).orElseThrow();
        int target = Math.max(0, Math.min(200, managed.getCreditScore() + delta));
        managed.setCreditScore(target);
        userRepository.save(managed);
    }

    public UserProfileResponse toProfile(User user) {
        return new UserProfileResponse(
                user.getId(), user.getStudentNo(), user.getNickname(), user.getEmail(), user.getPhone(), user.getAvatarUrl(),
                user.getCreditScore(), user.getVerified(),
                user.getRoles().stream().map(Enum::name).collect(Collectors.toSet())
        );
    }
}
