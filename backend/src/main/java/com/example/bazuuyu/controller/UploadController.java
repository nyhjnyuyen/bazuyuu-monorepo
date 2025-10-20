package com.example.bazuuyu.controller;

import com.example.bazuuyu.service.CloudinaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

/**
 * xu ly yeu cau tai anh tu client
 * Endpoint: POST /api/upload
 * gui file anh duong dang multipart va tra ve URL anh duoc luu tru tren cloudinary
 */
@RestController
@RequestMapping("/api/upload")
@RequiredArgsConstructor
public class UploadController {

    private final CloudinaryService cloudinaryService;

    // api nhan anh tu client va tai len Cloudinary
    @PostMapping
    public ResponseEntity<String> upload(@RequestParam("file") MultipartFile file) throws IOException {
        String imageUrl = cloudinaryService.uploadFile(file);
        return ResponseEntity.ok(imageUrl);
    }

}
