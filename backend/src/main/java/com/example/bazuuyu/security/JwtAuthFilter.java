package com.example.bazuuyu.security;

import com.example.bazuuyu.service.AdminService;
import com.example.bazuuyu.service.CustomerService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.io.IOException;
import java.util.Collections;

/**
 * kiem tra cac route cong khai (login, register)
 * phan tich token tu header Authorization
 * xac thuc nguoi dung dua tren token va role (admin, customer, super admin)
 * gan thong tin xac thuc vao Security Context neu hop le
 */
@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtUtils jwtUtils;
    private final AdminService adminService;
    private final CustomerService customerService;

    public JwtAuthFilter(JwtUtils jwtUtils, @Lazy AdminService adminService, CustomerService customerService) {
        this.jwtUtils = jwtUtils;
        this.adminService = adminService;
        this.customerService = customerService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            if (jwtUtils.validateToken(token)) {
                String username = jwtUtils.getUsernameFromToken(token);
                String role = jwtUtils.getRole(token);

                if ("ROLE_ADMIN".equalsIgnoreCase(role) || "ROLE_SUPER_ADMIN".equalsIgnoreCase(role)) {
                    adminService.findByUsername(username).ifPresent(admin -> {
                        var auth = new UsernamePasswordAuthenticationToken(
                                new AdminDetails(admin), null,
                                Collections.singleton(new SimpleGrantedAuthority(role))
                        );
                        SecurityContextHolder.getContext().setAuthentication(auth);
                    });
                } else if ("ROLE_CUSTOMER".equalsIgnoreCase(role)) {
                    customerService.findByUsername(username).ifPresent(customer -> {
                        var auth = new UsernamePasswordAuthenticationToken(
                                customer, null,
                                Collections.singleton(new SimpleGrantedAuthority(role))
                        );
                        SecurityContextHolder.getContext().setAuthentication(auth);
                    });
                }
            }
        }

        chain.doFilter(request, response);
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        final String path = request.getRequestURI();
        final String method = request.getMethod();

        // ✅ Never process CORS preflight through JWT parsing
        if ("OPTIONS".equalsIgnoreCase(method)) return true;

        // ✅ Skip ALL auth endpoints (register/login/refresh)
        if (path.startsWith("/api/auth/")) return true;

        if (path.equals("/api/customers/register") || path.equals("/api/customers/login")) return true;
        // (Optional) skip static or public resources if you have any
        // if (path.startsWith("/public/") || path.startsWith("/assets/")) return true;

        return false;
    }

}
