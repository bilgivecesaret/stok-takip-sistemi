"use strict";

const API_BASE_URL = "http://localhost:8080/api";

/**
 * Backend API'sine HTTP isteği gönderir.
 * JSON yanıtlarını okur ve hataları yönetir.
 */
async function apiRequest(endpoint, options = {}) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...options.headers
        }
    });

    if (!response.ok) {
        let message = `İstek başarısız. HTTP ${response.status}`;

        try {
            const errorBody = await response.json();

            message =
                errorBody.detail ||
                errorBody.message ||
                errorBody.title ||
                errorBody.error ||
                message;
        } catch {
            // JSON olmayan hata yanıtlarında varsayılan mesaj kullanılır.
        }

        const error = new Error(message);
        error.status = response.status;
        throw error;
    }

    // 204 No Content yanıtlarında JSON okunmaz.
    if (response.status === 204) {
        return null;
    }

    return response.json();
}

/**
 * Kayıtlı ürünleri listeler.
 */
async function getProducts() {
    return apiRequest("/products");
}

/**
 * Kategori ve ürün adına göre kayıt arar.
 *
 * Sonuç:
 * {
 *   product: { ... },
 *   previouslySold: true veya false
 * }
 */
async function lookupProduct(category, name) {
    const params = new URLSearchParams({
        category: category.trim(),
        name: name.trim()
    });

    return apiRequest(`/products/lookup?${params.toString()}`);
}

/**
 * Yeni ürün oluşturur.
 * Mevcut ürünün stok girişini birleştirmek için değil,
 * standart ürün oluşturma işlemleri için kullanılabilir.
 */
async function createProduct(product) {
    return apiRequest("/products", {
        method: "POST",
        body: JSON.stringify(product)
    });
}

/**
 * Yeni stok girişi yapar.
 *
 * Backend mevcut ürünü bulursa stok miktarını artırır.
 * Fiyat veya KDV değişikliği için updateExistingPrices
 * alanı kullanılır.
 */
async function enterStock(stockEntry) {
    return apiRequest("/products/stock-entry", {
        method: "POST",
        body: JSON.stringify(stockEntry)
    });
}

/**
 * Mevcut ürünü günceller.
 */
async function updateProduct(id, product) {
    return apiRequest(`/products/${id}`, {
        method: "PUT",
        body: JSON.stringify(product)
    });
}

/**
 * Ürünü siler.
 */
async function deleteProduct(id) {
    return apiRequest(`/products/${id}`, {
        method: "DELETE"
    });
}