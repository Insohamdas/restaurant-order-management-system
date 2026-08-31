# Harvest Kitchen - Restaurant Food Ordering System

A clean, lightweight, and complete **Java Full-Stack Restaurant Food Ordering System** for **Harvest Kitchen** designed for demonstration and portfolio showcase.

---

## 1. Overview

This project implements an end-to-end online food ordering platform for **Harvest Kitchen** consisting of:
1. **Customer Website**: Responsive web application for customers to browse the menu, filter by category, search dishes, manage a shopping cart, place delivery orders, and track order progress in real time.
2. **Admin Website**: Management dashboard for restaurant staff to manage food menu catalog, toggle food stock availability, view live customer orders, inspect order items, and update order fulfillment statuses.
3. **Spring Boot REST API**: High-performance Java backend delivering RESTful services, database persistence via JPA / Hibernate, validation, and price calculation.
4. **MySQL Database**: Central relational database holding food items, orders, and order items.

---

## 2. Architecture

```text
                    ┌─────────────────────────┐
                    │     MySQL Database      │
                    │      restaurant_db      │
                    └────────────▲────────────┘
                                 │
                                 │ JPA / Hibernate
                                 │
                    ┌────────────┴────────────┐
                    │    Java Spring Boot     │
                    │      REST API (8080)    │
                    └────────────▲────────────┘
                                 │
                 ┌───────────────┴───────────────┐
                 │                               │
                 │                               │
       ┌─────────┴──────────┐          ┌─────────┴──────────┐
       │  CUSTOMER WEBSITE  │          │   ADMIN WEBSITE    │
       │                    │          │                    │
       │   HTML5 / CSS3     │          │   HTML5 / CSS3     │
       │   Vanilla JS       │          │   Vanilla JS       │
       │   Fetch API        │          │   Fetch API        │
       └────────────────────┘          └────────────────────┘
```

> **Single Backend + Single Database Architecture**: Both frontend interfaces communicate directly with the same Spring Boot REST API and read/write to the same MySQL database.

---

## 3. Technology Stack

### Backend
* **Java 17+ / 21+**
* **Spring Boot 3.3.x**
* **Spring Web (REST Controllers)**
* **Spring Data JPA (Hibernate ORM)**
* **Bean Validation (Hibernate Validator)**
* **MySQL Connector/J**
* **Apache Maven**

### Database
* **MySQL 8.0+ / 9.x** (Database: `restaurant_db`)

### Frontend
* **HTML5 (Semantic Layouts)**
* **CSS3 (Custom responsive styling, light theme, CSS variables)**
* **Vanilla JavaScript (ES6+, Fetch API, LocalStorage)**

---

## 4. Project Structure

```text
Restaurant Food Ordering System/
│
├── backend/
│   ├── pom.xml
│   └── src/
│       ├── main/
│       │   ├── java/com/restaurant/
│       │   │   ├── RestaurantApplication.java
│       │   │   ├── config/
│       │   │   │   ├── CorsConfig.java
│       │   │   │   └── DataInitializer.java
│       │   │   ├── controller/
│       │   │   │   ├── DashboardController.java
│       │   │   │   ├── FoodController.java
│       │   │   │   └── OrderController.java
│       │   │   ├── dto/
│       │   │   │   ├── CreateOrderRequest.java
│       │   │   │   ├── DashboardStatsResponse.java
│       │   │   │   ├── FoodRequest.java
│       │   │   │   ├── FoodResponse.java
│       │   │   │   ├── OrderItemRequest.java
│       │   │   │   ├── OrderItemResponse.java
│       │   │   │   ├── OrderResponse.java
│       │   │   │   └── UpdateOrderStatusRequest.java
│       │   │   ├── entity/
│       │   │   │   ├── FoodItem.java
│       │   │   │   ├── Order.java
│       │   │   │   ├── OrderItem.java
│       │   │   │   └── OrderStatus.java
│       │   │   ├── exception/
│       │   │   │   ├── BadRequestException.java
│       │   │   │   ├── GlobalExceptionHandler.java
│       │   │   │   └── ResourceNotFoundException.java
│       │   │   ├── repository/
│       │   │   │   ├── FoodItemRepository.java
│       │   │   │   ├── OrderItemRepository.java
│       │   │   │   └── OrderRepository.java
│       │   │   └── service/
│       │   │       ├── FoodService.java
│       │   │       ├── FoodServiceImpl.java
│       │   │       ├── OrderService.java
│       │   │       └── OrderServiceImpl.java
│       │   │
│       │   └── resources/
│       │       └── application.properties
│       │
│       └── test/
│           └── java/com/restaurant/
│               └── RestaurantApplicationTests.java
│
├── customer/
│   ├── images/
│   │   ├── logo.png
│   │   └── logo2.png
│   ├── index.html
│   ├── menu.html
│   ├── cart.html
│   ├── checkout.html
│   ├── order-success.html
│   ├── track-order.html
│   ├── css/
│   │   └── style.css
│   └── js/
│       ├── api.js
│       ├── cart.js
│       ├── cart-page.js
│       ├── checkout.js
│       ├── menu.js
│       └── tracking.js
│
├── admin/
│   ├── images/
│   │   └── logo.png
│   ├── login.html
│   ├── dashboard.html
│   ├── menu-management.html
│   ├── order-management.html
│   ├── order-details.html
│   ├── css/
│   │   └── admin.css
│   └── js/
│       ├── api.js
│       ├── auth.js
│       ├── dashboard.js
│       ├── login.js
│       ├── menu-management.js
│       ├── order-details.js
│       └── order-management.js
│
├── logo.png
├── logo2.png
└── README.md
```

---

## 5. Database Setup

1. Start your local MySQL server.
2. Create the database `restaurant_db`:
   ```sql
   CREATE DATABASE IF NOT EXISTS restaurant_db;
   ```
3. Update `backend/src/main/resources/application.properties` with your MySQL credentials:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/restaurant_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
   spring.datasource.username=root
   spring.datasource.password=YOUR_PASSWORD
   ```
4. Spring Boot Data JPA automatically generates tables (`food_items`, `orders`, `order_items`) and populates 12 sample Indian food items on startup via `DataInitializer.java`.

---

## 6. REST API Endpoints

### Food Management (`/api/foods`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/foods` | List all foods (supports `?category=Pizza` and `?availableOnly=true`) |
| `GET` | `/api/foods/{id}` | Get food item details by ID |
| `POST` | `/api/foods` | Create a new food item |
| `PUT` | `/api/foods/{id}` | Update existing food item |
| `DELETE` | `/api/foods/{id}` | Delete a food item |

### Order Processing (`/api/orders`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/orders` | Place a new customer order (calculates true total on backend) |
| `GET` | `/api/orders` | Retrieve all orders (sorted newest first) |
| `GET` | `/api/orders/{id}` | Retrieve single order details with item breakdown |
| `PUT` | `/api/orders/{id}/status` | Update order status (`PLACED`, `CONFIRMED`, `PREPARING`, `OUT_FOR_DELIVERY`, `DELIVERED`, `CANCELLED`) |

### Dashboard Analytics (`/api/dashboard`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/dashboard/stats` | Aggregate count metrics (`totalOrders`, `pendingOrders`, `completedOrders`, `totalFoodItems`) |

---

## 7. Demo Admin Credentials

* **Username**: `admin`
* **Password**: `admin123`

> **Note**: *This authentication mechanism is intended for student demonstration and portfolio purposes and is not production-grade authentication.*

---

## 8. How to Run

### Step 1: Start MySQL Server
Ensure MySQL is running on port 3306.

### Step 2: Run the Spring Boot Backend
Open a terminal in the project root:
```bash
cd backend
mvn spring-boot:run
```
The REST API will start at `http://localhost:8080`.

### Step 3: Run the Frontend Server
Open a second terminal in the project root:
```bash
python3 -m http.server 5500
```

### Step 4: Access the Websites
* **Customer Website**: [http://localhost:5500/customer/](http://localhost:5500/customer/)
* **Admin Website**: [http://localhost:5500/admin/](http://localhost:5500/admin/)

---

## 9. End-to-End Testing Flow

### Customer Flow
1. Visit `http://localhost:5500/customer/` - verify landing page and popular dishes load from backend.
2. Go to **Menu** - filter by category (e.g. `Pizza`, `Burger`, `Main Course`) and search.
3. Click **+ Add to Cart** on items.
4. Open **Cart** - modify quantities `+`/`-`, check automatic subtotal and delivery fee computation.
5. Proceed to **Checkout** - enter Customer Name, Phone, Delivery Address, click **Place Order**.
6. On **Order Success** page, note the generated Order ID (e.g. `#1`).
7. Click **Track Order** - view real-time timeline status.

### Admin Flow
1. Visit `http://localhost:5500/admin/` and login with `admin` / `admin123`.
2. Inspect **Dashboard** - verify metrics reflect live database counts.
3. Go to **Menu Management** - add a new food item, edit prices, toggle availability.
4. Go to **Order Management** - see the customer order placed in the customer flow.
5. Click **View & Manage** - inspect itemized breakdown and update status to `PREPARING` or `OUT_FOR_DELIVERY`.
6. Refresh Customer **Track Order** page - verify updated status displays instantly.

---

## 10. Future Improvements
* Spring Security with JWT token-based authentication.
* Online payment gateway integration (Razorpay / Stripe).
* WebSocket support for instant real-time status push notifications.
* Customer profile & past order history lookup.
