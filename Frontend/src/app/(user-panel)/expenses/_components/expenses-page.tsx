'use client'

import { DarkButton, LiteButton } from '@/components/button'
import { toastCustom } from '@/components/toastCustom'
import { BASE_URL } from '@/config/constants'
import { routes } from '@/config/routes'
import { PenIcon, Trash2, Eye, Filter, Calendar, RefreshCw, Plus, Check, X, FileText } from 'lucide-react'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { confirmAlert } from 'react-confirm-alert'
import 'react-confirm-alert/src/react-confirm-alert.css'
import TableLoader from '../../_components/table-loader'
import { IExpense, IExpenseType, OptionType } from '@/app/(user-panel)/type'
import { useRouter } from 'next/navigation'
import ExpenseDetailsModal from './expense-details-modal'
import { TextField } from '@/components/Fields'
import dynamic from 'next/dynamic'

const ReactSelect = dynamic(() => import("react-select"), { ssr: false });

const ExpensesPage = () => {
  const router = useRouter()
  const hasFetched = useRef(false)

  // UI States
  const [showDetails, setShowDetails] = useState<boolean>(false)
  const [showFilters, setShowFilters] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [refreshing, setRefreshing] = useState<boolean>(false)

  // Data States
  const [expensesList, setExpensesList] = useState<IExpense[]>([])
  const [selectedExpense, setSelectedExpense] = useState<IExpense | null>(null)

  // Filter States
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('')
  const [expenseTypeList, setExpenseTypeList] = useState<OptionType[]>([])
  const [expenseTypeFilter, setExpenseTypeFilter] = useState<string>('')
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')

  // Delete an expense
  const delRecord = (id: number) => {
    confirmAlert({
      title: 'Confirm Delete',
      message: 'Are you sure you want to delete this expense?',
      buttons: [
        {
          label: 'Yes',
          onClick: () => {
            setIsLoading(true)
            fetch(`${BASE_URL}/api/expenses/delete`, {
              method: "POST",
              body: JSON.stringify({ id })
            }).then(async response => {
              const result = await response.json()
              if (result.status === 'success') {
                toastCustom.success('Expense deleted successfully.')
                setExpensesList(expensesList.filter(expense => Number(expense.id) !== id))
              } else {
                toastCustom.error(result.message || 'Failed to delete expense')
              }
              setIsLoading(false)
            }).catch(error => {
              console.error('Error deleting expense:', error)
              toastCustom.error('An error occurred while deleting the expense')
              setIsLoading(false)
            })
          }
        },
        {
          label: 'No',
          onClick: () => { }
        }
      ]
    })
  }

  // View expense details
  const viewExpenseDetails = (expense: IExpense) => {
    setSelectedExpense(expense)
    setShowDetails(true)
  }

  // Approve expense
  const approveExpense = async (id: number, notes?: string) => {
    try {
      setIsLoading(true)
      const response = await fetch(`${BASE_URL}/api/expenses/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          id, 
          status: 'approved',
          approval_notes: notes || ''
        })
      })
      
      const data = await response.json()
      
      if (data.status === 'success') {
        toastCustom.success('Expense approved successfully')
        load() // Refresh the list
      } else {
        toastCustom.error(data.message || 'Failed to approve expense')
      }
    } catch (error) {
      console.error('Error approving expense:', error)
      toastCustom.error('Error approving expense')
    } finally {
      setIsLoading(false)
    }
  }

  // Reject expense
  const rejectExpense = async (id: number, notes?: string) => {
    try {
      setIsLoading(true)
      const response = await fetch(`${BASE_URL}/api/expenses/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          id, 
          status: 'rejected',
          approval_notes: notes || ''
        })
      })
      
      const data = await response.json()
      
      if (data.status === 'success') {
        toastCustom.success('Expense rejected')
        load() // Refresh the list
      } else {
        toastCustom.error(data.message || 'Failed to reject expense')
      }
    } catch (error) {
      console.error('Error rejecting expense:', error)
      toastCustom.error('Error rejecting expense')
    } finally {
      setIsLoading(false)
    }
  }

  // Load expenses with filters
  const load = useCallback(async () => {
    if (refreshing) return
    
    setIsLoading(true)
    setRefreshing(true)
    
    try {
      const filterData: any = {}
      
      if (startDate && endDate) {
        filterData.date_from = startDate
        filterData.date_to = endDate
      }
      
      if (statusFilter) {
        filterData.status = statusFilter
      }

      if (paymentMethodFilter) {
        filterData.payment_method = paymentMethodFilter
      }

      if (expenseTypeFilter) {
        filterData.expense_type_id = expenseTypeFilter
      }

      const [viewList, types] = await Promise.all([
          fetch(`${BASE_URL}/api/expenses/view`, {
          method: "POST",
          body: JSON.stringify(filterData)
        }).then(async response => response.json()),

        fetch(`${BASE_URL}/api/expenses/types`, {
          method: "POST",
        }).then(async response => response.json())
      ])

      setExpenseTypeList(types.data.map((type: IExpenseType) => ({
        label: type.expense_name,
        value: type.id
      })))

      if (viewList?.data?.data) {
        setExpensesList(viewList.data.data)
      } else {
        setExpensesList([])
      }
    } catch (error) {
      console.error("Error fetching expenses:", error)
      toastCustom.error("Failed to load expenses")
    } finally {
      setIsLoading(false)
      setRefreshing(false)
      hasFetched.current = true
    }
  }, [startDate, endDate, statusFilter, paymentMethodFilter, expenseTypeFilter, refreshing])

  useEffect(() => {
    if (!hasFetched.current) {
      // Set default dates to current month if not already set
      if (!startDate) {
        const today = new Date()
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
        setStartDate(firstDayOfMonth.toISOString().split('T')[0])
        setEndDate(today.toISOString().split('T')[0])
      } else {
        load()
      }
    }
  }, [load, startDate, endDate])

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Status options for filter dropdown
  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'paid', label: 'Paid' }
  ]

  // Payment method options for filter dropdown
  const paymentMethodOptions = [
    { value: '', label: 'All Payment Methods' },
    { value: 'cash', label: 'Cash' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'cheque', label: 'Cheque' },
    { value: 'credit_card', label: 'Credit Card' }
  ]

  // Reset filters
  const resetFilters = () => {
    const today = new Date()
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    setStartDate(firstDayOfMonth.toISOString().split('T')[0])
    setEndDate(today.toISOString().split('T')[0])
    setStatusFilter('')
    setPaymentMethodFilter('')
    setExpenseTypeFilter('')
    hasFetched.current = false
  }

  return (
    <div>
      <div className={`flex items-center justify-between bg-white py-4 px-6 rounded-lg shadow-sm`}>
        <h2 className={'text-xl font-semibold'}>{'Expenses'}</h2>

        <div className="flex space-x-2">
          <LiteButton
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center ${showFilters ? 'bg-violet-100 text-violet-700' : ''}`}
          >
            <Filter className="w-4 h-4 mr-1" />
            Filters
          </LiteButton>

          <LiteButton
            onClick={() => {
              hasFetched.current = false
              load()
            }}
            className="flex items-center"
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </LiteButton>

          <DarkButton
            onClick={() => router.push(routes.expenses + '/create')}
            icon={<Plus className="w-4 h-4 mr-1" />}
          >
            {'Add Expense'}
          </DarkButton>
        </div>
      </div>

      {showFilters && (
        <div className="bg-white p-4 mt-4 rounded-lg shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">From Date</label>
              <TextField
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">To Date</label>
              <TextField
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <ReactSelect
                options={statusOptions}
                value={statusOptions.find(option => option.value === statusFilter)}
                onChange={(option: any) => setStatusFilter(option?.value || '')}
                classNamePrefix="react-select"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Payment Method</label>
              <ReactSelect
                options={paymentMethodOptions}
                value={paymentMethodOptions.find(option => option.value === paymentMethodFilter)}
                onChange={(option: any) => setPaymentMethodFilter(option?.value || '')}
                classNamePrefix="react-select"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Expense Type</label>
              <ReactSelect
                placeholder="Select Type..."
                options={expenseTypeList}
                // This would need to be populated with expense types from API
                value={expenseTypeList.find(option => option.value === expenseTypeFilter)}
                onChange={(option: any) => setExpenseTypeFilter(option?.value || '')}
                classNamePrefix="react-select"
              />
            </div>
          </div>
          
          <div className="flex justify-end mt-4 space-x-2">
            <LiteButton onClick={resetFilters}>
              Reset
            </LiteButton>
            
            <DarkButton onClick={() => {
              hasFetched.current = false
              load()
            }}>
              Apply Filters
            </DarkButton>
          </div>
        </div>
      )}

      {selectedExpense && (
        <ExpenseDetailsModal
          show={showDetails}
          setShow={setShowDetails}
          expense={selectedExpense}
          onApprove={approveExpense}
          onReject={rejectExpense}
        />
      )}

      <div className={'relative overflow-x-auto mt-5 bg-white shadow-sm rounded-lg'}>
        <table className={'w-full text-sm text-left rtl:text-right text-gray-500'}>
          <thead className={'text-xs text-gray-700 uppercase bg-gray-100'}>
            <tr>
              <th scope="col" className="px-6 py-3">Title</th>
              <th scope="col" className="px-6 py-3">Type</th>
              <th scope="col" className="px-6 py-3">Amount</th>
              <th scope="col" className="px-6 py-3">Date</th>
              <th scope="col" className="px-6 py-3">Payment Method</th>
              <th scope="col" className="px-6 py-3">Status</th>
              <th scope="col" className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={7}>
                  <TableLoader />
                </td>
              </tr>
            ) : expensesList.length > 0 ? (
              expensesList.map((expense) => (
                <tr key={expense.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{expense.expense_title}</td>
                  <td className="px-6 py-4">{expense.expense_type?.expense_name || 'N/A'}</td>
                  <td className="px-6 py-4 font-medium">${expense.amount.toFixed(2)}</td>
                  <td className="px-6 py-4">{formatDate(expense.expense_date)}</td>
                  <td className="px-6 py-4">
                    <span className="capitalize">{expense.payment_method.replace('_', ' ')}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      expense.status === 'approved' ? 'bg-green-100 text-green-800' :
                      expense.status === 'paid' ? 'bg-blue-100 text-blue-800' :
                      expense.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {expense.status.charAt(0).toUpperCase() + expense.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex items-center">
                    <DarkButton 
                      className='mr-2 inline-block w-max shadow-lg !p-[5px]'
                      onClick={() => viewExpenseDetails(expense)}
                    >
                      <Eye className={'p-1'} />
                    </DarkButton>

                    {expense.status === 'pending' && (
                      <>
                        <DarkButton 
                          className='mr-2 inline-block w-max shadow-lg !p-[5px] bg-green-600 hover:bg-green-700'
                          onClick={() => approveExpense(Number(expense.id))}
                        >
                          <Check className={'p-1'} />
                        </DarkButton>
                        <DarkButton 
                          className='mr-2 inline-block w-max shadow-lg !p-[5px] bg-red-600 hover:bg-red-700'
                          onClick={() => rejectExpense(Number(expense.id))}
                        >
                          <X className={'p-1'} />
                        </DarkButton>
                      </>
                    )}

                    <DarkButton 
                      className='mr-2 inline-block w-max shadow-lg !p-[5px]'
                      onClick={() => router.push(`${routes.expenses}/edit/${expense.id}`)}
                    >
                      <PenIcon className={'p-1'} />
                    </DarkButton>
                    
                    <DarkButton 
                      variant='danger'
                      className={'inline-block w-max shadow-lg !p-[5px]'}
                      onClick={() => delRecord(Number(expense.id))}
                    >
                      <Trash2 className={'w-5'} />
                    </DarkButton>
                  </td>
                </tr>
              ))) : (
                <tr>
                  <td colSpan={7}>
                    <p className={'p-4 text-center'}>{'No expenses found for the selected criteria'}</p>
                  </td>
                </tr>
              )
            }
          </tbody>
        </table>
      </div>
      
      {expensesList.length > 0 && (
        <div className="mt-4 bg-white p-4 rounded-lg shadow-sm">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <span className="text-sm text-gray-500">Total Expenses: </span>
              <span className="font-medium">{expensesList.length}</span>
            </div>
            <div>
              <span className="text-sm text-gray-500">Total Amount: </span>
              <span className="font-medium">${expensesList.reduce((total, expense) => total + expense.amount, 0).toFixed(2)}</span>
            </div>
            <div>
              <span className="text-sm text-gray-500">Pending: </span>
              <span className="font-medium">{expensesList.filter(e => e.status === 'pending').length}</span>
            </div>
            <div>
              <span className="text-sm text-gray-500">Approved: </span>
              <span className="font-medium">{expensesList.filter(e => e.status === 'approved').length}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ExpensesPage