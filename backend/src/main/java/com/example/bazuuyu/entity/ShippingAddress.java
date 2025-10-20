// src/main/java/com/example/bazuuyu/entity/ShippingAddress.java
package com.example.bazuuyu.entity;

import jakarta.persistence.Embeddable;
import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
@Embeddable
public class ShippingAddress {
    // Basic identity
    private String fullName;
    private String phone;

    // Administrative divisions (codes + names)
    private String province;
    private String district;
    private String ward;

    private String addressLine;   // house no., street, building…
    private String note;          // optional
    private String country;       // default "VN"
}
