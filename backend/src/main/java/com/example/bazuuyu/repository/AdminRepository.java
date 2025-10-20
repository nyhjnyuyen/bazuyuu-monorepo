package com.example.bazuuyu.repository;

import com.example.bazuuyu.entity.Admin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AdminRepository extends JpaRepository<Admin, Long> {
    // tim admin theo username
    Optional<Admin> findByUsername(String username);
    // kiem tra username da ton tai chua
    boolean existsByUsername(String username);
}
