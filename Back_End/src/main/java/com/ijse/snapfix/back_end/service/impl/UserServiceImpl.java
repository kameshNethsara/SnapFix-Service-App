package com.ijse.snapfix.back_end.service.impl;

import com.ijse.snapfix.back_end.dto.PasswordUpdateDTO;
import com.ijse.snapfix.back_end.dto.UserDTO;
import com.ijse.snapfix.back_end.dto.UserLocationDTO;
import com.ijse.snapfix.back_end.entity.Role;
import com.ijse.snapfix.back_end.entity.User;
import com.ijse.snapfix.back_end.entity.UserAddress;
import com.ijse.snapfix.back_end.repository.UserRepository;
import com.ijse.snapfix.back_end.service.AuthService;
import com.ijse.snapfix.back_end.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final ModelMapper modelMapper;
    private final PasswordEncoder passwordEncoder;
    private final AuthService authService;
//    private static final Logger log = LoggerFactory.getLogger(UserServiceImpl.class);

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
        if (userDTO.getUserPassword() != null && !userDTO.getUserPassword().isEmpty()) {
            if (!userDTO.getUserPassword().startsWith("$2a$")) { // BCrypt hash starts like this
                user.setUserPassword(passwordEncoder.encode(userDTO.getUserPassword()));
            } else {
                user.setUserPassword(userDTO.getUserPassword()); // Already encoded
            }
        }
        // Availability set based on role
        //user.setAvailability("Admin".equalsIgnoreCase(userDTO.getUserRole()) || "Technician".equalsIgnoreCase(userDTO.getUserRole()));
        //user.setAvailability(true); // Set availability to true for all new users

        // Set availability from DTO, default to true if null
        user.setAvailability(userDTO.isAvailability());

        // ===== Department default =====
        if (userDTO.getUserDepartment() == null || userDTO.getUserDepartment().isEmpty()) {
            user.setUserDepartment("N/A");
        } else {
            user.setUserDepartment(userDTO.getUserDepartment());
        }

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

        // Update non-password fields
        existingUser.setUserFullName(userDTO.getUserFullName());
        existingUser.setUserEmail(userDTO.getUserEmail());
        existingUser.setUserMobile(userDTO.getUserMobile());
        // ===== Department default logic =====
        if (userDTO.getUserDepartment() == null || userDTO.getUserDepartment().isEmpty()) {
            existingUser.setUserDepartment("N/A");
        } else {
            existingUser.setUserDepartment(userDTO.getUserDepartment());
        }
        existingUser.setUserInfo(userDTO.getUserInfo());
        existingUser.setUserImgURL(userDTO.getUserImgURL());

        // Update or set address
        UserAddress address = existingUser.getUserAddress() != null ? existingUser.getUserAddress() : new UserAddress();
        address.setStreet(userDTO.getStreet());
        address.setCity(userDTO.getCity());
        address.setPostalCode(userDTO.getPostalCode());
        existingUser.setUserAddress(address);

        // Update live location if provided
        if(userDTO.getLatitude() != null) {
            existingUser.setLatitude(userDTO.getLatitude());
        }
        if(userDTO.getLongitude() != null) {
            existingUser.setLongitude(userDTO.getLongitude());
        }

        // Role-based availability logic
        //String role = userDTO.getUserRole();
        //existingUser.setAvailability("ADMIN".equalsIgnoreCase(role) || "TECHNICIAN".equalsIgnoreCase(role));
        //existingUser.setAvailability(true); // Set all users to available
        //existingUser.setAvailability(userDTO.isAvailability());
        if (userDTO.getUserRole() != null) {
            existingUser.setAvailability(true); // keep current
        } else {
            existingUser.setAvailability(userDTO.isAvailability());
        }


        // Status always true for update
        existingUser.setStatus(true);

        // Password update: encode only if not already encoded
        String password = userDTO.getUserPassword();
        if (password != null && !password.isEmpty()) {
            if (!password.startsWith("$2a$")) { // BCrypt hash check
                existingUser.setUserPassword(passwordEncoder.encode(password));
            } else {
                existingUser.setUserPassword(password); // Already encoded
            }
        }

        User savedUser = userRepository.save(existingUser);
        return convertToDTO(savedUser);
    }

    public String saveFile(MultipartFile file) {
        try {
            String uploadDir = "uploads/images/"; // folder to save
            File dir = new File(uploadDir);
            if (!dir.exists()) dir.mkdirs();

            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();

            Files.copy(file.getInputStream(), Paths.get(uploadDir + fileName), StandardCopyOption.REPLACE_EXISTING);

            return "/uploads/images/" + fileName; // URL or relative path
        } catch (IOException e) {
            throw new RuntimeException("Failed to save file: " + e.getMessage());
        }
    }

    public UserDTO updateUserLocation(UserLocationDTO dto) {
        User existingUser = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if(dto.getLatitude() != null) existingUser.setLatitude(dto.getLatitude());
        if(dto.getLongitude() != null) existingUser.setLongitude(dto.getLongitude());

        User savedUser = userRepository.save(existingUser);
        return convertToDTO(savedUser);
    }

    public List<UserLocationDTO> getAllTechnicianLocations() {
        List<User> technicians = userRepository.findByUserRole(Role.TECHNICIAN);
        log.info("Found technicians: {}", technicians.size());
        return technicians.stream()
                .filter(u -> u.getLatitude() != null && u.getLongitude() != null)
                .map(u -> {
                    log.info("Mapping technician: {} - {}", u.getUserId(), u.getUserFullName());
                    return new UserLocationDTO(
                            u.getUserId(),
                            u.getUserFullName(),
                            u.getLatitude(),
                            u.getLongitude(),
                            u.isAvailability(),
                            u.getUserImgURL()
                    );
                })
                .collect(Collectors.toList());
    }

    @Override
    public UserDTO updateAllFormData(int userId, UserDTO userDTO, MultipartFile profileImage) {
        if (profileImage != null && !profileImage.isEmpty()) {
            String fileUrl = saveFile(profileImage);
            userDTO.setUserImgURL(fileUrl);
        }

        User existingUser = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

        // Update fields
        existingUser.setUserFullName(userDTO.getUserFullName());
        existingUser.setUserEmail(userDTO.getUserEmail());
        existingUser.setUserMobile(userDTO.getUserMobile());
        // ===== Department default logic =====
        if (userDTO.getUserDepartment() == null || userDTO.getUserDepartment().isEmpty()) {
            existingUser.setUserDepartment("N/A");
        } else {
            existingUser.setUserDepartment(userDTO.getUserDepartment());
        }
        existingUser.setUserInfo(userDTO.getUserInfo());
        existingUser.setUserImgURL(userDTO.getUserImgURL());

        // Address update
        UserAddress address = existingUser.getUserAddress() != null ? existingUser.getUserAddress() : new UserAddress();
        address.setStreet(userDTO.getStreet());
        address.setCity(userDTO.getCity());
        address.setPostalCode(userDTO.getPostalCode());
        existingUser.setUserAddress(address);

        // Update live location if provided
        if(userDTO.getLatitude() != null) {
            existingUser.setLatitude(userDTO.getLatitude());
        }
        if(userDTO.getLongitude() != null) {
            existingUser.setLongitude(userDTO.getLongitude());
        }

        // Role-based availability
        //String role = userDTO.getUserRole();
        //existingUser.setAvailability("ADMIN".equalsIgnoreCase(role) || "TECHNICIAN".equalsIgnoreCase(role));
        //existingUser.setAvailability(true); // Set all users to available
        if (userDTO.getUserRole() != null) {
            existingUser.setAvailability(true); // keep current
        } else {
            existingUser.setAvailability(userDTO.isAvailability());
        }


        // Status always true
        existingUser.setStatus(true);

        // Password update (only encode if not already encoded)
        String password = userDTO.getUserPassword();
        if (password != null && !password.isEmpty()) {
            if (!password.startsWith("$2a$")) {
                existingUser.setUserPassword(passwordEncoder.encode(password));
            } else {
                existingUser.setUserPassword(password);
            }
        }

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
    public List<UserDTO> searchUsersByName(String keyword) {
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
    public UserDTO getUserLocationById(int userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return modelMapper.map(user, UserDTO.class);
    }

    @Override
    public void activateUser(int userId) {
        userRepository.activateUserStatus(Integer.valueOf(String.valueOf(userId)));
        //userRepository.activateUserAvailability(Integer.valueOf(String.valueOf(userId)));
    }

    @Override
    public void deactivateUser(int userId) {
        userRepository.deactivateUserStatus(Integer.valueOf(String.valueOf(userId)));
        //userRepository.deactivateUserAvailability(Integer.valueOf(String.valueOf(userId)));
    }

    @Override
    public void activateUserAvailability(int userId) {
        userRepository.activateUserAvailability(Integer.valueOf(String.valueOf(userId)));
    }

    @Override
    public void deactivateUserAvailability(int userId) {
        userRepository.deactivateUserAvailability(Integer.valueOf(String.valueOf(userId)));
    }


}
