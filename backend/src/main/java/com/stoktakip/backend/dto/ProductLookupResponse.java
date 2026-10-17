package com.stoktakip.backend.dto;

import com.stoktakip.backend.entity.Product;

public record ProductLookupResponse(
        Product product,
        boolean previouslySold
) {
}