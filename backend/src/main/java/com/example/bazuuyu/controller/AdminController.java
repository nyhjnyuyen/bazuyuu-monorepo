package com.example.bazuuyu.controller;

import com.example.bazuuyu.dto.request.CreateAdminRequest;
import com.example.bazuuyu.dto.request.LoginRequest;
import com.example.bazuuyu.dto.request.ProductRequest;
import com.example.bazuuyu.dto.response.*;
import com.example.bazuuyu.entity.Admin;
import com.example.bazuuyu.entity.Product;
import com.example.bazuuyu.entity.Role;
import com.example.bazuuyu.mapper.AdminMapper;
import com.example.bazuuyu.mapper.OrderItemMapper;
import com.example.bazuuyu.mapper.OrderMapper;
import com.example.bazuuyu.mapper.ProductMapper;
import com.example.bazuuyu.security.AdminDetails;
import com.example.bazuuyu.security.JwtUtils;
import com.example.bazuuyu.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.List;

/**
 * cung cap cac api danh cho admin.
 * bao gom login, create new admin, add/delete products, and upload images.
 */
@RestController
@RequestMapping("/api/admins")
@RequiredArgsConstructor
public class AdminController {
    private final AdminService adminService;
    private final JwtUtils jwtUtils;
    private final ProductService productService;
    private final CloudinaryService cloudinaryService;
    private final PasswordEncoder passwordEncoder;
    private final OrderService orderService;
    private final OrderItemService orderItemService;


    // tao admin moi. chi SUPER_ADMIN moi duoc phep goi API nay.
    @PreAuthorize("hasAuthority('ROLE_SUPER_ADMIN')")
    @PostMapping("/create")
    public ResponseEntity<AdminResponse> createAdmin(@RequestBody CreateAdminRequest request) {
        return ResponseEntity.ok(adminService.createAdmin(request));
    }

    // dang nhap admin. return token JWT neu thanh cong
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest req) {
        Admin admin = adminService.findByUsername(req.getUsername())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED, "Invalid username or password"));

        if (!passwordEncoder.matches(req.getPassword(), admin.getPassword())) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED, "Invalid username or password");
        }

        String accessToken  = jwtUtils.generateAccessToken(
                admin.getId(),
                admin.getUsername(),
                admin.getRole().name());
        String refreshToken = jwtUtils.generateRefreshToken(admin.getUsername());

        return ResponseEntity.ok(new LoginResponse(accessToken, refreshToken));
    }


    // ✅ List all admins
    @GetMapping("/all")
    public ResponseEntity<List<AdminResponse>> listAdmins() {
        List<Admin> admins = adminService.findAll();
        List<AdminResponse> response = admins.stream()
                .map(AdminMapper::toResponse)
                .toList();
        return ResponseEntity.ok(response);
    }

    // ✅ Delete admin (only by SUPER_ADMIN)
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteAdmin(
            @PathVariable Long id,
            @RequestParam Long requesterId
    ) {
        Admin requester = adminService.findById(requesterId)
                .orElseThrow(() -> new IllegalArgumentException("Requester admin not found"));

        if (requester.getRole() != Role.SUPER_ADMIN) {
            return ResponseEntity.status(403).body("Only SUPER_ADMIN can delete admins.");
        }

        adminService.deleteAdmin(requester, id);
        return ResponseEntity.ok("Admin deleted successfully.");
    }

    // add a new product
    // AdminController.java

    @PostMapping("/products")
    public ResponseEntity<ProductResponse> addProduct(
            @RequestBody ProductRequest request,
            @AuthenticationPrincipal AdminDetails adminDetails
    ) {
        Role role = adminDetails.getAdmin().getRole();
        if (role != Role.ADMIN && role != Role.SUPER_ADMIN) {
            return ResponseEntity.status(403).build();
        }

        Product product = ProductMapper.toEntity(request);
        Product saved = productService.create(product);
        return ResponseEntity.ok(ProductMapper.toResponse(saved));
    }


    // lay danh sach toan bo san pham.
    @GetMapping("/products")
    public ResponseEntity<List<ProductResponse>> getAllProducts() {
        List<Product> products = productService.findAll();
        List<ProductResponse> response = products.stream()
                .map(ProductMapper::toResponse)
                .toList();
        return ResponseEntity.ok(response);
    }

    // delete product by ID
    @DeleteMapping("/products/{id}")
    public ResponseEntity<String> deleteProduct(
            @PathVariable Long id,
            @AuthenticationPrincipal AdminDetails adminDetails
    ) {
        Role role = adminDetails.getAdmin().getRole();
        if (role != Role.ADMIN && role != Role.SUPER_ADMIN) {
            return ResponseEntity.status(403).body("Forbidden");
        }

        productService.deleteById(id);
        return ResponseEntity.ok("Product deleted.");
    }
    @PutMapping("/products/{id}")
    public ResponseEntity<ProductResponse> updateProduct(
            @PathVariable Long id,
            @RequestBody ProductRequest request,
            @AuthenticationPrincipal AdminDetails adminDetails
    ) {
        Role role = adminDetails.getAdmin().getRole();
        if (role != Role.ADMIN && role != Role.SUPER_ADMIN) {
            return ResponseEntity.status(403).build();
        }

        Product existing = productService.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        existing.setName(request.getName());
        existing.setPrice(request.getPrice());
        existing.setCategory(request.getCategory());
        existing.setDescription(request.getDescription());
        existing.setImageUrl(request.getImageUrl());
        // ...other fields

        Product saved = productService.create(existing); // or productService.update(existing)
        return ResponseEntity.ok(ProductMapper.toResponse(saved));
    }


    // tai anh san pham len CLoudinary, chi admin co token moi duoc phep.
    @PostMapping("/upload")
    public ResponseEntity<String> uploadImage(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal AdminDetails adminDetails
    ) throws IOException {
        if (adminDetails == null) {
            return ResponseEntity.status(403).body("Unauthorized");
        }
        String url = cloudinaryService.uploadFile(file);
        return ResponseEntity.ok(url);
    }

    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_SUPER_ADMIN')")
    @GetMapping("/orders")
    public ResponseEntity<List<OrderResponse>> listAllOrders() {
        var orders = orderService.findAllOrderByDateDesc(); // see service below
        var resp = orders.stream().map(OrderMapper::toResponse).toList();
        return ResponseEntity.ok(resp);
    }

    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_SUPER_ADMIN')")
    @GetMapping("/orders/{orderId}/items")
    public ResponseEntity<List<OrderItemResponse>> getItems(@PathVariable Long orderId) {
        var items = orderItemService.getItemsByOrderId(orderId);
        var resp = items.stream().map(OrderItemMapper::toResponse).toList();
        return ResponseEntity.ok(resp);
    }

    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_SUPER_ADMIN')")
    @PatchMapping("/orders/{orderId}/status")
    public ResponseEntity<Void> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestParam String status
    ) {
        orderService.updateStatus(orderId, status);
        return ResponseEntity.noContent().build();
    }






}
