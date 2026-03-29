package com.campus.trade.controller;

import com.campus.trade.common.ApiResponse;
import com.campus.trade.dto.user.UpdateProfileRequest;
import com.campus.trade.dto.user.UserProfileResponse;
import com.campus.trade.service.UserService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public ApiResponse<UserProfileResponse> me() {
        return ApiResponse.ok("查询成功", userService.profile());
    }

    @PatchMapping("/me")
    public ApiResponse<UserProfileResponse> update(@Valid @RequestBody UpdateProfileRequest request) {
        return ApiResponse.ok("更新成功", userService.updateProfile(request));
    }
}
