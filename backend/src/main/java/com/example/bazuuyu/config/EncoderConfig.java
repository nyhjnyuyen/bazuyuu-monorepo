package com.example.bazuuyu.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * mad hoa mat khau su dung BCrypt
 */
@Configuration
public class EncoderConfig {

    // tra ve bean PasswordEncoder dung de ma hoa va xac thuc mat khau
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
