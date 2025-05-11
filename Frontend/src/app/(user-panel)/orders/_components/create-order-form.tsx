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
import { IItem, ITable, IUser } from '@/app/(user-panel)/type'
import { Clock } from 'lucide-react'
import { Controller } from 'react-hook-form'
import dynamic from 'next/dynamic'

const ReactSelect = dynamic(() => import("react-select"), {
    ssr: false,
});

const CreateOrderForm = () => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [itemsLoading, setItemsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Data States
  const [users, setUsers] = useState<IUser[]>([])
  const [tables, setTables] = useState<ITable[]>([])
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
  
  // Form Fields
  const [orderTaker, setOrderTaker] = useState('')
  const [orderNotes, setOrderNotes] = useState('')
  const [tableNo, setTableNo] = useState('')
  const [estimatedPrepTime, setEstimatedPrepTime] = useState<number>(15)
  
  // Fetch all users from the API
  const fetchUsers = useCallback(async () => {
    setItemsLoading(true)
    try {
      const response = await fetch(`${BASE_URL}/api/users/view`, {
        method: 'POST'
      })
      const data = await response.json()
      if (data?.data?.data) {
        setUsers(data.data.data)
      }
    } catch (error) {
      console.error('Error fetching items:', error)
    } finally {
      setItemsLoading(false)
    }
  }, [])

  // Fetch all users from the API
  const fetchTables = useCallback(async () => {
    setItemsLoading(true)
    try {
      const response = await fetch(`${BASE_URL}/api/tables/view`, {
        method: 'POST'
      })
      const data = await response.json()
      if (data?.data?.data) {
        setTables(data.data.data)
      }
    } catch (error) {
      console.error('Error fetching items:', error)
    } finally {
      setItemsLoading(false)
    }
  }, [])

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
    fetchTables()
  }, [fetchTables])
  
  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])
  
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
  
  // Submit order
  const submitOrder = async () => {
    if (selectedItems.length === 0) {
      toastCustom.error('Please add at least one item to the order')
      return
    }
    
    setLoading(true)
    
    try {
      const orderData = {
        order_taker: orderTaker,
        table_no: tableNo,
        items: selectedItems,
        notes: orderNotes,
        total_amount: calculateTotal(),
        status: 'pending',
        preparation_time: estimatedPrepTime
      }
      
      const response = await fetch(`${BASE_URL}/api/orders/add`, {
        method: 'POST',
        body: JSON.stringify(orderData)
      })
      
      const data = await response.json()
      
      if (data.status === 'success') {
        toastCustom.success('Order created successfully')
        router.push(routes.orders)
      } else {
        toastCustom.error('Failed to create order')
      }
    } catch (error) {
      console.error('Error creating order:', error)
      toastCustom.error('An error occurred while creating the order')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Left side - Customer info and item selection */}
      <div className="col-span-2 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="customerName" className="block mb-1 font-medium">Order Taker</label>
              <ReactSelect
                placeholder={'Select Order Taker ...'}
                defaultValue={users.filter(u => u.id === Number(orderTaker)).map(u => ({value: u.id, label: u.name}))}
                options={users.map(u => ({value: u.id, label: u.name}))}
                isClearable
                onChange={(selectedOption) => {
                  setOrderTaker(selectedOption ? selectedOption.value : null)
                }}
                classNames={{
                    control: () => "ring-1 ring-gray-300"
                }}
                styles={{
                    control: (styles) => ({...styles, backgroundColor: "rgb(249, 250, 251)", border: "none", boxShadow: "0 0 0 0px #fff, 0 0 0 calc(1px + 0px) rgb(209 213 219 / 1), 0 0 #0000, 0 0 #0000"})
                }}
              />
          </div>
          
          <div>
            <label htmlFor="tableNo" className="block mb-1 font-medium">Table No.</label>
            <ReactSelect
                placeholder={'Select Table No.'}
                defaultValue={tables.filter(t => t.id === tableNo).map(u => ({value: u.id, label: u.table_no}))}
                options={tables.map(u => ({value: u.id, label: u.table_no}))}
                isClearable
                onChange={(selectedOption) => {
                  setTableNo(selectedOption ? selectedOption.value : null)
                }}
                classNames={{
                    control: () => "ring-1 ring-gray-300"
                }}
                styles={{
                    control: (styles) => ({...styles, backgroundColor: "rgb(249, 250, 251)", border: "none", boxShadow: "0 0 0 0px #fff, 0 0 0 calc(1px + 0px) rgb(209 213 219 / 1), 0 0 #0000, 0 0 #0000"})
                }}
              />
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
                      if (item.grouped_items && item.grouped_items.length > 0) {
                        // If item has variations, don't add it directly
                      } else {
                        addItemToOrder(item)
                      }
                    }}
                  >
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-gray-600">${item.price?.toFixed(2) || '0.00'}</div>
                    {item.grouped_items && item.grouped_items.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {item.grouped_items.map((variation, index) => (
                          <div 
                            key={index}
                            className="text-sm border-t pt-1 flex justify-between cursor-pointer hover:bg-gray-100 px-1"
                            onClick={(e) => {
                              e.stopPropagation()
                              addItemToOrder(item, variation.item)
                            }}
                          >
                            <span className="text-gray-600">{variation.item.name}</span>
                            {/* <span className="font-medium">${variation.item.price?.toFixed(2) || '0.00'}</span> */}
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

        <div className="mb-4">
            <label className="block mb-1 font-medium">Estimated Preparation Time</label>
            <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2 text-gray-500" />
                <select
                value={estimatedPrepTime}
                onChange={(e) => setEstimatedPrepTime(Number(e.target.value))}
                className="bg-white border border-gray-300 rounded-md py-2 px-3"
                >
                <option value="5">5 minutes</option>
                <option value="10">10 minutes</option>
                <option value="15">15 minutes</option>
                <option value="20">20 minutes</option>
                <option value="30">30 minutes</option>
                <option value="45">45 minutes</option>
                <option value="60">60 minutes</option>
                </select>
            </div>
        </div>
        
        <div className="flex justify-between">
          <LiteButton
            onClick={() => router.push(routes.orders)}
            className="w-1/3"
          >
            Cancel
          </LiteButton>
          <DarkButton
            onClick={submitOrder}
            className="w-2/3 ml-2 justify-center"
            loading={loading}
            disabled={loading || selectedItems.length === 0}
          >
            Create Order
          </DarkButton>
        </div>
      </div>
    </div>
  )
}

export default CreateOrderForm