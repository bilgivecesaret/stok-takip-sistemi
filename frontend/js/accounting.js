"use strict";

const accountingList = document.getElementById("accounting-list");
const accountingMessage = document.getElementById("accounting-message");
const totalQuantityElement = document.getElementById("total-quantity");
const totalProfitElement = document.getElementById("total-profit");
const totalProfitWordsElement = document.getElementById("total-profit-words");

const currencyFormatter = new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
});

function formatCurrency(amount) {
    return currencyFormatter.format(amount);
}

function formatDate(dateValue) {
    if (!dateValue) {
        return "-";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return "-";
    }

    return new Intl.DateTimeFormat("tr-TR", {
        dateStyle: "short",
        timeStyle: "short"
    }).format(date);
}

function createCell(value) {
    const cell = document.createElement("td");
    cell.textContent = value;
    return cell;
}

/*
 * Tutarı Türkçe yazıya dönüştürür.
 * Örnek: 72,00 TL -> YETMİŞ İKİ TÜRK LİRASI
 */
function numberToTurkishWords(number) {
    const ones = [
        "SIFIR", "BİR", "İKİ", "ÜÇ", "DÖRT",
        "BEŞ", "ALTI", "YEDİ", "SEKİZ", "DOKUZ"
    ];

    const tens = [
        "", "ON", "YİRMİ", "OTUZ", "KIRK",
        "ELLİ", "ALTMIŞ", "YETMİŞ", "SEKSEN", "DOKSAN"
    ];

    function underThousand(value) {
        let result = "";

        const hundreds = Math.floor(value / 100);
        const remainder = value % 100;

        if (hundreds > 0) {
            if (hundreds === 1) {
                result += "YÜZ ";
            } else {
                result += ones[hundreds] + " YÜZ ";
            }
        }

        const ten = Math.floor(remainder / 10);
        const one = remainder % 10;

        if (ten > 0) {
            result += tens[ten] + " ";
        }

        if (one > 0) {
            result += ones[one] + " ";
        }

        return result.trim();
    }

    function integerToWords(value) {
        if (value === 0) {
            return "SIFIR";
        }

        if (!Number.isSafeInteger(value) || value < 0) {
            throw new Error("Tutar geçerli bir pozitif tam sayı olmalıdır.");
        }

        const groups = [
            { value: 1000000000000, name: "TRİLYON" },
            { value: 1000000000, name: "MİLYAR" },
            { value: 1000000, name: "MİLYON" },
            { value: 1000, name: "BİN" },
            { value: 1, name: "" }
        ];

        const parts = [];
        let remaining = value;

        for (const group of groups) {
            const count = Math.floor(remaining / group.value);

            if (count > 0) {
                if (group.value === 1000 && count === 1) {
                    parts.push("BİN");
                } else {
                    const words = underThousand(count);

                    parts.push(
                        group.name ? `${words} ${group.name}` : words
                    );
                }

                remaining %= group.value;
            }
        }

        return parts.join(" ").replace(/\s+/g, " ").trim();
    }

    const roundedAmount = Math.round((number + Number.EPSILON) * 100);
    const lira = Math.floor(roundedAmount / 100);
    const kurus = roundedAmount % 100;

    let result = `${integerToWords(lira)} TÜRK LİRASI`;

    if (kurus > 0) {
        result += ` ${integerToWords(kurus)} KURUŞ`;
    }

    return result;
}

function calculateSale(sale) {
    const quantity = Number(sale.quantity);
    const purchasePrice = Number(sale.purchasePrice);
    const salePrice = Number(sale.salePrice);
    const vatRate = Number(sale.vatRate);

    const purchasePriceWithVat =
        purchasePrice * (1 + vatRate / 100);

    const salePriceWithVat =
        salePrice * (1 + vatRate / 100);

    const profit =
        (salePriceWithVat - purchasePriceWithVat) * quantity;

    return {
        quantity,
        purchasePriceWithVat,
        salePriceWithVat,
        profit
    };
}

function showMessage(message, isError = false) {
    accountingMessage.textContent = message;
    accountingMessage.style.color = isError ? "#b42318" : "#18794e";
}

async function loadAccounting() {
    accountingList.replaceChildren();

    const loadingRow = document.createElement("tr");
    const loadingCell = createCell("Satış kayıtları yükleniyor...");
    loadingCell.colSpan = 8;
    loadingRow.appendChild(loadingCell);
    accountingList.appendChild(loadingRow);

    try {
        const sales = await apiRequest("/sales");

        accountingList.replaceChildren();

        if (!Array.isArray(sales) || sales.length === 0) {
            const row = document.createElement("tr");
            const cell = createCell("Henüz satış kaydı bulunmuyor.");
            cell.colSpan = 8;
            row.appendChild(cell);
            accountingList.appendChild(row);

            totalQuantityElement.textContent = "0";
            totalProfitElement.textContent = formatCurrency(0);
            totalProfitWordsElement.textContent = "SIFIR TÜRK LİRASI";

            showMessage("Gösterilecek satış kaydı bulunmuyor.");
            return;
        }

        let totalQuantity = 0;
        let totalProfit = 0;

        sales.forEach((sale, index) => {
            const calculated = calculateSale(sale);

            totalQuantity += calculated.quantity;
            totalProfit += calculated.profit;

            const row = document.createElement("tr");

            row.appendChild(createCell(String(index + 1)));
            row.appendChild(createCell(formatDate(sale.soldAt)));
            row.appendChild(createCell(sale.category ?? "-"));
            row.appendChild(createCell(sale.productName ?? "-"));
            row.appendChild(createCell(String(calculated.quantity)));
            row.appendChild(
                createCell(formatCurrency(calculated.purchasePriceWithVat))
            );
            row.appendChild(
                createCell(formatCurrency(calculated.salePriceWithVat))
            );
            row.appendChild(
                createCell(formatCurrency(calculated.profit))
            );

            accountingList.appendChild(row);
        });

        // Para hesaplamalarında ekranda iki ondalık basamak gösterilir.
        totalProfit = Math.round((totalProfit + Number.EPSILON) * 100) / 100;

        totalQuantityElement.textContent =
            totalQuantity.toLocaleString("tr-TR");

        totalProfitElement.textContent = formatCurrency(totalProfit);

        totalProfitWordsElement.textContent =
            numberToTurkishWords(totalProfit);

        showMessage(`${sales.length} satış kaydı listelendi.`);
    } catch (error) {
        accountingList.replaceChildren();

        const row = document.createElement("tr");
        const cell = createCell("Satış kayıtları yüklenemedi.");
        cell.colSpan = 8;
        row.appendChild(cell);
        accountingList.appendChild(row);

        showMessage(
            `Muhasebe kayıtları yüklenemedi: ${error.message}`,
            true
        );
    }
}

document.addEventListener("DOMContentLoaded", loadAccounting);