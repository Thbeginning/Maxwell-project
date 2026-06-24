const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Helpers
const dataDir = process.env.VERCEL ? '/tmp' : path.join(__dirname, 'data');

const ensureDataExists = (filename) => {
    const targetPath = path.join(dataDir, filename);
    const sourcePath = path.join(__dirname, 'data', filename);
    if (!fs.existsSync(targetPath)) {
        if (fs.existsSync(sourcePath)) {
            fs.copyFileSync(sourcePath, targetPath);
        } else {
            fs.writeFileSync(targetPath, '[]');
        }
    }
    return targetPath;
};

const readData = (filename) => {
    try {
        const filePath = ensureDataExists(filename);
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (e) {
        return [];
    }
};

const writeData = (filename, data) => {
    const filePath = ensureDataExists(filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

// Initialize Seats if empty
const initializeSeats = () => {
    const seatsFile = ensureDataExists('seats.json');
    if (readData('seats.json').length === 0) {
        const stadiums = readData('stadiums.json');
        let seats = [];
        let seatId = 1;
        stadiums.forEach(stadium => {
            const sections = ['A', 'B', 'C'];
            sections.forEach(section => {
                for (let row = 1; row <= 5; row++) {
                    for (let num = 1; num <= 10; num++) {
                        seats.push({
                            id: seatId++,
                            stadium_id: stadium.id,
                            section,
                            row,
                            number: num,
                            status: 'available' // available, booked
                        });
                    }
                }
            });
        });
        writeData('seats.json', seats);
    }
};

initializeSeats();

// --- API ROUTES ---

// Stadiums
app.get('/api/stadiums', (req, res) => {
    res.json(readData('stadiums.json'));
});

app.post('/api/stadiums', (req, res) => {
    const stadiums = readData('stadiums.json');
    const newStadium = { id: Date.now(), ...req.body };
    stadiums.push(newStadium);
    writeData('stadiums.json', stadiums);
    res.json(newStadium);
});

// Matches
app.get('/api/matches', (req, res) => {
    const matches = readData('matches.json');
    const { stadium_id } = req.query;
    if (stadium_id) {
        res.json(matches.filter(m => m.stadium_id == stadium_id));
    } else {
        res.json(matches);
    }
});

app.post('/api/matches', (req, res) => {
    const matches = readData('matches.json');
    const newMatch = { id: Date.now(), ...req.body };
    matches.push(newMatch);
    writeData('matches.json', matches);
    res.json(newMatch);
});

// Seats
app.get('/api/seats', (req, res) => {
    const seats = readData('seats.json');
    const { stadium_id } = req.query;
    if (stadium_id) {
        res.json(seats.filter(s => s.stadium_id == stadium_id));
    } else {
        res.json(seats);
    }
});

// Cart
app.get('/api/cart', (req, res) => {
    res.json(readData('cart.json'));
});

app.post('/api/cart', (req, res) => {
    const cart = readData('cart.json');
    const newItem = { id: Date.now(), ...req.body };
    cart.push(newItem);
    writeData('cart.json', cart);
    res.json(newItem);
});

app.delete('/api/cart/:id', (req, res) => {
    let cart = readData('cart.json');
    cart = cart.filter(item => item.id != req.params.id);
    writeData('cart.json', cart);
    res.json({ success: true });
});

app.post('/api/cart/clear', (req, res) => {
    writeData('cart.json', []);
    res.json({ success: true });
});

// Bookings
app.post('/api/bookings', (req, res) => {
    const bookings = readData('bookings.json');
    const cart = readData('cart.json');
    const seats = readData('seats.json');

    const newBooking = {
        id: Date.now(),
        booking_ref: crypto.randomBytes(4).toString('hex').toUpperCase(),
        created_at: new Date().toISOString(),
        items: cart,
        ...req.body
    };

    // Update seat status
    cart.forEach(cartItem => {
        const seat = seats.find(s => s.id == cartItem.seat_id);
        if (seat) seat.status = 'booked';
    });

    bookings.push(newBooking);
    writeData('bookings.json', bookings);
    writeData('seats.json', seats);
    writeData('cart.json', []); // clear cart after booking

    res.json({ success: true, booking: newBooking });
});

app.get('/api/bookings', (req, res) => {
    res.json(readData('bookings.json'));
});

if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}

module.exports = app;
