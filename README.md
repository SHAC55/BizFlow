# 🧠 Bizezy – Smart Business & Inventory Management System

## 📌 Overview

Bizezy is a modern business management platform designed to help small businesses manage inventory, track sales, monitor customer transactions, and handle payments efficiently.

It provides a clean dashboard with real-time insights into stock levels, sales, and financial activity.

---

## ✨ Core Features (MVP)

### 📊 Dashboard

* Today’s Sales
* Pending Payments
* Weekly Revenue
* Monthly Revenue
* Product & Inventory Overview
* Expense Tracking

---

### 📦 Inventory Management

* Add Product (Name, Price, Quantity, Min Quantity)
* Auto-generated SKU system
* Low Stock & Critical Alerts
* Stock update functionality
* Inventory tracking system

---

### 💰 Sales & Transaction Tracking

* Create orders
* Add product + quantity
* Automatic total calculation
* Payment status tracking
* Due payments & notifications

---

### 👥 Customer Management

* Store customer details (Name, Number, Email)
* Track orders & payment history
* Credit / Due management
* Customer-based transaction tracking

---

### 💸 Expense Management

* Track business expenses
* Record daily spending
* Dashboard integration

---

## 🧠 How It Works

* Products are stored with quantity and minimum threshold
* System automatically determines:

  * 🟢 In Stock
  * 🟡 Low Stock
  * 🔴 Critical Stock
* Sales reduce inventory automatically
* Customers and payments are linked to transactions

---

## 🛠️ Tech Stack

* **Frontend:** React.js, Tailwind CSS
* **Backend:** Node.js, Express.js
* **Database:** PostgreSQL (Prisma ORM)
* **Tools:** Git, GitHub

---

## ⚙️ Installation

```bash
git clone https://github.com/yourusername/bizezy.git
cd bizezy
npm install
npm run dev
```

---

## 📁 Project Structure

```
src/
 ├── components/
 ├── pages/
 ├── features/
 │    ├── inventory/
 │    ├── customers/
 │    ├── transactions/
 ├── utils/
 └── App.jsx
```

---

## 🚀 Future Improvements

* Barcode / QR scanning
* Multi-user roles (Admin / Staff)
* Notification system (SMS / Email)
* Advanced analytics
* Mobile responsiveness

---

## 🤝 Contributing

Pull requests are welcome. For major changes, please open an issue first.

---

## 📄 License

MIT License
