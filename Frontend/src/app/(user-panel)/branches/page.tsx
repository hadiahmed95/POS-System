'use client'

import { LinkButton, LiteButton } from '@/components/button'
import { BASE_URL } from '@/config/constants'
import { routes } from '@/config/routes'
import React, { useEffect, useState } from 'react'
import { confirmAlert } from 'react-confirm-alert'
import 'react-confirm-alert/src/react-confirm-alert.css';

const Users = () => {

  const [branchesList, setBranchesList] = useState<any[]>([])

    const delRecord = () => {
        confirmAlert({
            title: 'Confirm Delete',
            message: 'Are you sure to delete this record.',
            buttons: [{
            label: 'Yes',
            onClick: () => alert('Click Yes')
            },
            {
            label: 'No',
            onClick: () => {}
            }]
        });
    };


  useEffect(() => {
    const load = async () => {
      fetch(`${BASE_URL}/api/branches/view`, {
        method: "POST"
      }).then(async response => {
        const res = await response.json()
        if(res.data.data) {
            setBranchesList(res.data.data)
        }
      })
    }
    load()

    return () => {
      load()
    }
  }, [])

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
              branchesList.map((branch, index) => (
                <tr key={index}>
                  <td className="px-6 py-4">{index+1}</td>
                  <td className="px-6 py-4">{branch.branch_name}</td>
                  <td className="px-6 py-4">{branch.branch_address}</td>
                  <td className="px-6 py-4">{branch.branch_phone}</td>
                  <td className="px-6 py-4">
                    <LinkButton href={routes.branches+'/edit/'+branch.id} className='mr-2' >Edit</LinkButton>
                    <LiteButton className={'!text-red-500 bg-red-100'}
                        onClick={() => delRecord()}
                    >Del</LiteButton>
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