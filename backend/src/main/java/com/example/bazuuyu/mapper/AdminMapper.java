package com.example.bazuuyu.mapper;

import com.example.bazuuyu.dto.response.AdminResponse;
import com.example.bazuuyu.entity.Admin;

/**
 * chuyen doi tu entity admin sang response DTO
 */
public class AdminMapper {
    public static AdminResponse toResponse(Admin admin) {
        AdminResponse response = new AdminResponse();
        response.setId(admin.getId());
        response.setUsername(admin.getUsername());
        response.setRole(admin.getRole());
        return response;
    }
}
