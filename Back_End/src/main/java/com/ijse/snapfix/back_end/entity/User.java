package com.ijse.snapfix.back_end.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int userId;
    ///////////User Details//////////////
    private String userFullName;
    private String userImgURL;
    @Embedded
    private UserAddress userAddress;
    private String userEmail;
    private String userMobile;
    @Enumerated(EnumType.STRING)
    private Role userRole;
    private String userDepartment;
    private String userInfo;
    private LocalDate userWhenCreated; //date
    private boolean status;
    ///////////User Security Details/////////////
    private String userName;
    private String userPassword;

}
