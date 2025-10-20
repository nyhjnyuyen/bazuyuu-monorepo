package com.example.bazuuyu.dto.response;

import com.example.bazuuyu.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * dto tra ve cho client thong tin cua mot admin.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class AdminResponse {
    private Long id;
    private String username;
    private Role role;
}

