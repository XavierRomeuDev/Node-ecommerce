# 🛒 Node.js E-commerce API

This project is a backend REST API for a simple e-commerce platform built with **Node.js**, **Express**, and **MongoDB**. It supports basic features such as product management, user registration/login, and order processing.

## 📁 Project Structure

- `server.js`: Entry point of the application.
- `routes/`: Contains route definitions for products, users, and orders.
- `controllers/`: Logic that handles incoming requests.
- `models/`: Mongoose models for MongoDB collections.
- `middleware/`: Contains authentication and error-handling middleware.
- `config/`: Configuration for database and environment variables.

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or later)
- [MongoDB](https://www.mongodb.com/)
- npm or yarn

### Installation

1. Clone the repository:

   git clone https://github.com/XavierRomeuDev/Node-ecommerce.git
   
2. Navigate into the project directory:

   cd Node-ecommerce

3. Install the dependencies:

   npm install

4. Create a .env file in the root directory with the following content:

   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_secret_key
  
5. Running the Server

   npm start
   The API will be running at http://localhost:5000.

## 🛠️ Features
  - User registration and authentication with JWT.
  - Product CRUD operations.
  - Order creation and retrieval.
  - Secure routes using middleware.
  - MongoDB database integration with Mongoose.

## 📬 API Endpoints (examples)
  - POST /api/users/register – Register new user
  - POST /api/users/login – Login
  - GET /api/products – Get all products
  - POST /api/orders – Create new order (authenticated)

## 🤝 Contributing
  Feel free to fork this repo and submit pull requests! Bug reports and feature suggestions are welcome via issues.

## 📄 License
  This project is licensed under the MIT License – see the LICENSE file for details.
