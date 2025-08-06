package com.ijse.snapfix.back_end.service;


import com.ijse.snapfix.back_end.dto.AuthDTO;
import com.ijse.snapfix.back_end.dto.AuthResponseDTO;
import com.ijse.snapfix.back_end.dto.RegisterDTO;
import com.ijse.snapfix.back_end.entity.Role;
import com.ijse.snapfix.back_end.entity.User;
import com.ijse.snapfix.back_end.entity.UserAddress;
import com.ijse.snapfix.back_end.repository.UserRepository;
import com.ijse.snapfix.back_end.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthResponseDTO authenticate(AuthDTO authDTO) {
        User user =
                userRepository.findByUserEmail(authDTO.getEmail())
                .orElseThrow(
                        () -> new RuntimeException("User not found")
                );
        if (!passwordEncoder.matches(authDTO.getPassword(), user.getUserPassword())) {
            throw new RuntimeException("Invalid password");
        }
        String token = jwtUtil.generateToken(user.getUserName());
        return new AuthResponseDTO(token, user.getUserName(),user.getUserRole().name());
    }

//    public String register(RegisterDTO registerDTO) {
//        if (userRepository.findByUserName(registerDTO.getUsername()).isPresent()) {
//            throw new RuntimeException("Username already exists");
//        }
//        User user = User.builder()
//                .userName(registerDTO.getUsername())
//                .userPassword(passwordEncoder.encode(registerDTO.getPassword()))
//                .userRole(Role.valueOf(registerDTO.getRole().toUpperCase()))
//                .build();
//        userRepository.save(user);
//        return "User registered successfully";
//    }

    public String register(RegisterDTO registerDTO) {
        if (userRepository.findByUserName(registerDTO.getUserName()).isPresent()) {
            throw new RuntimeException("Username already exists");
        }

        // Create UserAddress from individual fields
        UserAddress address = new UserAddress();
        address.setStreet(registerDTO.getStreet() != null ? registerDTO.getStreet() : "Default Street");
        address.setCity(registerDTO.getCity() != null ? registerDTO.getCity() : "Default City");
        address.setPostalCode(registerDTO.getPostalCode() != null ? registerDTO.getPostalCode() : "00000");

        // Create User object
        User user = User.builder()
                .userFullName(registerDTO.getUserFullName() != null ? registerDTO.getUserFullName() : registerDTO.getUserName())
                .userImgURL(registerDTO.getUserImgURL() != null ? registerDTO.getUserImgURL() : "")
                .userAddress(address)
                .userEmail(registerDTO.getUserEmail() != null ? registerDTO.getUserEmail() : "")
                .userMobile(registerDTO.getUserMobile() != null ? registerDTO.getUserMobile() : "")
                .userRole(Role.valueOf(registerDTO.getUserRole() != null ? registerDTO.getUserRole() : "USER"))
                .userDepartment(registerDTO.getUserDepartment() != null ? registerDTO.getUserDepartment() : "")
                .userInfo(registerDTO.getUserInfo() != null ? registerDTO.getUserInfo() : "")
                .userWhenCreated(LocalDate.now())
                .status(true)
                .userName(registerDTO.getUserName())
                .userPassword(passwordEncoder.encode(registerDTO.getUserPassword()))
                .build();

        userRepository.save(user);
        return "User registered successfully";
    }


}
