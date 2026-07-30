# NexusCart - Role-Based E-Commerce Platform

This is a full-stack e-commerce web application built for the developer internship task.

## Stack Used
- **Frontend**: React (Vite), Vanilla CSS, React Router DOM, Axios, Lucide React, Razorpay Checkout.
- **Backend**: Node.js, Express.js, MongoDB (Mongoose), Cloudinary, Multer, Razorpay Node SDK, JWT, bcrypt.
- **Deployment**: Vercel (Frontend), Render (Backend).

## Deployment Instructions

### Backend (Render)
1. Push this repository to GitHub.
2. Go to [Render](https://render.com) and create a new **Web Service**.
3. Connect your GitHub repository.
4. Set the **Root Directory** to `backend`.
5. Build Command: `npm install`
6. Start Command: `npm start`
7. Add all environment variables from `.env.example` in the Render dashboard.

### Frontend (Vercel)
1. Go to [Vercel](https://vercel.com) and select **Add New Project**.
2. Import the GitHub repository.
3. Set the **Framework Preset** to Vite.
4. **Root Directory**: `frontend`
5. Add environment variables:
   - `VITE_API_URL=<your-render-backend-url>/api`
   - `VITE_RAZORPAY_KEY_ID=<your-razorpay-key>`
6. Click **Deploy**.

## Setup Instructions

### Backend Setup
1. Navigate to the `backend` directory.
2. Run `npm install`.
3. Create a `.env` file based on `.env.example` and fill in your MongoDB URI, Cloudinary keys, Razorpay keys, and JWT Secret.
4. Run `npm run dev` to start the server on `localhost:5000`.

### Frontend Setup
1. Navigate to the `frontend` directory.
2. Run `npm install`.
3. Create a `.env` file with:
   - `VITE_API_URL=http://localhost:5000/api`
   - `VITE_RAZORPAY_KEY_ID=your_razorpay_key_id`
4. Run `npm run dev` to start the Vite development server.

## Features & Role Credentials

The application enforces Role-Based Access Control (RBAC) on both the frontend UI and backend API.

### 1. Admin
- **Permissions**: Full control. Manage all products, view all orders, see basic sales statistics.
- **Test Login**: Create a new account and set the role to 'Admin' in the registration dropdown.

### 2. Sales Person
- **Permissions**: Add, edit, and delete **only their own products**. View orders that contain their products.
- **Test Login**: Create a new account and set the role to 'Sales Person'.

### 3. User
- **Permissions**: Browse, search, filter products. Manage wishlist and cart. View own order history.
- **Test Login**: Create a new account and set the role to 'Regular User'.

## Highlights
- **Premium Aesthetics**: Built entirely with Vanilla CSS using glassmorphism, modern typography (Outfit), and micro-animations to create a visually stunning experience.
- **Secure Image Uploads**: Product images are uploaded directly to Cloudinary using in-memory buffering.
- **Payment Integration**: End-to-end test payment flow using Razorpay with backend signature verification.

## Screenshots
*(Add your screenshots here)*
