# 🍽️ Restaurant POS System

A full-stack Restaurant Point of Sale (POS) system built to manage restaurant operations including orders, tables, menu items, inventory, customers, employees, kitchen workflow, invoices, payments, and restaurant settings.

The system provides role-based access for Managers, Cashiers, Waiters, and Chefs, allowing each role to access only the features relevant to their responsibilities.

---

## 🚀 Features

### 📊 Dashboard

- Restaurant overview
- Order statistics
- Sales overview
- Operational information
- Responsive dashboard design

### 🛒 New Orders

- Create dine-in orders
- Create takeaway orders
- Select tables
- Add menu items
- Add item quantities
- Add item notes
- Customer information
- Discount handling based on user role
- Payment method selection
- Payment status handling

### 📋 Orders

- View all orders
- Pagination
- Filter orders by status
- Filter orders by date range
- Display order date and time
- View complete order details
- Update order status
- Update payment status
- Cancel orders
- Refund status handling

### 🧾 Invoices

- Dedicated invoice navigation tab
- Today's invoices displayed by default
- Date range filtering
- Invoice date and time
- Customer information
- Subtotal
- Discount
- GST
- Service charge
- Grand total
- Payment status
- Order status
- Export invoices to CSV
- Download invoice as PDF

### 👨‍🍳 Kitchen

- View incoming orders
- Track order preparation
- Update kitchen order status
- Role-based kitchen access

### 🪑 Tables

- Manage restaurant tables
- View table status
- Assign tables to orders
- Support dine-in workflow

### 🍴 Menu

- Manage restaurant menu
- Menu item information
- Selling prices
- Menu categories
- Item types

### 📦 Inventory

- Manage inventory
- Track stock
- Inventory-related restaurant operations
- Manager and Chef access

### 👥 Customers

- Manage customers
- Customer name
- Customer phone number
- Customer order information

### 👨‍💼 Employees

- Manage restaurant employees
- Role-based access
- Manager-only employee management

### ⚙️ Settings

- Restaurant information
- Restaurant name
- Restaurant logo
- Restaurant initials
- Restaurant configuration

### 📱 Digital / QR Menu

- Public QR-based menu
- Customers can access the menu without logging into the POS
- QR orders are handled separately from authenticated POS orders

---

# 🔐 User Roles

The system currently supports four roles:

| Role | Access |
|------|--------|
| Manager | Full system access |
| Cashier | Orders, payments, customers, tables, menu |
| Waiter | Orders, tables, customers, menu |
| Chef | Kitchen, inventory, orders, menu |

Access is protected at both the frontend and backend levels.

---

# 🏗️ Project Architecture

The application follows a full-stack architecture:

```text
Frontend
   │
   │ HTTP / REST API
   ▼
Backend
   │
   ├── Controllers
   ├── Services
   ├── Routes
   ├── Middleware
   └── Models
        │
        ▼
     MongoDB
