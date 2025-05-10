import React from 'react'
import EditOrderForm from '../../_components/edit-order-form'

const EditOrder = ({ params }: { params: { order_id: string } }) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-xl font-semibold">Edit Order</h2>
      </div>
      <div className="bg-white rounded-lg shadow-sm p-5">
        <EditOrderForm orderId={params.order_id} />
      </div>
    </div>
  )
}

export default EditOrder