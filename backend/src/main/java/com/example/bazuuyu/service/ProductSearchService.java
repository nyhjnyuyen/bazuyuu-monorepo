// ProductSearchService.java
package com.example.bazuuyu.service;

import com.example.bazuuyu.dto.response.ProductResponse;
import com.example.bazuuyu.entity.Category;
import com.example.bazuuyu.entity.Product;
import com.example.bazuuyu.mapper.ProductMapper;
import com.example.bazuuyu.repository.ProductRepository;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.regex.Pattern;

@Service
public class ProductSearchService {
    private static final Pattern SPLIT_NON_ALNUM = Pattern.compile("[^\\p{L}\\p{N}]+");

    private final ProductRepository repo;

    public ProductSearchService(ProductRepository repo) {
        this.repo = repo;
    }

    public Page<ProductResponse> search(String keyword, String category, int page, int size) {
        final String kwRaw = (keyword == null) ? "" : keyword.trim();
        final String kw = kwRaw.toLowerCase(Locale.ROOT);

        final List<String> tokens = kw.isEmpty()
                ? List.of()
                : SPLIT_NON_ALNUM.splitAsStream(kw)
                .filter(s -> !s.isBlank())
                .map(String::toLowerCase)
                .distinct()
                .toList();

        // tolerant category
        Category catEnum = null;
        if (category != null && !category.isBlank()) {
            try { catEnum = Category.valueOf(category.trim().toUpperCase(Locale.ROOT)); }
            catch (IllegalArgumentException ignored) {}
        }

        // ---- make all captured vars explicitly final for the lambda ----
        // ... inside ProductSearchService.search(...) BEFORE creating Specification

        final String kwFinal = kw;
        final List<String> tokensFinal = tokens;
        final Category catEnumFinal = catEnum;

        // tuneables
        final int minTok = 2;      // looser than 3
        final int ngram  = 3;      // set to 2 if you want even looser
        final int maxPatterns = 30; // safety cap

        Specification<Product> spec = (root, query, cb) -> {
            Expression<String> nameL = cb.lower(cb.coalesce(root.get("name"), ""));
            Expression<String> descL = cb.lower(cb.coalesce(root.get("description"), ""));

            // Collect unique terms first
            java.util.Set<String> terms = new java.util.LinkedHashSet<>();

            if (!kwFinal.isEmpty()) terms.add(kwFinal); // full phrase

            for (String t : tokensFinal) {
                if (t.length() >= minTok) {
                    terms.add(t);                     // token itself
                    if (t.length() >= 3) terms.add(t.substring(0, 3)); // prefix gram
                    if (t.length() > ngram) {
                        for (int i = 0; i <= t.length() - ngram; i++) {
                            terms.add(t.substring(i, i + ngram));      // infix grams
                            if (terms.size() >= maxPatterns) break;
                        }
                    }
                }
                if (terms.size() >= maxPatterns) break;
            }

            java.util.List<Predicate> orPreds = new java.util.ArrayList<>(terms.size());
            for (String term : terms) {
                String like = "%" + escapeLike(term) + "%";
                orPreds.add(cb.or(cb.like(nameL, like, '\\'), cb.like(descL, like, '\\')));
            }

            Predicate textPred = orPreds.isEmpty() ? cb.conjunction()
                    : cb.or(orPreds.toArray(Predicate[]::new));
            Predicate catPred  = (catEnumFinal == null) ? cb.conjunction()
                    : cb.equal(root.get("category"), catEnumFinal);

            if (query != null) query.orderBy(cb.asc(nameL));
            return cb.and(textPred, catPred);
        };

        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 100));
        return repo.findAll(spec, pageable).map(ProductMapper::toResponse);
    }

    /** Escape %, _ and \ for SQL LIKE */
    private static String escapeLike(String s) {
        StringBuilder out = new StringBuilder(s.length());
        for (int i = 0; i < s.length(); i++) {
            char ch = s.charAt(i);
            if (ch == '%' || ch == '_' || ch == '\\') out.append('\\');
            out.append(ch);
        }
        return out.toString();
    }
}
