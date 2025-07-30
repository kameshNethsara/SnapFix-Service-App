package com.ijse.snapfix.back_end.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/hello")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://127.0.0.1:5501")
public class TestController {
    @GetMapping("/user")
    @PreAuthorize("hasRole('USER')")
    public String helloUser() {
        // This method returns a simple greeting message.
        return "Hello, World!";
    }
    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public String helloAdmin() {
        // This method returns a greeting message for admin users.
        return "Hello, Admin!";
    }
    @GetMapping("/all")
    @PreAuthorize("permitAll()")
    public String helloAll() {
        // This method returns a greeting message for both admin and user roles.
        return "Hello, All...!";
    }
}
