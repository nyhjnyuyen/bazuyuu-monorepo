// WishlistMergeRequest.java
package com.example.bazuuyu.dto.request;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class WishlistMergeRequest {
    @NotEmpty
    private List<Long> productIds;
}
