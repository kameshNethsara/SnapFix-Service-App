package com.ijse.snapfix.back_end.controller;

import com.ijse.snapfix.back_end.dto.PasswordUpdateDTO;
import com.ijse.snapfix.back_end.dto.UserDTO;
import com.ijse.snapfix.back_end.service.UserService;
import com.ijse.snapfix.back_end.util.APIResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("snapfix/user")
@RequiredArgsConstructor
@CrossOrigin
public class UserController {

    private final UserService userService;

    @PostMapping("create")
    public ResponseEntity<APIResponse<UserDTO>> createUser(@RequestBody @Valid UserDTO userDTO) {
        log.info("Creating user: {}", userDTO.getUserName());
        // Set the creation date here
        userDTO.setUserWhenCreated(LocalDate.now());
        UserDTO createdUser = userService.saveUser(userDTO);
        return new ResponseEntity<>(new APIResponse<>(
                201, "User created successfully!", createdUser
        ), HttpStatus.CREATED);
    }

//    @PutMapping("update/{id}")
//    public ResponseEntity<APIResponse<UserDTO>> updateUser(@PathVariable("id") int userId,
//                                                           @RequestBody @Valid UserDTO userDTO) {
//        log.info("Updating user with ID: {}", userId);
//        UserDTO updatedUser = userService.updateUser(userId, userDTO);
//        return ResponseEntity.ok(new APIResponse<>(
//                200, "User updated successfully!", updatedUser
//        ));
//    }
    @PutMapping("update")
    public ResponseEntity<APIResponse<UserDTO>> updateUser(@RequestBody @Valid UserDTO userDTO) {
        int userId = userDTO.getUserId(); // DTO eke id ekak thiyenna one
        log.info("Updating user with ID: {}", userId);
        UserDTO updatedUser = userService.updateUser(userId, userDTO);
        return ResponseEntity.ok(new APIResponse<>(
                200, "User updated successfully!", updatedUser
        ));
    }
    @PutMapping("updateAllFormData")
    public ResponseEntity<APIResponse<UserDTO>> updateAllFormData(@RequestBody @Valid UserDTO userDTO) {
        // Use the existing updateUser method in your service
        UserDTO updatedUser = userService.updateUser(userDTO.getUserId(), userDTO);
        return ResponseEntity.ok(new APIResponse<>(200, "User updated successfully!", updatedUser));
    }


    @PutMapping("updatePassword")
    public ResponseEntity<APIResponse<Void>> updatePassword(@RequestBody @Valid PasswordUpdateDTO dto) {
        try {
            userService.updatePassword(dto);
            return ResponseEntity.ok(new APIResponse<>(200, "Password updated successfully!", null));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new APIResponse<>(400, e.getMessage(), null));
        }
    }

    @GetMapping("get/{id}")
    public ResponseEntity<APIResponse<UserDTO>> getUserById(@PathVariable("id") int userId) {
        UserDTO user = userService.getUserById(userId);
        return ResponseEntity.ok(new APIResponse<>(
                200, "User fetched successfully!", user
        ));
    }

    @DeleteMapping("delete/{id}")
    public ResponseEntity<APIResponse<Void>> deleteUser(@PathVariable("id") int userId) {
        userService.deleteUser(userId);
        return ResponseEntity.ok(new APIResponse<>(
                200, "User deleted successfully!", null
        ));
    }

    @GetMapping("getall")
    public ResponseEntity<APIResponse<List<UserDTO>>> getAllUsers() {
        Page<UserDTO> userPage = userService.getAllUsers(PageRequest.of(0, Integer.MAX_VALUE));
        return ResponseEntity.ok(new APIResponse<>(
                200, "All users fetched successfully!", userPage.getContent()
        ));
    }

    @GetMapping("getallpaged")
    public ResponseEntity<APIResponse<Page<UserDTO>>> getAllUsersPaged(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {
        Page<UserDTO> userPage = userService.getAllUsers(PageRequest.of(page, size));
        return ResponseEntity.ok(new APIResponse<>(
                200, "Paged user list fetched successfully!", userPage
        ));
    }

    @PatchMapping("activate/{id}")
    public ResponseEntity<APIResponse<Void>> activateUser(@PathVariable("id") int userId) {
        userService.activateUser(userId);
        return ResponseEntity.ok(new APIResponse<>(
                200, "User activated successfully!", null
        ));
    }

    @PatchMapping("deactivate/{id}")
    public ResponseEntity<APIResponse<Void>> deactivateUser(@PathVariable("id") int userId) {
        userService.deactivateUser(userId);
        return ResponseEntity.ok(new APIResponse<>(
                200, "User deactivated successfully!", null
        ));
    }

    @PatchMapping("activateAvailability/{id}")
    public ResponseEntity<APIResponse<Void>> activateUserAvailability(@PathVariable("id") int userId) {
        userService.activateUserAvailability(userId);
        return ResponseEntity.ok(new APIResponse<>(
                200, "User Available now!", null
        ));
    }

    @PatchMapping("deactivateAvailability/{id}")
    public ResponseEntity<APIResponse<Void>> deactivateUserAvailability(@PathVariable("id") int userId) {
        userService.deactivateUserAvailability(userId);
        return ResponseEntity.ok(new APIResponse<>(
                200, "User not Available now!", null
        ));
    }

    @GetMapping("search/username/{keyword}")
    public ResponseEntity<APIResponse<List<UserDTO>>> searchByUsername(@PathVariable String keyword) {
        List<UserDTO> result = userService.searchUsersByUsername(keyword);
        return ResponseEntity.ok(new APIResponse<>(
                200, "Search by username successful!", result
        ));
    }

    @GetMapping("search/name/{keyword}")
    public ResponseEntity<APIResponse<List<UserDTO>>> searchByName(@PathVariable String keyword) {
        List<UserDTO> result = userService.searchUsersByName(keyword);
        return ResponseEntity.ok(new APIResponse<>(
                200, "Search by name successful!", result
        ));
    }

    @GetMapping("search/email/{keyword}")
    public ResponseEntity<APIResponse<List<UserDTO>>> searchByEmail(@PathVariable String keyword) {
        List<UserDTO> result = userService.searchUsersByEmail(keyword);
        return ResponseEntity.ok(new APIResponse<>(
                200, "Search by email successful!", result
        ));
    }

    @GetMapping("search/mobile/{keyword}")
    public ResponseEntity<APIResponse<List<UserDTO>>> searchByMobile(@PathVariable String keyword) {
        List<UserDTO> result = userService.searchUsersByMobile(keyword);
        return ResponseEntity.ok(new APIResponse<>(
                200, "Search by mobile successful!", result
        ));
    }

    @GetMapping("search/city/{keyword}")
    public ResponseEntity<APIResponse<List<UserDTO>>> searchByCity(@PathVariable String keyword) {
        List<UserDTO> result = userService.searchUsersByCity(keyword);
        return ResponseEntity.ok(new APIResponse<>(
                200, "Search by city successful!", result
        ));
    }
}
