const API_BASE_URL = "http://localhost:8080/api";

document.addEventListener("DOMContentLoaded", async () => {
    const statusMessage = document.getElementById("api-status-message");

    try {
        const response = await fetch(`${API_BASE_URL}/products/status`);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const result = await response.json();

        statusMessage.textContent = result.message;
    } catch (error) {
        console.error("Backend bağlantı hatası:", error);

        statusMessage.textContent =
            "Backend bağlantısı kurulamadı. Spring Boot uygulamasını kontrol edin.";
        statusMessage.style.color = "#b42318";
    }
});
