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
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import static org.springframework.security.config.Customizer.withDefaults;

import java.util.List;

/**
 * cau hinh bao mat chinh
 *
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
        http.csrf(AbstractHttpConfigurer::disable)
                .cors(withDefaults())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth

                        // 1) Allow anyone to hit the login/register endpoints:
                        .requestMatchers(
                                "/api/auth/**",
                                "/api/auth/refresh",
                                "/api/admins/login",
                                "/api/customers/login",
                                "/api/customers/register",
                                "/api/password/send-reset-token",
                                "/api/password/reset"
                        ).permitAll()

                        .requestMatchers(HttpMethod.POST, "/api/auth/customer/register").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/auth/login").permitAll()

                        // 2) Allow everyone to GET product‐list and product‐detail:
                        .requestMatchers(HttpMethod.GET, "/api/products/**")
                        .permitAll()

                        // 3) ADMIN or SUPER_ADMIN can create products (two possible URLs):
                        .requestMatchers(HttpMethod.POST, "/api/products", "/api/admins/products")
                        .hasAnyAuthority("ROLE_ADMIN", "ROLE_SUPER_ADMIN")

                        // 4) ADMIN or SUPER_ADMIN can edit/delete products:
                        .requestMatchers(HttpMethod.PUT,    "/api/products/**")
                        .hasAnyAuthority("ROLE_ADMIN", "ROLE_SUPER_ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/products/**")
                        .hasAnyAuthority("ROLE_ADMIN", "ROLE_SUPER_ADMIN")

                        // 5) ADMIN or SUPER_ADMIN can upload images (two URLs):
                        .requestMatchers(
                                "/api/upload",
                                "/api/admins/upload"
                        ).hasAnyAuthority("ROLE_ADMIN", "ROLE_SUPER_ADMIN")

                        // 6) Only a logged‐in CUSTOMER may hit /api/customers/**
                        .requestMatchers("/api/customers/**")
                        .hasAuthority("ROLE_CUSTOMER")

                        // 7) Only SUPER_ADMIN may do anything else under /api/admins/**
                        .requestMatchers("/api/admins/**")
                        .hasAuthority("ROLE_SUPER_ADMIN")
                        .requestMatchers("/error").permitAll()

                        .requestMatchers("/api/auth/**", "/api/newsletter/**").permitAll()


                        // 8) Everything else requires at least a valid token
                        .anyRequest().authenticated()
                )
                // 9) Always run our JWT filter BEFORE UsernamePasswordAuthenticationFilter
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

    // cau hinh CORS cho phep frontend truy cap API
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        // if you don't use cookies, keep this false (simpler CORS)
        config.setAllowCredentials(false);

        // ✅ allow your deploy origins
        config.setAllowedOriginPatterns(List.of(
                "http://localhost:*",
                "https://*.netlify.app",
                "https://*.vercel.app",
                "https://*.a.run.app"   // Cloud Run direct calls (if any)
        ));
        config.setAllowedMethods(List.of("GET","POST","PUT","DELETE","OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        // if you return JWT in headers later:
        config.setExposedHeaders(List.of("Authorization"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

}

