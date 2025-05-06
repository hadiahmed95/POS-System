'use client'

import React from 'react'
import { CheckCircle, Clock, ChefHat, BellRing, FileText } from 'lucide-react'
import { KitchenOrderStatus } from './kitchen-display'

interface IOrderFilterProps {
  statusFilter: KitchenOrderStatus | 'all'
  setStatusFilter: (status: KitchenOrderStatus | 'all') => void
  orderCounts: {
    all: number
    new: number
    preparing: number
    ready: number
    completed: number
  }
}

const OrderFilter = ({ statusFilter, setStatusFilter, orderCounts }: IOrderFilterProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => setStatusFilter('all')}
        className={`flex items-center px-3 py-2 rounded-md ${
          statusFilter === 'all'
            ? 'bg-violet-100 text-violet-800 font-medium shadow-sm'
            : 'bg-white text-gray-600 hover:bg-gray-50 shadow-sm'
        }`}
      >
        <FileText className="w-4 h-4 mr-2" />
        All Orders
        <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-gray-100">
          {orderCounts.all}
        </span>
      </button>
      
      <button
        onClick={() => setStatusFilter('new')}
        className={`flex items-center px-3 py-2 rounded-md ${
          statusFilter === 'new'
            ? 'bg-blue-100 text-blue-800 font-medium shadow-sm'
            : 'bg-white text-gray-600 hover:bg-gray-50 shadow-sm'
        }`}
      >
        <Clock className="w-4 h-4 mr-2" />
        New
        <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800">
          {orderCounts.new}
        </span>
      </button>
      
      <button
        onClick={() => setStatusFilter('preparing')}
        className={`flex items-center px-3 py-2 rounded-md ${
          statusFilter === 'preparing'
            ? 'bg-yellow-100 text-yellow-800 font-medium shadow-sm'
            : 'bg-white text-gray-600 hover:bg-gray-50 shadow-sm'
        }`}
      >
        <ChefHat className="w-4 h-4 mr-2" />
        Preparing
        <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-yellow-100 text-yellow-800">
          {orderCounts.preparing}
        </span>
      </button>
      
      <button
        onClick={() => setStatusFilter('ready')}
        className={`flex items-center px-3 py-2 rounded-md ${
          statusFilter === 'ready'
            ? 'bg-green-100 text-green-800 font-medium shadow-sm'
            : 'bg-white text-gray-600 hover:bg-gray-50 shadow-sm'
        }`}
      >
        <BellRing className="w-4 h-4 mr-2" />
        Ready
        <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-800">
          {orderCounts.ready}
        </span>
      </button>
      
      <button
        onClick={() => setStatusFilter('completed')}
        className={`flex items-center px-3 py-2 rounded-md ${
          statusFilter === 'completed'
            ? 'bg-gray-200 text-gray-800 font-medium shadow-sm'
            : 'bg-white text-gray-600 hover:bg-gray-50 shadow-sm'
        }`}
      >
        <CheckCircle className="w-4 h-4 mr-2" />
        Completed
        <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-gray-200 text-gray-800">
          {orderCounts.completed}
        </span>
      </button>
    </div>
  )
}

export default OrderFilter