import React from 'react'
import EditExpenseForm from '../../_components/edit-expense-form'

const EditExpense = ({ params }: { params: { expense_id: string } }) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-xl font-semibold">Edit Expense</h2>
      </div>
      <div className="bg-white rounded-lg shadow-sm p-5">
        <EditExpenseForm expenseId={params.expense_id} />
      </div>
    </div>
  )
}

export default EditExpense