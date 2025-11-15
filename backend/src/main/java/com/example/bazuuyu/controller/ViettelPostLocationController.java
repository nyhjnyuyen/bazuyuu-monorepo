// src/main/java/com/example/bazuuyu/controller/ViettelPostLocationController.java
package com.example.bazuuyu.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

@RestController
@RequestMapping("/api/vn")
@RequiredArgsConstructor
public class ViettelPostLocationController {

    private final RestTemplate restTemplate;
    private static final String VTP_BASE = "https://partner.viettelpost.vn/v2/categories";

    @GetMapping("/provinces")
    public ResponseEntity<?> getProvinces() {
        String url = VTP_BASE + "/listProvince";
        Object body = restTemplate.getForObject(url, Object.class); // 👈 note Object.class
        return ResponseEntity.ok(body);
    }

    @GetMapping("/districts")
    public ResponseEntity<?> getDistricts(@RequestParam("provinceId") String provinceId) {
        String url = VTP_BASE + "/listDistrict?provinceId=" + provinceId;
        Object body = restTemplate.getForObject(url, Object.class);
        return ResponseEntity.ok(body);
    }

    @GetMapping("/wards")
    public ResponseEntity<?> getWards(@RequestParam("districtId") String districtId) {
        String url = VTP_BASE + "/listWards?districtId=" + districtId;
        Object body = restTemplate.getForObject(url, Object.class);
        return ResponseEntity.ok(body);
    }
}
