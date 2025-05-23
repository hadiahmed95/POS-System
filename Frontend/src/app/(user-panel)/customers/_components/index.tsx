'use client'

import { toastCustom } from '@/components/toastCustom';
import { BASE_URL } from '@/config/constants';
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { confirmAlert } from 'react-confirm-alert';
import { ICustomer } from '../../type';
import { DarkButton } from '@/components/button';
import TableLoader from '../../_components/table-loader';
import { PenIcon, Trash2 } from 'lucide-react';
import FormWrapper from './form-wrapper';
import 'react-confirm-alert/src/react-confirm-alert.css';

const TablePage = () => {

  const title = 'Customers'
  const buttonTitle = 'Add Customer';

  const hasFetched = useRef(false);

  const [list, setList] = useState<ICustomer[]>([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState<ICustomer | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const delRecord = (id: number) => {
    confirmAlert({
      title: 'Confirm Delete',
      message: 'Are you sure to delete this record.',
      buttons: [
        {
          label: 'Yes',
          onClick: () => {
            fetch(`${BASE_URL}/api/customers/delete`, {
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
      const res = await fetch(`${BASE_URL}/api/customers/view`, {
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

  return (
    <div>
      <div className={`flex items-center justify-between bg-white py-4 px-6 rounded-lg shadow-sm`}>
        <h2 className={'text-xl font-semibold'}>{title}</h2>

        <DarkButton
        onClick={(e) => {
          setFormData(null)
          setShowForm(true)
        }}
        >{buttonTitle}</DarkButton>
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

      <div className={'relative overflow-x-auto mt-5 bg-white shadow-sm rounded-lg'}>
        <table className={'w-full text-sm text-left rtl:text-right text-gray-500'}>
          <thead className={'text-xs text-gray-700 uppercase bg-gray-100'}>
            <tr>
              <th scope="col" className="px-6 py-3">Sr #</th>
              <th scope="col" className="px-6 py-3">Name</th>
              <th scope="col" className="px-6 py-3">Phone No</th>
              <th scope="col" className="px-6 py-3">Email</th>
              <th scope="col" className="px-6 py-3">Type</th>
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
              list.length > 0 ? list.map((customer, index) => (
                <tr key={index}>
                  <td className="px-6 py-4">{index + 1}</td>
                  <td className="px-6 py-4">{customer.name}</td>
                  <td className="px-6 py-4">{customer.phone}</td>
                  <td className="px-6 py-4">{customer.email}</td>
                  <td className="px-6 py-4">{customer.customer_type}</td>
                  <td className="px-6 py-4 flex items-center">
                    <DarkButton 
                      className='mr-2 inline-block w-max shadow-lg !p-[5px]'
                      onClick={(e) => {
                        setFormData(customer)
                        setShowForm(true)
                      }}
                    >
                      <PenIcon className='p-1' />
                    </DarkButton>
                    <DarkButton 
                      variant='danger'
                      className={'inline-block w-max shadow-lg !p-[5px]'}
                      onClick={() => delRecord(Number(customer.id ?? 0))}
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
    </div>
  )
}

export default TablePage