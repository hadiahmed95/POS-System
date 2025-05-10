'use client'

import { DarkButton } from '@/components/button'
import { TextField } from '@/components/Fields'
import { toastCustom } from '@/components/toastCustom'
import { BASE_URL } from '@/config/constants'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useReactToPrint } from 'react-to-print'

interface ISalesData {
  date: string
  total_orders: number
  total_sales: number
  avg_order_value: number
}

interface ISummary {
  total_orders: number
  total_sales: number
  avg_order_value: number
}

const SalesReport = () => {
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [salesData, setSalesData] = useState<ISalesData[]>([])
  const [summary, setSummary] = useState<ISummary>({
    total_orders: 0,
    total_sales: 0,
    avg_order_value: 0
  })
  
  const reportRef = useRef<HTMLDivElement>(null)
  
  // Set default date range to current month
  useEffect(() => {
    const today = new Date()
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
    
    setStartDate(firstDay.toISOString().split('T')[0])
    setEndDate(today.toISOString().split('T')[0])
  }, [])
  
  const fetchSalesData = useCallback(async () => {
    if (!startDate || !endDate) {
      toastCustom.error('Please select start and end dates')
      return
    }
    
    setLoading(true)
    try {
      const response = await fetch(`${BASE_URL}/api/reports/sales`, {
        method: 'POST',
        body: JSON.stringify({ start_date: startDate, end_date: endDate })
      })
      
      const data = await response.json()
      
      if (data?.status === 'success' && data?.data) {
        setSalesData(data.data.sales)
        setSummary(data.data.summary)
      } else {
        toastCustom.error('Failed to fetch sales data')
      }
    } catch (error) {
      console.error('Error fetching sales data:', error)
      toastCustom.error('Error generating report')
    } finally {
      setLoading(false)
    }
  }, [startDate, endDate])
  
  useEffect(() => {
    if (startDate && endDate) {
      fetchSalesData()
    }
  }, [startDate, endDate, fetchSalesData])
  
  const handlePrint = useReactToPrint({
    // content: () => reportRef.current
  })
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }
  
  return (
    <div>
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="w-full md:w-1/3">
          <label className="block mb-1 font-medium">Start Date</label>
          <TextField
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        
        <div className="w-full md:w-1/3">
          <label className="block mb-1 font-medium">End Date</label>
          <TextField
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        
        <div className="w-full md:w-1/3 flex items-end">
          <DarkButton
            onClick={fetchSalesData}
            className="w-full justify-center"
            loading={loading}
          >
            Generate Report
          </DarkButton>
        </div>
      </div>
      
      <div className="mb-4 flex justify-end">
        <DarkButton
          onClick={handlePrint}
          className="w-auto"
          disabled={salesData.length === 0}
        >
          Print Report
        </DarkButton>
      </div>
      
      <div ref={reportRef} className="bg-white p-4">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold">Sales Report</h2>
          <p className="text-gray-600">
            {startDate && endDate ? `${formatDate(startDate)} - ${formatDate(endDate)}` : 'Select date range'}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm text-gray-500 font-medium">Total Orders</h3>
            <p className="text-2xl font-semibold mt-1">{summary.total_orders}</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm text-gray-500 font-medium">Total Sales</h3>
            <p className="text-2xl font-semibold mt-1">${summary.total_sales.toFixed(2)}</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm text-gray-500 font-medium">Average Order Value</h3>
            <p className="text-2xl font-semibold mt-1">${summary.avg_order_value.toFixed(2)}</p>
          </div>
        </div>
        
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading sales data...</div>
        ) : salesData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-2 px-4 text-left text-sm font-medium text-gray-700">Date</th>
                  <th className="py-2 px-4 text-right text-sm font-medium text-gray-700">Orders</th>
                  <th className="py-2 px-4 text-right text-sm font-medium text-gray-700">Sales</th>
                  <th className="py-2 px-4 text-right text-sm font-medium text-gray-700">Avg Order Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {salesData.map((day, index) => (
                  <tr key={index}>
                    <td className="py-2 px-4 text-sm">{formatDate(day.date)}</td>
                    <td className="py-2 px-4 text-sm text-right">{day.total_orders}</td>
                    <td className="py-2 px-4 text-sm text-right">${day.total_sales.toFixed(2)}</td>
                    <td className="py-2 px-4 text-sm text-right">${day.avg_order_value.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">No sales data available for the selected period</div>
        )}
      </div>
    </div>
  )
}

export default SalesReport