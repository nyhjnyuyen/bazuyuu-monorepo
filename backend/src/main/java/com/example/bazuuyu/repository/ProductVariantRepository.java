package com.example.bazuuyu.repository;

import com.example.bazuuyu.entity.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductVariantRepository extends JpaRepository<ProductVariant, Long> {
    // extra query methods later if needed
}
