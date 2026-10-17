package com.stoktakip.backend.service;

import com.stoktakip.backend.entity.Product;
import com.stoktakip.backend.entity.Sale;
import com.stoktakip.backend.repository.ProductRepository;
import com.stoktakip.backend.repository.SaleRepository;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class SaleService {

    private final ProductRepository productRepository;
    private final SaleRepository saleRepository;

    public SaleService(
            ProductRepository productRepository,
            SaleRepository saleRepository) {

        this.productRepository = productRepository;
        this.saleRepository = saleRepository;
    }

    /**
     * Tüm satış kayıtlarını getirir.
     */
    @Transactional(readOnly = true)
    public List<Sale> getAllSales() {
        return saleRepository.findAll(
                Sort.by(Sort.Direction.DESC,"soldAt")
        );
    }

    /**
     * Bir ürüne ait satış kayıtlarını getirir.
     */
    @Transactional(readOnly = true)
    public List<Sale> getSalesByProductId(Long productId) {
        if (productId == null || productId <= 0) {
            throw new IllegalArgumentException(
                    "Geçerli bir ürün ID'si belirtilmelidir."
            );
        }

        return saleRepository.findByProductId(productId);
    }

    /**
     * Satış gerçekleştirir ve stok miktarını azaltır.
     *
     * Satış kaydı ile stok güncellemesi aynı transaction
     * içerisinde gerçekleştirilir.
     */
    @Transactional
    public Sale sellProduct(Long productId, Integer quantity) {

        if (productId == null || productId <= 0) {
            throw new IllegalArgumentException(
                    "Geçerli bir ürün ID'si belirtilmelidir."
            );
        }

        if (quantity == null || quantity <= 0) {
            throw new IllegalArgumentException(
                    "Satış miktarı pozitif bir tam sayı olmalıdır."
            );
        }

        Product product = productRepository.findByIdForUpdate(productId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Ürün bulunamadı. ID: " + productId
                        )
                );

        if (product.getStockQuantity() == 0) {
            throw new IllegalStateException(
                    "STOCK_EMPTY: Ürünün stoğu tükenmiştir."
            );
        }

        if (product.getStockQuantity() < quantity) {
            throw new IllegalStateException(
                    "INSUFFICIENT_STOCK: Mevcut stok: "
                            + product.getStockQuantity()
                            + ", istenen miktar: "
                            + quantity
            );
        }

        // Satış anındaki ürün bilgilerini kaydet.
        Sale sale = new Sale();

        sale.setProductId(product.getId());
        sale.setCategory(product.getCategory());
        sale.setProductName(product.getName());
        sale.setQuantity(quantity);
        sale.setPurchasePrice(product.getPurchasePrice());
        sale.setSalePrice(product.getSalePrice());
        sale.setVatRate(product.getVatRate());

        // Satış kaydını oluştur.
        Sale savedSale = saleRepository.save(sale);

        // Stok miktarını azalt.
        product.setStockQuantity(
                product.getStockQuantity() - quantity
        );

        productRepository.save(product);

        return savedSale;
    }

    /**
     * Bir satışın KDV dahil toplam tutarını hesaplar.
     */
    public BigDecimal calculateVatIncludedTotal(Sale sale) {

        BigDecimal vatMultiplier = BigDecimal.ONE.add(
                sale.getVatRate().divide(
                        new BigDecimal("100")
                )
        );

        return sale.getSalePrice()
                .multiply(vatMultiplier)
                .multiply(BigDecimal.valueOf(sale.getQuantity()))
                .setScale(2, java.math.RoundingMode.HALF_UP);
    }
}