'use client'

import { DarkButton, LiteButton } from '@/components/button'
import { TextField } from '@/components/Fields'
import TextArea from '@/components/Fields/textarea'
import { toastCustom } from '@/components/toastCustom'
import { BASE_URL } from '@/config/constants'
import { routes } from '@/config/routes'
import { Upload, DollarSign, Calendar, CreditCard, FileText } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useCallback, useEffect, useState } from 'react'
import { IExpenseType } from '@/app/(user-panel)/type'
import dynamic from 'next/dynamic'
import { useAppSelector } from '@/app/(user-panel)/_lib/store'

const ReactSelect = dynamic(() => import("react-select"), {
    ssr: false,
});

const CreateExpenseForm = () => {
  const router = useRouter()
  const { user } = useAppSelector(state => state.user)
  
  // Loading states
  const [loading, setLoading] = useState(false)
  const [expenseTypesLoading, setExpenseTypesLoading] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  
  // Form states
  const [expenseTypeId, setExpenseTypeId] = useState<string>('')
  const [expenseTitle, setExpenseTitle] = useState<string>('')
  const [description, setDescription] = useState<string>('')
  const [amount, setAmount] = useState<number>(0)
  const [expenseDate, setExpenseDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [paymentMethod, setPaymentMethod] = useState<string>('cash')
  const [receiptNumber, setReceiptNumber] = useState<string>('')
  const [receiptImage, setReceiptImage] = useState<File | null>(null)
  const [receiptImagePreview, setReceiptImagePreview] = useState<string>('')
  
  // Data lists
  const [expenseTypes, setExpenseTypes] = useState<IExpenseType[]>([])
  
  // Fetch all expense types from the API
  const fetchExpenseTypes = useCallback(async () => {
    setExpenseTypesLoading(true)
    try {
      const response = await fetch(`${BASE_URL}/api/expense-types/view`, {
        method: 'POST'
      })
      const data = await response.json()
      if (data?.data?.data) {
        setExpenseTypes(data.data.data)
      }
    } catch (error) {
      console.error('Error fetching expense types:', error)
    } finally {
      setExpenseTypesLoading(false)
    }
  }, [])
  
  // Handle initial data loading
  useEffect(() => {
    fetchExpenseTypes()
  }, [fetchExpenseTypes])
  
  // Handle receipt image upload
  const handleReceiptImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toastCustom.error('Please select an image file')
        return
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toastCustom.error('Image size should be less than 5MB')
        return
      }
      
      setReceiptImage(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setReceiptImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }
  
  // Remove receipt image
  const removeReceiptImage = () => {
    setReceiptImage(null)
    setReceiptImagePreview('')
  }
  
  // Submit expense
  const submitExpense = async () => {
    // Validation
    if (!expenseTypeId) {
      toastCustom.error('Please select an expense type')
      return
    }
    
    if (!expenseTitle.trim()) {
      toastCustom.error('Please enter expense title')
      return
    }
    
    if (!amount || amount <= 0) {
      toastCustom.error('Please enter a valid amount')
      return
    }
    
    if (!expenseDate) {
      toastCustom.error('Please select expense date')
      return
    }
    
    setIsCreating(true)
    setLoading(true)
    
    try {
      // Prepare form data for file upload
      const formData = new FormData()
      formData.append('branch_id', user?.branch_id?.toString() || '')
      formData.append('expense_type_id', expenseTypeId)
      formData.append('added_by', user?.id?.toString() || '')
      formData.append('expense_title', expenseTitle.trim())
      formData.append('description', description.trim())
      formData.append('amount', amount.toString())
      formData.append('expense_date', expenseDate)
      formData.append('payment_method', paymentMethod)
      formData.append('receipt_number', receiptNumber.trim())
      formData.append('status', 'pending')
      
      if (receiptImage) {
        formData.append('receipt_image', receiptImage)
      }
      
      const response = await fetch(`${BASE_URL}/api/expenses/add`, {
        method: 'POST',
        body: formData // Note: Don't set Content-Type header for FormData
      })
      
      const data = await response.json()
      
      if (data.status === 'success') {
        toastCustom.success('Expense created successfully')
        router.push(routes.expenses)
      } else {
        toastCustom.error(data.message || 'Failed to create expense')
      }
    } catch (error) {
      console.error('Error creating expense:', error)
      toastCustom.error('An error occurred while creating the expense')
    } finally {
      setIsCreating(false)
      setLoading(false)
    }
  }
  
  // Payment method options
  const paymentMethodOptions = [
    { value: 'cash', label: 'Cash' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'cheque', label: 'Cheque' },
    { value: 'credit_card', label: 'Credit Card' }
  ]
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left side - Main form */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium mb-4">Expense Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="expenseType" className="block mb-1 font-medium">Expense Type *</label>
              <ReactSelect
                id="expenseType"
                placeholder="Select Expense Type..."
                value={expenseTypes.filter(t => t.id?.toString() === expenseTypeId).map(t => ({ 
                  value: t.id?.toString(), 
                  label: t.expense_name 
                }))[0]}
                options={expenseTypes.map(t => ({ 
                  value: t.id?.toString(), 
                  label: t.expense_name 
                }))}
                onChange={(selectedOption) => setExpenseTypeId(selectedOption?.value || '')}
                isSearchable
                isClearable
                isLoading={expenseTypesLoading}
                classNames={{
                  control: () => "ring-1 ring-gray-300"
                }}
                styles={{
                  control: (styles) => ({ ...styles, backgroundColor: "rgb(249, 250, 251)", border: "none" })
                }}
              />
            </div>
            
            <div>
              <label htmlFor="expenseTitle" className="block mb-1 font-medium">Expense Title *</label>
              <TextField
                id="expenseTitle"
                type="text"
                placeholder="Enter expense title"
                value={expenseTitle}
                onChange={(e) => setExpenseTitle(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>
          
          <div className="mt-4">
            <label htmlFor="description" className="block mb-1 font-medium">Description</label>
            <TextArea
              id="description"
              placeholder="Enter expense description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              disabled={loading}
            />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium mb-4">Financial Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="amount" className="block mb-1 font-medium">Amount *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <DollarSign className="w-4 h-4 text-gray-500" />
                </div>
                <TextField
                  id="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                  className="pl-10"
                  disabled={loading}
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="expenseDate" className="block mb-1 font-medium">Expense Date *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Calendar className="w-4 h-4 text-gray-500" />
                </div>
                <TextField
                  id="expenseDate"
                  type="date"
                  value={expenseDate}
                  onChange={(e) => setExpenseDate(e.target.value)}
                  className="pl-10"
                  disabled={loading}
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="paymentMethod" className="block mb-1 font-medium">Payment Method *</label>
              <div className="flex items-center">
                <CreditCard className="w-4 h-4 mr-2 text-gray-500" />
                <ReactSelect
                  id="paymentMethod"
                  options={paymentMethodOptions}
                  value={paymentMethodOptions.find(option => option.value === paymentMethod)}
                  onChange={(selectedOption) => setPaymentMethod(selectedOption?.value || 'cash')}
                  className="w-full"
                  isDisabled={loading}
                  classNames={{
                    control: () => "ring-1 ring-gray-300"
                  }}
                  styles={{
                    control: (styles) => ({ ...styles, backgroundColor: "rgb(249, 250, 251)", border: "none" })
                  }}
                />
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            <label htmlFor="receiptNumber" className="block mb-1 font-medium">Receipt Number</label>
            <TextField
              id="receiptNumber"
              type="text"
              placeholder="Enter receipt number (optional)"
              value={receiptNumber}
              onChange={(e) => setReceiptNumber(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium mb-4">Receipt Image</h3>
          
          {receiptImagePreview ? (
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <img 
                  src={receiptImagePreview} 
                  alt="Receipt preview" 
                  className="max-w-full h-auto max-h-64 object-contain mx-auto"
                />
              </div>
              <div className="flex justify-center">
                <LiteButton onClick={removeReceiptImage}>
                  Remove Image
                </LiteButton>
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <div className="text-center">
                <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Upload receipt image</p>
                  <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                </div>
                <div className="mt-4">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleReceiptImageChange}
                      className="hidden"
                      disabled={loading}
                    />
                    <DarkButton as="span" className="cursor-pointer">
                      Choose File
                    </DarkButton>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Right side - Summary and actions */}
      <div className="space-y-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-medium text-lg mb-3">Expense Summary</h3>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Type:</span>
              <span className="text-sm font-medium">
                {expenseTypes.find(t => t.id?.toString() === expenseTypeId)?.expense_name || 'Not selected'}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Amount:</span>
              <span className="text-lg font-bold text-green-600">${amount.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Date:</span>
              <span className="text-sm font-medium">
                {expenseDate ? new Date(expenseDate).toLocaleDateString() : 'Not selected'}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Payment:</span>
              <span className="text-sm font-medium capitalize">
                {paymentMethod.replace('_', ' ')}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Status:</span>
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Pending
              </span>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="font-medium mb-3">Actions</h3>
          <div className="space-y-2">
            <DarkButton
              onClick={submitExpense}
              className="w-full justify-center"
              loading={isCreating}
              disabled={loading || !expenseTypeId || !expenseTitle.trim() || !amount || amount <= 0}
            >
              {isCreating ? 'Creating...' : 'Create Expense'}
            </DarkButton>
            
            <LiteButton
              onClick={() => router.push(routes.expenses)}
              className="w-full justify-center"
              disabled={loading}
            >
              Cancel
            </LiteButton>
          </div>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <div className="flex items-start">
            <FileText className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
            <div>
              <h4 className="text-sm font-medium text-blue-800">Important Notes</h4>
              <ul className="text-xs text-blue-700 mt-1 space-y-1">
                <li>• All expenses require approval before payment</li>
                <li>• Upload receipt images for better record keeping</li>
                <li>• Ensure all details are accurate before submission</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateExpenseForm