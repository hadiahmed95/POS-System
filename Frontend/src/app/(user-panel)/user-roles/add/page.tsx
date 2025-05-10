import React from 'react'
import RoleForm from '../_components/form'
import { getSession } from '@/app/lib/session'
import { BASE_URL } from '@/config/constants'
import BackendAxios from '@/config/axios'

const AddUserRole = async () => {

  const userToken = await getSession('auth_token')

  const [modules, permissions] = await Promise.all([
    BackendAxios.get('view/modules', {
      headers: {
        "Authorization": `Bearer ${userToken}`
      }
    })
    .then(async (response) => response.data.data.data)
    .catch(e => {
      return e.response.data
    }),
    BackendAxios.get('view/permissions', {
      headers: {
        "Authorization": `Bearer ${userToken}`
      }
    })
    .then(async (response) => response.data.data.data)
    .catch(e => {
      return e.response.data
    })
  ])

  return (
    <div>
      <div className={`flex justify-between`}>
        <h2 className={'text-xl font-semibold'}>{'Add Role'}</h2>
      </div>
      <div className={'mt-5 ring-1 ring-gray-100 shadow-sm rounded'}>
        <RoleForm modules={modules} permissions={permissions} />
      </div>
    </div>
  )
}

export default AddUserRole