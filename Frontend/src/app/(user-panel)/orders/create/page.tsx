import React from 'react'
import CreateOrderForm from '../_components/create-order-form'

const CreateOrder = () => {
  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-xl font-semibold">Create New Order</h2>
      </div>
      <div className="bg-white rounded-lg shadow-sm p-5">
        <CreateOrderForm />
      </div>
    </div>
  )
}

export default CreateOrder