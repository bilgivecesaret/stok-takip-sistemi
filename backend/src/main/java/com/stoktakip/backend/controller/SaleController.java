package com.stoktakip.backend.controller;

import com.stoktakip.backend.entity.Sale;
import com.stoktakip.backend.service.SaleService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/sales")
public class SaleController {

    private final SaleService saleService;

    public SaleController(SaleService saleService) {
        this.saleService = saleService;
    }

    /**
     * Satış geçmişini getirir.
     */
    @GetMapping
    public List<Sale> getAllSales() {
        return saleService.getAllSales();
    }

    /**
     * Belirli bir ürünün satış geçmişini getirir.
     */
    @GetMapping("/product/{id}")
    public List<Sale> getSalesByProductId(@PathVariable Long id) {
        try {
            return saleService.getSalesByProductId(id);
        } catch (IllegalArgumentException exception) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    exception.getMessage()
            );
        }
    }

    /**
     * Yeni satış gerçekleştirir.
     */
    @PostMapping
    public ResponseEntity<Map<String, Object>> sellProduct(
            @Valid @RequestBody SaleRequest request) {

        try {
            Sale sale = saleService.sellProduct(
                    request.productId(),
                    request.quantity()
            );

            BigDecimal total =
                    saleService.calculateVatIncludedTotal(sale);

            Map<String, Object> response = Map.of(
                    "message", "Satış başarıyla gerçekleştirildi.",
                    "saleId", sale.getId(),
                    "productId", sale.getProductId(),
                    "productName", sale.getProductName(),
                    "quantity", sale.getQuantity(),
                    "vatIncludedTotal", total
            );

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(response);

        } catch (IllegalArgumentException exception) {

            Map<String, Object> response = Map.of(
                    "code", "INVALID_REQUEST",
                    "message", exception.getMessage()
            );

            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(response);

        } catch (IllegalStateException exception) {

            String errorMessage = exception.getMessage();

            if (errorMessage != null &&
                    errorMessage.startsWith("STOCK_EMPTY:")) {

                Map<String, Object> response = Map.of(
                        "code", "STOCK_EMPTY",
                        "message", "Ürünün stoğu tükenmiştir."
                );

                return ResponseEntity
                        .status(HttpStatus.CONFLICT)
                        .body(response);
            }

            if (errorMessage != null &&
                    errorMessage.startsWith("INSUFFICIENT_STOCK:")) {

                Map<String, Object> response = Map.of(
                        "code", "INSUFFICIENT_STOCK",
                        "message", errorMessage.substring(
                                "INSUFFICIENT_STOCK:".length()
                        ).trim()
                );

                return ResponseEntity
                        .status(HttpStatus.CONFLICT)
                        .body(response);
            }

            throw exception;
        }
    }

    /**
     * Satış isteğinin JSON veri yapısı.
     */
    public record SaleRequest(
            @NotNull @Positive Long productId,
            @NotNull @Positive Integer quantity
    ) {  }
}