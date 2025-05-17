'use client'

import { DarkButton, LiteButton } from '@/components/button'
import { TextField } from '@/components/Fields'
import TextArea from '@/components/Fields/textarea'
import { toastCustom } from '@/components/toastCustom'
import { BASE_URL } from '@/config/constants'
import { routes } from '@/config/routes'
import { Minus, Plus, Search, Trash2, Clock, CreditCard } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useCallback, useEffect, useState } from 'react'
import { IItem, ITable, IUser } from '@/app/(user-panel)/type'
import dynamic from 'next/dynamic'
import { useAppSelector } from '@/app/(user-panel)/_lib/store'

const ReactSelect = dynamic(() => import("react-select"), {
    ssr: false,
});

const CreateOrderForm = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAppSelector(state => state.user)
  
  // Loading states
  const [loading, setLoading] = useState(false)
  const [itemsLoading, setItemsLoading] = useState(false)
  const [tablesLoading, setTablesLoading] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('')
  
  // Form states
  const [orderTakerId, setOrderTakerId] = useState<string>(user?.id?.toString() || '')
  const [tableId, setTableId] = useState<string>('')
  const [customerId, setCustomerId] = useState<string>('')
  const [customerName, setCustomerName] = useState<string>('')
  const [orderNotes, setOrderNotes] = useState<string>('')
  const [discount, setDiscount] = useState<number>(0)
  const [tax, setTax] = useState<number>(0)
  const [estimatedPrepTime, setEstimatedPrepTime] = useState<number>(15)
  const [paymentStatus, setPaymentStatus] = useState<string>('unpaid')
  
  // Selected items for order
  const [selectedItems, setSelectedItems] = useState<Array<{
    item_id: string | number,
    name: string,
    quantity: number,
    unit_price: number,
    variation_name?: string,
    variation_id?: string | number,
    notes?: string
  }>>([])
  
  // Data lists
  const [users, setUsers] = useState<IUser[]>([])
  const [tables, setTables] = useState<ITable[]>([])
  const [availableTables, setAvailableTables] = useState<ITable[]>([])
  const [items, setItems] = useState<IItem[]>([])
  const [filteredItems, setFilteredItems] = useState<IItem[]>([])
  const [categories, setCategories] = useState<{[key: string]: IItem[]}>({})
  
  // Fetch all users from the API
  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/users/view`, {
        method: 'POST'
      })
      const data = await response.json()
      if (data?.data?.data) {
        setUsers(data.data.data)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }, [])

  // Fetch all tables from the API
  const fetchTables = useCallback(async () => {
    setTablesLoading(true)
    try {
      const response = await fetch(`${BASE_URL}/api/tables/view`, {
        method: 'POST'
      })
      const data = await response.json()
      if (data?.data?.data) {
        const allTables = data.data.data
        setTables(allTables)
        // Filter available tables
        const available = allTables.filter((table: ITable) => table.status === 'available')
        setAvailableTables(available)
      }
    } catch (error) {
      console.error('Error fetching tables:', error)
    } finally {
      setTablesLoading(false)
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
        const allItems = data.data.data
        setItems(allItems)
        setFilteredItems(allItems)
        
        // Group items by category
        const itemsByCategory: {[key: string]: IItem[]} = {}
        allItems.forEach((item: IItem) => {
          const catId = item.cat_id?.toString() || 'uncategorized'
          if (!itemsByCategory[catId]) {
            itemsByCategory[catId] = []
          }
          itemsByCategory[catId].push(item)
        })
        setCategories(itemsByCategory)
      }
    } catch (error) {
      console.error('Error fetching items:', error)
    } finally {
      setItemsLoading(false)
    }
  }, [])
  
  // Handle initial data loading
  useEffect(() => {
    fetchUsers()
    fetchTables()
    fetchItems()
    
    // Check if there's a table_id in URL params (from table page)
    const tableIdFromUrl = searchParams.get('table')
    if (tableIdFromUrl) {
      setTableId(tableIdFromUrl)
    }
  }, [fetchUsers, fetchTables, fetchItems, searchParams])
  
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
    const itemId = item.id
    let price = item.price
    let variationName = undefined
    let variationId = undefined
    
    if (variation) {
      variationName = variation.name
      variationId = variation.id
      price = variation.price || price
    }
    
    // Check if item already exists in the order
    const existingItemIndex = selectedItems.findIndex(
      (selectedItem) => {
        if (variation) {
          return selectedItem.item_id === itemId && selectedItem.variation_id === variationId
        }
        return selectedItem.item_id === itemId && !selectedItem.variation_id
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
        item_id: itemId ?? '',
        name: item.name,
        quantity: 1,
        unit_price: price,
        variation_name: variationName,
        variation_id: variationId
      }])
    }
  }
  
  // Update item quantity in order
  const updateItemQuantity = (index: number, value: number) => {
    const updatedItems = [...selectedItems]
    updatedItems[index].quantity = value < 1 ? 1 : value
    setSelectedItems(updatedItems)
  }
  
  // Add notes to an item
  const addItemNotes = (index: number, notes: string) => {
    const updatedItems = [...selectedItems]
    updatedItems[index].notes = notes
    setSelectedItems(updatedItems)
  }
  
  // Remove item from order
  const removeItem = (index: number) => {
    const updatedItems = [...selectedItems]
    updatedItems.splice(index, 1)
    setSelectedItems(updatedItems)
  }
  
  // Calculate subtotal
  const calculateSubtotal = () => {
    return selectedItems.reduce((total, item) => {
      return total + (item.unit_price * item.quantity)
    }, 0)
  }
  
  // Calculate total
  const calculateTotal = () => {
    const subtotal = calculateSubtotal()
    return subtotal - discount + tax
  }
  
  // Submit order
  const submitOrder = async () => {
    if (selectedItems.length === 0) {
      toastCustom.error('Please add at least one item to the order')
      return
    }
    
    if (!orderTakerId) {
      toastCustom.error('Please select an order taker')
      return
    }
    
    setIsCreating(true)
    setLoading(true)
    
    try {
      const orderData = {
        branch_id: user?.branch_id,
        order_taker_id: orderTakerId,
        created_by: user?.id,
        table_id: tableId || null,
        customer_id: customerId || null,
        customer_name: customerName,
        items: selectedItems,
        subtotal: calculateSubtotal(),
        discount: discount,
        tax: tax,
        total: calculateTotal(),
        notes: orderNotes,
        status: 'pending',
        payment_status: paymentStatus,
        preparation_time: estimatedPrepTime
      }
      
      const response = await fetch(`${BASE_URL}/api/orders/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      })
      
      const data = await response.json();
      
      if (data.status === 'success') {
        toastCustom.success('Order created successfully')
        router.push(routes.orders)
      } else {
        toastCustom.error(data.message || 'Failed to create order')
      }
    } catch (error) {
      console.error('Error creating order:', error)
      toastCustom.error('An error occurred while creating the order')
    } finally {
      setIsCreating(false)
      setLoading(false)
    }
  }
  
  // Payment status options
  const paymentStatusOptions = [
    { value: 'unpaid', label: 'Unpaid' },
    { value: 'partially_paid', label: 'Partially Paid' },
    { value: 'paid', label: 'Paid' }
  ]
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Left side - Customer info and item selection */}
      <div className="col-span-2 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="orderTaker" className="block mb-1 font-medium">Order Taker *</label>
              <ReactSelect
                id="orderTaker"
                placeholder="Select Order Taker..."
                value={users.filter(u => u.id?.toString() === orderTakerId).map(u => ({ value: u.id?.toString(), label: u.name }))[0]}
                options={users.map(u => ({ value: u.id?.toString(), label: u.name }))}
                onChange={(selectedOption: any) => setOrderTakerId(selectedOption?.value || '')}
                isSearchable
                isClearable
                classNames={{
                  control: () => "ring-1 ring-gray-300"
                }}
                styles={{
                  control: (styles) => ({ ...styles, backgroundColor: "rgb(249, 250, 251)", border: "none" })
                }}
              />
          </div>
          
          <div>
            <label htmlFor="table" className="block mb-1 font-medium">Table</label>
            <ReactSelect
              id="table"
              placeholder="Select Table..."
              value={tables.filter(t => t.id?.toString() === tableId).map(t => ({ 
                value: t.id?.toString(), 
                label: `Table ${t.table_no} (${t.capacity} seats)` 
              }))[0]}
              options={availableTables.map(t => ({ 
                value: t.id?.toString(), 
                label: `Table ${t.table_no} (${t.capacity} seats)` 
              }))}
              onChange={(selectedOption: any) => setTableId(selectedOption?.value || '')}
              isSearchable
              isClearable
              isLoading={tablesLoading}
              classNames={{
                control: () => "ring-1 ring-gray-300"
              }}
              styles={{
                control: (styles) => ({ ...styles, backgroundColor: "rgb(249, 250, 251)", border: "none" })
              }}
            />
            {availableTables.length === 0 && !tablesLoading && (
              <p className="text-xs text-amber-600 mt-1">No available tables. All tables are occupied or reserved.</p>
            )}
          </div>
          
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
          <div className="max-h-[400px] overflow-y-auto p-4">
            {itemsLoading ? (
              <div className="p-4 text-center">Loading items...</div>
            ) : filteredItems.length > 0 ? (
              searchQuery ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {filteredItems.map((item) => (
                    <div
                      key={item.id}
                      className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer"
                      onClick={() => addItemToOrder(item)}
                    >
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-gray-600">${item.price?.toFixed(2) || '0.00'}</div>
                    </div>
                  ))}
                </div>
              ) : (
                // Show items grouped by category when not searching
                Object.entries(categories).map(([catId, categoryItems]) => (
                  <div key={catId} className="mb-6">
                    <h3 className="text-lg font-medium mb-2">
                      {categoryItems[0]?.cat_name || 'Uncategorized'}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {categoryItems.map((item) => (
                        <div
                          key={item.id}
                          className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer"
                          onClick={() => addItemToOrder(item)}
                        >
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-gray-600">${item.price?.toFixed(2) || '0.00'}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )
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
          <div className="space-y-3 mb-4 max-h-[300px] overflow-y-auto">
            {selectedItems.map((item, index) => (
              <div key={index} className="bg-white rounded p-3 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">{item.name}</div>
                    {item.variation_name && (
                      <div className="text-xs text-gray-500">{item.variation_name}</div>
                    )}
                    <div className="text-sm text-gray-600 mt-1">${item.unit_price.toFixed(2)}</div>
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
                    onChange={(e) => updateItemQuantity(index, parseInt(e.target.value) || 1)}
                    className="w-12 text-center border-y py-1 text-sm"
                  />
                  <button 
                    className="bg-gray-200 rounded-r p-1"
                    onClick={() => updateItemQuantity(index, item.quantity + 1)}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <div className="ml-auto font-medium">
                    ${(item.unit_price * item.quantity).toFixed(2)}
                  </div>
                </div>
                <div className="mt-2">
                  <input
                    type="text"
                    placeholder="Add notes for this item..."
                    value={item.notes || ''}
                    onChange={(e) => addItemNotes(index, e.target.value)}
                    className="w-full text-xs p-1 border rounded bg-gray-50"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="border-t pt-3 mb-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label htmlFor="discount" className="text-sm">Discount:</label>
              <div className="w-1/2">
                <TextField
                  id="discount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={discount}
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                  className="text-right text-sm py-1"
                />
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <label htmlFor="tax" className="text-sm">Tax:</label>
              <div className="w-1/2">
                <TextField
                  id="tax"
                  type="number"
                  min="0"
                  step="0.01"
                  value={tax}
                  onChange={(e) => setTax(parseFloat(e.target.value) || 0)}
                  className="text-right text-sm py-1"
                />
              </div>
            </div>
            
            <div className="flex justify-between font-medium pt-2 border-t">
              <span>Total:</span>
              <span>${calculateTotal().toFixed(2)}</span>
            </div>
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block mb-1 font-medium">Order Notes</label>
          <TextArea
            placeholder="Add notes about the order..."
            value={orderNotes}
            onChange={(e) => setOrderNotes(e.target.value)}
            rows={3}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block mb-1 font-medium">Estimated Prep Time</label>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2 text-gray-500" />
              <select
                value={estimatedPrepTime}
                onChange={(e) => setEstimatedPrepTime(Number(e.target.value))}
                className="bg-white border border-gray-300 rounded-md py-2 px-3 w-full"
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
          
          <div>
            <label className="block mb-1 font-medium">Payment Status</label>
            <div className="flex items-center">
              <CreditCard className="w-4 h-4 mr-2 text-gray-500" />
              <ReactSelect
                options={paymentStatusOptions}
                value={paymentStatusOptions.find(option => option.value === paymentStatus)}
                onChange={(selectedOption: any) => setPaymentStatus(selectedOption?.value || 'unpaid')}
                className="w-full"
                classNames={{
                  control: () => "ring-1 ring-gray-300"
                }}
                styles={{
                  control: (styles) => ({ ...styles, backgroundColor: "rgb(249, 250, 251)", border: "none" })
                }}
              />
            </div>
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
            loading={isCreating}
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