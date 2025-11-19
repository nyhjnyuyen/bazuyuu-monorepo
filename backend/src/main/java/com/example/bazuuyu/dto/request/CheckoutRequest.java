// src/main/java/com/example/bazuuyu/dto/request/CheckoutRequest.java
package com.example.bazuuyu.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class CheckoutRequest {
    @NotNull
    private Long cartId;                 // ID giỏ hàng (guest / customer gì cũng được)

    @Valid @NotNull
    private ShippingAddressRequest shippingAddress;
}
