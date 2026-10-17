// Ürün talepleri ekranının JavaScript kodu

// Para veya tarih formatından bağımsız olarak talep tarihini gösterir.
function formatRequestDate(dateValue) {
    if (!dateValue) {
        return "-";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return dateValue;
    }

    return new Intl.DateTimeFormat("tr-TR", {
        dateStyle: "short",
        timeStyle: "short"
    }).format(date);
}

// Kullanıcıya işlem mesajı gösterir.
function showRequestMessage(message, type = "info", isError = false) {
    const messageElement = document.getElementById("request-message");

    messageElement.textContent = message;
    messageElement.dataset.type = type;
    messageElement.style.color = isError ? "#b42318" : "#18794e";
}

// Güvenli biçimde tablo hücresi oluşturur.
function createRequestCell(value) {
    const cell = document.createElement("td");
    cell.textContent = value;
    return cell;
}

// Ürün taleplerini backend API'sinden getirir.
async function loadRequests() {
    const tableBody = document.getElementById("request-list");

    tableBody.replaceChildren();

    const loadingRow = document.createElement("tr");
    const loadingCell = createRequestCell("Talepler yükleniyor...");
    loadingCell.colSpan = 6;
    loadingRow.appendChild(loadingCell);
    tableBody.appendChild(loadingRow);

    try {
        const requests = await apiRequest("/product-requests");

        tableBody.replaceChildren();

        if (!Array.isArray(requests) || requests.length === 0) {
            const row = document.createElement("tr");
            const cell = createRequestCell("Henüz ürün talebi bulunmuyor.");
            cell.colSpan = 6;
            row.appendChild(cell);
            tableBody.appendChild(row);
            return;
        }

        requests.forEach((request, index) => {
            const row = document.createElement("tr");

            row.appendChild(createRequestCell(index + 1));
            row.appendChild(createRequestCell(request.category));
            row.appendChild(createRequestCell(request.productName));
            row.appendChild(createRequestCell(request.requestedQuantity));
            row.appendChild(
                createRequestCell(formatRequestDate(request.requestedAt))
            );

            const actionCell = document.createElement("td");
            const deleteButton = document.createElement("button");

            deleteButton.type = "button";
            deleteButton.className = "btn btn-danger";
            deleteButton.textContent = "Sil";

            deleteButton.addEventListener("click", () => {
                deleteRequest(request);
            });

            actionCell.appendChild(deleteButton);
            row.appendChild(actionCell);

            tableBody.appendChild(row);
        });

    } catch (error) {
        tableBody.replaceChildren();

        const row = document.createElement("tr");
        const cell = createRequestCell("Ürün talepleri yüklenemedi.");
        cell.colSpan = 6;
        row.appendChild(cell);
        tableBody.appendChild(row);

        showRequestMessage(
            `Talep listesi yüklenirken hata oluştu: ${error.message}`,
            "error", true
        );
    }
}

// Yeni ürün talebi oluşturur.
async function createRequest(event) {
    event.preventDefault();

    const categoryInput = document.getElementById("category");
    const productNameInput = document.getElementById("productName");
    const quantityInput = document.getElementById("requestedQuantity");
    const submitButton = document.getElementById("request-submit-button");

    const category = categoryInput.value.trim();
    const productName = productNameInput.value.trim();
    const requestedQuantity = Number(quantityInput.value);

    if (!category || !productName) {
        showRequestMessage(
            "Kategori ve ürün adı boş bırakılamaz.",
            "error", true
        );
        return;
    }

    if (
        !Number.isInteger(requestedQuantity) ||
        requestedQuantity <= 0
    ) {
        showRequestMessage(
            "Talep miktarı pozitif bir tam sayı olmalıdır.",
            "error", true
        );
        quantityInput.focus();
        return;
    }

    submitButton.disabled = true;

    try {
        const result = await apiRequest("/product-requests", {
            method: "POST",
            body: JSON.stringify({
                category,
                productName,
                requestedQuantity
            })
        });

        showRequestMessage(
            `Ürün talebi başarıyla oluşturuldu.`,
            "success", false
        );

        document.getElementById("request-form").reset();

        await loadRequests();

    } catch (error) {
        showRequestMessage(
            `Ürün talebi oluşturulamadı: ${error.message}`,
            "error", true
        );
    } finally {
        submitButton.disabled = false;
    }
}

// Ürün talebini siler.
async function deleteRequest(request) {
    const confirmed = confirm(
        `"${request.productName}" ürün talebini silmek istiyor musunuz?`
    );

    if (!confirmed) {
        return;
    }

    try {
        await apiRequest(`/product-requests/${request.id}`, {
            method: "DELETE"
        });

        showRequestMessage(
            "Ürün talebi başarıyla silindi.",
            "success", false
        );

        await loadRequests();

    } catch (error) {
        showRequestMessage(
            `Ürün talebi silinemedi: ${error.message}`,
            "error", true
        );
    }
}

// Form gönderimini dinle.
document.addEventListener("DOMContentLoaded", () => {
    const requestForm = document.getElementById("request-form");

    requestForm.addEventListener("submit", createRequest);

    loadRequests();
});