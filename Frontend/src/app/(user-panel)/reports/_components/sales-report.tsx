'use client'

import { DarkButton, LiteButton } from '@/components/button'
import { TextField } from '@/components/Fields'
import { toastCustom } from '@/components/toastCustom'
import { BASE_URL } from '@/config/constants'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useReactToPrint } from 'react-to-print'
import { IOrderReport } from '../../type'
import { useAppSelector } from '../../_lib/store'
import { Calendar, Printer, Download, RefreshCw } from 'lucide-react'

interface ISummary {
  total_orders: number
  total_sales: number
  avg_order_value: number
}

const SalesReport = () => {
  const { branch } = useAppSelector(state => state.branch)
  
  // Refs
  const reportRef = useRef<HTMLDivElement>(null)
  
  // Date range state
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  
  // Loading states
  const [loading, setLoading] = useState<boolean>(false)
  const [isGenerating, setIsGenerating] = useState<boolean>(false)
  
  // Report data
  const [salesData, setSalesData] = useState<IOrderReport[]>([])
  const [summary, setSummary] = useState<ISummary>({
    total_orders: 0,
    total_sales: 0,
    avg_order_value: 0
  })
  
  // Set default date range to current month
  useEffect(() => {
    const today = new Date()
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
    
    setStartDate(firstDay.toISOString().split('T')[0])
    setEndDate(today.toISOString().split('T')[0])
  }, [])
  
  // Fetch sales data
  const fetchSalesData = useCallback(async () => {
    if (!startDate || !endDate) {
      toastCustom.error('Please select start and end dates')
      return
    }
    
    setIsGenerating(true)
    setLoading(true)
    
    try {
      const response = await fetch(`${BASE_URL}/api/reports/sales`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          start_date: startDate, 
          end_date: endDate,
          branch_id: branch?.id
        })
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
      setIsGenerating(false)
      setLoading(false)
    }
  }, [startDate, endDate, branch])
  
  // Generate report when date range changes
  useEffect(() => {
    if (startDate && endDate) {
      fetchSalesData()
    }
  }, [fetchSalesData, startDate, endDate])
  
  // Print report handler
  const handlePrint = useReactToPrint({
    contentRef: reportRef
  })
  
  // Export to CSV
  const exportToCSV = () => {
    if (salesData.length === 0) return
    
    // Create CSV content
    const headers = ['Date', 'Total Orders', 'Total Sales', 'Average Order Value']
    const csvRows = [headers]
    
    // Add data rows
    salesData.forEach(day => {
      csvRows.push([
        day.date,
        day.total_orders.toString(),
        day.total_sales.toFixed(2),
        day.avg_order_value.toFixed(2)
      ])
    })
    
    // Add summary row
    csvRows.push(['', '', '', ''])
    csvRows.push([
      'Summary',
      summary.total_orders.toString(),
      summary.total_sales.toFixed(2),
      summary.avg_order_value.toFixed(2)
    ])
    
    // Convert to CSV string
    const csvContent = csvRows.map(row => row.join(',')).join('\n')
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    
    link.setAttribute('href', url)
    link.setAttribute('download', `sales_report_${startDate}_to_${endDate}.csv`)
    link.style.visibility = 'hidden'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
  
  // Format date for display
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
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Calendar className="w-4 h-4 text-gray-500" />
            </div>
            <TextField
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="w-full md:w-1/3">
          <label className="block mb-1 font-medium">End Date</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Calendar className="w-4 h-4 text-gray-500" />
            </div>
            <TextField
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="w-full md:w-1/3 flex items-end">
          <DarkButton
            onClick={fetchSalesData}
            className="w-full justify-center"
            loading={isGenerating}
            disabled={isGenerating || !startDate || !endDate}
          >
            {isGenerating ? 'Generating...' : 'Generate Report'}
          </DarkButton>
        </div>
      </div>
      
      <div className="mb-4 flex justify-end space-x-2">
        <LiteButton
          onClick={handlePrint}
          className="flex items-center"
          disabled={salesData.length === 0 || loading}
        >
          <Printer className="w-4 h-4 mr-2" />
          Print Report
        </LiteButton>
        
        <LiteButton
          onClick={exportToCSV}
          className="flex items-center"
          disabled={salesData.length === 0 || loading}
        >
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </LiteButton>
      </div>
      
      <div ref={reportRef} className="bg-white p-6 rounded-lg shadow-sm">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold">Sales Report</h2>
          <p className="text-gray-600">
            {startDate && endDate ? `${formatDate(startDate)} - ${formatDate(endDate)}` : 'Select date range'}
          </p>
          {branch && (
            <p className="text-gray-600 text-sm mt-1">
              Branch: {branch.branch_name}
            </p>
          )}
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
          <div className="text-center py-8 text-gray-500">
            <RefreshCw className="w-8 h-8 mx-auto animate-spin text-violet-600 mb-2" />
            Loading sales data...
          </div>
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
                  <tr key={index} className="hover:bg-gray-50">
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
      
      {/* Extra insight section at the bottom */}
      {salesData.length > 0 && (
        <div className="mt-6 p-4 bg-violet-50 rounded-lg border border-violet-100">
          <h3 className="text-lg font-medium text-violet-800 mb-2">Report Insights</h3>
          <div className="space-y-2 text-sm text-violet-800">
            <p>
              <span className="font-medium">Daily Average: </span>
              ${(summary.total_sales / salesData.length).toFixed(2)} sales from {(summary.total_orders / salesData.length).toFixed(1)} orders per day
            </p>
            
            {salesData.length > 0 && (
              <>
                <p>
                  <span className="font-medium">Best Day: </span>
                  {formatDate(salesData.reduce((best, current) => 
                    current.total_sales > best.total_sales ? current : best, salesData[0]
                  ).date)} 
                  with ${salesData.reduce((best, current) => 
                    current.total_sales > best.total_sales ? current : best, salesData[0]
                  ).total_sales.toFixed(2)} in sales
                </p>
                
                <p>
                  <span className="font-medium">Busiest Day: </span>
                  {formatDate(salesData.reduce((best, current) => 
                    current.total_orders > best.total_orders ? current : best, salesData[0]
                  ).date)} 
                  with {salesData.reduce((best, current) => 
                    current.total_orders > best.total_orders ? current : best, salesData[0]
                  ).total_orders} orders
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default SalesReport