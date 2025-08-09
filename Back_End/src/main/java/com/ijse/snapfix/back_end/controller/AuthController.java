package com.ijse.snapfix.back_end.controller;

import com.ijse.snapfix.back_end.dto.AuthDTO;
import com.ijse.snapfix.back_end.dto.RegisterDTO;
import com.ijse.snapfix.back_end.service.AuthService;
import com.ijse.snapfix.back_end.util.APIResponse;
import com.ijse.snapfix.back_end.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/snapfixauth")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://127.0.0.1:5500")
public class AuthController {
    private final AuthService authService;

    @PostMapping("/register")
    @PreAuthorize("permitAll()")
    public ResponseEntity<APIResponse<Object>> registerUser(@RequestBody RegisterDTO registerDTO){
        return ResponseEntity.ok(new APIResponse<>(
                200,
                "OK",
                authService.register(registerDTO)
        ));
    }

    @PostMapping("/login")
    @PreAuthorize("permitAll()")
    public ResponseEntity<APIResponse<Object>> login(@RequestBody AuthDTO authDTO){
        return ResponseEntity.ok(new APIResponse<>(
                200,
                "OK",
                authService.authenticate(authDTO)
        ));
    }
}
