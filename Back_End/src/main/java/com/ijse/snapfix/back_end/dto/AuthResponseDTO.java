package com.ijse.snapfix.back_end.dto;

import com.ijse.snapfix.back_end.entity.UserAddress;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDate;


@Data
@AllArgsConstructor
public class AuthResponseDTO {
    private String accessToken;
    private String username;
//    private String password;
    private String role;
    private int userId;
    private String fullName;
    private String email;
    private String mobile;
    private UserAddress location; // Assuming UserAddress is a class that holds address details
    private String department;
    private LocalDate userWhenCreated;
    private String userInfo;
    private String userImgURL;

}
