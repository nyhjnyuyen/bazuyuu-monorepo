package com.example.bazuuyu.repository;

import com.example.bazuuyu.entity.Product;
import com.example.bazuuyu.entity.Category;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;


import java.util.List;

/**
 * thao tac voi bang product
 */
public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {
    List<Product> findByCategory(Category category);
    List<Product> findByIsNewArrivalTrueOrderByCreatedAtDesc();

    // tim tat ca san pham theo danh muc
    Page<Product> findAllByCategory(Category category, Pageable pageable);
    List<Product> findByIsBestSellerTrue();
    List<Product> findByIsNewArrivalTrue();

    @Query("""
      SELECT p FROM Product p
      WHERE (:kw IS NULL OR :kw = '' OR
             LOWER(p.name) LIKE LOWER(CONCAT('%', :kw, '%')) OR
             LOWER(p.description) LIKE LOWER(CONCAT('%', :kw, '%')))
        AND (:cat IS NULL OR :cat = '' OR p.category = :catEnum)
      """)
    Page<Product> search(
            @Param("kw") String kw,
            @Param("cat") String cat,        // for optional string binding
            @Param("catEnum") Category catEnum, // derived enum (may be null)
            Pageable pageable
    );
}
