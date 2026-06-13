# GrocBuket - Local Store Ordering App

This project is a mobile ordering system designed for local mom-and-pop stores (general stores / Kirana stores) to let their neighborhood customers place orders from home instead of using paper lists or messy WhatsApp messages. The app tracks order statuses (Pending, Packed, Out for Delivery, Delivered) and keeps records of customer balances through a digital credit (Khata) ledger.

This project is currently under active development.

## Tech Stack

- **Frontend (Mobile):** React Native Expo (JavaScript) with Safe Area Context and AsyncStorage.
- **Backend:** Node.js with Express.
- **Database:** MongoDB with Mongoose ODM.
- **Authentication:** JSON Web Tokens (JWT) with bcryptjs password hashing.

---

## Getting Started

### 1. Database
Make sure you have a local MongoDB server running. The backend is configured to automatically seed test accounts and catalog items on startup if the database is empty.

### 2. Backend
Run the backend Express server:
```bash
cd Backend
npm install
npm start
```
The server will run on `http://localhost:3001`.

### 3. Mobile Client
Run the Expo developer tools:
```bash
cd Mobile
npm install
npm start
```
To test on a physical device:
1. Download **Expo Go** on your iOS or Android phone.
2. Connect both your phone and computer to the same Wi-Fi network.
3. Scan the QR code displayed in the terminal.
*(If you need to test in your web browser instead, press `w` in the terminal).*

---

## Demo Credentials

You can use these pre-seeded accounts to log in and test the application flows:

### Customer Dashboard
- **Phone Number:** `1234567890`
- **Password:** `password`
Allows browsing categories, adding items to the cart, choosing payment methods (Cash or Credit/Khata), submitting orders, and tracking status.

### Shopkeeper Dashboard
- **Phone Number:** `0987654321`
- **Password:** `password`
Allows tracking incoming orders, changing order delivery stages, adjusting item stock/pricing, and recording ledger cash collections.
