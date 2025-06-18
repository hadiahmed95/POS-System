'use client'

import { DarkButton, LiteButton } from '@/components/button'
import { TextField } from '@/components/Fields'
import { toastCustom } from '@/components/toastCustom'
import { BASE_URL } from '@/config/constants'
import { PenIcon, Trash2, RefreshCw, Plus } from 'lucide-react'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { confirmAlert } from 'react-confirm-alert'
import 'react-confirm-alert/src/react-confirm-alert.css'
import TableLoader from '../../_components/table-loader'
import { IExpenseType } from '@/app/(user-panel)/type'
import Popup, { PopupContent, PopupHeader } from '@/components/popup'
import { useAppSelector } from '@/app/(user-panel)/_lib/store'

const ExpenseTypesPage = () => {
  const hasFetched = useRef(false)
  const { user } = useAppSelector(state => state.user)

  // UI States
  const [showForm, setShowForm] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [refreshing, setRefreshing] = useState<boolean>(false)
  const [isFormLoading, setIsFormLoading] = useState<boolean>(false)

  // Data States
  const [expenseTypesList, setExpenseTypesList] = useState<IExpenseType[]>([])
  const [editingType, setEditingType] = useState<IExpenseType | null>(null)

  // Form States
  const [expenseName, setExpenseName] = useState<string>('')

  // Delete an expense type
  const delRecord = (id: number) => {
    confirmAlert({
      title: 'Confirm Delete',
      message: 'Are you sure you want to delete this expense type?',
      buttons: [
        {
          label: 'Yes',
          onClick: () => {
            setIsLoading(true)
            fetch(`${BASE_URL}/api/expense-types/delete`, {
              method: "POST",
              body: JSON.stringify({ id })
            }).then(async response => {
              const result = await response.json()
              if (result.status === 'success') {
                toastCustom.success('Expense type deleted successfully.')
                setExpenseTypesList(expenseTypesList.filter(type => Number(type.id) !== id))
              } else {
                toastCustom.error(result.message || 'Failed to delete expense type')
              }
              setIsLoading(false)
            }).catch(error => {
              console.error('Error deleting expense type:', error)
              toastCustom.error('An error occurred while deleting the expense type')
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

  // Edit expense type
  const editRecord = (expenseType: IExpenseType) => {
    setEditingType(expenseType)
    setExpenseName(expenseType.expense_name)
    setShowForm(true)
  }

  // Load expense types
  const load = useCallback(async () => {
    if (refreshing) return
    
    setIsLoading(true)
    setRefreshing(true)
    
    try {
      const res = await fetch(`${BASE_URL}/api/expense-types/view`, {
        method: "POST",
        body: JSON.stringify({})
      }).then(async response => response.json())

      if (res?.data?.data) {
        setExpenseTypesList(res.data.data)
      } else {
        setExpenseTypesList([])
      }
    } catch (error) {
      console.error("Error fetching expense types:", error)
      toastCustom.error("Failed to load expense types")
    } finally {
      setIsLoading(false)
      setRefreshing(false)
      hasFetched.current = true
    }
  }, [refreshing])

  useEffect(() => {
    if (!hasFetched.current) {
      load()
    }
  }, [load])

  // Submit form (create or update)
  const submitForm = async () => {
    if (!expenseName.trim()) {
      toastCustom.error('Please enter expense type name')
      return
    }

    setIsFormLoading(true)

    try {
      const endpoint = editingType ? 'update' : 'add'
      const payload = editingType 
        ? { id: editingType.id, expense_name: expenseName.trim() }
        : { expense_name: expenseName.trim(), added_by: user?.id }

      const response = await fetch(`${BASE_URL}/api/expense-types/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (data.status === 'success') {
        toastCustom.success(editingType ? 'Expense type updated successfully' : 'Expense type created successfully')
        closeForm()
        load() // Refresh the list
      } else {
        toastCustom.error(data.message || 'Failed to save expense type')
      }
    } catch (error) {
      console.error('Error saving expense type:', error)
      toastCustom.error('An error occurred while saving')
    } finally {
      setIsFormLoading(false)
    }
  }

  // Close form and reset
  const closeForm = () => {
    setShowForm(false)
    setEditingType(null)
    setExpenseName('')
  }

  // Open create form
  const openCreateForm = () => {
    setEditingType(null)
    setExpenseName('')
    setShowForm(true)
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div>
      <div className={`flex items-center justify-between bg-white py-4 px-6 rounded-lg shadow-sm`}>
        <h2 className={'text-xl font-semibold'}>{'Expense Types'}</h2>

        <div className="flex space-x-2">
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
            onClick={openCreateForm}
            icon={<Plus className="w-4 h-4 mr-1" />}
          >
            {'Add Expense Type'}
          </DarkButton>
        </div>
      </div>

      {/* Form Modal */}
      <Popup show={showForm}>
        <PopupHeader 
          title={editingType ? 'Edit Expense Type' : 'Add Expense Type'} 
          onClose={closeForm} 
        />
        <PopupContent>
          <div className="space-y-4">
            <div>
              <label htmlFor="expenseName" className="block mb-1 font-medium">
                Expense Type Name *
              </label>
              <TextField
                id="expenseName"
                type="text"
                placeholder="Enter expense type name"
                value={expenseName}
                onChange={(e) => setExpenseName(e.target.value)}
                disabled={isFormLoading}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <LiteButton
                onClick={closeForm}
                disabled={isFormLoading}
              >
                Cancel
              </LiteButton>
              <DarkButton
                onClick={submitForm}
                loading={isFormLoading}
                disabled={isFormLoading || !expenseName.trim()}
              >
                {editingType ? 'Update' : 'Create'}
              </DarkButton>
            </div>
          </div>
        </PopupContent>
      </Popup>

      <div className={'relative overflow-x-auto mt-5 bg-white shadow-sm rounded-lg'}>
        <table className={'w-full text-sm text-left rtl:text-right text-gray-500'}>
          <thead className={'text-xs text-gray-700 uppercase bg-gray-100'}>
            <tr>
              <th scope="col" className="px-6 py-3">Expense Type Name</th>
              <th scope="col" className="px-6 py-3">Added By</th>
              <th scope="col" className="px-6 py-3">Created Date</th>
              <th scope="col" className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={4}>
                  <TableLoader />
                </td>
              </tr>
            ) : expenseTypesList.length > 0 ? (
              expenseTypesList.map((expenseType) => (
                <tr key={expenseType.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{expenseType.expense_name}</td>
                  <td className="px-6 py-4">{expenseType.added_by_name || 'N/A'}</td>
                  <td className="px-6 py-4">{expenseType.created_at ? formatDate(expenseType.created_at) : 'N/A'}</td>
                  <td className="px-6 py-4 flex items-center">
                    <DarkButton 
                      className='mr-2 inline-block w-max shadow-lg !p-[5px]'
                      onClick={() => editRecord(expenseType)}
                    >
                      <PenIcon className={'p-1'} />
                    </DarkButton>
                    <DarkButton 
                      variant='danger'
                      className={'inline-block w-max shadow-lg !p-[5px]'}
                      onClick={() => delRecord(Number(expenseType.id))}
                    >
                      <Trash2 className={'w-5'} />
                    </DarkButton>
                  </td>
                </tr>
              ))
            ) : (
                <tr>
                  <td colSpan={4}>
                    <p className={'p-4 text-center'}>{'No expense types found'}</p>
                  </td>
                </tr>
              )
            }
          </tbody>
        </table>
      </div>
      
      {expenseTypesList.length > 0 && (
        <div className="mt-4 bg-white p-4 rounded-lg shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-sm text-gray-500">Total Expense Types: </span>
              <span className="font-medium">{expenseTypesList.length}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ExpenseTypesPage