'use client'

import Popup, { PopupContent, PopupHeader } from '@/components/popup'
import React, { useState } from 'react'
import { IExpense } from '@/app/(user-panel)/type'
import { DarkButton, LiteButton } from '@/components/button'
import { routes } from '@/config/routes'
import { useRouter } from 'next/navigation'
import { Check, X, FileText, Eye } from 'lucide-react'
import TextArea from '@/components/Fields/textarea'

interface IExpenseDetailsModal {
  show: boolean
  setShow: (val: boolean) => void
  expense: IExpense
  onApprove?: (id: number, notes?: string) => void
  onReject?: (id: number, notes?: string) => void
}

const ExpenseDetailsModal = ({ show, setShow, expense, onApprove, onReject }: IExpenseDetailsModal) => {
  const router = useRouter()
  const [showApprovalForm, setShowApprovalForm] = useState(false)
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject'>('approve')
  const [approvalNotes, setApprovalNotes] = useState('')
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleApprovalAction = (action: 'approve' | 'reject') => {
    setApprovalAction(action)
    setApprovalNotes('')
    setShowApprovalForm(true)
  }

  const submitApproval = () => {
    if (approvalAction === 'approve' && onApprove) {
      onApprove(Number(expense.id), approvalNotes)
    } else if (approvalAction === 'reject' && onReject) {
      onReject(Number(expense.id), approvalNotes)
    }
    setShowApprovalForm(false)
    setShow(false)
  }

  const viewReceiptImage = () => {
    if (expense.receipt_image) {
      window.open(expense.receipt_image, '_blank')
    }
  }

  return (
    <Popup show={show}>
      <PopupHeader title="Expense Details" onClose={() => setShow(false)} />
      <PopupContent>
        {showApprovalForm ? (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">
              {approvalAction === 'approve' ? 'Approve Expense' : 'Reject Expense'}
            </h3>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                {approvalAction === 'approve' ? 'Approval Notes' : 'Rejection Reason'}
              </label>
              <TextArea
                placeholder={approvalAction === 'approve' ? 'Add approval notes...' : 'Add rejection reason...'}
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex justify-between pt-4 border-t">
              <LiteButton onClick={() => setShowApprovalForm(false)}>
                Cancel
              </LiteButton>
              <DarkButton 
                onClick={submitApproval}
                className={approvalAction === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
              >
                {approvalAction === 'approve' ? 'Approve Expense' : 'Reject Expense'}
              </DarkButton>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-500">Expense Title</h3>
                <p className="font-medium">{expense.expense_title}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-500">Expense Type</h3>
                <p>{expense.expense_type_name || 'N/A'}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-500">Amount</h3>
                <p className="font-medium text-lg">${expense.amount.toFixed(2)}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-500">Expense Date</h3>
                <p>{formatDate(expense.expense_date)}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-500">Payment Method</h3>
                <p className="capitalize">{expense.payment_method.replace('_', ' ')}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-500">Status</h3>
                <p className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                  expense.status === 'approved' ? 'bg-green-100 text-green-800' :
                  expense.status === 'paid' ? 'bg-blue-100 text-blue-800' :
                  expense.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {expense.status.charAt(0).toUpperCase() + expense.status.slice(1)}
                </p>
              </div>
              {expense.receipt_number && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500">Receipt Number</h3>
                  <p>{expense.receipt_number}</p>
                </div>
              )}
              <div>
                <h3 className="text-sm font-semibold text-gray-500">Added By</h3>
                <p>{expense.added_by_name || 'N/A'}</p>
              </div>
            </div>
            
            {expense.description && (
              <div>
                <h3 className="text-sm font-semibold text-gray-500 mb-2">Description</h3>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">{expense.description}</p>
              </div>
            )}

            {expense.receipt_image && (
              <div>
                <h3 className="text-sm font-semibold text-gray-500 mb-2">Receipt Image</h3>
                <div className="flex items-center space-x-2">
                  <DarkButton 
                    onClick={viewReceiptImage}
                    className="flex items-center"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Receipt
                  </DarkButton>
                </div>
              </div>
            )}

            {(expense.status === 'approved' || expense.status === 'rejected') && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-500 mb-2">Approval Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-xs font-semibold text-gray-400">Approved/Rejected By</h4>
                    <p className="text-sm">{expense.approved_by_name || 'N/A'}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-gray-400">Date</h4>
                    <p className="text-sm">{expense.approved_date ? formatDate(expense.approved_date) : 'N/A'}</p>
                  </div>
                </div>
                {expense.approval_notes && (
                  <div className="mt-2">
                    <h4 className="text-xs font-semibold text-gray-400">Notes</h4>
                    <p className="text-sm mt-1">{expense.approval_notes}</p>
                  </div>
                )}
              </div>
            )}

            <div className="text-xs text-gray-500">
              <p>Created: {expense.created_at ? formatDateTime(expense.created_at) : 'N/A'}</p>
              {expense.updated_at && expense.updated_at !== expense.created_at && (
                <p>Updated: {formatDateTime(expense.updated_at)}</p>
              )}
            </div>
            
            <div className="flex justify-between pt-4 border-t">
              <div className="flex space-x-2">
                {expense.status === 'pending' && onApprove && onReject && (
                  <>
                    <DarkButton 
                      onClick={() => handleApprovalAction('approve')}
                      className="bg-green-600 hover:bg-green-700 flex items-center"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Approve
                    </DarkButton>
                    <DarkButton 
                      onClick={() => handleApprovalAction('reject')}
                      className="bg-red-600 hover:bg-red-700 flex items-center"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Reject
                    </DarkButton>
                  </>
                )}
              </div>
              
              <DarkButton 
                onClick={() => router.push(`${routes.expenses}/edit/${expense.id}`)}
                className="flex items-center"
              >
                <FileText className="w-4 h-4 mr-2" />
                Edit Expense
              </DarkButton>
            </div>
          </div>
        )}
      </PopupContent>
    </Popup>
  )
}

export default ExpenseDetailsModal