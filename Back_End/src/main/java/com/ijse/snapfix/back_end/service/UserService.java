package com.ijse.snapfix.back_end.service;

import com.ijse.snapfix.back_end.dto.PasswordUpdateDTO;
import com.ijse.snapfix.back_end.dto.UserDTO;
import com.ijse.snapfix.back_end.dto.UserLocationDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface UserService {

    // Save a new user
    UserDTO saveUser(UserDTO userDTO);

    // Update an existing user
    UserDTO updateUser(int userId, UserDTO userDTO);

    public UserDTO updateUserLocation(UserLocationDTO dto);

    public List<UserLocationDTO> getAllTechnicianLocations();

    public UserDTO updateAllFormData(int userId, UserDTO userDTO, MultipartFile profileImage);

    // Update user password
    void updatePassword(PasswordUpdateDTO dto);

    // Delete a user by ID
    void deleteUser(int userId);

    // Get user by ID
    UserDTO getUserById(int userId);

    // Get all users (with pagination)
    Page<UserDTO> getAllUsers(Pageable pageable);

    // Search users by username
    List<UserDTO> searchUsersByUsername(String keyword);

    // Search users by name
    List<UserDTO> searchUsersByName(String keyword);

    // Search users by email
    List<UserDTO> searchUsersByEmail(String keyword);

    // Search users by mobile
    List<UserDTO> searchUsersByMobile(String keyword);

    // Search users by city
    List<UserDTO> searchUsersByCity(String keyword);

    // Search user live location by id
    public UserDTO getUserLocationById(int userId);

    // Activate a user
    void activateUser(int userId);

    // Deactivate a user
    void deactivateUser(int userId);

    // Activate user availability
    public void activateUserAvailability(int userId);

    // Deactivate user availability
    public void deactivateUserAvailability(int userId);
}
