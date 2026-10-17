package com.stoktakip.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "products")
public class Product {
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
	private String name;
	
	@NotNull(message = "Stok miktarı belirtilmelidir.")
	@PositiveOrZero(message = "Stok miktarı negatif olamaz.")
	@Column(name = "stock_quantity", nullable = false)
	private Integer stockQuantity;
	
	@NotNull(message = "Alış fiyatı belirtilmelidir.")
	@DecimalMin(value = "0.0", message = "Alış fiyatı negatif olamaz.")
	@Column(name = "purchase_price", nullable = false, precision = 12, scale = 2)
	private BigDecimal purchasePrice;
	
	@NotNull(message = "Satış fiyatı belirtilmelidir.")
	@DecimalMin(value = "0.0", message = "Satış fiyatı negatif olamaz.")
	@Column(name = "sale_price", nullable = false, precision = 12, scale = 2)
	private BigDecimal salePrice;
	
	@NotNull(message = "KDV oranı belirtilmelidir.")
	@DecimalMin(value = "0.0", message = "KDV oranı negatif olamaz.")
	@Column(name = "vat_rate", nullable = false, precision = 5, scale = 2)
	private BigDecimal vatRate;
	
	@Column(name = "created_at", nullable = false)
	private LocalDateTime createdAt;
	
	public Product() { }
	
	@PrePersist
	protected void onCreate() {
		if(createdAt == null) {
			createdAt = LocalDateTime.now();
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
	
	public String getName() {
		return name;
	}
	
	public void setName(String name) {
		this.name = name;
	}
	
	public Integer getStockQuantity() {
    	return stockQuantity;
	}

	public void setStockQuantity(Integer stockQuantity) {
    	this.stockQuantity = stockQuantity;
	}

	public BigDecimal getPurchasePrice() {
		return purchasePrice;
	}

	public void setPurchasePrice(BigDecimal purchasePrice) {
		this.purchasePrice = purchasePrice;
	}

	public BigDecimal getSalePrice() {
		return salePrice;
	}

	public void setSalePrice(BigDecimal salePrice) {
		this.salePrice = salePrice;
	}

	public BigDecimal getVatRate() {
		return vatRate;
	}

	public void setVatRate(BigDecimal vatRate) {
		this.vatRate = vatRate;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}
}
	
