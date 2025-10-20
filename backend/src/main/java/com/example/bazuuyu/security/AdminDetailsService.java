package com.example.bazuuyu.security;

import com.example.bazuuyu.entity.Admin;
import com.example.bazuuyu.repository.AdminRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

/**
 * cung cap thong tin admin cho qua trinh xac thuc dang nhap
 */
@Service
public class AdminDetailsService implements UserDetailsService {
    private final AdminRepository adminRepository;

    public AdminDetailsService(AdminRepository adminRepository) {
        this.adminRepository = adminRepository;
    }

    // tim admin theo username de phuc vu dang nhap
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Admin admin = adminRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Admin not found"));
        return new AdminDetails(admin);
    }
}
