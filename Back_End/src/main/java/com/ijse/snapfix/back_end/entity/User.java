package com.ijse.snapfix.back_end.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
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
    private String userAddress;
    private String userEmail;
    private String userMobile;
    private String userRole;
    private String userDepartment;
    private String userInfo;
    private LocalDate userWhenCreated; //date
    ///////////User Security Details/////////////
    private String userName;
    private String userPassword;

}
