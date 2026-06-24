# Match Ticket Booking System

## Overview
This project is a web-based ticket booking system that allows users to browse stadiums, find matches, and book seats. It features an intuitive user interface for seamless ticket purchasing and an admin panel for managing the system.

## How the Site Works

The application operates using a frontend-backend architecture:

1.  **Frontend (User Interface):**
    *   **Browsing:** Users start on the homepage (`index.html`) where they can navigate to view available stadiums and matches.
    *   **Selection:** When a user selects a match, they are taken to the seat selection page. Here, they can see an interactive layout of available and booked seats for different sections (A, B, C) and rows.
    *   **Cart & Checkout:** Selected seats are added to a shopping cart. The user can then proceed to checkout, provide their details, and complete the booking. A unique booking reference is generated upon success.
    *   **Admin Panel:** There is an admin interface (`admin.html`) to manage stadiums and matches, providing a simple way to update the system's offerings.

2.  **Backend (Server & Data):**
    *   **Server:** A Node.js backend using the Express framework handles all the business logic. It provides API endpoints for the frontend to fetch data and submit bookings.
    *   **Database:** Instead of a traditional database, the system uses JSON files (located in the `data` folder) to store information about stadiums, matches, seats, carts, and bookings. This makes the project lightweight and easy to run locally. When a user books a seat, the server updates the `seats.json` to mark it as 'booked' and saves the order details in `bookings.json`.

## Hosting & Deployment

**Frontend Hosting (Vercel)**
Currently, only the **frontend** of this application is hosted online using **Vercel**. 
The hosting is linked directly to this GitHub repository. This means any updates pushed to the `main` branch on GitHub will automatically trigger Vercel to rebuild and deploy the latest frontend changes. 

*(Note: Since the backend relies on local JSON files for its database, the full dynamic functionality including the API and data persistence requires the Node.js server to be running. The live Vercel link serves the static HTML/CSS/JS frontend interface).*

## Running Locally
To run the full application (frontend + backend) on your local machine:
1. Ensure you have [Node.js](https://nodejs.org/) installed.
2. Clone this repository.
3. Open your terminal in the project directory and install dependencies:
   `npm install`
4. Start the server:
   `node server.js`
5. Open your browser and navigate to `http://localhost:3000`.
