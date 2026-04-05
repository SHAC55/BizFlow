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

  GET /products

  Query params:

  page
  limit
  category
  search
  lowStockOnly

  ### Get Low Stock Products

  GET /products/low-stock

  Query params:

  page
  limit
  category
  search

  ### Get Product By Id

  GET /products/:id

  ### Update Product

  PATCH /products/:id

  ### Adjust Product Stock

  POST /products/:id/adjust-stock

  Body examples:

  Increase stock:
```json
  {
    "type": "INCREASE",
    "quantity": 10,
    "reason": "restock",
    "notes": "new shipment"
  }
```
  Decrease stock:
```json
  {
    "type": "DECREASE",
    "quantity": 2,
    "reason": "damaged items",
    "notes": "box torn in transit"
  }
```

  Set stock:
```json
  {
    "type": "SET",
    "quantity": 20,
    "reason": "manual correction",
    "notes": "inventory recount"
  }
```
  ### Get Product Movements

  GET /products/:id/movements

  ### Delete Product

  DELETE /products/:id

  ## Customer APIs

  ### Add Customer

  POST /customers

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

  GET /customers

  Query params:

  page
  limit
  search
  dueStatus
  sortBy
  sortOrder
  recentOnly
  includeArchived

  ### Get Customer By Id

  GET /customers/:id

  Returns profile details with sales history and payment history.

  ### Update Customer

  PATCH /customers/:id

  ### Archive Customer

  POST /customers/:id/archive

  ## Sales APIs

  ### Create Sale

  POST /sales

  Body:
```json
  {
    "customerId": "customer-uuid",
    "items": [
      {
        "productId": "product-uuid",
        "quantity": 2,
        "unitPrice": 899
      },
      {
        "productId": "product-uuid-2",
        "quantity": 1,
        "unitPrice": 499
      }
    ],
    "totalAmount": 2197,
    "paidAmount": 1000
  }
```
  Notes:

  - unitPrice is editable and can differ from the product default price.
  - totalAmount can be lower than item subtotal to support discounts.
  - Product stock is reduced automatically after sale creation.
  - Initial payment is recorded automatically if paidAmount > 0.

  ### Get Sales

  GET /sales

  Query params:

  page
  limit
  search
  status

  Supported status values:

  all
  paid
  partial
  pending

  ### Get Sale By Id

  GET /sales/:id

  Returns:

  - sale summary
  - customer details
  - sold items
  - payment activity
  - due amount
  - discount amount

  ### Record Payment For Sale

  POST /sales/:id/payments

  Body:
```json
  {
    "amount": 500
  }
```
  Notes:

  - Payment amount cannot exceed the remaining due amount.
  - Payment is linked to the sale and updates sale/customer outstanding amounts automatically.

  ## Business APIs

  ### Get Business

  GET /business

  ### Create Business

  POST /business

  ### Update Business

  PATCH /business
