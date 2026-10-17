package com.stoktakip.backend.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record StockEntryRequest(

        @NotBlank(message = "Kategori boş bırakılamaz.")
        @Size(max = 100, message = "Kategori en fazla 100 karakter olabilir.")
        String category,

        @NotBlank(message = "Ürün adı boş bırakılamaz.")
        @Size(max = 200, message = "Ürün adı en fazla 200 karakter olabilir.")
        String name,

        @NotNull(message = "Stok miktarı belirtilmelidir.")
        @Min(value = 1, message = "Stok giriş miktarı en az 1 olmalıdır.")
        Integer quantity,

        @NotNull(message = "Alış fiyatı belirtilmelidir.")
        @DecimalMin(value = "0.0", message = "Alış fiyatı negatif olamaz.")
        BigDecimal purchasePrice,

        @NotNull(message = "Satış fiyatı belirtilmelidir.")
        @DecimalMin(value = "0.0", message = "Satış fiyatı negatif olamaz.")
        BigDecimal salePrice,

        @NotNull(message = "KDV oranı belirtilmelidir.")
        @DecimalMin(value = "0.0", message = "KDV oranı negatif olamaz.")
        @DecimalMax(value = "100.0", message = "KDV oranı %100'den büyük olamaz.")
        BigDecimal vatRate,

        boolean updateExistingPrices

) {
}