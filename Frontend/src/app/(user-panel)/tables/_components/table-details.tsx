'use client'

import React, { useState } from 'react'
import { ITable, ICustomer, IOrder } from '@/app/(user-panel)/type'
import { toastCustom } from '@/components/toastCustom'
import { BASE_URL } from '@/config/constants'
import { DarkButton, LiteButton } from '@/components/button'
import { TextField } from '@/components/Fields'
import { Clock, Users, CalendarClock, Utensils, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { routes } from '@/config/routes'

interface ITableDetailsProps {
  table: ITable
  onClose: () => void
  onStatusChange: (tableId: string | number, newStatus: ITable['status']) => void
}

interface IReservation {
  id: string | number
  table_id: string | number
  customer_name: string
  customer_phone: string
  party_size: number
  reservation_time: string
  notes?: string
  status: 'confirmed' | 'seated' | 'completed' | 'cancelled'
}

const TableDetails = ({ table, onClose, onStatusChange }: ITableDetailsProps) => {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'details' | 'reservations' | 'create-reservation'>('details')
  const [isLoading, setIsLoading] = useState(false)
  const [reservations, setReservations] = useState<IReservation[]>([])
  const [currentOrder, setCurrentOrder] = useState<IOrder | null>(null)
  
  // States for creating a new reservation
  const [reservationForm, setReservationForm] = useState({
    customer_name: '',
    customer_phone: '',
    party_size: table.capacity,
    reservation_time: formatDateForInput(new Date()),
    notes: ''
  })
  
  // Format date for datetime-local input
  function formatDateForInput(date: Date): string {
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }
  
  // Load reservations for this table
  const loadReservations = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${BASE_URL}/api/reservations/by-table/${table.id}`, {
        method: 'GET'
      })
      
      const data = await response.json()
      
      if (data.status === 'success' && data.data) {
        setReservations(data.data)
      }
    } catch (error) {
      console.error('Error loading reservations:', error)
      toastCustom.error('Failed to load reservations')
    } finally {
      setIsLoading(false)
    }
  }
  
  // Load current order for this table
  const loadCurrentOrder = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/orders/by-table/${table.id}/current`, {
        method: 'GET'
      })
      
      const data = await response.json()
      
      if (data.status === 'success' && data.data) {
        setCurrentOrder(data.data)
      }
    } catch (error) {
      console.error('Error loading current order:', error)
    }
  }
  
  // Handle reservation tab click
  const handleReservationsClick = () => {
    loadReservations()
    setActiveTab('reservations')
  }
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setReservationForm({
      ...reservationForm,
      [name]: value
    })
  }
  
  // Create a new reservation
  const createReservation = async () => {
    if (!reservationForm.customer_name || !reservationForm.reservation_time) {
      toastCustom.error('Please fill in all required fields')
      return
    }
    
    setIsLoading(true)
    try {
      const response = await fetch(`${BASE_URL}/api/reservations/add`, {
        method: 'POST',
        body: JSON.stringify({
          ...reservationForm,
          table_id: table.id,
          status: 'confirmed'
        })
      })
      
      const data = await response.json()
      
      if (data.status === 'success') {
        toastCustom.success('Reservation created successfully')
        setReservationForm({
          customer_name: '',
          customer_phone: '',
          party_size: table.capacity,
          reservation_time: formatDateForInput(new Date()),
          notes: ''
        })
        handleReservationsClick()
      } else {
        toastCustom.error(data.message || 'Failed to create reservation')
      }
    } catch (error) {
      console.error('Error creating reservation:', error)
      toastCustom.error('Failed to create reservation')
    } finally {
      setIsLoading(false)
    }
  }
  
  // Update reservation status
  const updateReservationStatus = async (reservationId: string | number, status: 'confirmed' | 'seated' | 'completed' | 'cancelled') => {
    setIsLoading(true)
    try {
      const response = await fetch(`${BASE_URL}/api/reservations/update-status`, {
        method: 'POST',
        body: JSON.stringify({
          id: reservationId,
          status
        })
      })
      
      const data = await response.json()
      
      if (data.status === 'success') {
        // If status is 'seated', update table status to 'occupied'
        if (status === 'seated') {
          onStatusChange(table.id ?? '', 'occupied')
        } else if (status === 'completed' || status === 'cancelled') {
          // Only update to available if there's no current order
          if (!currentOrder) {
            onStatusChange(table.id ?? '', 'available')
          }
        }
        
        // Update reservations list
        setReservations(reservations.map(res => 
          res.id === reservationId ? { ...res, status } : res
        ))
        
        toastCustom.success(`Reservation ${status} successfully`)
      } else {
        toastCustom.error(data.message || 'Failed to update reservation')
      }
    } catch (error) {
      console.error('Error updating reservation:', error)
      toastCustom.error('Failed to update reservation')
    } finally {
      setIsLoading(false)
    }
  }
  
  // Format reservation time
  const formatReservationTime = (timeString: string) => {
    const date = new Date(timeString)
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    })
  }
  
  // Create new order for this table
  const createNewOrder = () => {
    router.push(`${routes.orders}/create?table=${table.id}`)
  }
  
  // View current order
  const viewCurrentOrder = () => {
    if (currentOrder) {
      router.push(`${routes.orders}/edit/${currentOrder.id}`)
    }
  }
  
  // Check if a table is occupied
  const isTableOccupied = () => {
    return table.status === 'occupied'
  }
  
  // Clear table (mark as available)
  const clearTable = async () => {
    if (!isTableOccupied()) return
    
    try {
      // Update table status
      onStatusChange(table.id ?? '', 'available')
      
      // If there's a current order, mark it as completed
      if (currentOrder) {
        await fetch(`${BASE_URL}/api/orders/update`, {
          method: 'POST',
          body: JSON.stringify({
            id: currentOrder.id,
            status: 'completed'
          })
        })
        
        setCurrentOrder(null)
      }
      
      toastCustom.success('Table cleared successfully')
    } catch (error) {
      console.error('Error clearing table:', error)
      toastCustom.error('Failed to clear table')
    }
  }
  
  // Load current order when details tab is selected
  React.useEffect(() => {
    if (activeTab === 'details' && isTableOccupied()) {
      loadCurrentOrder()
    }
  }, [activeTab])
  
  // Get status badge styling
  const getStatusBadgeStyle = () => {
    switch (table.status) {
      case 'available':
        return 'bg-green-100 text-green-800'
      case 'reserved':
        return 'bg-amber-100 text-amber-800'
      case 'occupied':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }
  
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden" style={{ minWidth: '400px' }}>
      {/* Header */}
      <div className="bg-violet-100 px-4 py-3 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Table {table.table_no}</h3>
          <div className="flex items-center text-sm">
            <Users className="w-4 h-4 mr-1" />
            <span>Capacity: {table.capacity}</span>
            <span className={`ml-3 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeStyle()}`}>
              {table.status.charAt(0).toUpperCase() + table.status.slice(1)}
            </span>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      {/* Tabs */}
      <div className="flex border-b">
        <button
          className={`flex-1 py-2 text-center text-sm ${activeTab === 'details' ? 'border-b-2 border-violet-500 font-medium text-violet-600' : 'text-gray-600 hover:text-gray-800'}`}
          onClick={() => setActiveTab('details')}
        >
          Details
        </button>
        <button
          className={`flex-1 py-2 text-center text-sm ${activeTab === 'reservations' ? 'border-b-2 border-violet-500 font-medium text-violet-600' : 'text-gray-600 hover:text-gray-800'}`}
          onClick={handleReservationsClick}
        >
          Reservations
        </button>
        <button
          className={`flex-1 py-2 text-center text-sm ${activeTab === 'create-reservation' ? 'border-b-2 border-violet-500 font-medium text-violet-600' : 'text-gray-600 hover:text-gray-800'}`}
          onClick={() => setActiveTab('create-reservation')}
        >
          New Reservation
        </button>
      </div>
      
      {/* Content */}
      <div className="p-4">
        {/* Details Tab */}
        {activeTab === 'details' && (
          <div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="border rounded p-3 text-center">
                <div className="text-sm text-gray-500">Type</div>
                <div className="font-medium">{table.type.charAt(0).toUpperCase() + table.type.slice(1)}</div>
              </div>
              <div className="border rounded p-3 text-center">
                <div className="text-sm text-gray-500">Status</div>
                <div className="font-medium">{table.status.charAt(0).toUpperCase() + table.status.slice(1)}</div>
              </div>
            </div>
            
            {isTableOccupied() && (
              <div className="border rounded-lg p-3 mb-4">
                <h4 className="font-medium mb-2">Current Order</h4>
                {currentOrder ? (
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Order #{currentOrder.order_number}</span>
                      <span>{new Date(currentOrder.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="text-sm text-gray-600 mb-3">
                      {currentOrder.items_count} items • ${currentOrder.total_amount.toFixed(2)}
                    </div>
                    <DarkButton 
                      onClick={viewCurrentOrder}
                      className="w-full justify-center"
                    >
                      View Order Details
                    </DarkButton>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No active order found.</p>
                )}
              </div>
            )}
            
            <div className="space-y-2">
              {!isTableOccupied() && (
                <DarkButton 
                  onClick={createNewOrder}
                  className="w-full justify-center"
                >
                  <Utensils className="w-4 h-4 mr-2" />
                  Create New Order
                </DarkButton>
              )}
              
              {isTableOccupied() && (
                <LiteButton 
                  onClick={clearTable}
                  className="w-full justify-center"
                >
                  Clear Table
                </LiteButton>
              )}
              
              <LiteButton 
                onClick={() => setActiveTab('create-reservation')}
                className="w-full justify-center"
              >
                <CalendarClock className="w-4 h-4 mr-2" />
                Make Reservation
              </LiteButton>
            </div>
          </div>
        )}
        
        {/* Reservations Tab */}
        {activeTab === 'reservations' && (
          <div>
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-medium">Upcoming Reservations</h4>
              <LiteButton 
                onClick={() => setActiveTab('create-reservation')}
                className="text-xs py-1"
              >
                + New
              </LiteButton>
            </div>
            
            {isLoading ? (
              <div className="text-center py-4">
                <div className="inline-block w-6 h-6 border-2 border-gray-300 border-t-violet-600 rounded-full animate-spin"></div>
                <p className="mt-2 text-sm text-gray-500">Loading reservations...</p>
              </div>
            ) : reservations.length > 0 ? (
              <div className="space-y-3">
                {reservations.map(reservation => (
                  <div key={reservation.id} className="border rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h5 className="font-medium">{reservation.customer_name}</h5>
                        <p className="text-sm text-gray-600">{reservation.customer_phone}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        reservation.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                        reservation.status === 'seated' ? 'bg-green-100 text-green-800' :
                        reservation.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                      </span>
                    </div>
                    <div className="flex items-center text-sm mt-2 mb-3">
                      <Clock className="w-4 h-4 mr-1 text-gray-500" />
                      <span>{formatReservationTime(reservation.reservation_time)}</span>
                      <Users className="w-4 h-4 ml-3 mr-1 text-gray-500" />
                      <span>Party of {reservation.party_size}</span>
                    </div>
                    {reservation.notes && (
                      <div className="text-sm mb-3 bg-gray-50 p-2 rounded">
                        {reservation.notes}
                      </div>
                    )}
                    <div className="flex space-x-2">
                      {reservation.status === 'confirmed' && (
                        <>
                          <LiteButton 
                            onClick={() => updateReservationStatus(reservation.id, 'seated')}
                            className="flex-1 justify-center text-xs py-1"
                          >
                            Seat Now
                          </LiteButton>
                          <LiteButton 
                            onClick={() => updateReservationStatus(reservation.id, 'cancelled')}
                            className="flex-1 justify-center text-xs py-1 bg-red-50 text-red-600"
                          >
                            Cancel
                          </LiteButton>
                        </>
                      )}
                      {reservation.status === 'seated' && (
                        <LiteButton 
                          onClick={() => updateReservationStatus(reservation.id, 'completed')}
                          className="w-full justify-center text-xs py-1"
                        >
                          Mark Completed
                        </LiteButton>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                <p>No reservations found for this table.</p>
                <p className="text-sm mt-1">Create a new reservation to get started.</p>
              </div>
            )}
          </div>
        )}
        
        {/* Create Reservation Tab */}
        {activeTab === 'create-reservation' && (
          <div>
            <h4 className="font-medium mb-3">New Reservation</h4>
            <form onSubmit={(e) => {
              e.preventDefault()
              createReservation()
            }}>
              <div className="space-y-3">
                <div>
                  <label htmlFor="customer_name" className="block text-sm font-medium text-gray-700 mb-1">
                    Customer Name *
                  </label>
                  <TextField
                    id="customer_name"
                    name="customer_name"
                    value={reservationForm.customer_name}
                    onChange={handleInputChange}
                    placeholder="Customer Name"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="customer_phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <TextField
                    id="customer_phone"
                    name="customer_phone"
                    value={reservationForm.customer_phone}
                    onChange={handleInputChange}
                    placeholder="Phone Number"
                  />
                </div>
                
                <div>
                  <label htmlFor="party_size" className="block text-sm font-medium text-gray-700 mb-1">
                    Party Size *
                  </label>
                  <TextField
                    id="party_size"
                    name="party_size"
                    type="number"
                    min="1"
                    max={table.capacity}
                    value={reservationForm.party_size}
                    onChange={handleInputChange}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Max capacity: {table.capacity}
                  </p>
                </div>
                
                <div>
                  <label htmlFor="reservation_time" className="block text-sm font-medium text-gray-700 mb-1">
                    Reservation Time *
                  </label>
                  <TextField
                    id="reservation_time"
                    name="reservation_time"
                    type="datetime-local"
                    value={reservationForm.reservation_time}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows={3}
                    value={reservationForm.notes}
                    onChange={handleInputChange}
                    placeholder="Special requests or notes"
                    className="w-full p-2 border border-gray-300 rounded-md bg-gray-50 text-sm"
                  />
                </div>
                
                <div className="pt-2">
                  <DarkButton
                    type="submit"
                    className="w-full justify-center"
                    loading={isLoading}
                    disabled={isLoading}
                  >
                    Create Reservation
                  </DarkButton>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

export default TableDetails