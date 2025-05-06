import React from 'react'
import SalesReport from '../_components/sales-report'

const SalesReportPage = () => {
  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-xl font-semibold">Sales Report</h2>
      </div>
      <div className="bg-white rounded-lg shadow-sm p-5">
        <SalesReport />
      </div>
    </div>
  )
}

export default SalesReportPage