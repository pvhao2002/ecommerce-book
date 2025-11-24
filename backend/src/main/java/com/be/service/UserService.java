package com.be.service;

import com.be.dto.admin.UpdateUserStatusRequest;
import com.be.dto.admin.UserResponse;
import com.be.dto.common.MessageResponse;
import com.be.dto.common.PagedResponse;
import com.be.dto.user.ChangePasswordRequest;
import com.be.dto.user.UpdateUserProfileRequest;
import com.be.dto.user.UserProfileResponse;

public interface UserService {

    PagedResponse<UserResponse> getAllUsers(int page, int size, String search);

    UserResponse updateUserStatus(Long userId, UpdateUserStatusRequest request);

    UserResponse getUserById(Long userId);

    UserProfileResponse getUserProfile(String userEmail);

    UserProfileResponse updateUserProfile(String userEmail, UpdateUserProfileRequest request);

    MessageResponse changePassword(String userEmail, ChangePasswordRequest request);
}