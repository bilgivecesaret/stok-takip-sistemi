package com.stoktakip.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

@Entity
@Table(name = "product_requests")
public class ProductRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Kategori boş bırakılamaz.")
    @Size(max = 100, message = "Kategori en fazla 100 karakter olabilir.")
    @Column(nullable = false, length = 100)
    private String category;

    @NotBlank(message = "Ürün adı boş bırakılamaz.")
    @Size(max = 200, message = "Ürün adı en fazla 200 karakter olabilir.")
    @Column(nullable = false, length = 200)
    private String productName;

    @NotNull(message = "Talep miktarı boş bırakılamaz.")
    @Positive(message = "Talep miktarı sıfırdan büyük olmalıdır.")
    @Column(nullable = false)
    private Integer requestedQuantity;

    @Column(nullable = false, updatable = false)
    private LocalDateTime requestedAt;

    public ProductRequest() {
    }

    @PrePersist
    protected void onCreate() {
        if (requestedAt == null) {
            requestedAt = LocalDateTime.now();
        }
    }

    public Long getId() {
        return id;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public Integer getRequestedQuantity() {
        return requestedQuantity;
    }

    public void setRequestedQuantity(Integer requestedQuantity) {
        this.requestedQuantity = requestedQuantity;
    }

    public LocalDateTime getRequestedAt() {
        return requestedAt;
    }
}