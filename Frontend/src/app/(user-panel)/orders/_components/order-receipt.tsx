'use client'

import React, { useEffect, useRef } from 'react'
import { IOrder } from '@/app/(user-panel)/type'
import { useReactToPrint } from 'react-to-print'
import { DarkButton } from '@/components/button'
import { useAppSelector } from '../../_lib/store'

interface IOrderReceiptProps {
  order: IOrder
  onClose: () => void
}

const OrderReceipt = ({ order, onClose }: IOrderReceiptProps) => {
  const receiptRef = useRef<HTMLDivElement>(null)
  const { branch } = useAppSelector(state => state.branch)
  
  const handlePrint = useReactToPrint({
    contentRef: receiptRef,
    onAfterPrint: () => {
      onClose()
    }
  })
  
  // Automatically trigger print when component mounts
  // useEffect(() => {
  //   // Slight delay to ensure the component is fully rendered
  //   const timer = setTimeout(() => {
  //     handlePrint()
  //   }, 300)
    
  //   return () => clearTimeout(timer)
  // }, [handlePrint])
  
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h3 className="text-lg font-medium mb-4">Print Receipt</h3>
        
        <div ref={receiptRef} className="p-4 w-80 mx-auto font-mono text-sm">
          {/* Receipt Header */}
          <div className="text-center mb-4">
            <h2 className="text-lg font-bold">{branch?.branch_name || 'Restaurant POS'}</h2>
            <p className="text-xs">{branch?.branch_address || ''}</p>
            <p className="text-xs">{branch?.branch_phone || ''}</p>
          </div>
          
          <div className="border-b border-dashed border-gray-400 mb-3"></div>
          
          {/* Order Info */}
          <div className="mb-3">
            <p>Receipt #: {order.order_number}</p>
            <p>Date: {formatDate(order.created_at)}</p>
            {order.customer_name && <p>Customer: {order.customer_name}</p>}
            {order.table_no && <p>Table: {order.table_no}</p>}
          </div>
          
          <div className="border-b border-dashed border-gray-400 mb-3"></div>
          
          {/* Order Items */}
          <div className="mb-3">
            <div className="grid grid-cols-12 text-xs font-bold mb-1">
              <div className="col-span-6">Item</div>
              <div className="col-span-2 text-right">Qty</div>
              <div className="col-span-2 text-right">Price</div>
              <div className="col-span-2 text-right">Total</div>
            </div>
            
            {order.items.map((item, index) => (
              <div key={index} className="grid grid-cols-12 text-xs py-1 border-b border-dotted border-gray-200">
                <div className="col-span-6">
                  <p>{item.item_name}</p>
                  {item.variation_name && <p className="text-xs">({item.variation_name})</p>}
                </div>
                <div className="col-span-2 text-right">{item.quantity}</div>
                <div className="col-span-2 text-right">${(item.unit_price).toFixed(2)}</div>
                <div className="col-span-2 text-right">${(item.unit_price * item.quantity).toFixed(2)}</div>
              </div>
            ))}
          </div>
          
          <div className="border-b border-dashed border-gray-400 mb-2"></div>
          
          {/* Totals */}
          <div className="text-xs">
            <div className="flex justify-between mb-1">
              <span>Subtotal:</span>
              <span>${(order.subtotal || 0).toFixed(2)}</span>
            </div>
            
            {order.discount > 0 && (
              <div className="flex justify-between mb-1">
                <span>Discount:</span>
                <span>-${order.discount.toFixed(2)}</span>
              </div>
            )}
            
            {order.tax > 0 && (
              <div className="flex justify-between mb-1">
                <span>Tax:</span>
                <span>${order.tax.toFixed(2)}</span>
              </div>
            )}
            
            <div className="flex justify-between font-bold mt-1 pt-1 border-t border-dashed border-gray-400">
              <span>Total:</span>
              <span>${(order.total || order.total_amount || 0).toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between mt-2">
              <span>Payment Status:</span>
              <span>{order.payment_status ? (order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)) : 'Unpaid'}</span>
            </div>
          </div>
          
          <div className="border-b border-dashed border-gray-400 my-3"></div>
          
          {/* Footer */}
          <div className="text-center text-xs mt-4">
            <p>Thank you for your business!</p>
            <p>Please come again</p>
            <p className="mt-2">Receipt generated: {new Date().toLocaleString()}</p>
          </div>
        </div>
        
        <div className="text-center mb-4 mt-6">
          <p>The receipt is ready to print.</p>
          <p className="text-sm text-gray-500">If the print dialog doesn't appear, use the button below.</p>
        </div>
        
        <div className="flex justify-between">
          <DarkButton onClick={handlePrint} className="w-1/2 justify-center mr-2">
            Print Receipt
          </DarkButton>
          <DarkButton variant="danger" onClick={onClose} className="w-1/2 ml-2 justify-center">
            Close
          </DarkButton>
        </div>
      </div>
    </div>
  )
}

export default OrderReceipt