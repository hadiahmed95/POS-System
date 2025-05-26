import React from 'react'
import RoleForm from './form'
import { IRole } from '../../type'

interface IEditRole {
    role: IRole
    modules: any
    permissions: any
    clearRole: () => void
}

const EditRole = ({ role, modules, permissions, clearRole } : IEditRole) => {

  return (
    <div>
      <div className={`flex justify-between`}>
        <h2 className={'text-xl font-semibold'}>{'Role #' + role.id}</h2>
      </div>
      <div className={'mt-5 ring-1 ring-gray-100 shadow-sm rounded'}>
        <RoleForm modules={modules} permissions={permissions} role={role} clearRole={clearRole} />
      </div>
    </div>
  )
}

export default EditRole