package com.example.bazuuyu.repository;

public interface AddressDirectory {
    String getProvinceName(String code);
    String getDistrictName(String provinceCode, String districtCode);
    String getWardName(String districtCode, String wardCode);
}
