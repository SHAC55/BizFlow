# Database Schema

  ## Overview

  This database supports core business operations including inventory management, customer records, sales transactions, order item tracking, and expense management.

  ## Entities

  ### Product
  Stores product and inventory details.

  | Field | Description |
  |-------|-------------|
  | id | Unique product ID |
  | name | Product name |
  | price | Product selling price |
  | quantity | Available stock |
  | minQuantity | Minimum stock threshold |
  | sku | Unique stock keeping unit |

  ### Customer
  Stores customer information and account balance.

  | Field | Description |
  |-------|-------------|
  | id | Unique customer ID |
  | name | Customer name |
  | phone | Customer phone number |
  | email | Customer email address |
  | creditBalance | Customer outstanding or available credit |

  ### Transaction
  Represents a customer purchase.

  | Field | Description |
  |-------|-------------|
  | id | Unique transaction ID |
  | customerId | Linked customer ID |
  | totalAmount | Total transaction amount |
  | paymentStatus | Payment state |
  | createdAt | Transaction creation timestamp |

  ### OrderItem
  Stores item-level transaction details.

  | Field | Description |
  |-------|-------------|
  | id | Unique order item ID |
  | productId | Linked product ID |
  | quantity | Quantity sold |
  | price | Item price at the time of sale |

  Note: `OrderItem` should ideally include `transactionId` to link each item to its parent transaction.

  ### Expense
  Stores business expense records.

  | Field | Description |
  |-------|-------------|
  | id | Unique expense ID |
  | title | Expense title |
  | amount | Expense amount |
  | date | Expense date |

  ## Relationships

  - One `Customer` can have many `Transaction` records.
  - One `Transaction` can contain many `OrderItem` records.
  - One `Product` can appear in many `OrderItem` records.
  - `Expense` is maintained independently for business cost tracking.

  ## Data Flow

  1. Products are added and inventory is maintained through `quantity` and `minQuantity`.
  2. Customers are stored with contact details and `creditBalance`.
  3. Each sale creates a `Transaction` linked to a customer.
  4. Sold products are recorded as `OrderItem` entries.
  5. Expenses are stored separately for financial tracking.

  ## Summary

  This schema provides a clear structure for managing:
  - Products
  - Customers
  - Transactions
  - Order items
  - Expenses
