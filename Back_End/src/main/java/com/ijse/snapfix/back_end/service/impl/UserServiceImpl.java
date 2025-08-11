package com.ijse.snapfix.back_end.service.impl;

import com.ijse.snapfix.back_end.dto.PasswordUpdateDTO;
import com.ijse.snapfix.back_end.dto.UserDTO;
import com.ijse.snapfix.back_end.entity.User;
import com.ijse.snapfix.back_end.entity.UserAddress;
import com.ijse.snapfix.back_end.repository.UserRepository;
import com.ijse.snapfix.back_end.service.UserService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final ModelMapper modelMapper;
    private final PasswordEncoder passwordEncoder;

    // Convert DTO to Entity
    private User convertToEntity(UserDTO dto) {
        User user = modelMapper.map(dto, User.class);
        UserAddress address = new UserAddress();
        address.setStreet(dto.getStreet());
        address.setCity(dto.getCity());
        address.setPostalCode(dto.getPostalCode());
        user.setUserAddress(address);
        return user;
    }

    // Convert Entity to DTO
    private UserDTO convertToDTO(User user) {
        UserDTO dto = modelMapper.map(user, UserDTO.class);
        if (user.getUserAddress() != null) {
            dto.setStreet(user.getUserAddress().getStreet());
            dto.setCity(user.getUserAddress().getCity());
            dto.setPostalCode(user.getUserAddress().getPostalCode());
        }
        return dto;
    }

    @Override
    public UserDTO saveUser(UserDTO userDTO) {
        User user = convertToEntity(userDTO);
        User savedUser = userRepository.save(user);
        return convertToDTO(savedUser);
    }

//    @Override
//    public UserDTO updateUser(int userId, UserDTO userDTO) {
//        User existingUser = userRepository.findById(userId)
//                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
//
//        User updatedUser = convertToEntity(userDTO);
//        updatedUser.setUserId(existingUser.getUserId());
//        User savedUser = userRepository.save(updatedUser);
//        return convertToDTO(savedUser);
//    }

    @Override
    public UserDTO updateUser(int userId, UserDTO userDTO) {
        User existingUser = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

        // Update non-password fields manually or via mapper, but keep ID and password carefully
        existingUser.setUserFullName(userDTO.getUserFullName());
        existingUser.setUserEmail(userDTO.getUserEmail());
        existingUser.setUserMobile(userDTO.getUserMobile());
        existingUser.setUserDepartment(userDTO.getUserDepartment());
        existingUser.setUserInfo(userDTO.getUserInfo());

        // Update or set address
        UserAddress address = existingUser.getUserAddress() != null ? existingUser.getUserAddress() : new UserAddress();
        address.setStreet(userDTO.getStreet());
        address.setCity(userDTO.getCity());
        address.setPostalCode(userDTO.getPostalCode());
        existingUser.setUserAddress(address);

        //Always set status to true when updating
        existingUser.setStatus(true);
        // 🔹 Role-based status logic
        if ("ADMIN".equalsIgnoreCase(userDTO.getUserRole())) {
            existingUser.setStatus(!existingUser.isStatus()); // flip
        } else if ("USER".equalsIgnoreCase(userDTO.getUserRole())) {
            existingUser.setStatus(true); // always true
        }

        // Password encode: Only update if password is provided and different from existing one
        if (userDTO.getUserPassword() != null && !userDTO.getUserPassword().isEmpty()) {
            // Inject PasswordEncoder in this class (add field and constructor)
            String encodedPassword = passwordEncoder.encode(userDTO.getUserPassword());
            existingUser.setUserPassword(encodedPassword);
        }
        // else: keep existing password

        User savedUser = userRepository.save(existingUser);
        return convertToDTO(savedUser);
    }

    @Override
    public void updatePassword(PasswordUpdateDTO dto) {
        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(dto.getCurrentPassword(), user.getUserPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }

        if (!dto.getNewPassword().equals(dto.getConfirmPassword())) {
            throw new RuntimeException("New password and confirm password do not match");
        }

        user.setUserPassword(passwordEncoder.encode(dto.getNewPassword()));
        userRepository.save(user);
    }

    @Override
    public void deleteUser(int userId) {
        userRepository.deleteById(userId);
    }

    @Override
    public UserDTO getUserById(int userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
        return convertToDTO(user);
    }

    @Override
    public Page<UserDTO> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable).map(this::convertToDTO);
    }

    @Override
    public List<UserDTO> searchUsersByUsername(String keyword) {
        return userRepository.findUserByUserNameContainingIgnoreCase(keyword)
                .stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @Override
    public List<UserDTO> searchUsersByEmail(String keyword) {
        return userRepository.findUserByUserEmailContainingIgnoreCase(keyword)
                .stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @Override
    public List<UserDTO> searchUsersByMobile(String keyword) {
        return userRepository.findUserByUserMobileContainingIgnoreCase(keyword)
                .stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @Override
    public List<UserDTO> searchUsersByCity(String keyword) {
        return userRepository.findUserByUserAddress_CityContainingIgnoreCase(keyword)
                .stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @Override
    public void activateUser(int userId) {
        userRepository.activateUserStatus(String.valueOf(userId));
    }

    @Override
    public void deactivateUser(int userId) {
        userRepository.deactivateUserStatus(String.valueOf(userId));
    }
}
