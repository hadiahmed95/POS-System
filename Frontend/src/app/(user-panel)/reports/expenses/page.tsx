import React from 'react'
import ExpenseReports from '../_components/expense-reports'

const ExpenseReportsPage = () => {
  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-xl font-semibold">Expense Reports</h2>
      </div>
      <div className="bg-white rounded-lg shadow-sm p-5">
        <ExpenseReports />
      </div>
    </div>
  )
}

export default ExpenseReportsPage
