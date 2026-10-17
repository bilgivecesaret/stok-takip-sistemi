// Satış ekranındaki ürünler
let products = [];

// Para birimini Türk lirası biçiminde gösterir.
function formatCurrency(value) {
    return new Intl.NumberFormat("tr-TR", {
        style: "currency",
        currency: "TRY"
    }).format(value);
}

// KDV dâhil birim satış fiyatını hesaplar.
function calculateVatIncludedPrice(salePrice, vatRate) {
    return Number(salePrice) * (1 + Number(vatRate) / 100);
}

// Kullanıcıya mesaj gösterir.
function showSalesMessage(message, type = "info", isError = false) {
    const messageElement = document.getElementById("sales-message");

    messageElement.textContent = message;
    messageElement.dataset.type = type;
    messageElement.style.color = isError ? "#b42318" : "#18794e";
}

// HTML tablosunda metinleri güvenli biçimde gösterir.
function createCell(value) {
    const cell = document.createElement("td");
    cell.textContent = value;
    return cell;
}

// Ürün listesini backend API'sinden getirir.
async function loadSalesProducts() {
    const tableBody = document.getElementById("sales-product-list");

    tableBody.replaceChildren();

    const loadingRow = document.createElement("tr");
    const loadingCell = createCell("Ürünler yükleniyor...");
    loadingCell.colSpan = 7;
    loadingRow.appendChild(loadingCell);
    tableBody.appendChild(loadingRow);

    try {
        products = await getProducts();

        tableBody.replaceChildren();

        if (!Array.isArray(products) || products.length === 0) {
            const row = document.createElement("tr");
            const cell = createCell("Satış yapılabilecek ürün bulunamadı.");
            cell.colSpan = 7;
            row.appendChild(cell);
            tableBody.appendChild(row);
            return;
        }

        products.forEach((product, index) => {
            const row = document.createElement("tr");

            const vatIncludedPrice = calculateVatIncludedPrice(
                product.salePrice,
                product.vatRate
            );

            row.appendChild(createCell(index + 1));
            row.appendChild(createCell(product.category));
            row.appendChild(createCell(product.name));
            row.appendChild(createCell(formatCurrency(vatIncludedPrice)));

            // Satış miktarı alanı
            const quantityCell = document.createElement("td");
            const quantityInput = document.createElement("input");

            quantityInput.type = "number";
            quantityInput.min = "1";
            quantityInput.step = "1";
            quantityInput.value = "1";
            quantityInput.id = `quantity-${product.id}`;
            quantityInput.setAttribute(
                "aria-label",
                `${product.name} satış miktarı`
            );

            if (product.stockQuantity <= 0) {
                quantityInput.disabled = true;
            }

            quantityInput.addEventListener("input", () => {
                updateSalesSummary(product.id);
            });

            quantityCell.appendChild(quantityInput);
            row.appendChild(quantityCell);

            // Toplam tutar alanı
            const totalCell = createCell(
                formatCurrency(
                    product.stockQuantity > 0 ? vatIncludedPrice : 0
                )
            );
            totalCell.id = `total-${product.id}`;
            row.appendChild(totalCell);

            // Satış düğmesi
            const actionCell = document.createElement("td");
            const sellButton = document.createElement("button");

            sellButton.type = "button";
            sellButton.className = "btn btn-primary";
            sellButton.textContent = "Satışı Gerçekleştir";

            sellButton.addEventListener("click", () => {
                sellProduct(product.id);
            });

            actionCell.appendChild(sellButton);
            row.appendChild(actionCell);

            tableBody.appendChild(row);
        });

        showSalesMessage("Ürünler başarıyla yüklendi.", "success", false);

    } catch (error) {
        tableBody.replaceChildren();

        const row = document.createElement("tr");
        const cell = createCell("Ürünler yüklenemedi.");
        cell.colSpan = 8;
        row.appendChild(cell);
        tableBody.appendChild(row);

        showSalesMessage(
            `Backend bağlantısı veya ürün yükleme hatası: ${error.message}`,
            "error", true
        );
    }
}

// Ürün seçimi ve miktarına göre toplam tutarı günceller.
function updateSalesSummary(productId) {
    const product = products.find(item => item.id === productId);

    if (!product) {
        return;
    }

    const quantityInput = document.getElementById(`quantity-${productId}`);
    const totalCell = document.getElementById(`total-${productId}`);

    const quantity = Number(quantityInput.value);

    const unitPrice = calculateVatIncludedPrice(
        product.salePrice,
        product.vatRate
    );

    const validQuantity =
        Number.isInteger(quantity) &&
        quantity > 0 &&
        quantity <= product.stockQuantity;

    totalCell.textContent = formatCurrency(
        validQuantity ? unitPrice * quantity : 0
    );

    document.getElementById("selected-product").textContent =
        product.category + " / " + product.name;

    document.getElementById("selected-quantity").textContent =
        validQuantity ? String(quantity) : "0";

    document.getElementById("selected-total").textContent =
        formatCurrency(validQuantity ? unitPrice * quantity : 0);

    showSalesMessage("", "info", false);
}

// Satış işlemini backend API'sine gönderir.
async function sellProduct(productId) {
    const product = products.find(item => item.id === productId);

    if (!product) {
        showSalesMessage("Ürün bulunamadı.", "error", true);
        return;
    }

    // Stok tükenmişse ürün talebi oluşturma işlemi.
    if (product.stockQuantity <= 0) {
        const createRequest = confirm(
            "Bu ürünün stoğu tükenmiştir. Ürün talebi oluşturmak ister misiniz?"
        );

        if (!createRequest) {
            showSalesMessage("Ürün talebi oluşturulmadı.", "info", false);
            return;
        }

        const requestedQuantity = prompt(
            `${product.category} / ${product.name}\n` +
            "Talep etmek istediğiniz ürün miktarını girin:"
        );

        // Kullanıcı giriş penceresini iptal etti.
        if (requestedQuantity === null) {
            showSalesMessage("Ürün talebi iptal edildi.", "info", false);
            return;
        }

        const quantity = Number(requestedQuantity);

        if (!Number.isInteger(quantity) || quantity <= 0) {
            showSalesMessage(
                "Talep miktarı pozitif bir tam sayı olmalıdır.",
                "error", true
            );
            return;
        }

        try {
            showSalesMessage("Ürün talebi oluşturuluyor...", "info", false);

            const result = await createProductRequest({
                category: product.category,
                productName: product.name,
                requestedQuantity: quantity
            });

            showSalesMessage(
                `Ürün talebi başarıyla oluşturuldu. ` +
                `Ürün: ${product.name}, Talep miktarı: ${quantity} adet.`,
                "success", false
            );

            console.log("Oluşturulan ürün talebi:", result);

        } catch (error) {
            showSalesMessage(
                `Ürün talebi oluşturulamadı: ${error.message}`,
                "error", true
            );
        }

        return;
    }

    // Normal satış işlemleri.
    const quantityInput = document.getElementById(`quantity-${productId}`);
    const quantity = Number(quantityInput.value);

    if (!Number.isInteger(quantity) || quantity <= 0) {
        showSalesMessage(
            "Satış miktarı pozitif bir tam sayı olmalıdır.",
            "error", true
        );
        quantityInput.focus();
        return;
    }

    if (quantity > product.stockQuantity) {
        showSalesMessage(
            `Yetersiz stok! Mevcut stok: ${product.stockQuantity} adet.`,
            "error", true
        );
        quantityInput.focus();
        return;
    }

    const unitPrice = calculateVatIncludedPrice(
        product.salePrice,
        product.vatRate
    );

    const total = unitPrice * quantity;

    const confirmed = confirm(
        `${product.name}\n` +
        `Miktar: ${quantity}\n` +
        `KDV dâhil toplam: ${formatCurrency(total)}\n\n` +
        "Satışı gerçekleştirmek istiyor musunuz?"
    );

    if (!confirmed) {
        return;
    }

    try {
        showSalesMessage("Satış işlemi gerçekleştiriliyor...", "info", false);

        const result = await apiRequest("/sales", {
            method: "POST",
            body: JSON.stringify({
                productId: product.id,
                quantity: quantity
            })
        });

        showSalesMessage(
            `${result.message} Toplam: ${formatCurrency(result.vatIncludedTotal)}`,
            "success", false
        );

        document.getElementById("selected-product").textContent =
            "Henüz ürün seçilmedi.";

        document.getElementById("selected-quantity").textContent = "0";
        document.getElementById("selected-total").textContent =
            formatCurrency(0);

        await loadSalesProducts();

    } catch (error) {
        showSalesMessage(
            `Satış gerçekleştirilemedi: ${error.message}`,
            "error", true
        );

        // Stok başka bir işlem sırasında değişmiş olabilir.
        await loadSalesProducts();
    }
}

/**
 * Yeni ürün talebi oluşturur.
 */
async function createProductRequest(productRequest) {
    return apiRequest("/product-requests", {
        method: "POST",
        body: JSON.stringify(productRequest)
    });
}

// Sayfa açıldığında ürünleri yükle.
document.addEventListener("DOMContentLoaded", loadSalesProducts);