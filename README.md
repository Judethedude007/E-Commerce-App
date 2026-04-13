<div align="center">

# 🛍️ E-Commerce App — Second-Hand Store with Bidding

### A full-stack marketplace to buy, sell, and bid on second-hand goods

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-Database-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-Images-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)](https://cloudinary.com/)
[![Vite](https://img.shields.io/badge/Vite-Build-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)

</div>

---

## 📖 Table of Contents

- [About](#-about)
- [Features](#-features)
- [Tech Stack](#️-tech-stack)
- [Project Structure](#-project-structure)
- [Database Schema](#-database-schema)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Endpoints](#-api-endpoints)
- [How It Works](#-how-it-works)
- [Contributing](#-contributing)

---

## 🧭 About

**E-Commerce App** is a full-stack second-hand marketplace where users can list items for sale, place bids, chat with sellers, and manage a personal wallet — all in one place. Built with React on the frontend and Node.js + MySQL on the backend, it mirrors the core functionality of real-world platforms like eBay.

---

## 🚀 Features

| Feature | Description |
|---|---|
| 🔐 **Authentication** | Email/password sign-up & login, plus Google OAuth via Passport.js |
| 📦 **Product Listings** | Add, edit, delete listings with image uploads (Cloudinary) |
| 🔨 **Bidding System** | Place bids on items; wallet balance is locked per bid |
| 💰 **Wallet** | Top-up & use your in-app wallet for bidding and purchases |
| ❤️ **Wishlist** | Save favourite items to your personal wishlist |
| 💬 **Messaging / Chat** | Real-time-style chat between buyers and sellers per product |
| ⭐ **Seller Ratings** | Rate sellers after a transaction to build trust |
| 📊 **Stats Dashboard** | Sellers can view performance stats for their listings |
| 🔍 **Search** | Search products across all categories |
| 📂 **Categories** | Browse items by product category |
| 📱 **Responsive UI** | Fully responsive design using Tailwind CSS |

---

## 🛠️ Tech Stack

### Frontend
| Technology | Role |
|---|---|
| [React 19](https://react.dev/) | UI framework |
| [Vite](https://vitejs.dev/) | Build tool & dev server |
| [React Router DOM v7](https://reactrouter.com/) | Client-side routing |
| [Tailwind CSS v4](https://tailwindcss.com/) | Utility-first styling |
| [Axios](https://axios-http.com/) | HTTP client |
| [Lucide React](https://lucide.dev/) / [React Icons](https://react-icons.github.io/react-icons/) | Icon libraries |

### Backend
| Technology | Role |
|---|---|
| [Node.js](https://nodejs.org/) | Runtime |
| [Express.js](https://expressjs.com/) | Web framework |
| [MySQL2](https://www.npmjs.com/package/mysql2) | Database driver |
| [Passport.js + Google OAuth 2.0](http://www.passportjs.org/) | Google login |
| [Cloudinary](https://cloudinary.com/) + [Multer](https://github.com/expressjs/multer) | Image upload & storage |
| [dotenv](https://github.com/motdotla/dotenv) | Environment config |

### Database
| Technology | Role |
|---|---|
| [MySQL](https://www.mysql.com/) | Relational database |

---

## 📁 Project Structure

```
E-Commerce-App/
├── FrontEnd/                  # React + Vite application
│   ├── src/
│   │   ├── Components/        # Reusable UI components
│   │   │   ├── Navbar.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── ProductDetails.jsx
│   │   │   ├── Productlisting.jsx
│   │   │   ├── CategorySection.jsx
│   │   │   ├── SearchBar.jsx
│   │   │   ├── wishlist.jsx
│   │   │   ├── seller.jsx
│   │   │   ├── WalletDropdown.jsx
│   │   │   ├── DummyPayment.jsx
│   │   │   ├── Footer.jsx
│   │   │   └── AboutUs.jsx
│   │   ├── pages/             # Page-level components
│   │   │   ├── Homepage.jsx
│   │   │   ├── Signin.jsx
│   │   │   ├── Sellitems.jsx
│   │   │   └── ProductMsg.jsx
│   │   ├── config/
│   │   │   └── apiBase.js     # Centralised API base URL
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── BackEnd/                   # Node.js + Express API
│   ├── models/                # Route handlers (one file per resource)
│   │   ├── signin.js          # User registration
│   │   ├── login.js           # User login
│   │   ├── product.js         # Get all products
│   │   ├── addproduct.js      # Add new product
│   │   ├── productDetails.js  # Single product detail
│   │   ├── edit.js            # Edit product
│   │   ├── delete.js          # Delete product
│   │   ├── bid.js             # Bid management
│   │   ├── bidbalance.js      # Bid with wallet balance
│   │   ├── wallet.js          # Wallet operations
│   │   ├── wishlist.js        # View wishlist
│   │   ├── iwishlist.js       # Add to wishlist
│   │   ├── dwishlist.js       # Remove from wishlist
│   │   ├── message.js         # Send message
│   │   ├── history.js         # Chat history
│   │   ├── markmsg.js         # Mark messages as read
│   │   ├── productBuyers.js   # List buyers per product
│   │   ├── unseenMsgCount.js  # Unseen message count
│   │   ├── seller.js          # Seller info
│   │   ├── seller-profile.js  # Seller profile page
│   │   ├── sellerproduct.js   # Seller's product list
│   │   ├── userproduct.js     # User's own products
│   │   ├── rate.js            # Rate a seller
│   │   ├── userRating.js      # Get user rating
│   │   ├── stats.js           # Seller statistics
│   │   ├── time.js            # Bid countdown timer
│   │   ├── getUserId.js       # Resolve user ID
│   │   └── database.js        # MySQL connection
│   ├── auth/
│   │   └── googleAuth.js      # Passport Google OAuth
│   ├── config/
│   │   └── cloudinary.js      # Cloudinary config
│   ├── middleware/
│   │   └── multer.js          # Multer file upload middleware
│   └── server.js              # Express app entry point
│
└── dd.sql                     # Database schema
```

---

## 🗃️ Database Schema

The MySQL database (`ecommerce`) contains the following tables:

```
users         — registered user accounts
categories    — product categories
products      — item listings (linked to users & categories)
orders        — placed orders
order_items   — individual items within an order
cart          — shopping cart entries
reviews       — product ratings and comments
```

To initialise the database, run:

```bash
mysql -u root -p < dd.sql
```

---

## 🏁 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) ≥ 18
- [MySQL](https://www.mysql.com/) ≥ 8
- A [Cloudinary](https://cloudinary.com/) account (free tier works)
- A [Google Cloud](https://console.cloud.google.com/) project with OAuth 2.0 credentials

### 1. Clone the repository

```bash
git clone https://github.com/Judethedude007/E-Commerce-App.git
cd E-Commerce-App
```

### 2. Set up the database

```bash
mysql -u root -p < dd.sql
```

### 3. Configure the backend

```bash
cd BackEnd
cp .env.example .env   # fill in your values (see below)
npm install
npm run dev            # starts on http://localhost:8081
```

### 4. Configure the frontend

```bash
cd ../FrontEnd
cp .env.example .env   # fill in VITE_API_BASE_URL (see Environment Variables below)
npm install
npm run dev            # starts on http://localhost:5173
```

---

## 🔑 Environment Variables

### Backend — create a `.env` file inside `BackEnd/`

```env
# MySQL
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=ecommerce

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:8081/auth/google/callback

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Session
SESSION_SECRET=your_session_secret
```

### Frontend — create a `.env` file inside `FrontEnd/` (copy from `FrontEnd/.env.example`)

```env
# Backend API base URL — no trailing slash
# Local development:
VITE_API_BASE_URL=http://localhost:8081
# Production (replace with your deployed backend URL):
# VITE_API_BASE_URL=https://your-new-backend.onrender.com
```

> **Note:** The `VITE_` prefix is required by [Vite](https://vitejs.dev/guide/env-and-mode) so the variable is exposed to browser code. The value is read in `FrontEnd/src/config/apiBase.js`.

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/signin` | Register a new user |
| POST | `/login` | Login with email & password |
| GET | `/auth/google` | Google OAuth login |
| GET | `/products` | List all products |
| POST | `/add-product` | Add a new product listing |
| GET | `/product/:id` | Get product details |
| PUT | `/update-item/:id` | Edit a product |
| DELETE | `/delete-item/:id` | Delete a product |
| GET | `/user-products` | Get current user's listings |
| GET | `/seller-products` | Get a specific seller's listings |
| POST | `/bid` | Place a bid |
| POST | `/place-bid` | Place bid using wallet balance |
| GET / POST | `/wallet` | Get / top-up wallet |
| GET | `/wishlist` | View wishlist |
| POST | `/iwishlist` | Add to wishlist |
| DELETE | `/dwishlist` | Remove from wishlist |
| POST | `/send-message` | Send a chat message |
| GET | `/chat` | Get chat history |
| POST | `/mark-read` | Mark messages as read |
| GET | `/product-buyers` | List buyers for a product |
| GET | `/unseen-msg-count` | Count unseen messages |
| GET | `/seller` | Get seller info |
| GET | `/seller-profile` | Get seller profile |
| POST | `/rate-seller` | Rate a seller |
| GET | `/user-rating` | Get user's average rating |
| GET | `/stats` | Seller statistics |
| GET | `/time` | Bid expiry timer |
| GET | `/get-userid` | Resolve user ID from token |

---

## 🏪 How It Works

```
1. Sign Up / Log In
   └─ Register with email & password, or sign in with Google

2. Browse & Search
   └─ View all listings, filter by category, or use the search bar

3. Place a Bid
   └─ Top up your wallet → place a bid → wait for the auction timer
   └─ Highest bid when time expires wins the item

4. Chat with Sellers
   └─ Open a product → start a conversation with the seller

5. Manage Your Listings
   └─ Sellers can add new items with images, set a starting price and auction timer
   └─ Edit or delete existing listings from the seller dashboard

6. Wishlist
   └─ Save items you're interested in for later

7. Ratings & Stats
   └─ Rate sellers after a transaction
   └─ Sellers can review their performance statistics
```

---

## 🤝 Contributing

Contributions are very welcome!

1. **Fork** the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a **Pull Request**

---

<div align="center">

Made with ❤️ by [Judethedude007](https://github.com/Judethedude007)

</div>
