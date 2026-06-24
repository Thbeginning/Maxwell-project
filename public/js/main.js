// General utilities
document.addEventListener('DOMContentLoaded', async () => {
    updateCartCount();
});

async function updateCartCount() {
    const countEl = document.getElementById('cart-count');
    if (countEl) {
        const cart = await window.api.getCart();
        countEl.textContent = cart.length;
    }
}

// Utility to mask PII
function maskPII(text) {
    if (!text) return '';
    return '*'.repeat(Math.max(text.length - 4, 0)) + text.slice(-4);
}

// Safe DOM insertion function to prevent XSS (following SecureCoder skills)
function safelySetText(elementId, text) {
    const el = document.getElementById(elementId);
    if (el) {
        el.textContent = text;
    }
}
