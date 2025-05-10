'use client'

import { DarkButton, LiteButton } from '@/components/button'
import { TextField } from '@/components/Fields'
import TextArea from '@/components/Fields/textarea'
import { toastCustom } from '@/components/toastCustom'
import { BASE_URL } from '@/config/constants'
import { routes } from '@/config/routes'
import { Minus, Plus, Search, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useCallback, useEffect, useState } from 'react'
import { IItem } from '@/app/(user-panel)/type'

interface IEditOrderFormProps {
  orderId: string
}

const EditOrderForm = ({ orderId }: IEditOrderFormProps) => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [loadingOrder, setLoadingOrder] = useState(true)
  const [itemsLoading, setItemsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [items, setItems] = useState<IItem[]>([])
  const [filteredItems, setFilteredItems] = useState<IItem[]>([])
  const [selectedItems, setSelectedItems] = useState<Array<{
    id: number | string,
    name: string,
    quantity: number,
    price: number,
    variation?: string,
    variation_id?: number | string
  }>>([])
  
  const [customerName, setCustomerName] = useState('')
  const [orderNotes, setOrderNotes] = useState('')
  const [tableNo, setTableNo] = useState('')
  const [orderStatus, setOrderStatus] = useState<'pending' | 'completed' | 'cancelled'>('pending')
  
  // Fetch order details
  const fetchOrderDetails = useCallback(async () => {
    setLoadingOrder(true)
    try {
      const response = await fetch(`${BASE_URL}/api/orders/${orderId}`, {
        method: 'GET'
      })
      const data = await response.json()
      
      if (data?.data) {
        const order = data.data
        setCustomerName(order.customer_name || '')
        setTableNo(order.table_no || '')
        setOrderNotes(order.notes || '')
        setOrderStatus(order.status)
        
        // Convert order items to the format used in the form
        if (order.items && Array.isArray(order.items)) {
          setSelectedItems(order.items.map((item: any) => ({
            id: item.variation_id ? `${item.item_id}-${item.variation_id}` : item.item_id,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            variation: item.variation_name,
            variation_id: item.variation_id
          })))
        }
      }
    } catch (error) {
      console.error('Error fetching order details:', error)
      toastCustom.error('Failed to load order details')
    } finally {
      setLoadingOrder(false)
    }
  }, [orderId])
  
  // Fetch all items from the API
  const fetchItems = useCallback(async () => {
    setItemsLoading(true)
    try {
      const response = await fetch(`${BASE_URL}/api/items/view`, {
        method: 'POST'
      })
      const data = await response.json()
      if (data?.data?.data) {
        setItems(data.data.data)
        setFilteredItems(data.data.data)
      }
    } catch (error) {
      console.error('Error fetching items:', error)
    } finally {
      setItemsLoading(false)
    }
  }, [])
  
  useEffect(() => {
    fetchOrderDetails()
    fetchItems()
  }, [fetchOrderDetails, fetchItems])
  
  // Filter items based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredItems(items)
    } else {
      const filtered = items.filter((item) => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredItems(filtered)
    }
  }, [searchQuery, items])
  
  // Add item to order
  const addItemToOrder = (item: IItem, variation?: any) => {
    const itemId = variation ? `${item.id}-${variation.id}` : item.id
    
    // Check if item already exists in the order
    const existingItemIndex = selectedItems.findIndex(
      (selectedItem) => {
        if (variation) {
          return selectedItem.id === itemId
        }
        return selectedItem.id === item.id && !selectedItem.variation_id
      }
    )
    
    if (existingItemIndex !== -1) {
      // Increment quantity if item already exists
      const updatedItems = [...selectedItems]
      updatedItems[existingItemIndex].quantity += 1
      setSelectedItems(updatedItems)
    } else {
      // Add new item to order
      setSelectedItems([...selectedItems, {
        id: itemId ?? '',
        name: item.name,
        quantity: 1,
        price: variation ? variation.price : (item.price || 0),
        variation: variation ? variation.name : undefined,
        variation_id: variation ? variation.id : undefined
      }])
    }
  }
  
  // Update item quantity in order
  const updateItemQuantity = (index: number, value: number) => {
    const updatedItems = [...selectedItems]
    updatedItems[index].quantity = value
    setSelectedItems(updatedItems)
  }
  
  // Remove item from order
  const removeItem = (index: number) => {
    const updatedItems = [...selectedItems]
    updatedItems.splice(index, 1)
    setSelectedItems(updatedItems)
  }
  
  // Calculate order total
  const calculateTotal = () => {
    return selectedItems.reduce((total, item) => {
      return total + (item.price * item.quantity)
    }, 0)
  }
  
  // Update order
  const updateOrder = async () => {
    if (selectedItems.length === 0) {
      toastCustom.error('Please add at least one item to the order')
      return
    }
    
    setLoading(true)
    
    try {
      const orderData = {
        id: orderId,
        customer_name: customerName,
        table_no: tableNo,
        items: selectedItems,
        notes: orderNotes,
        total_amount: calculateTotal(),
        status: orderStatus
      }
      
      const response = await fetch(`${BASE_URL}/api/orders/update`, {
        method: 'POST',
        body: JSON.stringify(orderData)
      })
      
      const data = await response.json()
      
      if (data.status === 'success') {
        toastCustom.success('Order updated successfully')
        router.push(routes.orders)
      } else {
        toastCustom.error('Failed to update order')
      }
    } catch (error) {
      console.error('Error updating order:', error)
      toastCustom.error('An error occurred while updating the order')
    } finally {
      setLoading(false)
    }
  }
  
  if (loadingOrder) {
    return <div className="text-center py-8">Loading order details...</div>
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Left side - Customer info and item selection */}
      <div className="col-span-2 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="customerName" className="block mb-1 font-medium">Customer Name</label>
            <TextField
              id="customerName"
              type="text"
              placeholder="Customer Name (Optional)"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
          </div>
          
          <div>
            <label htmlFor="tableNo" className="block mb-1 font-medium">Table No.</label>
            <TextField
              id="tableNo"
              type="text"
              placeholder="Table Number"
              value={tableNo}
              onChange={(e) => setTableNo(e.target.value)}
            />
          </div>
          
          <div>
            <label htmlFor="status" className="block mb-1 font-medium">Order Status</label>
            <select
              id="status"
              className="w-full p-2 bg-gray-50 border-none rounded-md"
              value={orderStatus}
              onChange={(e) => setOrderStatus(e.target.value as any)}
            >
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
        
        <div>
          <label className="block mb-1 font-medium">Search Items</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-4 h-4 text-gray-500" />
            </div>
            <TextField
              type="text"
              className="pl-10"
              placeholder="Search items by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <div className="border rounded-lg overflow-hidden">
          <div className="max-h-80 overflow-y-auto">
            {itemsLoading ? (
              <div className="p-4 text-center">Loading items...</div>
            ) : filteredItems.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 p-3">
                {filteredItems.map((item) => (
                  <div
                    key={item.id}
                    className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer"
                    onClick={() => {
                      if (item.variations && item.variations.length > 0) {
                        // If item has variations, don't add it directly
                      } else {
                        addItemToOrder(item)
                      }
                    }}
                  >
                    <div className="font-medium">{item.name}</div>
                    {!item.variations || item.variations.length === 0 ? (
                      <div className="text-sm text-gray-600">${item.price?.toFixed(2) || '0.00'}</div>
                    ) : (
                      <div className="mt-2 space-y-1">
                        {item.variations.map((variation, index) => (
                          <div 
                            key={index}
                            className="text-sm border-t pt-1 flex justify-between cursor-pointer hover:bg-gray-100 px-1"
                            onClick={(e) => {
                              e.stopPropagation()
                              addItemToOrder(item, variation)
                            }}
                          >
                            <span className="text-gray-600">{'variation.name'}</span>
                            <span className="font-medium">${0?.toFixed(2) || '0.00'}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500">No items found</div>
            )}
          </div>
        </div>
      </div>
      
      {/* Right side - Order summary */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-medium text-lg mb-3">Order Summary</h3>
        
        {selectedItems.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No items added to order
          </div>
        ) : (
          <div className="space-y-3 mb-4">
            {selectedItems.map((item, index) => (
              <div key={index} className="bg-white rounded p-3 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">{item.name}</div>
                    {item.variation && (
                      <div className="text-xs text-gray-500">{item.variation}</div>
                    )}
                    <div className="text-sm text-gray-600 mt-1">${item.price.toFixed(2)}</div>
                  </div>
                  <button 
                    className="text-red-500 hover:text-red-700"
                    onClick={() => removeItem(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center mt-2">
                  <button 
                    className="bg-gray-200 rounded-l p-1"
                    onClick={() => updateItemQuantity(index, Math.max(1, item.quantity - 1))}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input 
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItemQuantity(index, Number(e.target.value) || 1)}
                    className="w-12 text-center border-y py-1 text-sm"
                  />
                  <button 
                    className="bg-gray-200 rounded-r p-1"
                    onClick={() => updateItemQuantity(index, item.quantity + 1)}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <div className="ml-auto font-medium">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="border-t pt-3 mb-4">
          <div className="flex justify-between font-medium">
            <span>Total:</span>
            <span>${calculateTotal().toFixed(2)}</span>
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block mb-1 font-medium">Order Notes</label>
          <TextArea
            placeholder="Add notes about the order..."
            value={orderNotes}
            onChange={(e) => setOrderNotes(e.target.value)}
          />
        </div>
        
        <div className="flex justify-between">
          <LiteButton
            onClick={() => router.push(routes.orders)}
            className="w-1/3"
          >
            Cancel
          </LiteButton>
          <DarkButton
            onClick={updateOrder}
            className="w-2/3 ml-2 justify-center"
            loading={loading}
            disabled={loading || selectedItems.length === 0}
          >
            Update Order
          </DarkButton>
        </div>
      </div>
    </div>
  )
}

export default EditOrderForm