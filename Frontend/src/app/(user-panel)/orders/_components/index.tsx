'use client'

import { DarkButton } from '@/components/button'
import { toastCustom } from '@/components/toastCustom'
import { BASE_URL } from '@/config/constants'
import { routes } from '@/config/routes'
import { PenIcon, Printer, Trash2, Eye } from 'lucide-react'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { confirmAlert } from 'react-confirm-alert'
import 'react-confirm-alert/src/react-confirm-alert.css'
import TableLoader from '../../_components/table-loader'
import { IOrder } from '@/app/(user-panel)/type'
import { useRouter } from 'next/navigation'
import OrderDetailsModal from './order-details-modal'
import OrderReceipt from './order-receipt'

const OrdersPage = () => {
  const router = useRouter()
  const hasFetched = useRef(false)

  const [showReceipt, setShowReceipt] = useState<boolean>(false)
  const [ordersList, setOrdersList] = useState<IOrder[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [showDetails, setShowDetails] = useState<boolean>(false)
  const [selectedOrder, setSelectedOrder] = useState<IOrder | null>(null)

  const delRecord = (id: number) => {
    confirmAlert({
      title: 'Confirm Delete',
      message: 'Are you sure to delete this order?',
      buttons: [
        {
          label: 'Yes',
          onClick: () => {
            fetch(`${BASE_URL}/api/orders/delete`, {
              method: "POST",
              body: JSON.stringify({ id })
            }).then(_ => {
              toastCustom.error('Order deleted successfully.')
              setOrdersList(ordersList.filter(order => Number(order.id) !== id))
            })
          }
        },
        {
          label: 'No',
          onClick: () => { }
        }
      ]
    })
  }

  const viewOrderDetails = (order: IOrder) => {
    setSelectedOrder(order)
    setShowDetails(true)
  }

  const printReceipt = async (id: number) => {
        // Implement receipt printing functionality
        try {
        const response = await fetch(`${BASE_URL}/api/orders/${id}`, {
        method: 'GET'
        })
        
        const data = await response.json()
        
        if (data?.status === 'success' && data?.data) {
        setSelectedOrder(data.data)
        setShowReceipt(true)
        } else {
        toastCustom.error('Failed to load order details for receipt')
        }
    } catch (error) {
        console.error('Error fetching order for receipt:', error)
        toastCustom.error('Error printing receipt')
    }
  }

  const load = useCallback(async () => {
    if (hasFetched.current) return

    hasFetched.current = true
    // setIsLoading(true)
    // try {
    //   const res = await fetch(`${BASE_URL}/api/orders/view`, {
    //     method: "POST"
    //   }).then(async response => response.json())

    //   if (res?.data?.data) {
    //     setOrdersList(res.data.data)
    //   }
    //   setIsLoading(false)
    // } 
    // catch (error) {
    //   console.error("Error fetching data:", error)
    // } 
    // finally {
    //   setIsLoading(false)
    // }
  }, [])

  useEffect(() => {
    load()
  }, [load])

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
    <div>
      <div className={`flex items-center justify-between bg-white py-4 px-6 rounded-lg shadow-sm`}>
        <h2 className={'text-xl font-semibold'}>{'Orders'}</h2>

        <DarkButton
          onClick={() => router.push(routes.orders + '/create')}
        >{'Create Order'}</DarkButton>
      </div>

        {selectedOrder && (
        <>
            <OrderDetailsModal
            show={showDetails}
            setShow={setShowDetails}
            order={selectedOrder}
            />
            
            {showReceipt && (
            <OrderReceipt 
                order={selectedOrder}
                onClose={() => setShowReceipt(false)}
            />
            )}
        </>
        )}

      <div className={'relative overflow-x-auto mt-5 bg-white shadow-sm rounded-lg'}>
        <table className={'w-full text-sm text-left rtl:text-right text-gray-500'}>
          <thead className={'text-xs text-gray-700 uppercase bg-gray-100'}>
            <tr>
              <th scope="col" className="px-6 py-3">Order #</th>
              <th scope="col" className="px-6 py-3">Date</th>
              <th scope="col" className="px-6 py-3">Customer</th>
              <th scope="col" className="px-6 py-3">Items</th>
              <th scope="col" className="px-6 py-3">Total</th>
              <th scope="col" className="px-6 py-3">Status</th>
              <th scope="col" className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={7}>
                  <TableLoader />
                </td>
              </tr>
            ) : ordersList.length > 0 ? (
              ordersList.map((order) => (
                <tr key={order.id} className="border-b">
                  <td className="px-6 py-4 font-medium">#{order.order_number}</td>
                  <td className="px-6 py-4">{formatDate(order.created_at)}</td>
                  <td className="px-6 py-4">{order.customer_name || 'Walk-in'}</td>
                  <td className="px-6 py-4">{order.items_count}</td>
                  <td className="px-6 py-4 font-medium">${order.total_amount.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      order.status === 'completed' ? 'bg-green-100 text-green-800' :
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex items-center">
                    <DarkButton 
                      className='mr-2 inline-block w-max shadow-lg !p-[5px]'
                      onClick={() => viewOrderDetails(order)}
                    >
                      <Eye className={'p-1'} />
                    </DarkButton>
                    <DarkButton 
                      className='mr-2 inline-block w-max shadow-lg !p-[5px]'
                      onClick={() => router.push(`${routes.orders}/edit/${order.id}`)}
                    >
                      <PenIcon className={'p-1'} />
                    </DarkButton>
                    <DarkButton 
                      className='mr-2 inline-block w-max shadow-lg !p-[5px]'
                      onClick={() => printReceipt(Number(order.id))}
                    >
                      <Printer className={'p-1'} />
                    </DarkButton>
                    <DarkButton 
                      variant='danger'
                      className={'inline-block w-max shadow-lg !p-[5px]'}
                      onClick={() => delRecord(Number(order.id))}
                    >
                      <Trash2 className={'w-5'} />
                    </DarkButton>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7}>
                  <p className={'p-4 text-center'}>{'No orders found'}</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default OrdersPage