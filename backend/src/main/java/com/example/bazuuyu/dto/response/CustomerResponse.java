package com.example.bazuuyu.dto.response;

import lombok.Data;

@Data
public class CustomerResponse {
    private Long id;
    private String username;
    private String email;

    // new profile fields
    private String firstName;
    private String lastName;
    private String phone;
    private String address;
    private String paymentInfo;
}
