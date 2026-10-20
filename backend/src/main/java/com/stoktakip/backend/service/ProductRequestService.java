package com.stoktakip.backend.service;

import com.stoktakip.backend.entity.ProductRequest;
import com.stoktakip.backend.repository.ProductRequestRepository;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ProductRequestService {

    private final ProductRequestRepository productRequestRepository;

    public ProductRequestService(ProductRequestRepository productRequestRepository) {
        this.productRequestRepository = productRequestRepository;
    }

    /**
     * Ürün taleplerini en yeniden en eskiye doğru listeler.
     */
    @Transactional(readOnly = true)
    public List<ProductRequest> getAllRequests() {
        return productRequestRepository.findAll(
                Sort.by(Sort.Direction.DESC, "requestedAt")
        );
    }

    /**
     * ID üzerinden ürün talebini getirir.
     */
    @Transactional(readOnly = true)
    public ProductRequest getRequestById(Long id) {
        validateId(id);

        return productRequestRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Ürün talebi bulunamadı. ID: " + id
                        )
                );
    }

    /**
     * Yeni ürün talebi oluşturur.
     */
    @Transactional
    public ProductRequest createRequest(ProductRequest request) {
        if (request == null) {
            throw new IllegalArgumentException(
                    "Ürün talebi boş olamaz."
            );
        }

        String category = request.getCategory();
        String productName = request.getProductName();
        Integer requestedQuantity = request.getRequestedQuantity();

        if (category == null || category.isBlank()) {
            throw new IllegalArgumentException(
                    "Kategori boş bırakılamaz."
            );
        }

        if (category.trim().length() > 100) {
            throw new IllegalArgumentException(
                    "Kategori en fazla 100 karakter olabilir."
            );
        }

        if (productName == null || productName.isBlank()) {
            throw new IllegalArgumentException(
                    "Ürün adı boş bırakılamaz."
            );
        }

        if (productName.trim().length() > 200) {
            throw new IllegalArgumentException(
                    "Ürün adı en fazla 200 karakter olabilir."
            );
        }

        if (requestedQuantity == null || requestedQuantity <= 0) {
            throw new IllegalArgumentException(
                    "Talep miktarı sıfırdan büyük bir tam sayı olmalıdır."
            );
        }

        /*************************************/
         // Aynı kategori ve ürün adına sahip talep var mı?
        ProductRequest existingRequest =
                productRequestRepository
                        .findByCategoryIgnoreCaseAndProductNameIgnoreCase(
                                category,
                                productName
                        )
                        .orElse(null);

        if (existingRequest != null) {

            // Mevcut talep miktarını artır.
            int updatedQuantity = Math.addExact(
                    existingRequest.getRequestedQuantity(),
                    requestedQuantity
            );

            existingRequest.setRequestedQuantity(updatedQuantity);

            // Mevcut kaydı güncelle.
            return productRequestRepository.save(existingRequest);
        }
        /**************************************/ 

        request.setCategory(category.trim());
        request.setProductName(productName.trim());

        return productRequestRepository.save(request);
    }

    /**
     * Ürün talebini siler.
     */
    @Transactional
    public void deleteRequest(Long id) {
        validateId(id);

        if (!productRequestRepository.existsById(id)) {
            throw new IllegalArgumentException(
                    "Silinecek ürün talebi bulunamadı. ID: " + id
            );
        }

        productRequestRepository.deleteById(id);
    }

    private void validateId(Long id) {
        if (id == null || id <= 0) {
            throw new IllegalArgumentException(
                    "Talep ID değeri pozitif olmalıdır."
            );
        }
    }
}