"use strict";

// HTML elemanları
const productForm = document.getElementById("product-form");
const productTableBody = document.getElementById("product-table-body");
const formMessage = document.getElementById("form-message");
const tableMessage = document.getElementById("table-message");

const categoryInput = document.getElementById("category");
const nameInput = document.getElementById("name");
const stockQuantityInput = document.getElementById("stockQuantity");
const purchasePriceInput = document.getElementById("purchasePrice");
const salePriceInput = document.getElementById("salePrice");
const vatRateInput = document.getElementById("vatRate");

const submitButton = productForm.querySelector(
    'button[type="submit"]'
);

let editingProductId = null;
let lookupTimer = null;
let lookupSequence = 0;

/**
 * Para değerlerini Türk lirası biçiminde gösterir.
 */
function formatCurrency(value) {
    return new Intl.NumberFormat("tr-TR", {
        style: "currency",
        currency: "TRY"
    }).format(value);
}

/**
 * KDV dahil satış fiyatını hesaplar.
 */
function calculateVatIncludedPrice(salePrice, vatRate) {
    return Number(salePrice) * (1 + Number(vatRate) / 100);
}

/**
 * Form mesajını gösterir.
 */
function showFormMessage(message, isError = false) {
    formMessage.textContent = message;
    formMessage.style.color = isError ? "#b42318" : "#18794e";
}

/**
 * Ürünleri backend'den alır ve tabloda gösterir.
 */
async function loadProducts() {
    productTableBody.replaceChildren();

    const loadingRow = document.createElement("tr");
    const loadingCell = document.createElement("td");

    loadingCell.colSpan = 6;
    loadingCell.textContent = "Ürünler yükleniyor...";

    loadingRow.appendChild(loadingCell);
    productTableBody.appendChild(loadingRow);

    try {
        const products = await getProducts();

        productTableBody.replaceChildren();

        if (products.length === 0) {
            const row = document.createElement("tr");
            const cell = document.createElement("td");

            cell.colSpan = 6;
            cell.textContent = "Henüz kayıtlı ürün bulunmuyor.";

            row.appendChild(cell);
            productTableBody.appendChild(row);
            tableMessage.textContent = "";
            return;
        }

        //products.sort((a, b) => a.id - b.id);

        products.forEach((product, index) => {
            const row = document.createElement("tr");

            const vatIncludedPrice = calculateVatIncludedPrice(
                product.salePrice,
                product.vatRate
            );

            const values = [
                (index+1),
                product.category,
                product.name,
                product.stockQuantity,
                formatCurrency(vatIncludedPrice)
            ];

            values.forEach(value => {
                const cell = document.createElement("td");
                cell.textContent = value;
                row.appendChild(cell);
            });

            const actionsCell = document.createElement("td");

            const editButton = document.createElement("button");
            editButton.type = "button";
            editButton.textContent = "Güncelle";
            editButton.className = "btn btn-secondary";

            editButton.addEventListener("click", () => {
                startProductUpdate(product);
            });

            const deleteButton = document.createElement("button");
            deleteButton.type = "button";
            deleteButton.textContent = "Sil";
            deleteButton.className = "btn btn-danger";
            deleteButton.style.marginLeft = "6px";

            deleteButton.addEventListener("click", () => {
                removeProduct(product);
            });

            actionsCell.append(editButton, deleteButton);
            row.appendChild(actionsCell);

            productTableBody.appendChild(row);
        });

        tableMessage.textContent = "";

    } catch (error) {
        console.error("Ürünler yüklenemedi:", error);

        productTableBody.replaceChildren();

        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 7;
        cell.textContent =
            "Ürünler yüklenemedi. Backend bağlantısını kontrol edin.";

        row.appendChild(cell);
        productTableBody.appendChild(row);
    }
}

/**
 * Kategori ve ürün adı girilirken mevcut ürünü arar.
 *
 * Daha önce satılmış bir ürün bulunursa fiyatları ve KDV oranını
 * otomatik doldurur.
 */
async function searchExistingProduct() {
    if (editingProductId !== null) {
        return;
    }

    const category = categoryInput.value.trim();
    const name = nameInput.value.trim();

    const currentSequence = ++lookupSequence;

    clearTimeout(lookupTimer);

    if (!category || !name) {
        return;
    }

    lookupTimer = setTimeout(async () => {
        try {
            const result = await lookupProduct(category, name);

            // Kullanıcı bu sırada farklı bir ürün yazdıysa eski
            // aramanın sonucunu uygulama.
            if (currentSequence !== lookupSequence) {
                return;
            }

            if (!result || !result.product) {
                return;
            }

            const product = result.product;

            if (result.previouslySold) {
                purchasePriceInput.value = product.purchasePrice;
                salePriceInput.value = product.salePrice;
                vatRateInput.value = product.vatRate;

                showFormMessage(
                    `"${product.name}" daha önce satılmış. ` +
                    "Alış fiyatı, satış fiyatı ve KDV otomatik dolduruldu."
                );
            } else {
                showFormMessage(
                    `"${product.name}" adlı ürün zaten kayıtlı. ` +
                    "Fiyatları kontrol ederek stok girişi yapabilirsiniz."
                );
            }

        } catch (error) {
            // 404: Bu kategori ve isimle kayıt bulunamadı.
            // Bu normal bir durumdur; yeni ürün girilebilir.
            if (currentSequence !== lookupSequence) {
                return;
            }

            if (!error.message.includes("404")) {
                console.error("Ürün arama hatası:", error);
            }
        }
    }, 400);
}

// Kategori veya ürün adı değişince arama yap.
categoryInput.addEventListener("input", searchExistingProduct);
nameInput.addEventListener("input", searchExistingProduct);

/**
 * Formdaki sayısal değerleri ve metinleri doğrular.
 */
function validateProduct(product, isEditing) {
    if (!product.category || !product.name) {
        showFormMessage(
            "Kategori ve ürün adı boş bırakılamaz.",
            true
        );
        return false;
    }

    const minimumQuantity = isEditing ? 0 : 1;

    if (!Number.isInteger(product.stockQuantity) ||
        product.stockQuantity < minimumQuantity) {
        showFormMessage(
            isEditing
                ? "Stok miktarı negatif olmayan bir tam sayı olmalıdır."
                : "Stok giriş miktarı en az 1 olmalıdır.",
            true
        );
        return false;
    }

    if (!Number.isFinite(product.purchasePrice) ||
        product.purchasePrice < 0 ||
        !Number.isFinite(product.salePrice) ||
        product.salePrice < 0) {
        showFormMessage(
            "Alış ve satış fiyatları geçerli, negatif olmayan sayılar olmalıdır.",
            true
        );
        return false;
    }

    if (!Number.isFinite(product.vatRate) ||
        product.vatRate < 0 ||
        product.vatRate > 100) {
        showFormMessage(
            "KDV oranı %0 ile %100 arasında olmalıdır.",
            true
        );
        return false;
    }

    return true;
}

/**
 * Fiyat veya KDV değişikliği onaylanırsa mevcut ürüne yeni
 * fiyatlarla stok girişi yapar.
 */
async function handlePriceConflict(stockEntry) {
    const updatePrices = confirm(
        "Mevcut ürünün alış fiyatı, satış fiyatı veya KDV oranı " +
        "değişmiş.\n\n" +
        "Mevcut ürünün fiyatlarını güncelleyip girilen miktar kadar " +
        "stok eklemek istiyor musunuz?"
    );

    if (updatePrices) {
        return enterStock({
            ...stockEntry,
            updateExistingPrices: true
        });
    }

    const changeName = confirm(
        "Mevcut fiyatları güncellemeden devam etmek istiyorsunuz.\n\n" +
        "Ürünü yeni bir kayıt olarak ekleyebilmek için ürün adını " +
        "değiştirmek ister misiniz?"
    );

    if (changeName) {
        showFormMessage(
            "Ürün adını değiştirin. Yeni adla tekrar kaydedebilirsiniz."
        );

        nameInput.focus();
        nameInput.select();

        // Kullanıcı yeni adı girmeden kayıt yapma.
        return null;
    }

    resetProductForm();

    showFormMessage(
        "İşlem iptal edildi. Form temizlendi."
    );

    return null;
}

/**
 * Form gönderildiğinde:
 * - Düzenleme modundaysa mevcut ürünü günceller.
 * - Yeni stok girişiyse mükerrer kayıt kontrolü yapar.
 * - Fiyatlar değişmişse kullanıcıdan onay alır.
 */
productForm.addEventListener("submit", async event => {
    event.preventDefault();

    showFormMessage("");

    const formData = new FormData(productForm);

    const product = {
        category: String(formData.get("category") || "").trim(),
        name: String(formData.get("name") || "").trim(),
        stockQuantity: Number(formData.get("stockQuantity")),
        purchasePrice: Number(formData.get("purchasePrice")),
        salePrice: Number(formData.get("salePrice")),
        vatRate: Number(formData.get("vatRate"))
    };

    const isEditing = editingProductId !== null;

    if (!validateProduct(product, isEditing)) {
        return;
    }

    submitButton.disabled = true;

    try {
        if (isEditing) {
            // Mevcut ürünü düzenleme işlemi.
            await updateProduct(editingProductId, product);

            showFormMessage("Ürün başarıyla güncellendi.");

        } else {
            // Yeni ürün veya mevcut ürüne stok ekleme işlemi.
            const stockEntry = {
                category: product.category,
                name: product.name,
                quantity: product.stockQuantity,
                purchasePrice: product.purchasePrice,
                salePrice: product.salePrice,
                vatRate: product.vatRate,
                updateExistingPrices: false
            };

            try {
                await enterStock(stockEntry);

                showFormMessage("Ürün Başarı ile Stoklandı");

            } catch (error) {
                // Backend fiyat/KDV değişikliği için onay istiyor.
                if (error.status === 409 ||
                    error.message.includes("Fiyat veya KDV değişti")) {

                    const result = await handlePriceConflict(stockEntry);

                    // null: kullanıcı yeni ürün adı girecek veya
                    // işlemi iptal etti; formu burada koru/sonlandır.
                    if (result === null) {
                        return;
                    }

                    showFormMessage(
                        "Fiyatlar güncellendi ve stok başarıyla eklendi."
                    );

                } else {
                    throw error;
                }
            }
        }
        
        resetProductForm();
        await loadProducts();
        showFormMessage("Ürün Başarı ile Stoklandı.");

    } catch (error) {
        console.error("Ürün işlemi başarısız:", error);

        showFormMessage(
            `İşlem başarısız: ${error.message}`,
            true
        );

    } finally {
        submitButton.disabled = false;
    }
});

/**
 * Ürün düzenleme modunu başlatır.
 */
function startProductUpdate(product) {
    // Bekleyen aramaların eski formu değiştirmesini engelle.
    lookupSequence++;
    clearTimeout(lookupTimer);

    editingProductId = product.id;

    categoryInput.value = product.category;
    nameInput.value = product.name;
    stockQuantityInput.value = product.stockQuantity;
    purchasePriceInput.value = product.purchasePrice;
    salePriceInput.value = product.salePrice;
    vatRateInput.value = product.vatRate;

    submitButton.textContent = "Değişiklikleri Kaydet";

    showFormMessage(
        `"${product.name}" düzenleme modunda.`
    );

    productForm.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

/**
 * Formu varsayılan durumuna getirir.
 */
function resetProductForm() {
    lookupSequence++;
    clearTimeout(lookupTimer);

    editingProductId = null;

    productForm.reset();

    vatRateInput.value = "20";

    submitButton.textContent = "Ürünü Kaydet";
}

/**
 * Formun temizlenmesi durumunda düzenleme modunu kapatır.
 */
productForm.addEventListener("reset", () => {
    lookupSequence++;
    clearTimeout(lookupTimer);

    editingProductId = null;

    submitButton.textContent = "Ürünü Kaydet";

    if (formMessage) {
        formMessage.textContent = "";
    }
});

/**
 * Ürünü siler.
 */
async function removeProduct(product) {
    const confirmed = confirm(
        `"${product.name}" ürününü silmek istediğinizden emin misiniz?`
    );

    if (!confirmed) {
        return;
    }

    try {
        await deleteProduct(product.id);

        showFormMessage(`"${product.name}" ürünü silindi.`);

        await loadProducts();

    } catch (error) {
        console.error("Ürün silinemedi:", error);

        showFormMessage(
            `Ürün silinemedi: ${error.message}`,
            true
        );
    }
}

// Sayfa açıldığında ürünleri listele.
loadProducts();