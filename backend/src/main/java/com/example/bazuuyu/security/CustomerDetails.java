package com.example.bazuuyu.security;

import com.example.bazuuyu.entity.Customer;
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.GrantedAuthority;

import java.util.Collection;
import java.util.Collections;
import java.util.List;

/**
 * cung cap thong tin ve khach hang cho Spring Security.
 */
@Getter
@AllArgsConstructor
public class CustomerDetails implements UserDetails {
    private final Customer customer;

    // tra ve quyen cua customer
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(() -> "CUSTOMER");
    }


    @Override public String getPassword() { return customer.getPassword(); }
    @Override public String getUsername() { return customer.getUsername(); }

    @Override public boolean isAccountNonExpired() { return true; }
    @Override public boolean isAccountNonLocked() { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }
    @Override public boolean isEnabled() { return true; }

}
