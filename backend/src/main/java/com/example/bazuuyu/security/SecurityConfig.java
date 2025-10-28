package com.example.bazuuyu.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.firewall.HttpFirewall;
import org.springframework.security.web.firewall.StrictHttpFirewall;
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * cau hinh bao mat chinh
 * - dinh nghia cac route duoc phep truy cap hoac can xac thuc
 * - them JwtAuthFilter vao chuoi filter
 * - cau hinh AuthenticationManager cho admin va customer
 * thiet lap CORS, CSRF va SessionPolicy.
 */
@Configuration
@EnableMethodSecurity(prePostEnabled = true)
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final AdminDetailsService adminDetailsService;
    private final CustomerDetailsService customerDetailsService;
    private final PasswordEncoder passwordEncoder;

    // cau hinh quyen truy cap theo tung endpoint
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(c -> c.configurationSource(corsConfigurationSource()))   // <— use your bean
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/api/auth/**", "/api/newsletter/**",
                                "/api/auth/refresh", "/api/admins/login",
                                "/api/customers/login", "/api/customers/register",
                                "/api/password/send-reset-token", "/api/password/reset").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/products/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/products", "/api/admins/products")
                        .hasAnyAuthority("ROLE_ADMIN","ROLE_SUPER_ADMIN")
                        .requestMatchers("/api/customers/**").hasAuthority("ROLE_CUSTOMER")
                        .requestMatchers("/api/admins/**").hasAuthority("ROLE_SUPER_ADMIN")
                        .requestMatchers("/error").permitAll()
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    // cung cap AuthenticationMangager ho tro admin av customer
    @Bean
    public AuthenticationManager authenticationManager() {
        return new ProviderManager(
                List.of(adminAuthenticationProvider(), customerAuthenticationProvider())
        );
    }

    // provider xac thuc cho admin
    @Bean
    public DaoAuthenticationProvider adminAuthenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(adminDetailsService);
        provider.setPasswordEncoder(passwordEncoder);
        return provider;
    }

    // provider xac thuc cho customer
    @Bean
    public DaoAuthenticationProvider customerAuthenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(customerDetailsService); // You create this
        provider.setPasswordEncoder(passwordEncoder);
        return provider;
    }


    // cho phep firewall xu ly ky tu URL max hoa nhu %0A
    @Bean
    public HttpFirewall allowUrlEncodedPercentHttpFirewall() {
        StrictHttpFirewall firewall = new StrictHttpFirewall();
        firewall.setAllowUrlEncodedPercent(true);  // ✅ Allow encoded characters like %0A
        return firewall;
    }

    // dang ky firewall tuy chinh vao spring Security.
    @Bean
    public WebSecurityCustomizer webSecurityCustomizer(HttpFirewall firewall) {
        return (web) -> web.httpFirewall(firewall);
    }

    @Bean
    public org.springframework.web.cors.CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration cfg = new CorsConfiguration();
        cfg.setAllowCredentials(false); // không dùng cookie
        cfg.setAllowedOrigins(List.of(
                "https://690001d688d2cb592e8e4e43--bazuuyu.netlify.app", // preview
                "https://bazuuyu.netlify.app",                           // prod (nếu có)
                "http://localhost:3000"                                  // dev
        ));
        cfg.setAllowedMethods(List.of("GET","POST","PUT","DELETE","PATCH","OPTIONS"));
        cfg.setAllowedHeaders(List.of("*"));
        cfg.setExposedHeaders(List.of("Authorization"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", cfg);
        return source;
    }


}

