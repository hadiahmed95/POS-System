'use client'

import Popup, { PopupContent, PopupHeader } from '@/components/popup'
import React from 'react'
import { IOrder } from '@/app/(user-panel)/type'
import { DarkButton } from '@/components/button'
import { routes } from '@/config/routes'
import { useRouter } from 'next/navigation'
import { Printer } from 'lucide-react'

interface IOrderDetailsModal {
  show: boolean
  setShow: (val: boolean) => void
  order: IOrder
  onPrint?: () => void
}

const OrderDetailsModal = ({ show, setShow, order, onPrint }: IOrderDetailsModal) => {
  const router = useRouter()
  
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
        <div className="space-y-6" style={{
          maxHeight: "calc(100vh - 234px)",
          overflow: "auto"
        }}
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-500">Order Number</h3>
              <p className="font-medium">#{order.order_number}</p>
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
              <h3 className="text-sm font-semibold text-gray-500">Table</h3>
              <p>{order.table_no || 'No table'}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-500">Status</h3>
              <p className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                order.status === 'completed' ? 'bg-green-100 text-green-800' :
                order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </p>
            </div>
            {/* <div>
              <h3 className="text-sm font-semibold text-gray-500">Payment</h3>
              <p className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                order.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                order.payment_status === 'partially_paid' ? 'bg-blue-100 text-blue-800' :
                'bg-red-100 text-red-800'
              }`}>
                {order.payment_status ? (order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)) : 'Unpaid'}
              </p>
            </div> */}
          </div>
          
          <div>
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
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-2 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{item.item_name}</div>
                        {item.variation_name && (
                          <div className="text-xs text-gray-500">{item.variation_name}</div>
                        )}
                        {item.notes && (
                          <div className="text-xs text-gray-500 italic">{item.notes}</div>
                        )}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 text-right">{item.quantity}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 text-right">
                        ${(item.unit_price || 0).toFixed(2)}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 font-medium text-right">
                        ${((item.unit_price || 0) * item.quantity).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="flex flex-col items-end">
            <div className="grid grid-cols-2 gap-2 text-sm w-48">
              <span className="text-gray-500">Subtotal:</span>
              <span className="text-right">${(order.subtotal || 0).toFixed(2)}</span>
              
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
              
              <span className="text-gray-800 font-medium border-t pt-1">Total:</span>
              <span className="text-right font-bold border-t pt-1">
                ${(order.total || order.total_amount || 0).toFixed(2)}
              </span>
            </div>
          </div>
          
          {order.notes && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-1">Notes</h3>
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">{order.notes}</p>
            </div>
          )}
          
        </div>
        <div className="flex justify-between pt-4 border-t">
          <DarkButton 
            className="flex-1 justify-center mr-2"
            onClick={() => router.push(`${routes.orders}/edit/${order.id}`)}
          >
            Edit Order
          </DarkButton>
          
          {onPrint && (
            <DarkButton 
              className="flex-1 justify-center ml-2"
              onClick={onPrint}
            >
              <Printer className="w-4 h-4 mr-2" />
              Print Receipt
            </DarkButton>
          )}
        </div>
      </PopupContent>
    </Popup>
  )
}

export default OrderDetailsModal