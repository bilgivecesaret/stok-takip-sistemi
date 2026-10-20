package com.stoktakip.backend.repository;

import com.stoktakip.backend.entity.ProductRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProductRequestRepository extends JpaRepository<ProductRequest, Long> { 
     /**
     * Kategori ve ürün adına göre mevcut talebi bulur.
     * Büyük/küçük harf farklılıklarını dikkate almaz.
     */
    Optional<ProductRequest> findByCategoryIgnoreCaseAndProductNameIgnoreCase(
            String category,
            String productName
    );
}