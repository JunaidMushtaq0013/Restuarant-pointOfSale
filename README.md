# Warisoft POS

Warisoft POS is a full-stack restaurant point-of-sale system for managing orders, billing, tables, menu items, inventory, customers, employees, and kitchen operations.

## Features

- Dashboard with restaurant activity and sales summaries
- New Order workflow for dine-in and takeaway orders
- Order tracking from pending through preparing, ready, served, or cancelled
- Kitchen display for updating order progress
- Restaurant table management with available, occupied, reserved, and inactive states
- Menu and category management
- Inventory and low-stock tracking
- Customer records and order history
- Employee and role-based access management
- Restaurant settings, branding, billing, GST, and service-charge configuration
- Cash and Razorpay online payments
- Invoice printing from order details
- Responsive layouts for desktop and mobile
- Icon-based row actions across list and table views

## Technology Stack

### Frontend

- React 19
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Axios
- React Icons
- Recharts

### Backend

- Node.js
- Express 5
- TypeScript
- MongoDB with Mongoose
- JWT authentication
- Zod validation
- Razorpay payments
- Cloudinary uploads

## Project Structure

```text
warisoft-POS/
├── backend/       Express API and database services
├── frontend/      React web application
└── README.md
```

## Requirements

- Node.js 24 or newer
- npm
- MongoDB database
- Razorpay account for online payments
- Cloudinary account for image uploads, if menu or branding uploads are used

## Installation

Install dependencies in both applications:

```bash
cd backend
npm install

cd ../frontend
npm install
```

## Environment Variables

Create `backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/warisoft-pos
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=1d
FRONTEND_URL=http://localhost:5173

RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret

CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_RAZORPAY_KEY_ID=your-razorpay-key-id
```

Never commit real secrets to the repository.

## Running Locally

Start the backend in one terminal:

```bash
cd backend
npm run dev
```

Start the frontend in another terminal:

```bash
cd frontend
npm run dev
```

The frontend runs at `http://localhost:5173` and the API runs at `http://localhost:5000` by default.

## User Roles

| Role    | Main permissions                                                                                                                   |
| ------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Manager | Full operational access, employee/menu/category/inventory management, payments, discounts, and settings                            |
| Cashier | Create orders, collect cash or online payments, and apply discounts up to 10%                                                      |
| Waiter  | Create pending orders, manage assigned order/table workflow, and update service status; cannot collect payments or apply discounts |
| Chef    | View kitchen orders and update preparation status                                                                                  |

## Discounts and Payments

- Managers and Cashiers can apply discounts in New Order.
- Managers and Cashiers can apply or change discounts while collecting payment in Order Details.
- The maximum discount is 10%.
- The displayed total updates immediately when the discount changes.
- Existing discounts are preserved when a pending order is paid later.
- Discounts are recalculated from the original subtotal, so they are never applied twice.
- Waiters cannot see payment controls and cannot create paid orders.
- Backend authorization enforces the same rules as the frontend.
- Razorpay payment creation and verification are restricted to Managers and Cashiers.

## Available Scripts

### Frontend

```bash
npm run dev       # Start Vite development server
npm run build     # Type-check and create production build
npm run lint      # Run ESLint
npm run preview   # Preview the production build
```

### Backend

```bash
npm run dev         # Start API with watch mode
npm run build       # Compile TypeScript
npm run start       # Start compiled API
npm run type-check  # Run TypeScript without emitting files
npm test            # Run backend tests
```

## Validation

The current implementation has been verified with:

- Frontend production build
- Backend TypeScript build
- Backend test suite
- Git diff whitespace validation



## API Overview

The backend API is mounted under `/api` and includes endpoints for:

- `/auth`
- `/categories`
- `/customers`
- `/dashboard`
- `/employees`
- `/inventory`
- `/menu`
- `/orders`
- `/payments`
- `/settings`
- `/tables`

Protected endpoints require the authenticated JWT token. Role permissions are enforced by backend authorization middleware.

## Security Notes

- Keep JWT and payment secrets server-side.
- Use HTTPS in production.
- Configure `FRONTEND_URL` to the deployed frontend origin.
- Do not rely on frontend visibility checks alone; backend role middleware also validates protected actions.
