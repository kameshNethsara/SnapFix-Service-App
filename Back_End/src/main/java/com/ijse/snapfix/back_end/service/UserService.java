package com.ijse.snapfix.back_end.service;

import com.ijse.snapfix.back_end.dto.UserDTO;
import org.springframework.data.domain.Page;

import java.util.List;

public interface UserService {
    public void saveUserDetails(UserDTO userDTO);
    public void updateUserDetails(UserDTO userDTO);
    List<UserDTO> getAllUserDetails();
    public void changeUserStatus(String userId);
    public List<UserDTO> getAllUserByKeyword(String keyword); // Added search method
    public Page<UserDTO> getAllUserWithPagination(int page, int size); // Added pagination method

}
