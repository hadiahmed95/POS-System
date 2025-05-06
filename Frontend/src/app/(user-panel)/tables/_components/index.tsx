'use client'

import { toastCustom } from '@/components/toastCustom';
import { BASE_URL } from '@/config/constants';
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { confirmAlert } from 'react-confirm-alert';
import { ITable } from '../../type';
import { DarkButton } from '@/components/button';
import TableLoader from '../../_components/table-loader';
import { PenIcon, Trash2, ArrowUpDown } from 'lucide-react';
import FormWrapper from './form-wrapper';
import 'react-confirm-alert/src/react-confirm-alert.css';
import FloorPlan from './floor-plan';
import TableDetails from './table-details';

const TablePage = () => {

  const title = 'Tables'
  const buttonTitle = 'Add Table';

  const hasFetched = useRef(false);

  const [list, setList] = useState<ITable[]>([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState<ITable | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [viewMode, setViewMode] = useState<'list' | 'floor-plan'>('floor-plan')
  const [selectedTable, setSelectedTable] = useState<ITable | null>(null)

  const delRecord = (id: number) => {
    confirmAlert({
      title: 'Confirm Delete',
      message: 'Are you sure to delete this record.',
      buttons: [
        {
          label: 'Yes',
          onClick: () => {
            fetch(`${BASE_URL}/api/tables/delete`, {
              method: "POST",
              body: JSON.stringify({ id })
            }).then(_ => {
              toastCustom.error('Table deleted successfully.')
              setList(list.filter(li => Number(li.id) !== id))
            })
          }
        },
        {
          label: 'No',
          onClick: () => { }
        }
      ]
    });
  };

  const load = useCallback(async () => {

    if (hasFetched.current) return

    hasFetched.current = true;
    setIsLoading(true)
    try {
      const res = await fetch(`${BASE_URL}/api/tables/view`, {
        method: "POST"
      }).then(async response => response.json())
      if (res?.data?.data) {
        setList(res.data.data)
      }
      setIsLoading(false)
    }
    catch (error) {
      console.error("Error fetching data:", error);
    }
    finally {
      setIsLoading(false);
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])
  
  // Handle table status change
  const handleTableStatusChange = async (tableId: string | number, newStatus: ITable['status']) => {
    try {
      const response = await fetch(`${BASE_URL}/api/tables/update-status`, {
        method: "POST",
        body: JSON.stringify({ id: tableId, status: newStatus })
      })
      
      const data = await response.json()
      
      if (data.status === 'success') {
        // Update local state
        setList(prevList => 
          prevList.map(table => 
            table.id === tableId 
              ? { ...table, status: newStatus }
              : table
          )
        )
        
        // Update selected table if it's the one being updated
        if (selectedTable && selectedTable.id === tableId) {
          setSelectedTable({ ...selectedTable, status: newStatus })
        }
        
        toastCustom.success(`Table status updated to ${newStatus}`)
      }
    } catch (error) {
      console.error('Error updating table status:', error)
      toastCustom.error('Failed to update table status')
    }
  }
  
  // Handle table click in floor plan
  const handleTableClick = (table: ITable) => {
    setSelectedTable(table)
  }

  return (
    <div>
      <div className={`flex items-center justify-between bg-white py-4 px-6 rounded-lg shadow-sm`}>
        <h2 className={'text-xl font-semibold'}>{title}</h2>

        <div className="flex space-x-2">
          <div className="flex rounded-md overflow-hidden">
            <button
              className={`px-3 py-1 ${viewMode === 'floor-plan' ? 'bg-violet-600 text-white' : 'bg-gray-100'}`}
              onClick={() => setViewMode('floor-plan')}
            >
              Floor Plan
            </button>
            <button
              className={`px-3 py-1 ${viewMode === 'list' ? 'bg-violet-600 text-white' : 'bg-gray-100'}`}
              onClick={() => setViewMode('list')}
            >
              List View
            </button>
          </div>
          
          <DarkButton
          onClick={(e) => {
            setFormData(null)
            setShowForm(true)
          }}
          >{buttonTitle}</DarkButton>
        </div>
      </div>

      <FormWrapper 
        title={title}
        show={showForm} 
        setShow={setShowForm}
        formData={formData}
        onSubmit={() => {
          hasFetched.current = false;
          load()
        }}
      />
      
      {/* Table details popup */}
      {selectedTable && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <TableDetails 
            table={selectedTable}
            onClose={() => setSelectedTable(null)}
            onStatusChange={handleTableStatusChange}
          />
        </div>
      )}
      
      {/* Floor Plan View */}
      {viewMode === 'floor-plan' && (
        <FloorPlan 
          tables={list}
          onTableUpdate={updatedTable => {
            setList(prevList => 
              prevList.map(table => 
                table.id === updatedTable.id 
                  ? updatedTable
                  : table
              )
            )
          }}
          onTableClick={handleTableClick}
        />
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className={'relative overflow-x-auto mt-5 bg-white shadow-sm rounded-lg'}>
          <table className={'w-full text-sm text-left rtl:text-right text-gray-500'}>
            <thead className={'text-xs text-gray-700 uppercase bg-gray-100'}>
              <tr>
                <th scope="col" className="px-6 py-3">Sr #</th>
                <th scope="col" className="px-6 py-3">Table No</th>
                <th scope="col" className="px-6 py-3">Capacity</th>
                <th scope="col" className="px-6 py-3">Type</th>
                <th scope="col" className="px-6 py-3">Status</th>
                <th scope="col" className="px-6 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {
                isLoading ?
                  <tr>
                    <td colSpan={6}>
                      <TableLoader />
                    </td>
                  </tr>
                :
                list.length > 0 ? list.map((table, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4">{index + 1}</td>
                    <td className="px-6 py-4">{table.table_no}</td>
                    <td className="px-6 py-4">{table.capacity}</td>
                    <td className="px-6 py-4">{table.type}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        table.status === 'available' ? 'bg-green-100 text-green-800' :
                        table.status === 'reserved' ? 'bg-amber-100 text-amber-800' :
                        table.status === 'occupied' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {table.status.charAt(0).toUpperCase() + table.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex items-center">
                      <DarkButton 
                        className='mr-2 inline-block w-max shadow-lg !p-[5px]'
                        onClick={() => handleTableClick(table)}
                      >
                        <ArrowUpDown className="w-4 h-4 p-[1px]" />
                      </DarkButton>
                      <DarkButton 
                        className='mr-2 inline-block w-max shadow-lg !p-[5px]'
                        onClick={(e) => {
                          setFormData(table)
                          setShowForm(true)
                        }}
                      >
                        <PenIcon className='p-1' />
                      </DarkButton>
                      <DarkButton 
                        variant='danger'
                        className={'inline-block w-max shadow-lg !p-[5px]'}
                        onClick={() => delRecord(Number(table.id ?? 0))}
                      >
                        <Trash2 className={'w-5'} />
                      </DarkButton>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6}>
                      <p className={'p-4 text-center'}>{'No Record Found!'}</p>
                    </td>
                  </tr>
                )
              }
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default TablePage