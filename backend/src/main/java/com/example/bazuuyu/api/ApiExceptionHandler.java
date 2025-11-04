// com.example.bazuuyu.api.ApiExceptionHandler
package com.example.bazuuyu.api;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

record ApiError(String message) {}

@RestControllerAdvice
public class ApiExceptionHandler {
    @ExceptionHandler(DataIntegrityViolationException.class)
    @ResponseStatus(HttpStatus.CONFLICT)
    public ApiError handleDup(DataIntegrityViolationException ex) {
        return new ApiError("Duplicate key");
    }
}
