'use client'

import { DarkButton, LiteButton } from '@/components/button'
import { TextField } from '@/components/Fields'
import { toastCustom } from '@/components/toastCustom'
import { BASE_URL } from '@/config/constants'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useReactToPrint } from 'react-to-print'
import { IExpenseReport } from '../../type'
import { useAppSelector } from '../../_lib/store'
import { Calendar, Printer, Download, RefreshCw, TrendingUp, TrendingDown } from 'lucide-react'

interface ISummary {
  total_expenses: number
  total_amount: number
  avg_expense_amount: number
}

const ExpenseReports = () => {
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
  const [expenseData, setExpenseData] = useState<IExpenseReport[]>([])
  const [summary, setSummary] = useState<ISummary>({
    total_expenses: 0,
    total_amount: 0,
    avg_expense_amount: 0
  })
  
  // Set default date range to current month
  useEffect(() => {
    const today = new Date()
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
    
    setStartDate(firstDay.toISOString().split('T')[0])
    setEndDate(today.toISOString().split('T')[0])
  }, [])
  
  // Fetch expense data
  const fetchExpenseData = useCallback(async () => {
    if (!startDate || !endDate) {
      toastCustom.error('Please select start and end dates')
      return
    }
    
    setIsGenerating(true)
    setLoading(true)
    
    try {
      const response = await fetch(`${BASE_URL}/api/reports/expenses`, {
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
        setExpenseData(data.data.expenses)
        setSummary(data.data.summary)
      } else {
        toastCustom.error('Failed to fetch expense data')
      }
    } catch (error) {
      console.error('Error fetching expense data:', error)
      toastCustom.error('Error generating report')
    } finally {
      setIsGenerating(false)
      setLoading(false)
    }
  }, [startDate, endDate, branch])
  
  // Generate report when date range changes
  useEffect(() => {
    if (startDate && endDate) {
      fetchExpenseData()
    }
  }, [fetchExpenseData, startDate, endDate])
  
  // Print report handler
  const handlePrint = useReactToPrint({
    contentRef: reportRef
  })
  
  // Export to CSV
  const exportToCSV = () => {
    if (expenseData.length === 0) return
    
    // Create CSV content
    const headers = ['Date', 'Total Expenses', 'Total Amount']
    
    // Add expense type columns
    const expenseTypes = new Set<string>()
    expenseData.forEach(day => {
      Object.keys(day.expenses_by_type || {}).forEach(type => {
        expenseTypes.add(type)
      })
    })
    
    const typeHeaders = Array.from(expenseTypes).map(type => `${type} Amount`)
    const csvHeaders = [...headers, ...typeHeaders]
    const csvRows = [csvHeaders]
    
    // Add data rows
    expenseData.forEach(day => {
      const row = [
        day.date,
        day.total_expenses.toString(),
        day.total_amount.toFixed(2)
      ]
      
      // Add expense type amounts
      Array.from(expenseTypes).forEach(type => {
        const amount = day.expenses_by_type?.[type] || 0
        row.push(amount.toFixed(2))
      })
      
      csvRows.push(row)
    })
    
    // Add summary row
    csvRows.push(['', '', ''])
    const summaryRow = [
      'Summary',
      summary.total_expenses.toString(),
      summary.total_amount.toFixed(2)
    ]
    
    // Add total by type
    const typeTotals: { [key: string]: number } = {}
    expenseData.forEach(day => {
      Object.entries(day.expenses_by_type || {}).forEach(([type, amount]) => {
        typeTotals[type] = (typeTotals[type] || 0) + amount
      })
    })
    
    Array.from(expenseTypes).forEach(type => {
      summaryRow.push((typeTotals[type] || 0).toFixed(2))
    })
    
    csvRows.push(summaryRow)
    
    // Convert to CSV string
    const csvContent = csvRows.map(row => row.join(',')).join('\n')
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    
    link.setAttribute('href', url)
    link.setAttribute('download', `expense_report_${startDate}_to_${endDate}.csv`)
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
  
  // Get unique expense types for display
  const getUniqueExpenseTypes = () => {
    const types = new Set<string>()
    expenseData.forEach(day => {
      Object.keys(day.expenses_by_type || {}).forEach(type => {
        types.add(type)
      })
    })
    return Array.from(types)
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
            onClick={fetchExpenseData}
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
          disabled={expenseData.length === 0 || loading}
        >
          <Printer className="w-4 h-4 mr-2" />
          Print Report
        </LiteButton>
        
        <LiteButton
          onClick={exportToCSV}
          className="flex items-center"
          disabled={expenseData.length === 0 || loading}
        >
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </LiteButton>
      </div>
      
      <div ref={reportRef} className="bg-white p-6 rounded-lg shadow-sm">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold">Expense Report</h2>
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
          <div className="bg-red-50 p-4 rounded-lg border border-red-100">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-red-600 mr-3" />
              <div>
                <h3 className="text-sm text-red-600 font-medium">Total Expenses</h3>
                <p className="text-2xl font-semibold text-red-800">{summary.total_expenses}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
            <div className="flex items-center">
              <TrendingDown className="w-8 h-8 text-orange-600 mr-3" />
              <div>
                <h3 className="text-sm text-orange-600 font-medium">Total Amount</h3>
                <p className="text-2xl font-semibold text-orange-800">${summary.total_amount.toFixed(2)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-yellow-600 mr-3" />
              <div>
                <h3 className="text-sm text-yellow-600 font-medium">Average Amount</h3>
                <p className="text-2xl font-semibold text-yellow-800">${summary.avg_expense_amount.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="text-center py-8 text-gray-500">
            <RefreshCw className="w-8 h-8 mx-auto animate-spin text-violet-600 mb-2" />
            Loading expense data...
          </div>
        ) : expenseData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-2 px-4 text-left text-sm font-medium text-gray-700">Date</th>
                  <th className="py-2 px-4 text-right text-sm font-medium text-gray-700">Expenses</th>
                  <th className="py-2 px-4 text-right text-sm font-medium text-gray-700">Amount</th>
                  {getUniqueExpenseTypes().map(type => (
                    <th key={type} className="py-2 px-4 text-right text-sm font-medium text-gray-700">
                      {type}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {expenseData.map((day, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="py-2 px-4 text-sm">{formatDate(day.date)}</td>
                    <td className="py-2 px-4 text-sm text-right">{day.total_expenses}</td>
                    <td className="py-2 px-4 text-sm text-right font-medium">${day.total_amount.toFixed(2)}</td>
                    {getUniqueExpenseTypes().map(type => (
                      <td key={type} className="py-2 px-4 text-sm text-right">
                        ${(day.expenses_by_type?.[type] || 0).toFixed(2)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">No expense data available for the selected period</div>
        )}
      </div>
      
      {/* Extra insight section at the bottom */}
      {expenseData.length > 0 && (
        <div className="mt-6 p-4 bg-red-50 rounded-lg border border-red-100">
          <h3 className="text-lg font-medium text-red-800 mb-2">Expense Insights</h3>
          <div className="space-y-2 text-sm text-red-800">
            <p>
              <span className="font-medium">Daily Average: </span>
              ${(summary.total_amount / expenseData.length).toFixed(2)} from {(summary.total_expenses / expenseData.length).toFixed(1)} expenses per day
            </p>
            
            {expenseData.length > 0 && (
              <>
                <p>
                  <span className="font-medium">Highest Expense Day: </span>
                  {formatDate(expenseData.reduce((highest, current) => 
                    current.total_amount > highest.total_amount ? current : highest, expenseData[0]
                  ).date)} 
                  with ${expenseData.reduce((highest, current) => 
                    current.total_amount > highest.total_amount ? current : highest, expenseData[0]
                  ).total_amount.toFixed(2)}
                </p>
                
                <p>
                  <span className="font-medium">Most Active Day: </span>
                  {formatDate(expenseData.reduce((busiest, current) => 
                    current.total_expenses > busiest.total_expenses ? current : busiest, expenseData[0]
                  ).date)} 
                  with {expenseData.reduce((busiest, current) => 
                    current.total_expenses > busiest.total_expenses ? current : busiest, expenseData[0]
                  ).total_expenses} expenses
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default ExpenseReports