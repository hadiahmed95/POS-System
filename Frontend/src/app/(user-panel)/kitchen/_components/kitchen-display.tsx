'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { BASE_URL } from '@/config/constants'
import { IOrder, OrderStatusType } from '../../type'
import OrderCard from './order-card'
import { Bell, CheckCircle, Clock, RefreshCw } from 'lucide-react'
import OrderFilter from './order-filter'
import { toastCustom } from '@/components/toastCustom'
import { useAppSelector } from '../../_lib/store'

// Extend the existing IOrder interface for kitchen-specific needs
export interface IKitchenOrder extends IOrder {
  kitchen_status: OrderStatusType
  preparation_time?: number // in minutes
  preparation_started_at?: string
}

const KitchenDisplay = () => {
  const { branch } = useAppSelector(state => state.branch)
  
  // State
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState<IKitchenOrder[]>([])
  const [filteredOrders, setFilteredOrders] = useState<IKitchenOrder[]>([])
  const [statusFilter, setStatusFilter] = useState<OrderStatusType | 'all'>('all')
  const [refreshInterval, setRefreshInterval] = useState<number>(30) // in seconds
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  // Fetch active orders
  const fetchOrders = useCallback(async () => {
    if (isRefreshing) return
    
    setIsRefreshing(true)
    try {
      const branchQueryParam = branch?.id ? `?branch_id=${branch.id}` : ''
      const response = await fetch(`${BASE_URL}/api/kitchen/orders${branchQueryParam}`, {
        method: 'GET'
      })

      if(!response.ok) {
        console.error('error', response)
      }
      
      const data = await response.json();
      
      if (data?.status === 'success' && data?.data) {
        const kitchenOrders = data.data.data.map((order: IOrder) => {
          return {
            ...order,
            kitchen_status: order.status,
            preparation_time: order.preparation_time || 15 // Default to 15 min if not set
          } as IKitchenOrder
        })
        
        setOrders(kitchenOrders)
      }
    } catch (error) {
      console.error('Error fetching kitchen orders:', error)
      toastCustom.error('Failed to load kitchen orders')
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }, [branch, isRefreshing])
  
  // Update order status
  const updateOrderStatus = async (orderId: number | string, status: OrderStatusType): Promise<void> => {
    try {
      // Mark the order as being updated locally
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { 
                ...order, 
                kitchen_status: status,
                preparation_started_at: status === 'processing' && !order.preparation_started_at 
                  ? new Date().toISOString() 
                  : order.preparation_started_at
              } 
            : order
        )
      )
      
      // Send update to server
      const response = await fetch(`${BASE_URL}/api/kitchen/update-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          order_id: orderId,
          status
        })
      })
      
      const data = await response.json()
      
      if (data.status !== 'success') {
        // If failed, revert the local change
        toastCustom.error('Failed to update order status')
        await fetchOrders() // Refresh orders to get accurate state
      } else {
        // Play sound for status change if set to ready
        if (status === 'ready') {
          playNotificationSound()
        }
        
        toastCustom.success(`Order status updated to ${status}`)
      }
    } catch (error) {
      console.error('Error updating order status:', error)
      toastCustom.error('Error updating order status')
      await fetchOrders() // Refresh orders to get accurate state
    }
  }
  
  // Play notification sound when order is ready
  const playNotificationSound = () => {
    try {
      const audio = new Audio('/sounds/notification.mp3')
      audio.play()
    } catch (error) {
      console.error('Error playing notification sound:', error)
    }
  }
  
  // Set up auto-refresh
  useEffect(() => {
    // Load orders initially
    fetchOrders()
    
    // Set up interval for auto-refresh
    const interval = setInterval(() => {
      fetchOrders()
    }, refreshInterval * 1000)
    
    // // Clean up interval on unmount
    // return () => clearInterval(interval)
  }, [])
  
  // Filter orders based on selected status
  useEffect(() => {
    if (statusFilter === 'all') {
      setFilteredOrders(orders)
    } else {
      setFilteredOrders(orders.filter(order => order.kitchen_status === statusFilter))
    }
  }, [orders, statusFilter])
  
  // Calculate counts for filter display
  const orderCounts = {
    all: orders.length,
    new: orders.filter(o => o.kitchen_status === 'pending').length,
    preparing: orders.filter(o => o.kitchen_status === 'processing').length,
    ready: orders.filter(o => o.kitchen_status === 'ready').length,
    completed: orders.filter(o => o.kitchen_status === 'completed').length,
  }
  
  // Handle manual refresh
  const handleManualRefresh = () => {
    fetchOrders()
  }
  
  return (
    <div>
      {/* Controls and filters */}
      <div className="flex flex-wrap items-center justify-between mb-4 gap-4">
        <div className="flex items-center space-x-2">
          <button 
            onClick={handleManualRefresh} 
            className="flex items-center px-4 py-2 bg-white rounded-md shadow-sm hover:bg-gray-50 disabled:opacity-50"
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          
          <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-md shadow-sm">
            <label htmlFor="refreshInterval" className="text-sm text-gray-600 flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              Auto-refresh:
            </label>
            <select 
              id="refreshInterval"
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              className="border-none bg-transparent text-sm"
            >
              <option value="10">10s</option>
              <option value="30">30s</option>
              <option value="60">1m</option>
              <option value="300">5m</option>
            </select>
          </div>
        </div>
        
        <OrderFilter 
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          orderCounts={orderCounts}
        />
      </div>
      
      {/* Order cards */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-gray-300 border-t-violet-600 rounded-full animate-spin"></div>
          <p className="mt-2 text-gray-600">Loading orders...</p>
        </div>
      ) : filteredOrders.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredOrders.map(order => (
            <OrderCard 
              key={order.id} 
              order={order} 
              updateStatus={updateOrderStatus} 
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Bell className="w-12 h-12 mx-auto text-gray-400" />
          <h3 className="mt-2 text-xl font-medium text-gray-600">No active orders</h3>
          <p className="text-gray-500">New orders will appear here automatically</p>
        </div>
      )}
    </div>
  )
}

export default KitchenDisplay