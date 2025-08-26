package com.ijse.snapfix.back_end.dto;

import jakarta.persistence.Id;
import jakarta.validation.constraints.*;
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

    ///////// User Details //////////

    @NotBlank(message = "Full name is required")
    private String userFullName;

    private String userImgURL;

    @NotBlank(message = "Street is required")
    private String street;

    @NotBlank(message = "City is required")
    private String city;

    @NotBlank(message = "Postal code is required")
    private String postalCode;

    @Email(message = "Invalid email format")
    @NotBlank(message = "Email is required")
    private String userEmail;

    @Pattern(regexp = "^(\\+94|0)?7\\d{8}$", message = "Invalid mobile number")
    private String userMobile;

    @NotBlank(message = "Role is required")
    private String userRole;

    private String userDepartment;

    private String userInfo;

    private LocalDate userWhenCreated;

    private boolean status;

    private boolean availability;

    ///////// User Security Details //////////

    @NotBlank(message = "Username is required")
    private String userName;

    @Size(min = 6, message = "Password must be at least 6 characters")
    private String userPassword;
}
