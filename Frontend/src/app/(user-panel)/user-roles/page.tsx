import { LiteButton } from '@/components/button'
import React from 'react'

const UsersAccess = () => {
  return (
    <div>
      <div className={`flex justify-between`}>
        <h2 className={'text-xl font-semibold'}>{'User Roles'}</h2>

        <LiteButton>{'Add User Role'}</LiteButton>
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
            <tr>
              <td className="px-6 py-4">1</td>
              <td className="px-6 py-4">Name</td>
              <td className="px-6 py-4">username</td>
              <td className="px-6 py-4">email@domain.com</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default UsersAccess