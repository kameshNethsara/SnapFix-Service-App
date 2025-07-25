package com.ijse.snapfix.back_end.service.impl;

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
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final ModelMapper modelMapper;

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

    @Override
    public UserDTO updateUser(int userId, UserDTO userDTO) {
        User existingUser = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

        User updatedUser = convertToEntity(userDTO);
        updatedUser.setUserId(existingUser.getUserId());
        User savedUser = userRepository.save(updatedUser);
        return convertToDTO(savedUser);
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
