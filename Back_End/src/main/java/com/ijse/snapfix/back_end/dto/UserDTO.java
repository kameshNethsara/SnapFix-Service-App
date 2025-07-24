package com.ijse.snapfix.back_end.dto;


import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDate;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class UserDTO {
    private int userId;
    ///////////User Details//////////////
    private String userFullName;
    private String userImgURL;
    private String userAddress;
    private String userEmail;
    private String userMobile;
    private String userRole;
    private String userDepartment;
    private String userInfo;
    private LocalDate userWhenCreated; //date
    private boolean status;
    ///////////User Security Details/////////////
    private String userName;
    private String userPassword;
}
