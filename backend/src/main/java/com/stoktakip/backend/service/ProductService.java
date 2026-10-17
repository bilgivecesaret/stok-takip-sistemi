package com.stoktakip.backend.service;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.stoktakip.backend.dto.ProductLookupResponse;
import com.stoktakip.backend.dto.StockEntryRequest;
import com.stoktakip.backend.entity.Product;
import com.stoktakip.backend.repository.ProductRepository;
import com.stoktakip.backend.repository.SaleRepository;

@Service
@Transactional
public class ProductService {

    private final ProductRepository productRepository;
    private final SaleRepository saleRepository;

    public ProductService(
            ProductRepository productRepository,
            SaleRepository saleRepository) {
        this.productRepository = productRepository;
        this.saleRepository = saleRepository;
    }

    // Tüm ürünleri listele
    @Transactional(readOnly = true)
    public List<Product> getAllProducts() {
        return productRepository.findAll(
                Sort.by(Sort.Direction.DESC,"createdAt")
        );
    }

    // Kimliğe göre ürün getir
    @Transactional(readOnly = true)
    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Ürün bulunamadı. ID: " + id
                        )
                );
    }

    // Kategori ve ürün adına göre mevcut ürünü bulur.
    @Transactional(readOnly = true)
    public ProductLookupResponse findProductByCategoryAndName(
            String category,
            String name) {

        if (category == null || category.isBlank()
                || name == null || name.isBlank()) {
            throw new IllegalArgumentException(
                    "Kategori ve ürün adı boş bırakılamaz."
            );
        }

        List<Product> matchingProducts =
                productRepository.findByCategoryIgnoreCaseAndNameIgnoreCase(
                        category.trim(),
                        name.trim()
                );

        if (matchingProducts.isEmpty()) {
            return null;
        }

        if (matchingProducts.size() > 1) {
            throw new IllegalStateException(
                    "Aynı kategori ve ürün adıyla birden fazla kayıt bulundu. "
                    + "Önce mükerrer ürün kayıtları düzenlenmelidir."
            );
        }

        Product product = matchingProducts.get(0);

        boolean previouslySold =
                saleRepository.existsByProductId(product.getId());

        return new ProductLookupResponse(product, previouslySold);
    }

    // Yeni stok girişi yapar veya mevcut stoğu artırır.
    public Product enterStock(StockEntryRequest request) {

        if (request == null) {
            throw new IllegalArgumentException(
                    "Stok giriş bilgileri boş olamaz."
            );
        }

        // Yeni ürün bilgilerini mevcut doğrulama kurallarından geçir.
        Product candidate = new Product();
        candidate.setCategory(request.category());
        candidate.setName(request.name());
        candidate.setStockQuantity(request.quantity());
        candidate.setPurchasePrice(request.purchasePrice());
        candidate.setSalePrice(request.salePrice());
        candidate.setVatRate(request.vatRate());

        validateProduct(candidate);

        // Ürünü kategori ve adına göre kilitleyerek ara.
        List<Product> matchingProducts =
                productRepository.findByCategoryAndNameForUpdate(
                        candidate.getCategory(),
                        candidate.getName()
                );

        if (matchingProducts.size() > 1) {
            throw new IllegalStateException(
                    "Aynı kategori ve ürün adıyla birden fazla kayıt bulundu."
            );
        }

        // Ürün bulunmadıysa yeni ürün oluştur.
        if (matchingProducts.isEmpty()) {
            return productRepository.save(candidate);
        }

        Product existingProduct = matchingProducts.get(0);

        boolean pricesChanged =
                existingProduct.getPurchasePrice()
                        .compareTo(candidate.getPurchasePrice()) != 0
                || existingProduct.getSalePrice()
                        .compareTo(candidate.getSalePrice()) != 0
                || existingProduct.getVatRate()
                        .compareTo(candidate.getVatRate()) != 0;

        // Fiyatlar değiştiyse kullanıcı onayı olmadan güncelleme yapma.
        if (pricesChanged && !request.updateExistingPrices()) {
            throw new IllegalStateException(
                    "PRICE_UPDATE_CONFIRMATION_REQUIRED"
            );
        }

        // Stok miktarını güvenli biçimde hesapla.
        long newQuantity =
                (long) existingProduct.getStockQuantity()
                        + candidate.getStockQuantity();

        if (newQuantity > Integer.MAX_VALUE) {
            throw new IllegalArgumentException(
                    "Toplam stok miktarı izin verilen sınırı aşıyor."
            );
        }

        existingProduct.setStockQuantity((int) newQuantity);

        // Fiyat değişikliği yalnızca onay verildiğinde uygulanır.
        if (pricesChanged) {
            existingProduct.setPurchasePrice(candidate.getPurchasePrice());
            existingProduct.setSalePrice(candidate.getSalePrice());
            existingProduct.setVatRate(candidate.getVatRate());
        }

        return productRepository.save(existingProduct);
    }

    // Yeni ürün oluştur
    public Product createProduct(Product product) {
        validateProduct(product);
        return productRepository.save(product);
    }

    // Mevcut ürünü güncelle
    public Product updateProduct(Long id, Product updatedProduct) {
        validateProduct(updatedProduct);

        Product existingProduct = getProductById(id);

        existingProduct.setCategory(updatedProduct.getCategory().trim());
        existingProduct.setName(updatedProduct.getName().trim());
        existingProduct.setStockQuantity(updatedProduct.getStockQuantity());
        existingProduct.setPurchasePrice(updatedProduct.getPurchasePrice());
        existingProduct.setSalePrice(updatedProduct.getSalePrice());
        existingProduct.setVatRate(updatedProduct.getVatRate());

        return productRepository.save(existingProduct);
    }

    // Ürün sil
    public void deleteProduct(Long id) {
        Product product = getProductById(id);
        productRepository.delete(product);
    }

    // Ürün bilgilerini doğrula
    private void validateProduct(Product product) {
        if (product == null) {
            throw new IllegalArgumentException(
                    "Ürün bilgileri boş olamaz."
            );
        }

        if (product.getCategory() == null
                || product.getCategory().isBlank()) {
            throw new IllegalArgumentException(
                    "Kategori boş bırakılamaz."
            );
        }

        if (product.getName() == null
                || product.getName().isBlank()) {
            throw new IllegalArgumentException(
                    "Ürün adı boş bırakılamaz."
            );
        }

        if (product.getStockQuantity() == null
                || product.getStockQuantity() < 0) {
            throw new IllegalArgumentException(
                    "Stok miktarı negatif olamaz."
            );
        }

        if (isNegative(product.getPurchasePrice())) {
            throw new IllegalArgumentException(
                    "Alış fiyatı negatif olamaz."
            );
        }

        if (isNegative(product.getSalePrice())) {
            throw new IllegalArgumentException(
                    "Satış fiyatı negatif olamaz."
            );
        }

        if (isNegative(product.getVatRate())) {
            throw new IllegalArgumentException(
                    "KDV oranı negatif olamaz."
            );
        }

        if (product.getPurchasePrice() == null
                || product.getSalePrice() == null
                || product.getVatRate() == null) {
            throw new IllegalArgumentException(
                    "Fiyatlar ve KDV oranı belirtilmelidir."
            );
        }

        if (product.getPurchasePrice().scale() > 2
                || product.getSalePrice().scale() > 2
                || product.getVatRate().scale() > 2) {
            throw new IllegalArgumentException(
                    "Fiyatlar ve KDV oranı en fazla iki ondalık basamak içerebilir."
            );
        }

        if (product.getCategory().trim().length() > 100) {
            throw new IllegalArgumentException(
                    "Kategori en fazla 100 karakter olabilir."
            );
        }

        if (product.getName().trim().length() > 200) {
            throw new IllegalArgumentException(
                    "Ürün adı en fazla 200 karakter olabilir."
            );
        }

        if (product.getVatRate().compareTo(new BigDecimal("100")) > 0) {
            throw new IllegalArgumentException(
                    "KDV oranı %100'den büyük olamaz."
            );
        }

        product.setCategory(product.getCategory().trim());
        product.setName(product.getName().trim());
    }

    private boolean isNegative(BigDecimal value) {
        return value != null
                && value.compareTo(BigDecimal.ZERO) < 0;
    }
}
