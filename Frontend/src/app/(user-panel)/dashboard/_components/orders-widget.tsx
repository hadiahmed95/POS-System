'use client'

import { useRouter } from 'next/navigation'
import React, { useCallback, useEffect, useState } from 'react'
import { BASE_URL } from '@/config/constants'
import { routes } from '@/config/routes'
import { IOrder } from '../../type'
import { ArrowRight } from 'lucide-react'

const OrdersWidget = () => {
  const router = useRouter()
  const [recentOrders, setRecentOrders] = useState<IOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSales: 0,
    pendingOrders: 0,
    completedOrders: 0
  })

  const loadData = useCallback(async () => {
    setLoading(true)
    // try {
    //   const [ordersRes, statsRes] = await Promise.all([
    //     fetch(`${BASE_URL}/api/orders/recent`, {
    //       method: 'POST'
    //     }).then(res => res.json()),
    //     fetch(`${BASE_URL}/api/orders/stats`, {
    //       method: 'POST'
    //     }).then(res => res.json())
    //   ])

    //   if (ordersRes?.data?.data) {
    //     setRecentOrders(ordersRes.data.data)
    //   }

    //   if (statsRes?.data) {
    //     setStats(statsRes.data)
    //   }
    // } catch (error) {
    //   console.error('Error loading dashboard data:', error)
    // } finally {
    //   setLoading(false)
    // }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Stats Section */}
      <div className="col-span-full grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h3 className="text-sm text-gray-500 font-medium">Total Orders</h3>
          <p className="text-2xl font-semibold mt-1">{stats.totalOrders}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h3 className="text-sm text-gray-500 font-medium">Total Sales</h3>
          <p className="text-2xl font-semibold mt-1">${stats.totalSales.toFixed(2)}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h3 className="text-sm text-gray-500 font-medium">Pending Orders</h3>
          <p className="text-2xl font-semibold mt-1">{stats.pendingOrders}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h3 className="text-sm text-gray-500 font-medium">Completed Orders</h3>
          <p className="text-2xl font-semibold mt-1">{stats.completedOrders}</p>
        </div>
      </div>
      
      {/* Recent Orders */}
      <div className="col-span-2 bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Recent Orders</h3>
          <button 
            className="text-violet-600 hover:text-violet-800 flex items-center text-sm"
            onClick={() => router.push(routes.orders)}
          >
            View All <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </div>
        
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : recentOrders.length > 0 ? (
          <div className="divide-y">
            {recentOrders.map((order) => (
              <div 
                key={order.id} 
                className="py-3 flex justify-between items-center cursor-pointer hover:bg-gray-50"
                onClick={() => router.push(`${routes.orders}/edit/${order.id}`)}
              >
                <div>
                  <p className="font-medium">#{order.order_number}</p>
                  <p className="text-sm text-gray-500">
                    {order.customer_name || 'Walk-in'} • {formatDate(order.created_at)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">${order.total_amount.toFixed(2)}</p>
                  <p className={`text-xs ${
                    order.status === 'completed' ? 'text-green-600' :
                    order.status === 'pending' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">No recent orders</div>
        )}
      </div>
      
      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h3 className="text-lg font-medium mb-4">Quick Actions</h3>
        <div className="space-y-2">
          <button 
            className="w-full bg-violet-600 hover:bg-violet-700 text-white py-2 px-4 rounded-md transition-colors text-sm font-medium"
            onClick={() => router.push(`${routes.orders}/create`)}
          >
            Create New Order
          </button>
          <button 
            className="w-full bg-white border border-violet-600 text-violet-600 hover:bg-violet-50 py-2 px-4 rounded-md transition-colors text-sm font-medium"
            onClick={() => router.push(routes.items)}
          >
            Manage Items
          </button>
          <button 
            className="w-full bg-white border border-violet-600 text-violet-600 hover:bg-violet-50 py-2 px-4 rounded-md transition-colors text-sm font-medium"
            onClick={() => router.push(routes.categories)}
          >
            Manage Categories
          </button>
        </div>
      </div>
    </div>
  )
}

export default OrdersWidget