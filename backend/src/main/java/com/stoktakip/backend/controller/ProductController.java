package com.stoktakip.backend.controller;

import com.stoktakip.backend.entity.Product;
import com.stoktakip.backend.dto.ProductLookupResponse;
import com.stoktakip.backend.dto.StockEntryRequest;
import com.stoktakip.backend.service.ProductService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    // Tüm ürünleri listele
    @GetMapping
    public List<Product> getAllProducts() {
        return productService.getAllProducts();
    }

    // ID ile ürün getir
    @GetMapping("/{id}")
    public Product getProductById(@PathVariable Long id) {
        try {
            return productService.getProductById(id);
        } catch (IllegalArgumentException exception) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    exception.getMessage()
            );
        }
    }

    // Kategori ve ürün adına göre mevcut ürünü ara.
    @GetMapping("/lookup")
    public ProductLookupResponse findProduct(
            @RequestParam String category,
            @RequestParam String name) {

        try {
            ProductLookupResponse result =
                    productService.findProductByCategoryAndName(
                            category,
                            name
                    );

            if (result == null) {
                throw new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Bu kategori ve ürün adıyla kayıt bulunamadı."
                );
            }

            return result;

        } catch (IllegalArgumentException exception) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    exception.getMessage()
            );
        } catch (IllegalStateException exception) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    exception.getMessage()
            );
        }
    }

    // Yeni stok girişi yap veya mevcut stoğu artır.
    @PostMapping("/stock-entry")
    public Product enterStock(
            @Valid @RequestBody StockEntryRequest request) {

        try {
            return productService.enterStock(request);

        } catch (IllegalArgumentException exception) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    exception.getMessage()
            );

        } catch (IllegalStateException exception) {

            if ("PRICE_UPDATE_CONFIRMATION_REQUIRED"
                    .equals(exception.getMessage())) {
                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "Fiyat veya KDV değişti. Güncelleme onayı gerekiyor."
                );
            }

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    exception.getMessage()
            );
        }
    }

    // Yeni ürün ekle
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Product createProduct(@Valid @RequestBody Product product) {
        return productService.createProduct(product);
    }

    // Ürün güncelle
    @PutMapping("/{id}")
    public Product updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody Product product) {

        try {
            return productService.updateProduct(id, product);
        } catch (IllegalArgumentException exception) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    exception.getMessage()
            );
        }
    }

    // Ürün sil
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteProduct(@PathVariable Long id) {
        try {
            productService.deleteProduct(id);
        } catch (IllegalArgumentException exception) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    exception.getMessage()
            );
        }
    }

    // API durumunu kontrol et
    @GetMapping("/status")
    public Map<String, String> status() {
        return Map.of(
                "status", "OK",
                "message", "Ürün API çalışıyor."
        );
    }
}
