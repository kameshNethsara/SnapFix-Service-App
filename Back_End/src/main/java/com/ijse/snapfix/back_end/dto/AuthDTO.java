package com.ijse.snapfix.back_end.dto;

import lombok.Data;

@Data
public class AuthDTO {
    private String email;
    private String password;
    private String role;
}
