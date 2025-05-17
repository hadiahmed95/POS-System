'use client'

import { DarkButton, LiteButton } from '@/components/button'
import { toastCustom } from '@/components/toastCustom'
import { BASE_URL } from '@/config/constants'
import { routes } from '@/config/routes'
import { PenIcon, Printer, Trash2, Eye, Filter, Calendar, RefreshCw } from 'lucide-react'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { confirmAlert } from 'react-confirm-alert'
import 'react-confirm-alert/src/react-confirm-alert.css'
import TableLoader from '../../_components/table-loader'
import { IOrder } from '@/app/(user-panel)/type'
import { useRouter } from 'next/navigation'
import OrderDetailsModal from './order-details-modal'
import OrderReceipt from './order-receipt'
import { TextField } from '@/components/Fields'
import dynamic from 'next/dynamic'

const ReactSelect = dynamic(() => import("react-select"), { ssr: false });

const OrdersPage = () => {
  const router = useRouter()
  const hasFetched = useRef(false)

  // UI States
  const [showReceipt, setShowReceipt] = useState<boolean>(false)
  const [showDetails, setShowDetails] = useState<boolean>(false)
  const [showFilters, setShowFilters] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [refreshing, setRefreshing] = useState<boolean>(false)

  // Data States
  const [ordersList, setOrdersList] = useState<IOrder[]>([])
  const [selectedOrder, setSelectedOrder] = useState<IOrder | null>(null)

  // Filter States
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')

  // Delete an order
  const delRecord = (id: number) => {
    confirmAlert({
      title: 'Confirm Delete',
      message: 'Are you sure you want to delete this order?',
      buttons: [
        {
          label: 'Yes',
          onClick: () => {
            setIsLoading(true)
            fetch(`${BASE_URL}/api/orders/delete`, {
              method: "POST",
              body: JSON.stringify({ id })
            }).then(async response => {
              const result = await response.json()
              if (result.status === 'success') {
                toastCustom.error('Order deleted successfully.')
                setOrdersList(ordersList.filter(order => Number(order.id) !== id))
              } else {
                toastCustom.error(result.message || 'Failed to delete order')
              }
              setIsLoading(false)
            }).catch(error => {
              console.error('Error deleting order:', error)
              toastCustom.error('An error occurred while deleting the order')
              setIsLoading(false)
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

  // View order details
  const viewOrderDetails = (order: IOrder) => {
    setSelectedOrder(order)
    setShowDetails(true)
  }

  // Print receipt
  const printReceipt = async (id: number) => {
    try {
      setIsLoading(true)
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
    } finally {
      setIsLoading(false)
    }
  }

  // Load orders with filters
  const load = useCallback(async () => {
    if (refreshing) return
    
    setIsLoading(true)
    setRefreshing(true)
    
    try {
      const filterData: any = {}
      
      if (startDate && endDate) {
        filterData.date_from = startDate
        filterData.date_to = endDate
      }
      
      if (statusFilter) {
        filterData.status = statusFilter
      }
      
      const res = await fetch(`${BASE_URL}/api/orders/view`, {
        method: "POST",
        body: JSON.stringify(filterData)
      }).then(async response => response.json())

      if (res?.data?.data) {
        setOrdersList(res.data.data)
      } else {
        setOrdersList([])
      }
    } catch (error) {
      console.error("Error fetching orders:", error)
      toastCustom.error("Failed to load orders")
    } finally {
      setIsLoading(false)
      setRefreshing(false)
      hasFetched.current = true
    }
  }, [startDate, endDate, statusFilter, refreshing])

  useEffect(() => {
    if (!hasFetched.current) {
      // Set default dates to current month if not already set
      if (!startDate) {
        const today = new Date()
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
        setStartDate(firstDayOfMonth.toISOString().split('T')[0])
        setEndDate(today.toISOString().split('T')[0])
      } else {
        load()
      }
    }
  }, [load, startDate, endDate])

  // Format date for display
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

  // Status options for filter dropdown
  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ]

  // Reset filters
  const resetFilters = () => {
    const today = new Date()
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    setStartDate(firstDayOfMonth.toISOString().split('T')[0])
    setEndDate(today.toISOString().split('T')[0])
    setStatusFilter('')
    hasFetched.current = false
  }

  return (
    <div>
      <div className={`flex items-center justify-between bg-white py-4 px-6 rounded-lg shadow-sm`}>
        <h2 className={'text-xl font-semibold'}>{'Orders'}</h2>

        <div className="flex space-x-2">
          <LiteButton
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center ${showFilters ? 'bg-violet-100 text-violet-700' : ''}`}
          >
            <Filter className="w-4 h-4 mr-1" />
            Filters
          </LiteButton>

          <LiteButton
            onClick={() => {
              hasFetched.current = false
              load()
            }}
            className="flex items-center"
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </LiteButton>

          <DarkButton
            onClick={() => router.push(routes.orders + '/create')}
          >
            {'Create Order'}
          </DarkButton>
        </div>
      </div>

      {showFilters && (
        <div className="bg-white p-4 mt-4 rounded-lg shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">From Date</label>
              <TextField
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">To Date</label>
              <TextField
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <ReactSelect
                options={statusOptions}
                value={statusOptions.find(option => option.value === statusFilter)}
                onChange={(option: any) => setStatusFilter(option?.value || '')}
                classNamePrefix="react-select"
              />
            </div>
          </div>
          
          <div className="flex justify-end mt-4 space-x-2">
            <LiteButton onClick={resetFilters}>
              Reset
            </LiteButton>
            
            <DarkButton onClick={() => {
              hasFetched.current = false
              load()
            }}>
              Apply Filters
            </DarkButton>
          </div>
        </div>
      )}

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
              <th scope="col" className="px-6 py-3">Table</th>
              <th scope="col" className="px-6 py-3">Items</th>
              <th scope="col" className="px-6 py-3">Total</th>
              <th scope="col" className="px-6 py-3">Status</th>
              <th scope="col" className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={8}>
                  <TableLoader />
                </td>
              </tr>
            ) : ordersList.length > 0 ? (
              ordersList.map((order) => (
                <tr key={order.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">#{order.order_number}</td>
                  <td className="px-6 py-4">{formatDate(order.created_at)}</td>
                  <td className="px-6 py-4">{order.customer_name || 'Walk-in'}</td>
                  <td className="px-6 py-4">{order?.table_no || '-'}</td>
                  <td className="px-6 py-4">{ order.items.map(_item => _item.item_name).join(', ') }</td>
                  <td className="px-6 py-4 font-medium">${(order.total || order.total_amount || 0).toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      order.status === 'completed' ? 'bg-green-100 text-green-800' :
                      order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
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
              ))) : (
                <tr>
                  <td colSpan={8}>
                    <p className={'p-4 text-center'}>{'No orders found for the selected criteria'}</p>
                  </td>
                </tr>
              )
            }
          </tbody>
        </table>
      </div>
      
      {ordersList.length > 0 && (
        <div className="mt-4 bg-white p-4 rounded-lg shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-sm text-gray-500">Total Orders: </span>
              <span className="font-medium">{ordersList.length}</span>
            </div>
            <div>
              <span className="text-sm text-gray-500">Total Amount: </span>
              <span className="font-medium">${ordersList.reduce((total, order) => total + (Number(order.total) || Number(order.total_amount) || 0), 0).toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default OrdersPage