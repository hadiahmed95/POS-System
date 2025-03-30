'use client'

import { DarkButton, LiteButton } from '@/components/button'
import { BouncingCircle } from '@/components/svg'
import { toastCustom } from '@/components/toastCustom'
import { BASE_URL } from '@/config/constants'
import { PenIcon, Trash2 } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { confirmAlert } from 'react-confirm-alert'
import 'react-confirm-alert/src/react-confirm-alert.css';
import AddBrand from './_components/add-branch'
import { IBrand } from '../type'

const Users = () => {

  const [list, setList] = useState<IBrand[]>([])
  const [showForm, setShowForm] = useState(false)
  const [brand, setBrand] = useState<IBrand | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const delRecord = (id: number) => {
    confirmAlert({
      title: 'Confirm Delete',
      message: 'Are you sure to delete this record.',
      buttons: [
        {
          label: 'Yes',
          onClick: () => {
            fetch(`${BASE_URL}/api/brands/delete`, {
              method: "POST",
              body: JSON.stringify({ id })
            }).then(_ => {
              toastCustom.error('Brand deleted successfully.')
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

  const load = async () => {
    setIsLoading(true)
    await fetch(`${BASE_URL}/api/brands/view`, {
      method: "POST"
    }).then(async response => {
      const res = await response.json()
      console.log('res', res)
      if (res?.data?.data) {
        setList(res.data.data)
      }
    })
    setIsLoading(false)
  }


  useEffect(() => {
    load()
  }, [])

  return (
    <div>
      <div className={`flex justify-between`}>
        <h2 className={'text-xl font-semibold'}>{'Brands'}</h2>

        <DarkButton
        onClick={(e) => {
          setShowForm(true)
        }}
        >{'Add Brand'}</DarkButton>
      </div>

      <AddBrand 
        show={showForm} 
        setShow={setShowForm}
        brand={brand}
        onSubmit={() => {
          load()
        }}
      />

      <div className={'relative overflow-x-auto mt-5'}>
        <table className={'w-full text-sm text-left rtl:text-right text-gray-500'}>
          <thead className={'text-xs text-gray-700 uppercase bg-gray-100'}>
            <tr>
              <th scope="col" className="px-6 py-3">Sr #</th>
              <th scope="col" className="px-6 py-3">Name</th>
              <th scope="col" className="px-6 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {
              isLoading ?
                <tr>
                  <td colSpan={5}>
                    <div className={'text-center w-full my-10'}>
                    <BouncingCircle className='mx-auto' />
                    </div>
                  </td>
                </tr>
              :
              list.map((brand, index) => (
                <tr key={index}>
                  <td className="px-6 py-4">{index + 1}</td>
                  <td className="px-6 py-4">{brand.brand_name}</td>
                  <td className="px-6 py-4 flex items-center">
                    <LiteButton 
                      className='mr-2 inline-block w-max bg-white shadow !p-[5px]'
                      onClick={(e) => setBrand(brand)}
                    >
                      <PenIcon className='p-1' />
                    </LiteButton>
                    <DarkButton variant='danger'
                      className={'!p-[5px]'}
                      onClick={() => delRecord(Number(brand.id ?? 0))}
                    >
                      <Trash2 className={'w-5'} />
                    </DarkButton>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Users