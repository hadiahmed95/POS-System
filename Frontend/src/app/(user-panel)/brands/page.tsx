'use client'

import { DarkButton, LiteButton } from '@/components/button'
import { toastCustom } from '@/components/toastCustom'
import { BASE_URL } from '@/config/constants'
import { PenIcon, Trash2 } from 'lucide-react'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { confirmAlert } from 'react-confirm-alert'
import 'react-confirm-alert/src/react-confirm-alert.css';
import AddBrand from './_components/add-branch'
import { IBrand } from '../type'
import { TrippleDotLoader } from '@/components/loaders'
import TableLoader from '../_components/table-loader'

const Users = () => {

  const hasFetched = useRef(false)
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

  const showBrand = (brand: IBrand) => {
    setShowForm(true)
    setBrand(brand)

  }

  const load = useCallback( async () => {

    if (hasFetched.current) return

    hasFetched.current = true;
    setIsLoading(true)
    try {
      const res = await fetch(`${BASE_URL}/api/brands/view`, {
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
  }, [setIsLoading])


  useEffect(() => {
    load()
  }, [load])

  return (
    <div>
      <div className={`flex items-center justify-between bg-white py-2 px-2 rounded-lg shadow-sm`}>
        <h2 className={'text-xl font-semibold'}>{'Brands'}</h2>

        <DarkButton
        onClick={(e) => {
          setShowForm(true)
        }}
        >{'Add Brand'}</DarkButton>
      </div>

      <AddBrand 
        title={'Add Brand'}
        show={showForm} 
        setShow={setShowForm}
        brand={brand}
        onSubmit={() => {
          hasFetched.current = false
          load()
        }}
      />

      <div className={'relative overflow-x-auto mt-5 bg-white shadow-sm rounded-lg'}>
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
                    <TableLoader />
                  </td>
                </tr>
              :
              list.length > 0 ? list.map((brand, index) => (
                <tr key={index}>
                  <td className="px-6 py-4">{index + 1}</td>
                  <td className="px-6 py-4">{brand.brand_name}</td>
                  <td className="px-6 py-4 flex items-center">
                    <LiteButton 
                      className='mr-2 inline-block w-max bg-white shadow !p-[5px]'
                      onClick={(e) => showBrand(brand)}
                    >
                      <PenIcon className='p-1' />
                    </LiteButton>
                    <DarkButton variant='danger'
                      className={'inline-block w-max shadow-lg !p-[5px]'}
                      onClick={() => delRecord(Number(brand.id ?? 0))}
                    >
                      <Trash2 className={'w-5'} />
                    </DarkButton>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={3}>
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

export default Users