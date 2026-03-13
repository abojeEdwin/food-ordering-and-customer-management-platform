# Food Ordering and Customer Management Platform

Backend API for a food ordering system with customer authentication (OTP verification), cart and order flow, and admin product/order management.

## Tech Stack
- Node.js + Express
- MongoDB + Mongoose
- Redis (cache, rate limiting store, OTP TTL, pub/sub, streams)
- BullMQ (background jobs)
- Joi (request validation for auth routes)
- JWT authentication
- Mailjet (OTP email)
- Docker + Docker Compose

## Implemented Features
- Customer signup, OTP verification, login, and OTP resend
- Role model with `customer` and `admin` users
- Category and food item management (admin endpoints)
- Product browsing and search
- Cart management (add/view/remove/clear)
- Order placement, cancellation, payment simulation
- Order status transitions (`pending -> confirmed -> preparing -> out_for_delivery -> delivered`)
- Security middleware: `helmet`, CORS, Mongo sanitize, XSS clean, compression, rate limiting

## Project Structure
```text
.
├── app/
│   ├── app.js
│   ├── server.js
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── model/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── validations/
│   └── Dockerfile
├── docker-compose.yml
├── entity-relation-diagram/
└── flow-diagram/
```

## Environment Variables
Create `app/.env`:

```env
NODE_ENV=development
PORT=3000
MONGO_URI=mongodb://mongo:27017/food-ordering-app
REDIS_HOST=redis
REDIS_PORT=6379
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1d
ADMIN_EMAIL=admin@chukskitchen.com
ADMIN_PASSWORD=admin123
EMAIL_HOST=smtp.mailjet.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USERNAME=your_mailjet_api_key
EMAIL_PASSWORD=your_mailjet_secret_key
EMAIL_FROM_NAME=Chuks Kitchen
EMAIL_FROM_ADDRESS=hello@yourdomain.com
REDIS_URL=redis://localhost:6379
CACHE_TTL_SECONDS=60
OTP_TTL_SECONDS=600
EMAIL_QUEUE_ENABLED=false
ORDER_QUEUE_ENABLED=false
REDIS_SUBSCRIBER_ENABLED=false
```

## Run With Docker
From repository root:

```bash
docker compose up --build
```

API base URL:
- `http://localhost:3000/api/v1`

## Run Locally (Without Docker)
1. Start MongoDB and Redis locally.
2. Set `MONGO_URI` and Redis values for local services.
3. Install and run:

```bash
cd app
npm install
npm run dev
```
4. (Optional) start workers:

```bash
cd app
npm run worker:email
npm run worker:order
```

## API Endpoints
Base path: `/api/v1`

### Auth
- `POST /auth/signup` - register customer (sends OTP)
- `POST /auth/verify-otp` - verify account with OTP
- `POST /auth/login` - login and receive JWT
- `POST /auth/resend-otp` - resend OTP
- `POST /auth/logout` - logout and invalidate token

### Admin
- `POST /admin/categories` - create category
- `POST /admin/food-items` - add food item
- `PATCH /admin/food-items/:foodItemId` - update food item
- `PATCH /admin/food-items/:foodItemId/unavailable` - mark unavailable
- `DELETE /admin/food-items/:foodItemId` - remove food item
- `GET /admin/categories/:categoryId/products` - list category products
- `GET /admin/products?name=...` - search products by name
- `PATCH /admin/orders/:orderId` - update order status
- `GET /admin/orders` - list all orders

### Customer
- `GET /customer/food` - browse food (`?search=` and `?category=`)
- `POST /customer/cart` - add item to cart
- `GET /customer/cart` - view cart
- `DELETE /customer/cart/items/:foodItemId` - remove cart item
- `DELETE /customer/cart` - clear cart
- `POST /customer/orders` - place order
- `PATCH /customer/orders/:orderId/cancel` - cancel pending order
- `POST /customer/orders/:orderId/pay` - simulate payment

## Notes About Current Implementation
- `admin` and `customer` routes are currently not protected by auth middleware in routing.
- Customer controllers expect `req.user.id`; until auth middleware is re-enabled on customer routes, those endpoints will fail at runtime.
- Redis is used for rate limiting, caching, OTP TTLs, order events (pub/sub + streams), and queues.
- `npm run seed:admin` references `./config/config.env` in code, but that file does not exist in this repository by default.

## Architecture Assets
- ER diagram: `entity-relation-diagram/food-ordering-system.drawio.png`
- Flow diagram: `flow-diagram/SystemDesign.png`
