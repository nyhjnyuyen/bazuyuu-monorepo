package com.example.bazuuyu.dto.request;

import lombok.Data;

// dto tao san pham ( kh bao gom anh va danh muc)
@Data
public class CreateProductRequest {
    private String name;
    private String description;
    private Double price;
}
