import React from 'react'
import KitchenDisplay from './_components/kitchen-display'

const KitchenDisplayPage = () => {
  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <div className="mb-4">
        <h2 className="text-2xl font-bold">Kitchen Display System</h2>
        <p className="text-gray-600">View and manage active orders</p>
      </div>
      <KitchenDisplay />
    </div>
  )
}

export default KitchenDisplayPage