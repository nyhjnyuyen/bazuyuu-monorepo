package com.example.bazuuyu.security;

import com.example.bazuuyu.entity.Admin;
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.Collection;
import java.util.Collections;

/**
 * cung cap thong tin ve tai khoan admin cho Spring Security
 */
@Getter
@AllArgsConstructor
public class AdminDetails implements UserDetails {
    private final Admin admin; // thong tin cua 1 admin

    /// tra ve vai tro cua admin de phan quyen
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.singleton(new SimpleGrantedAuthority(admin.getRole().name()));
    }

    @Override public String getPassword() { return admin.getPassword(); }
    @Override public String getUsername() { return admin.getUsername(); }
    @Override public boolean isAccountNonExpired() { return true; }
    @Override public boolean isAccountNonLocked() { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }
    @Override public boolean isEnabled() { return true; }
}
