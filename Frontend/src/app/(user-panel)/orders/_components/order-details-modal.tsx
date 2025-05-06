'use client'

import Popup, { PopupContent, PopupHeader } from '@/components/popup'
import React from 'react'
import { IOrder } from '@/app/(user-panel)/type'

interface IOrderDetailsModal {
  show: boolean
  setShow: (val: boolean) => void
  order: IOrder
}

const OrderDetailsModal = ({ show, setShow, order }: IOrderDetailsModal) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <Popup show={show}>
      <PopupHeader title="Order Details" onClose={() => setShow(false)} />
      <PopupContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-500">Order Number</h3>
              <p>#{order.order_number}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-500">Date</h3>
              <p>{formatDate(order.created_at)}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-500">Customer</h3>
              <p>{order.customer_name || 'Walk-in'}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-500">Status</h3>
              <p className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                order.status === 'completed' ? 'bg-green-100 text-green-800' :
                order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </p>
            </div>
          </div>
          
          <div className="mt-4">
            <h3 className="text-sm font-semibold text-gray-500 mb-2">Items</h3>
            <div className="border rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {order.items.map((item, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{item.name}</div>
                        {item && (
                          <div className="text-xs text-gray-500">{'variation'}</div>
                        )}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 text-right">{item.quantity}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 text-right">${item.price.toFixed(2)}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 font-medium text-right">${(item.quantity * item.price).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="mt-4 flex flex-col items-end">
            <div className="grid grid-cols-2 gap-2 text-sm w-48">
              <span className="text-gray-500">Subtotal:</span>
              <span className="text-right">${order.subtotal.toFixed(2)}</span>
              
              {order.discount > 0 && (
                <>
                  <span className="text-gray-500">Discount:</span>
                  <span className="text-right text-red-600">-${order.discount.toFixed(2)}</span>
                </>
              )}
              
              {order.tax > 0 && (
                <>
                  <span className="text-gray-500">Tax:</span>
                  <span className="text-right">${order.tax.toFixed(2)}</span>
                </>
              )}
              
              <span className="text-gray-800 font-medium">Total:</span>
              <span className="text-right font-bold">${order.total_amount.toFixed(2)}</span>
            </div>
          </div>
          
          {order.notes && (
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-gray-500 mb-1">Notes</h3>
              <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">{order.notes}</p>
            </div>
          )}
        </div>
      </PopupContent>
    </Popup>
  )
}

export default OrderDetailsModal