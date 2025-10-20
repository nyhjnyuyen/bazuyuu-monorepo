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
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {

        String path = request.getRequestURI();

        // Only login and register are public
        boolean isPublic =
                request.getMethod().equalsIgnoreCase("POST") &&
                        (path.equals("/api/customers/register")
                                || path.equals("/api/customers/login")
                                || path.equals("/api/admins/login"));

        if (isPublic) {
            System.out.println("Authentication in context: " + SecurityContextHolder.getContext().getAuthentication());

            chain.doFilter(request, response);
            return;
        }


        // Handle token
        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            if (jwtUtils.validateToken(token)) {
                String username = jwtUtils.getUsernameFromToken(token);
                String role = jwtUtils.getRole(token);
                System.out.println("DEBUG :: Parsed role = [" + role + "]");
                System.out.println("DEBUG :: Authorities set = " + new SimpleGrantedAuthority(role));


                // ✅ Set authority from token
                if ("ROLE_ADMIN".equalsIgnoreCase(role) || "ROLE_SUPER_ADMIN".equalsIgnoreCase(role)) {
                    adminService.findByUsername(username).ifPresent(admin -> {
                        AdminDetails adminDetails = new AdminDetails(admin);
                        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                                adminDetails, null,
                                Collections.singleton(new SimpleGrantedAuthority(role))
                        );
                        SecurityContextHolder.getContext().setAuthentication(auth);
                        System.out.println("Token parsed for user: " + username);
                        System.out.println("Raw role from token: " + role);
                        System.out.println("GrantedAuthority set: " + new SimpleGrantedAuthority(role));

                    });
                }
                else if ("ROLE_CUSTOMER".equalsIgnoreCase(role)) {
                    customerService.findByUsername(username).ifPresent(customer -> {
                        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
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
}
