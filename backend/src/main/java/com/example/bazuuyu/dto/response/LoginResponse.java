package com.example.bazuuyu.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

/**
 * dto tra ve token JWT sau khi dang nhap thanh cong
 */
@Data
@AllArgsConstructor
public class LoginResponse {
    private String accessToken;
    private String refreshToken;
}