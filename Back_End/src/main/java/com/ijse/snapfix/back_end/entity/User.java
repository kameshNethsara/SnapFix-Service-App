package com.ijse.snapfix.back_end.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder //builders are used to create instances of the class with a fluent API
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
    @Lob
    private boolean status;
    ///////////User Security Details/////////////
    private String userName;
    private String userPassword;

}
