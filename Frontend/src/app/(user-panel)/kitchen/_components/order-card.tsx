'use client'

import React, { useState } from 'react'
import { IKitchenOrder, KitchenOrderStatus } from './kitchen-display'
import { CheckCircle, Clock, ChefHat, BellRing, MoreVertical } from 'lucide-react'

interface IOrderCardProps {
  order: IKitchenOrder
  updateStatus: (orderId: number | string, status: KitchenOrderStatus) => Promise<void>
}

const OrderCard = ({ order, updateStatus }: IOrderCardProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  
  // Format elapsed time since order was placed or preparation started
  const formatElapsedTime = (dateString?: string) => {
    if (!dateString) return '--:--'
    
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffSecs = Math.floor((diffMs % 60000) / 1000)
    
    return `${diffMins.toString().padStart(2, '0')}:${diffSecs.toString().padStart(2, '0')}`
  }
  
  // Get estimated completion time
  const getEstimatedCompletionTime = () => {
    if (!order.preparation_started_at || !order.preparation_time) return null
    
    const startDate = new Date(order.preparation_started_at)
    const estCompletionDate = new Date(startDate.getTime() + order.preparation_time * 60000)
    
    // If already passed estimated time
    if (estCompletionDate.getTime() < new Date().getTime()) {
      return 'Overdue'
    }
    
    // Return time until estimated completion
    const diffMs = estCompletionDate.getTime() - new Date().getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffSecs = Math.floor((diffMs % 60000) / 1000)
    
    return `${diffMins}:${diffSecs.toString().padStart(2, '0')}`
  }
  
  // Get card styles based on status
  const getCardStyles = () => {
    switch (order.kitchen_status) {
      case 'new':
        return 'border-l-4 border-blue-500 bg-blue-50'
      case 'preparing':
        return 'border-l-4 border-yellow-500 bg-yellow-50'
      case 'ready':
        return 'border-l-4 border-green-500 bg-green-50'
      case 'completed':
        return 'border-l-4 border-gray-400 bg-gray-50'
      default:
        return 'border-l-4 border-gray-300'
    }
  }
  
  // Get status text and icon
  const getStatusInfo = () => {
    switch (order.kitchen_status) {
      case 'new':
        return { 
          text: 'New Order', 
          icon: <Clock className="w-5 h-5 text-blue-500" /> 
        }
      case 'preparing':
        return { 
          text: 'Preparing', 
          icon: <ChefHat className="w-5 h-5 text-yellow-500" /> 
        }
      case 'ready':
        return { 
          text: 'Ready to Serve', 
          icon: <BellRing className="w-5 h-5 text-green-500" /> 
        }
      case 'completed':
        return { 
          text: 'Completed', 
          icon: <CheckCircle className="w-5 h-5 text-gray-500" /> 
        }
      default:
        return { 
          text: 'Unknown', 
          icon: <Clock className="w-5 h-5" /> 
        }
    }
  }
  
  // Format date
  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    })
  }
  
  const statusInfo = getStatusInfo()
  
  return (
    <div className={`rounded-lg shadow overflow-hidden ${getCardStyles()}`}>
      {/* Header */}
      <div className="bg-white p-3 flex justify-between items-center border-b">
        <div className="flex items-center">
          {statusInfo.icon}
          <span className="font-bold text-lg ml-2">#{order.order_number}</span>
        </div>
        
        <div className="flex items-center">
          <span className="text-sm text-gray-500 mr-2">
            {formatTime(order.created_at)}
          </span>
          
          <div className="relative">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-1 rounded-full hover:bg-gray-100"
            >
              <MoreVertical className="w-5 h-5 text-gray-600" />
            </button>
            
            {isMenuOpen && (
              <div className="absolute right-0 mt-1 bg-white rounded-md shadow-lg z-10 min-w-[160px]">
                <div className="py-1">
                  {order.kitchen_status !== 'new' && (
                    <button
                      onClick={() => {
                        updateStatus(order.id as number, 'new')
                        setIsMenuOpen(false)
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Mark as New
                    </button>
                  )}
                  
                  {order.kitchen_status !== 'preparing' && (
                    <button
                      onClick={() => {
                        updateStatus(order.id as number, 'preparing')
                        setIsMenuOpen(false)
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Start Preparing
                    </button>
                  )}
                  
                  {order.kitchen_status !== 'ready' && (
                    <button
                      onClick={() => {
                        updateStatus(order.id as number, 'ready')
                        setIsMenuOpen(false)
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Mark as Ready
                    </button>
                  )}
                  
                  {order.kitchen_status !== 'completed' && (
                    <button
                      onClick={() => {
                        updateStatus(order.id as number, 'completed')
                        setIsMenuOpen(false)
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Complete Order
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Status bar */}
      <div className="flex items-center justify-between px-3 py-1 bg-opacity-30" 
        style={{
          backgroundColor: order.kitchen_status === 'new' ? 'rgba(59, 130, 246, 0.1)' : 
                          order.kitchen_status === 'preparing' ? 'rgba(245, 158, 11, 0.1)' :
                          order.kitchen_status === 'ready' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(156, 163, 175, 0.1)'
        }}
      >
        <span className="text-sm font-medium">{statusInfo.text}</span>
        
        {order.kitchen_status === 'preparing' && (
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            <span className="text-sm">
              {order.preparation_time ? `${getEstimatedCompletionTime()} left` : formatElapsedTime(order.preparation_started_at)}
            </span>
          </div>
        )}
        
        {order.kitchen_status === 'new' && (
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            <span className="text-sm">{formatElapsedTime(order.created_at)}</span>
          </div>
        )}
      </div>
      
      {/* Order content */}
      <div className="p-3 bg-white">
        {/* Customer info */}
        <div className="mb-2">
          {order.customer_name && (
            <p className="text-sm font-medium">{order.customer_name}</p>
          )}
          
          {order.table_no && (
            <p className="text-sm text-gray-600">Table: {order.table_no}</p>
          )}
        </div>
        
        {/* Order items */}
        <div className="space-y-1 mb-3">
          {order.items.map((item, index) => (
            <div key={index} className="flex justify-between items-start py-1 border-b border-dashed border-gray-200 last:border-0">
              <div>
                <span className="font-medium">{item.quantity}x</span>{' '}
                <span>{item.name}</span>
                {item.variation_name && (
                  <span className="text-sm text-gray-600 block ml-5">
                    {item.variation_name}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {/* Notes */}
        {order.notes && (
          <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-700">
            <p className="font-medium">Notes:</p>
            <p>{order.notes}</p>
          </div>
        )}
      </div>
      
      {/* Actions */}
      <div className="px-3 py-2 bg-gray-50 border-t">
        {order.kitchen_status === 'new' && (
          <button
            onClick={() => updateStatus(order.id as number, 'preparing')}
            className="w-full py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-md font-medium flex items-center justify-center"
          >
            <ChefHat className="w-4 h-4 mr-2" />
            Start Preparing
          </button>
        )}
        
        {order.kitchen_status === 'preparing' && (
          <button
            onClick={() => updateStatus(order.id as number, 'ready')}
            className="w-full py-2 bg-green-500 hover:bg-green-600 text-white rounded-md font-medium flex items-center justify-center"
          >
            <BellRing className="w-4 h-4 mr-2" />
            Mark as Ready
          </button>
        )}
        
        {order.kitchen_status === 'ready' && (
          <button
            onClick={() => updateStatus(order.id as number, 'completed')}
            className="w-full py-2 bg-violet-500 hover:bg-violet-600 text-white rounded-md font-medium flex items-center justify-center"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Complete Order
          </button>
        )}
      </div>
    </div>
  )
}

export default OrderCard