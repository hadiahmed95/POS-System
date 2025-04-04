'use client'

import { DarkButton, LinkButton } from '@/components/button'
import TrippleRoundCircleLoader from '@/components/loaders/tripple-round-circle-loader'
import { toastCustom } from '@/components/toastCustom'
import { BASE_URL } from '@/config/constants'
import { routes } from '@/config/routes'
import { PenIcon, SquarePen, Trash2 } from 'lucide-react'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { confirmAlert } from 'react-confirm-alert'
import 'react-confirm-alert/src/react-confirm-alert.css';

const Users = () => {

  const hasFetched = useRef(false)
  const [branchesList, setList] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const delRecord = (id: number) => {
    confirmAlert({
      title: 'Confirm Delete',
      message: 'Are you sure to delete this record.',
      buttons: [
        {
          label: 'Yes',
          onClick: () => {
            fetch(`${BASE_URL}/api/branches/delete`, {
              method: "POST",
              body: JSON.stringify({ id })
            }).then(async response => {
              console.log('del response', response)
              toastCustom.error('Branch deleted successfully.')
              setList(branchesList.filter(branch => branch.id !== id))
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
      const res = await fetch(`${BASE_URL}/api/branches/view`, {
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
      <div className={`flex justify-between`}>
        <h2 className={'text-xl font-semibold'}>{'Branches'}</h2>

        <LinkButton href='/branches/add'>{'Add Branches'}</LinkButton>
      </div>

      <div className={'relative overflow-x-auto mt-5'}>
        <table className={'w-full text-sm text-left rtl:text-right text-gray-500'}>
          <thead className={'text-xs text-gray-700 uppercase bg-gray-100'}>
            <tr>
              <th scope="col" className="px-6 py-3">Sr #</th>
              <th scope="col" className="px-6 py-3">Name</th>
              <th scope="col" className="px-6 py-3">Address</th>
              <th scope="col" className="px-6 py-3">Phone No</th>
              <th scope="col" className="px-6 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {
              isLoading ?
                <tr>
                  <td colSpan={5}>
                    <div className={'text-center w-full my-10'}>
                      <TrippleRoundCircleLoader />
                    </div>
                  </td>
                </tr>
              :
              branchesList.map((branch, index) => (
                <tr key={index}>
                  <td className="px-6 py-4">{index + 1}</td>
                  <td className="px-6 py-4">{branch.branch_name}</td>
                  <td className="px-6 py-4">{branch.branch_address}</td>
                  <td className="px-6 py-4">{branch.branch_phone}</td>
                  <td className="px-6 py-4 flex items-center">
                    <LinkButton href={routes.branches + '/edit/' + branch.id} className='mr-2 inline-block w-max !p-[5px]' >
                      <PenIcon className={'p-1'} />
                    </LinkButton>
                    <DarkButton variant='danger'
                      onClick={() => delRecord(branch.id)}
                      className={'!p-[5px]'}
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