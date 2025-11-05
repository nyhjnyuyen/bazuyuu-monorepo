// CartMergeRequest.java
package com.example.bazuuyu.dto.request;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class CartMergeRequest {
    @NotEmpty
    private List<CartMergeItem> items;
}
