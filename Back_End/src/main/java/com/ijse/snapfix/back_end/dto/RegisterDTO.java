package com.ijse.snapfix.back_end.dto;

import com.ijse.snapfix.back_end.entity.Role;
import com.ijse.snapfix.back_end.entity.UserAddress;
import lombok.Data;

import java.time.LocalDate;

@Data
public class RegisterDTO {
    private int userId;
    private String userFullName;
    private String userImgURL;
    private String street;
    private String city;
    private String postalCode;
    private String userMobile;
    private String userRole;
    private String userDepartment;
    private String userInfo;
    private LocalDate userWhenCreated;
    private boolean status;
    private String userName;
    private String userPassword;
    private String userEmail;
}
