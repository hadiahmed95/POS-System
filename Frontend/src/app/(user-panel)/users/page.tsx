'use client'

import { DarkButton, LinkButton, LiteButton } from '@/components/button'
import Popup, { PopupHeader } from '@/components/popup'
import { toastCustom } from '@/components/toastCustom'
import { BASE_URL } from '@/config/constants'
import { routes } from '@/config/routes'
import { SquarePen, Trash2 } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { confirmAlert } from 'react-confirm-alert'
import AddUser from './_components/add-user'

const Users = () => {

  const [usersList, setUsersList] = useState<any[]>([])
  const [user, setUser] = useState(null)
  const [showForm, setShowForm] = useState(false)

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
              console.log('del response', response)
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
      fetch(`${BASE_URL}/api/users/view`, {
        method: "POST"
      }).then(async response => {
        const res = await response.json()
        if(res.data.data) {
          setUsersList(res.data.data)
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
        <h2 className={'text-xl font-semibold'}>{'Users'}</h2>

        <LiteButton onClick={() => setShowForm(true)}>{'Add User'}</LiteButton>
      </div>

      <AddUser user={user} show={showForm} setShow={setShowForm} />

      <div className={'relative overflow-x-auto mt-5'}>
        <table className={'w-full text-sm text-left rtl:text-right text-gray-500'}>
          <thead className={'text-xs text-gray-700 uppercase bg-gray-100'}>
            <tr>
              <th scope="col" className="px-6 py-3">Sr #</th>
              <th scope="col" className="px-6 py-3">Name</th>
              <th scope="col" className="px-6 py-3">Username</th>
              <th scope="col" className="px-6 py-3">Email</th>
              <th scope="col" className="px-6 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {
              usersList.map((user, index) => (
                <tr key={index}>
                  <td className="px-6 py-4">{index+1}</td>
                  <td className="px-6 py-4">{user.name}</td>
                  <td className="px-6 py-4"></td>
                  <td className="px-6 py-4">{user.email}</td>
                  <td className="px-6 py-4 flex items-center">
                    <LiteButton className='mr-2 inline-block w-max'
                      onClick={() => {
                        setUser(user)
                      }}
                    >
                      <SquarePen />
                    </LiteButton>
                    <DarkButton variant='danger'
                      onClick={() => delRecord(user.id)}
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