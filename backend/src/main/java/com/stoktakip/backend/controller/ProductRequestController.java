package com.stoktakip.backend.controller;

import com.stoktakip.backend.entity.ProductRequest;
import com.stoktakip.backend.service.ProductRequestService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/product-requests")
public class ProductRequestController {

    private final ProductRequestService productRequestService;

    public ProductRequestController(ProductRequestService productRequestService) {
        this.productRequestService = productRequestService;
    }

    /**
     * Tüm ürün taleplerini listeler.
     */
    @GetMapping
    public List<ProductRequest> getAllRequests() {
        return productRequestService.getAllRequests();
    }

    /**
     * ID üzerinden bir ürün talebini getirir.
     */
    @GetMapping("/{id}")
    public ProductRequest getRequestById(@PathVariable Long id) {
        try {
            return productRequestService.getRequestById(id);
        } catch (IllegalArgumentException exception) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    exception.getMessage()
            );
        }
    }

    /**
     * Yeni ürün talebi oluşturur.
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProductRequest createRequest(@Valid @RequestBody ProductRequest request) {
        try {
            return productRequestService.createRequest(request);
        } catch (IllegalArgumentException exception) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    exception.getMessage()
            );
        }
    }

    /**
     * Ürün talebini siler.
     */
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteRequest(@PathVariable Long id) {
        try {
            productRequestService.deleteRequest(id);
        } catch (IllegalArgumentException exception) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    exception.getMessage()
            );
        }
    }
}