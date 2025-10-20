package com.example.bazuuyu.dto.request;
import jakarta.validation.constraints.*;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ShippingAddressRequest {
    @NotBlank private String fullName;

    @NotBlank
    @Pattern(regexp = "^(\\+?84|0)\\d{9,10}$", message = "Invalid VN phone")
    private String phone;

    @NotBlank private String province;
    @NotBlank private String district;
    @NotBlank private String ward;

    @NotBlank private String addressLine;

    private String note;
    private String country; // default "VN"
}
