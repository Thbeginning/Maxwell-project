const API_BASE = '/api';

// Fallback Mock Data in case the Node server is not running
const fallbackData = {
    stadiums: [
        { id: 1, name: "Estadio Azteca", city: "Mexico City", country: "Mexico", capacity: 83264, image: "images/stadiums/azteca.jpg" },
        { id: 2, name: "MetLife Stadium", city: "New York/New Jersey", country: "USA", capacity: 82500, image: "images/stadiums/metlife.jpg" },
        { id: 3, name: "BMO Field", city: "Toronto", country: "Canada", capacity: 30000, image: "images/stadiums/bmo.jpg" },
        { id: 4, name: "Wembley Stadium", city: "London", country: "UK", capacity: 90000, image: "images/stadiums/wembley.jpg" },
        { id: 5, name: "Maracanã", city: "Rio de Janeiro", country: "Brazil", capacity: 78838, image: "images/stadiums/maracana.jpg" },
        { id: 6, name: "Lusail Stadium", city: "Lusail", country: "Qatar", capacity: 88966, image: "images/stadiums/lusail.jpg" }
    ],
    matches: [
        { id: 1, home_team: "Mexico", away_team: "Germany", date: "2026-06-11", time: "14:00", stadium_id: 1, ticket_prices: { VIP: 500, Regular: 200, Economy: 100 } },
        { id: 2, home_team: "USA", away_team: "England", date: "2026-06-12", time: "16:00", stadium_id: 2, ticket_prices: { VIP: 600, Regular: 250, Economy: 120 } },
        { id: 3, home_team: "Canada", away_team: "France", date: "2026-06-13", time: "18:00", stadium_id: 3, ticket_prices: { VIP: 400, Regular: 180, Economy: 80 } },
        { id: 4, home_team: "England", away_team: "Spain", date: "2026-06-15", time: "20:00", stadium_id: 4, ticket_prices: { VIP: 800, Regular: 300, Economy: 150 } },
        { id: 5, home_team: "Brazil", away_team: "Argentina", date: "2026-06-16", time: "17:00", stadium_id: 5, ticket_prices: { VIP: 450, Regular: 200, Economy: 90 } },
        { id: 6, home_team: "Qatar", away_team: "Japan", date: "2026-06-17", time: "19:00", stadium_id: 6, ticket_prices: { VIP: 700, Regular: 280, Economy: 130 } }
    ],
    generateSeats: (stadium_id) => {
        let seats = [];
        let seatId = stadium_id * 1000;
        ['A', 'B', 'C'].forEach(section => {
            for (let row = 1; row <= 5; row++) {
                for (let num = 1; num <= 10; num++) {
                    seats.push({ id: seatId++, stadium_id: parseInt(stadium_id), section, row, number: num, status: 'available' });
                }
            }
        });
        return seats;
    }
};

const getLocalCart = () => JSON.parse(localStorage.getItem('wc_cart') || '[]');
const saveLocalCart = (cart) => localStorage.setItem('wc_cart', JSON.stringify(cart));
const getLocalBookings = () => JSON.parse(localStorage.getItem('wc_bookings') || '[]');
const saveLocalBookings = (bookings) => localStorage.setItem('wc_bookings', JSON.stringify(bookings));

const api = {
    async fetchWithFallback(url, fallbackDataFn) {
        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error('Network response was not ok');
            return await res.json();
        } catch (error) {
            console.warn(`Backend fetch failed for ${url}. Using local fallback data.`);
            return fallbackDataFn();
        }
    },
    async getStadiums() {
        return this.fetchWithFallback(`${API_BASE}/stadiums`, () => fallbackData.stadiums);
    },
    async getMatches(stadiumId = '') {
        const url = stadiumId ? `${API_BASE}/matches?stadium_id=${stadiumId}` : `${API_BASE}/matches`;
        return this.fetchWithFallback(url, () => {
            if (stadiumId) return fallbackData.matches.filter(m => m.stadium_id == stadiumId);
            return fallbackData.matches;
        });
    },
    async getSeats(stadiumId = '') {
        const url = stadiumId ? `${API_BASE}/seats?stadium_id=${stadiumId}` : `${API_BASE}/seats`;
        return this.fetchWithFallback(url, () => fallbackData.generateSeats(stadiumId || 1));
    },
    async getCart() {
        return this.fetchWithFallback(`${API_BASE}/cart`, getLocalCart);
    },
    async addToCart(item) {
        try {
            const res = await fetch(`${API_BASE}/cart`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(item)
            });
            if (!res.ok) throw new Error('Network error');
            return await res.json();
        } catch (e) {
            const cart = getLocalCart();
            item.id = Date.now();
            cart.push(item);
            saveLocalCart(cart);
            return item;
        }
    },
    async removeFromCart(id) {
        try {
            const res = await fetch(`${API_BASE}/cart/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Network error');
            return await res.json();
        } catch (e) {
            let cart = getLocalCart();
            cart = cart.filter(item => item.id != id);
            saveLocalCart(cart);
            return { success: true };
        }
    },
    async clearCart() {
        try {
            const res = await fetch(`${API_BASE}/cart/clear`, { method: 'POST' });
            if (!res.ok) throw new Error('Network error');
            return await res.json();
        } catch (e) {
            saveLocalCart([]);
            return { success: true };
        }
    },
    async createBooking(bookingData) {
        try {
            const res = await fetch(`${API_BASE}/bookings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bookingData)
            });
            if (!res.ok) throw new Error('Network error');
            return await res.json();
        } catch (e) {
            const bookings = getLocalBookings();
            const cart = getLocalCart();
            const newBooking = {
                id: Date.now(),
                booking_ref: Math.random().toString(36).substring(2, 8).toUpperCase(),
                created_at: new Date().toISOString(),
                items: cart,
                ...bookingData
            };
            bookings.push(newBooking);
            saveLocalBookings(bookings);
            saveLocalCart([]); // Clear cart
            return { success: true, booking: newBooking };
        }
    },
    // Admin CRUD Fallbacks
    async createStadium(data) {
        // Mock success for offline
        return { success: true };
    },
    async createMatch(data) {
        return { success: true };
    },
    async getBookings() {
        return this.fetchWithFallback(`${API_BASE}/bookings`, getLocalBookings);
    }
};

window.api = api;
