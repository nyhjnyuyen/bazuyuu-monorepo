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
    private final GuestIdFilter guestIdFilter;

    // cau hinh quyen truy cap theo tung endpoint
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(c -> c.configurationSource(corsConfigurationSource()))   // <— use your bean
                // SecurityConfig.java (after http.csrf().cors()...)
                .addFilterBefore(guestIdFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)

                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/api/guest/**").permitAll()
                        .requestMatchers("/api/auth/**", "/api/newsletter/**",
                                "/api/auth/refresh", "/api/admins/login",
                                "/api/customers/login", "/api/customers/register",
                                "/api/password/send-reset-token", "/api/password/reset").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/products/**").permitAll()

                        .requestMatchers(HttpMethod.POST, "/api/orders/checkout").permitAll()
                        .requestMatchers("/api/payments/**").permitAll()
                        .requestMatchers("/api/vn/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/search/**").permitAll()


                        .requestMatchers(HttpMethod.POST, "/api/products", "/api/admins/products")
                        .hasAnyAuthority("ROLE_ADMIN","ROLE_SUPER_ADMIN")
                        .requestMatchers("/api/customers/**").hasAuthority("ROLE_CUSTOMER")
                        .requestMatchers("/api/admins/**").hasAuthority("ROLE_SUPER_ADMIN")
                        .requestMatchers("/error").permitAll()
                        .anyRequest().authenticated()
                );
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

        // ✅ CRITICAL: Set to true for credentials support
        cfg.setAllowCredentials(true);

        // ✅ Allow your Netlify domains + Cloud Run direct access
        cfg.setAllowedOriginPatterns(List.of(
                "https://*.netlify.app",                                    // All Netlify previews
                "https://bazuuyu.netlify.app",                             // Production Netlify
                "https://bazuyuu-backend-4uz2zgyutq-as.a.run.app",        // Direct Cloud Run access
                "http://localhost:*",                                      // Local development
                "http://127.0.0.1:*"                                       // Local IP
        ));

        // ✅ Allow all standard HTTP methods
        cfg.setAllowedMethods(List.of(
                "GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"
        ));

        // ✅ Allow all headers (frontend can send any header)
        cfg.setAllowedHeaders(List.of("*"));

        // ✅ Expose headers that frontend needs to read
        cfg.setExposedHeaders(List.of(
                "Authorization",
                "Content-Type",
                "X-Total-Count",
                "Access-Control-Allow-Origin",
                "Access-Control-Allow-Credentials"
        ));

        // ✅ Cache preflight for 2 hours
        cfg.setMaxAge(7200L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", cfg);
        return source;
    }
}

