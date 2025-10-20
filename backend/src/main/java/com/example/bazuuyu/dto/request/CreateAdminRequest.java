package com.example.bazuuyu.dto.request;

import com.example.bazuuyu.entity.Role;
import lombok.Data;

/**
 * DTO nhan du lieu tu client khi tao tai khoan admin moi
 */
@Data
public class CreateAdminRequest {
    private String username;
    private String password;
    private Role role; // Allow SUPER_ADMIN to specify ADMIN or SUPER_ADMIN
}
