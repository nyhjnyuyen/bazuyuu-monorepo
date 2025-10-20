package com.example.bazuuyu.utils;

public class ValidationaUtil {
    public static void validatePositive(int value, String fieldName) {
        if (value <= 0) {
            throw new IllegalArgumentException(fieldName + " must be positive.");
        }
    }
}
