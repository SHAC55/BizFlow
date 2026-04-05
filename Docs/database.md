• # Database Schema

  ## Overview

  This database supports core business operations including:
  - authentication and sessions
  - business profile management
  - inventory and stock movement tracking
  - customer records and balances
  - sales transactions
  - item-level sale tracking
  - payment collection
  - invoice linkage

  ## Entities

  ### User
  Stores account and authentication information.

  | Field | Description |
  |-------|-------------|
  | id | Unique user ID |
  | name | User name |
  | password | Hashed password for email/password auth |
  | verified | Email verification status |
  | mobile | User mobile number |
  | email | User email address |
  | provider | Auth provider such as Google |
  | createdAt | Record creation timestamp |
  | updatedAt | Last update timestamp |

  ### Session
  Stores active login sessions.

  | Field | Description |
  |-------|-------------|
  | id | Unique session ID |
  | userId | Linked user ID |
  | userAgent | Device or browser info |
  | createdAt | Session creation timestamp |
  | expiresAt | Session expiry timestamp |

  ### VerificationCode
  Stores short-lived codes for account actions.

  | Field | Description |
  |-------|-------------|
  | id | Unique verification code ID |
  | userId | Linked user ID |
  | type | Code type such as email verification or password reset |
  | createdAt | Creation timestamp |
  | expiresAt | Expiry timestamp |

  ### Business
  Stores the business owned by a user.

  | Field | Description |
  |-------|-------------|
  | id | Unique business ID |
  | name | Business name |
  | ownerId | Linked owner user ID |
  | createdAt | Record creation timestamp |

  ### Customer
  Stores customer information and balance context.

  | Field | Description |
  |-------|-------------|
  | id | Unique customer ID |
  | name | Customer name |
  | mobile | Customer phone number |
  | email | Customer email address |
  | address | Customer address |
  | notes | Internal notes about the customer |
  | openingBalance | Starting balance carried for the customer |
  | archivedAt | Archive timestamp if hidden from active lists |
  | businessId | Linked business ID |
  | createdAt | Record creation timestamp |

  ### Product
  Stores product and inventory details.

  | Field | Description |
  |-------|-------------|
  | id | Unique product ID |
  | businessId | Linked business ID |
  | name | Product name |
  | category | Product category |
  | price | Default selling price |
  | quantity | Available stock |
  | minimumQuantity | Minimum stock threshold |
  | sku | Business-scoped stock keeping unit |
  | createdAt | Record creation timestamp |
  | updatedAt | Last update timestamp |

  ### InventoryMovement
  Stores every stock change for auditability.

  | Field | Description |
  |-------|-------------|
  | id | Unique movement ID |
  | productId | Linked product ID |
  | businessId | Linked business ID |
  | userId | User who performed the stock action |
  | type | Movement type such as INITIAL, INCREASE, DECREASE, or SET |
  | quantityBefore | Stock before the change |
  | quantityAfter | Stock after the change |
  | quantityChange | Net stock delta |
  | reason | Reason for the stock change |
  | notes | Optional notes |
  | createdAt | Movement creation timestamp |

  ### Sale
  Represents a customer sale.

  | Field | Description |
  |-------|-------------|
  | id | Unique sale ID |
  | businessId | Linked business ID |
  | customerId | Linked customer ID |
  | totalAmount | Final sale amount after discount if any |
  | createdAt | Sale creation timestamp |

  ### SaleItem
  Stores item-level sale details.

  | Field | Description |
  |-------|-------------|
  | id | Unique sale item ID |
  | saleId | Linked sale ID |
  | productId | Linked product ID |
  | quantity | Quantity sold |
  | unitPrice | Product price used at the time of sale |
  | totalAmount | Line total for the item |
  | createdAt | Record creation timestamp |

  ### Payment
  Stores payments collected against a sale.

  | Field | Description |
  |-------|-------------|
  | id | Unique payment ID |
  | saleId | Linked sale ID |
  | amount | Payment amount collected |
  | createdAt | Payment creation timestamp |

  ### Invoice
  Stores invoice linkage for a sale.

  | Field | Description |
  |-------|-------------|
  | id | Unique invoice ID |
  | saleId | Linked sale ID |
  | pdfUrl | Optional PDF URL |
  | createdAt | Invoice creation timestamp |

  ## Relationships

  - One `User` can have many `Session` records.
  - One `User` can have many `VerificationCode` records.
  - One `User` owns one `Business`.
  - One `Business` can have many `Customer` records.
  - One `Business` can have many `Product` records.
  - One `Business` can have many `Sale` records.
  - One `Customer` can have many `Sale` records.
  - One `Sale` can have many `SaleItem` records.
  - One `Sale` can have many `Payment` records.
  - One `Sale` can have one `Invoice`.
  - One `Product` can appear in many `SaleItem` records.
  - One `Product` can have many `InventoryMovement` records.

  ## Data Flow

  1. A user signs in and operates within a single business context.
  2. Products are added and inventory is maintained through `quantity`, `minimumQuantity`, and `InventoryMovement`.
  3. Customers are stored with contact details, notes, and `openingBalance`.
  4. Each sale creates a `Sale` linked to a customer and business.
  5. Sold products are recorded as `SaleItem` entries with sale-time pricing.
  6. Product stock is reduced automatically and logged in `InventoryMovement`.
  7. Payments are stored separately in `Payment` so dues can be collected later.
  8. Customer due and revenue are derived from `openingBalance`, `Sale.totalAmount`, and linked `Payment` records.
  9. Invoice generation can be attached to a sale through `Invoice`.

  ## Summary

  This schema currently manages:
  - Users
  - Sessions
  - Verification codes
  - Business profile
  - Products
  - Inventory movements
  - Customers
  - Sales
  - Sale items
  - Payments
  - Invoices
