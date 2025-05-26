import React from 'react'
import RolesTableList from './_components';
import { getSession } from '@/app/lib/session';
import BackendAxios from '@/config/axios';

const UsersAccess = async () => {

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
    <RolesTableList modules={modules} permissions={permissions} />
  )
}

export default UsersAccess