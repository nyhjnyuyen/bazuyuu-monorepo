package com.example.bazuuyu.controller;

import com.example.bazuuyu.dto.request.RegisterCustomerRequest;
import com.example.bazuuyu.dto.request.UpdateAddressRequest;
import com.example.bazuuyu.dto.request.UpdatePersonalRequest;
import com.example.bazuuyu.dto.response.CustomerResponse;
import com.example.bazuuyu.entity.Customer;
import com.example.bazuuyu.security.CustomerDetails;
import com.example.bazuuyu.security.JwtUtils;
import com.example.bazuuyu.service.CustomerService;
import com.example.bazuuyu.dto.request.LoginRequest;
import com.example.bazuuyu.dto.response.LoginResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

/**
 * quan ly API lien quan toi tai khoan khach hang
 */
@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;

    // dang ky tai khoan khach hang
    @PostMapping("/register")
    public ResponseEntity<CustomerResponse> register(
            @Valid @RequestBody RegisterCustomerRequest req) {

        Customer saved = customerService.registerCustomer(req);

        CustomerResponse resp = new CustomerResponse();
        BeanUtils.copyProperties(saved, resp);

        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(saved.getId())
                .toUri();

        return ResponseEntity.created(location).body(resp);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CustomerResponse> getById(@PathVariable Long id) {
        return customerService.getCustomerById(id)
                .map(customer -> {
                    CustomerResponse resp = new CustomerResponse();
                    BeanUtils.copyProperties(customer, resp);
                    return ResponseEntity.ok(resp);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }


    // dang nhap va tra ve tokn JWT neu thanh cong
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getUsername(),
                        loginRequest.getPassword()
                )
        );

        CustomerDetails userDetails = (CustomerDetails) auth.getPrincipal();
        String accessToken = jwtUtils.generateAccessToken(
                userDetails.getCustomer().getId(),
                userDetails.getUsername(),
                "CUSTOMER"
        );

        String refreshToken = jwtUtils.generateRefreshToken(userDetails.getUsername());

        return ResponseEntity.ok(new LoginResponse(accessToken, refreshToken));
    }


    // lay thong tin khach hang theo ID

    // lay thong tin khach hang dang login tu JWT
    @GetMapping("/me")
    public ResponseEntity<CustomerResponse> getCurrentCustomer(HttpServletRequest request) {
        String token = jwtUtils.resolveToken(request);
        String username = jwtUtils.getUsernameFromToken(token);
        Customer customer = customerService.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Customer not found"));
        CustomerResponse resp = new CustomerResponse();
        BeanUtils.copyProperties(customer, resp);
        return ResponseEntity.ok(resp);
    }
    @PutMapping("/me")
    public ResponseEntity<CustomerResponse> updateCurrentCustomer(
            HttpServletRequest request,
            @RequestBody UpdatePersonalRequest req
    ) {
        String token = jwtUtils.resolveToken(request);
        String username = jwtUtils.getUsernameFromToken(token);

        Customer customer = customerService.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        if (req.getFirstName() != null) customer.setFirstName(req.getFirstName());
        if (req.getLastName() != null)  customer.setLastName(req.getLastName());
        if (req.getPhone() != null)     customer.setPhone(req.getPhone());

        Customer saved = customerService.save(customer); // thêm hàm save nếu chưa có

        CustomerResponse resp = new CustomerResponse();
        BeanUtils.copyProperties(saved, resp);
        return ResponseEntity.ok(resp);
    }
    @PutMapping("/me/address")
    public ResponseEntity<CustomerResponse> updateAddress(
            HttpServletRequest request,
            @RequestBody UpdateAddressRequest req
    ) {
        String token = jwtUtils.resolveToken(request);
        String username = jwtUtils.getUsernameFromToken(token);

        Customer customer = customerService.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        customer.setAddress(req.getAddress());

        Customer saved = customerService.save(customer);
        CustomerResponse resp = new CustomerResponse();
        BeanUtils.copyProperties(saved, resp);
        return ResponseEntity.ok(resp);
    }



    // lay danh sach tat ca khach hang (cho admin)
    @GetMapping("/all")
    public ResponseEntity<List<CustomerResponse>> getAll() {
        List<CustomerResponse> dtos = customerService.getAllCustomers().stream()
                .map(c -> {
                    CustomerResponse r = new CustomerResponse();
                    BeanUtils.copyProperties(c, r);
                    return r;
                })
                .toList();
        return ResponseEntity.ok(dtos);
    }

}
