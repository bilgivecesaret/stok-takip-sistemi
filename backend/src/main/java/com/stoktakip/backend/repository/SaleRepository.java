package com.stoktakip.backend.repository;

import com.stoktakip.backend.entity.Sale;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SaleRepository extends JpaRepository<Sale, Long> {

    // Belirli bir ürüne ait satış kayıtlarını getirir.
    List<Sale> findByProductId(Long productId);

    // Ürünün daha önce satılıp satılmadığını kontrol eder.
    boolean existsByProductId(Long productId);
}