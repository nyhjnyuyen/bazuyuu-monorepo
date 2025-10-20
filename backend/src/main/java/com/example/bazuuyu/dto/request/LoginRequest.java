package com.example.bazuuyu.dto.request;

import lombok.Getter;
import lombok.Setter;

/**
 * dto chua thong tin dang nhap (username va password)
 */
@Getter
@Setter
public class LoginRequest {
    private String username;
    private String password;
}
