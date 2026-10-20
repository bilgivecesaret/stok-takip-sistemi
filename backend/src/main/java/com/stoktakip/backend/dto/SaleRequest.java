package com.stoktakip.backend.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

/**
* Satış isteğinin JSON veri yapısı.
*/
public record SaleRequest(
        @NotNull @Positive Long productId,
        @NotNull @Positive Integer quantity
) {  }
