package com.ijse.snapfix.back_end.config;

import com.ijse.snapfix.back_end.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;

@Configuration
@RequiredArgsConstructor // constructor injection
public class ApplicationConfig {
    private final UserRepository userRepository;

    @Bean
    public UserDetailsService userDetailsService() {
        return username -> userRepository.findByUserName(username)
                .map(user ->
                        new org.springframework.security
                                .core.userdetails.User(
                                user.getUserEmail(),
                                user.getUserPassword(),
                                List.of(new SimpleGrantedAuthority
                                        ("ROLE_" + user.getUserRole()
                                                .name()))
                        )).orElseThrow(
                        () -> new RuntimeException
                                ("User not found")
                );
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        // This method returns a PasswordEncoder bean that uses BCrypt for password encoding.
        return new BCryptPasswordEncoder();
    }
}
