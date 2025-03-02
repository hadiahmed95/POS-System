'use client'

import { LinkButton } from '@/components/button'
import { BASE_URL } from '@/config/constants'
import React, { useEffect, useState } from 'react'

const Users = () => {

  const [usersList, setUsersList] = useState<any[]>([])

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

        <LinkButton href='/users/add'>{'Add User'}</LinkButton>
      </div>

      <div className={'relative overflow-x-auto mt-5'}>
        <table className={'w-full text-sm text-left rtl:text-right text-gray-500'}>
          <thead className={'text-xs text-gray-700 uppercase bg-gray-100'}>
            <tr>
              <th scope="col" className="px-6 py-3">Sr #</th>
              <th scope="col" className="px-6 py-3">Name</th>
              <th scope="col" className="px-6 py-3">Username</th>
              <th scope="col" className="px-6 py-3">Email</th>
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