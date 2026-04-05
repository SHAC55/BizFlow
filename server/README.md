# auth

To install dependencies:

```bash
bun install
```

Prisma packages are pinned to `7.2.0` in this server package. After pulling dependency or generated-client changes, rerun install so `generated/prisma` and the installed Prisma runtime stay on the same version.

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.3.5. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.

# API Documentation

All protected routes require authentication.

## Product APIs

### Create Product

`POST /products`

Body:

```json
{
  "name": "Wireless Mouse",
  "category": "Electronics",
  "price": 899,
  "quantity": 25,
  "minimumQuantity": 5,
  "sku": "WM-001"
}
```

### Get Products

`GET /products`

Query params:

```txt
page
limit
category
search
lowStockOnly
```

### Get Product By Id

`GET /products/:id`

### Update Product

`PATCH /products/:id`

### Adjust Product Stock

`POST /products/:id/adjust-stock`

### Get Product Movements

`GET /products/:id/movements`

### Delete Product

`DELETE /products/:id`

## Customer APIs

### Add Customer

`POST /customers`

Body:

```json
{
  "name": "Rahul Sharma",
  "mobile": "9876543210",
  "email": "rahul@example.com",
  "address": "Jaipur, Rajasthan",
  "notes": "Prefers weekend delivery",
  "openingBalance": 2000
}
```

### Get Customers

`GET /customers`

Query params:

```txt
page
limit
search
dueStatus
sortBy
sortOrder
recentOnly
includeArchived
```

### Get Customer By Id

`GET /customers/:id`

Returns profile details with sales history and payment history.

### Update Customer

`PATCH /customers/:id`

### Archive Customer

`POST /customers/:id/archive`

## Business APIs

### Get Business

`GET /business`

### Create Business

`POST /business`

### Update Business

`PATCH /business`
