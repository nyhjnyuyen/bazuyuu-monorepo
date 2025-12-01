// dto/request/GuestCartItem.java
package com.example.bazuuyu.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class GuestCartItem {
    private Long productId;
    private Long variantId;   // optional
    private Integer quantity;
}
