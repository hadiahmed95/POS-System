import React from 'react'
import CreateExpenseForm from '../_components/create-expense-form'

const CreateExpense = () => {
  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-xl font-semibold">Create Expense</h2>
      </div>
      <div className="bg-white rounded-lg shadow-sm p-5">
        <CreateExpenseForm />
      </div>
    </div>
  )
}

export default CreateExpense