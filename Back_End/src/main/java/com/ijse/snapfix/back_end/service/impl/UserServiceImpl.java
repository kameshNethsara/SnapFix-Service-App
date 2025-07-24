package com.ijse.snapfix.back_end.service.impl;

import com.ijse.snapfix.back_end.dto.UserDTO;
import com.ijse.snapfix.back_end.service.UserService;
import org.springframework.data.domain.Page;

import java.util.List;

public class UserServiceImpl implements UserService {
    @Override
    public void saveUserDetails(UserDTO userDTO) {

    }

    @Override
    public void updateUserDetails(UserDTO userDTO) {

    }

    @Override
    public List<UserDTO> getAllUserDetails() {
        return List.of();
    }

    @Override
    public void changeUserStatus(String userId) {

    }

    @Override
    public List<UserDTO> getAllUserByKeyword(String keyword) {
        return List.of();
    }

    @Override
    public Page<UserDTO> getAllUserWithPagination(int page, int size) {
        return null;
    }
}
