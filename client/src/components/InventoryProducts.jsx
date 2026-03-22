import React, { useState } from 'react'
import { Package, TrendingUp, AlertTriangle, ShoppingBag, Edit2, RefreshCw, ChevronRight, MoreVertical } from 'lucide-react'

const InventoryProducts = () => {
  // Dummy data for 5 products
  const [products, setProducts] = useState([
    {
      id: 1,
      name: 'Wireless Headphones',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop',
      price: 299.99,
      quantity: 156,
      minQuantity: 50,
      category: 'Electronics',
      sku: 'WH-001'
    },
    {
      id: 2,
      name: 'Smart Fitness Watch',
      image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=200&h=200&fit=crop',
      price: 199.99,
      quantity: 89,
      minQuantity: 30,
      category: 'Electronics',
      sku: 'SW-002'
    },
    {
      id: 3,
      name: 'Cotton T-Shirt',
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&h=200&fit=crop',
      price: 34.99,
      quantity: 28,
      minQuantity: 40,
      category: 'Clothing',
      sku: 'CT-003'
    },
    {
      id: 4,
      name: 'Ceramic Coffee Mug',
      image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=200&h=200&fit=crop',
      price: 24.99,
      quantity: 423,
      minQuantity: 100,
      category: 'Home',
      sku: 'CM-004'
    },
    {
      id: 5,
      name: 'Leather Backpack',
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=200&h=200&fit=crop',
      price: 129.99,
      quantity: 67,
      minQuantity: 25,
      category: 'Accessories',
      sku: 'BP-005'
    }
  ])

  // Calculate statistics
  const totalProducts = products.length
  const totalValue = products.reduce((sum, product) => sum + (product.price * product.quantity), 0)
  const lowStockCount = products.filter(p => p.quantity <= p.minQuantity && p.quantity > 0).length
  const outOfStockCount = products.filter(p => p.quantity === 0).length

  // Stock status functions
  const getStockStatus = (quantity, minQuantity) => {
    if (quantity === 0) return { label: 'Out of Stock', color: 'text-red-600', bg: 'bg-red-50' }
    if (quantity <= minQuantity) return { label: 'Low Stock', color: 'text-yellow-600', bg: 'bg-yellow-50' }
    return { label: 'In Stock', color: 'text-green-600', bg: 'bg-green-50' }
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 h-full ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Header - Compact */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">Inventory</h1>
            <p className="text-sm text-gray-500 mt-0.5">Manage your products</p>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 shadow-sm">
            <ShoppingBag className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>

        {/* Stats Cards - Compact */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Total Products</p>
                <p className="text-xl font-bold text-gray-800">{totalProducts}</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-2">
                <Package className="w-4 h-4 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Inventory Value</p>
                <p className="text-xl font-bold text-gray-800">₹{totalValue.toLocaleString()}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Low Stock</p>
                <p className="text-xl font-bold text-yellow-600">{lowStockCount}</p>
              </div>
              <div className="bg-yellow-50 rounded-lg p-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Out of Stock</p>
                <p className="text-xl font-bold text-red-600">{outOfStockCount}</p>
              </div>
              <div className="bg-red-50 rounded-lg p-2">
                <Package className="w-4 h-4 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Products Table View - Compact & Professional */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Table Header */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((product) => {
                  const stockStatus = getStockStatus(product.quantity, product.minQuantity)
                  
                  return (
                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                      {/* Product Info */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <img 
                            src={product.image} 
                            alt={product.name}
                            className="w-10 h-10 rounded-lg object-cover bg-gray-100"
                          />
                          <div>
                            <p className="text-sm font-medium text-gray-800">{product.name}</p>
                          </div>
                        </div>
                      </td>
                      
                      {/* SKU */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <p className="text-sm text-gray-600 font-mono">{product.sku}</p>
                      </td>
                      
                      {/* Category */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-md">
                          {product.category}
                        </span>
                      </td>
                      
                      {/* Price */}
                      <td className="px-4 py-3 whitespace-nowrap text-right">
                        <p className="text-sm font-semibold text-gray-800">₹{product.price}</p>
                      </td>
                      
                      {/* Quantity with Progress */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex flex-col items-end">
                          <p className={`text-sm font-medium ${
                            product.quantity <= product.minQuantity && product.quantity > 0 ? 'text-yellow-600' : 
                            product.quantity === 0 ? 'text-red-600' : 'text-gray-800'
                          }`}>
                            {product.quantity} units
                          </p>
                          {product.quantity <= product.minQuantity && product.quantity > 0 && (
                            <p className="text-xs text-yellow-600 mt-0.5">
                              Min: {product.minQuantity}
                            </p>
                          )}
                        </div>
                      </td>
                      
                      {/* Status Badge */}
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${stockStatus.bg} ${stockStatus.color}`}>
                          {stockStatus.label}
                        </span>
                      </td>
                      
                      {/* Actions */}
                      <td className="px-4 py-3 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all">
                            <Package className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Empty State */}
        {products.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <div className="text-gray-400 text-5xl mb-3">📦</div>
            <h3 className="text-base font-medium text-gray-600 mb-1">No Products Found</h3>
            <p className="text-sm text-gray-500">Add your first product to get started</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default InventoryProducts