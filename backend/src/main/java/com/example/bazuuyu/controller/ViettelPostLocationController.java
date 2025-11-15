// src/main/java/com/example/bazuuyu/controller/ViettelPostLocationController.java
package com.example.bazuuyu.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

@RestController
@RequestMapping("/api/vn") // 👈 important: /api + /vn matches axios base + path
@RequiredArgsConstructor
public class ViettelPostLocationController {

    private final RestTemplate restTemplate;
    private static final String VTP_BASE = "https://partner.viettelpost.vn/v2/categories";

    @GetMapping("/provinces")
    public ResponseEntity<String> getProvinces() {
        String url = VTP_BASE + "/listProvince";
        String body = restTemplate.getForObject(url, String.class);
        return ResponseEntity.ok(body);
    }

    @GetMapping("/districts")
    public ResponseEntity<String> getDistricts(@RequestParam("provinceId") String provinceId) {
        String url = VTP_BASE + "/listDistrict?provinceId=" + provinceId;
        String body = restTemplate.getForObject(url, String.class);
        return ResponseEntity.ok(body);
    }

    @GetMapping("/wards")
    public ResponseEntity<String> getWards(@RequestParam("districtId") String districtId) {
        String url = VTP_BASE + "/listWards?districtId=" + districtId;
        String body = restTemplate.getForObject(url, String.class);
        return ResponseEntity.ok(body);
    }
}
