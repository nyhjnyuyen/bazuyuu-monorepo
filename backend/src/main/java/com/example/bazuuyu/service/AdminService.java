package com.example.bazuuyu.service;

import com.example.bazuuyu.dto.request.CreateAdminRequest;
import com.example.bazuuyu.dto.response.AdminResponse;
import com.example.bazuuyu.entity.Admin;
import com.example.bazuuyu.entity.Role;
import com.example.bazuuyu.repository.AdminRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * service class chua cac chuc nang lien quan toi admin.
 */
@Service
@RequiredArgsConstructor
public class AdminService {

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;

    // tao tai khoan admin moi
    public AdminResponse createAdmin(CreateAdminRequest request) {
        //chi cho phep tao admin
        if (request.getRole() != Role.ADMIN) {
            throw new RuntimeException("Only 'ADMIN' role can be created.");
        }
        // throw exception if username already taken (unique)
        if (adminRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already taken.");
        }
        // build admin : username, password (ma hoa), role(admin)
        Admin admin = Admin.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.ADMIN)
                .build();


        Admin saved = adminRepository.save(admin);
        return new AdminResponse(saved.getId(), saved.getUsername(), saved.getRole());
    }

    // xoa admin, chi cho phep SUPER_ADMIN request
    public void deleteAdmin(Admin requester, Long adminId) {
        if (requester.getRole() != Role.SUPER_ADMIN) {
            throw new SecurityException("Only SUPER_ADMIN can delete admins");
        }
        adminRepository.deleteById(adminId);
    }

    // tim admin theo username
    public Optional<Admin> findByUsername(String username) {
        return adminRepository.findByUsername(username);
    }

    // tim admin theo ID
    public Optional<Admin> findById(Long id) {
        return adminRepository.findById(id);
    }

    // lay danh sach tat ca admin
    public List<Admin> findAll() {
        return adminRepository.findAll();
    }
}
