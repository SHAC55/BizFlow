# 🗄️ Database Schema

## Product

* id
* name
* price
* quantity
* minQuantity
* sku

## Customer

* id
* name
* phone
* email
* creditBalance

## Transaction

* id
* customerId
* totalAmount
* paymentStatus
* createdAt

## OrderItem

* id
* productId
* quantity
* price

## Expense

* id
* title
* amount
* date
