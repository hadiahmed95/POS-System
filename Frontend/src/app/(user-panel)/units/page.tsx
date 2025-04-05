'use client'

import { DarkButton } from '@/components/button'
import { toastCustom } from '@/components/toastCustom'
import { BASE_URL } from '@/config/constants'
import { PenIcon, Trash2 } from 'lucide-react'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { confirmAlert } from 'react-confirm-alert'
import 'react-confirm-alert/src/react-confirm-alert.css';
import AddUnit from './_components/add-unit'
import { IUnit } from '../type'
import TableLoader from '../_components/table-loader'

const Users = () => {

  const title = 'Add Unit';

  const hasFetched = useRef(false);

  const [list, setList] = useState<IUnit[]>([])
  const [showForm, setShowForm] = useState(false)
  const [unit, setUnit] = useState<IUnit | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const delRecord = (id: number) => {
    confirmAlert({
      title: 'Confirm Delete',
      message: 'Are you sure to delete this record.',
      buttons: [
        {
          label: 'Yes',
          onClick: () => {
            fetch(`${BASE_URL}/api/units/delete`, {
              method: "POST",
              body: JSON.stringify({ id })
            }).then(_ => {
              toastCustom.error('Unit deleted successfully.')
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

  const load = useCallback( async () => {

    if (hasFetched.current) return

    hasFetched.current = true;
    setIsLoading(true)
    try {
      const res = await fetch(`${BASE_URL}/api/units/view`, {
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
      <div className={`flex items-center justify-between bg-white py-2 px-2 rounded-lg shadow-sm`}>
        <h2 className={'text-xl font-semibold'}>{'Units'}</h2>

        <DarkButton
        onClick={(e) => {
          setUnit(null)
          setShowForm(true)
        }}
        >{title}</DarkButton>
      </div>

      <AddUnit 
        title={title}
        show={showForm} 
        setShow={setShowForm}
        unit={unit}
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
              <th scope="col" className="px-6 py-3">Abbrevation</th>
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
              list.length > 0 ? list.map((unit, index) => (
                <tr key={index}>
                  <td className="px-6 py-4">{index + 1}</td>
                  <td className="px-6 py-4">{unit.unit_name}</td>
                  <td className="px-6 py-4">{unit.unit_abbr}</td>
                  <td className="px-6 py-4 flex items-center">
                    <DarkButton 
                      className='mr-2 inline-block w-max shadow-lg !p-[5px]'
                      onClick={(e) => {
                        setUnit(unit)
                        setShowForm(true)
                      }}
                    >
                      <PenIcon className='p-1' />
                    </DarkButton>
                    <DarkButton 
                      variant='danger'
                      className={'inline-block w-max shadow-lg !p-[5px]'}
                      onClick={() => delRecord(Number(unit.id ?? 0))}
                    >
                      <Trash2 className={'w-5'} />
                    </DarkButton>
                  </td>
                </tr>
              ))  : (
                <tr>
                  <td colSpan={4}>
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