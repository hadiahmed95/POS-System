'use client'

import { DarkButton } from '@/components/button'
import { toastCustom } from '@/components/toastCustom'
import { BASE_URL } from '@/config/constants'
import { PenIcon, Trash2 } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { confirmAlert } from 'react-confirm-alert'
import 'react-confirm-alert/src/react-confirm-alert.css'
import AddUser from './_components/add-user'
import PageTitleOver from '../_components/page-title-over'
import { IUser } from '../type'
import TableLoader from '../_components/table-loader'

const Users = () => {

  const [usersList, setUsersList] = useState<IUser[]>([])
  const [user, setUser] = useState<IUser | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const delRecord = (id: number) => {
    confirmAlert({
      title: 'Confirm Delete',
      message: 'Are you sure to delete this record.',
      buttons: [
        {
          label: 'Yes',
          onClick: () => {
            fetch(`${BASE_URL}/api/users/delete`, {
              method: "POST",
              body: JSON.stringify({ id })
            }).then(async response => {
              toastCustom.error('User deleted successfully.')
              setUsersList(usersList.filter(user => user.id !== id))
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

  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      fetch(`${BASE_URL}/api/users/view`, {
        method: "POST"
      }).then(async response => {
        const res = await response.json()
        if (res.data.data) {
          setUsersList(res.data.data)
        }
        setIsLoading(false)
      })
        .catch(e => {
          setIsLoading(false)
        })
    }
    load()

    return () => {
      load()
    }
  }, [])

  return (
    <div>
      <PageTitleOver>
        <h2 className={'text-xl font-semibold'}>{'Users'}</h2>

        <DarkButton onClick={() => setShowForm(true)}>{'Add User'}</DarkButton>
      </PageTitleOver>

      <AddUser user={user} show={showForm} setShow={setShowForm} onSave={(data) => {
        if (user && data) {
          setUsersList(prev => prev.map(u => u.id == data?.id ? data : u))
        }
        if (!user && data) {
          setUsersList(prev => [data, ...prev])
        }
      }} />

      <div className={'relative overflow-x-auto mt-5 bg-white shadow-sm rounded-lg'}>
        <table className={'w-full text-sm text-left rtl:text-right text-gray-500'}>
          <thead className={'text-xs text-gray-700 uppercase bg-gray-100'}>
            <tr>
              <th scope="col" className="px-6 py-3">Sr #</th>
              <th scope="col" className="px-6 py-3">Name</th>
              <th scope="col" className="px-6 py-3">Email</th>
              <th scope="col" className="px-6 py-3">Role</th>
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
                usersList.length > 0 ? usersList.map((user, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4">{index + 1}</td>
                    <td className="px-6 py-4">{user.name}</td>
                    <td className="px-6 py-4">{user.email}</td>
                    <td className="px-6 py-4">{user.role?.role_name}</td>
                    <td className="px-6 py-4 flex items-center">
                      <DarkButton
                        className='mr-2 inline-block w-max !p-[5px]'
                        onClick={(e) => {
                          setUser(user)
                          setShowForm(true)
                        }}
                      >
                        <PenIcon className='p-1' />
                      </DarkButton>
                      <DarkButton variant='danger'
                        onClick={() => delRecord(Number(user.id ?? 0))}
                        className={'inline-block w-max shadow-lg !p-[5px]'}
                      >
                        <Trash2 className={'w-5'} />
                      </DarkButton>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5}>
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