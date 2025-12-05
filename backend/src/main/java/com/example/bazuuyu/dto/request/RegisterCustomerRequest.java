package com.example.bazuuyu.dto.request;

import jakarta.validation.constraints.*;

import lombok.Data;

@Data
public class RegisterCustomerRequest {
    @NotBlank @Size(min = 3, max = 30)
    private String username;

    @NotBlank @Email
    private String email;

    @NotBlank @Size(min = 6)
    private String password;

    @NotBlank
    private String firstName;

    @NotBlank
    private String lastName;

    @NotBlank @Pattern(regexp = "\\d{10,15}")
    private String phone;

    // optional
    private String address;

}
