// src/main/java/com/example/bazuuyu/controller/SearchApiController.java
package com.example.bazuuyu.controller;

import com.example.bazuuyu.dto.response.ProductResponse;
import com.example.bazuuyu.service.ProductSearchService;
import org.springframework.data.domain.Page;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/search")
public class SearchController {

    private final ProductSearchService service;

    public SearchController(ProductSearchService service) {
        this.service = service;
    }

    @GetMapping
    public Page<ProductResponse> search(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "24") int size) {
        return service.search(keyword, category, page, size);
    }
    // If you still need the view version:
    @GetMapping("/search")

    public String searchView(@RequestParam(required=false) String keyword,
                             @RequestParam(required=false) String category,
                             @RequestParam(defaultValue="0") int page,
                             @RequestParam(defaultValue="24") int size,
                             Model model) {
        var pageResp = service.search(keyword, category, page, size);
        model.addAttribute("products", pageResp.getContent());
        model.addAttribute("page", pageResp);
        model.addAttribute("keyword", keyword == null ? "" : keyword);
        model.addAttribute("category", category == null ? "" : category);
        return "search";
    }

}
