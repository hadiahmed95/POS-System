import React from 'react'
import UserForm from '../../_components/user-form'

const EditBranch = async (props: any) => {

  const user_id = await props.params.user_id

  return (
    <div>
      <div className={`flex justify-between`}>
        <h2 className={'text-xl font-semibold'}>{'Edit Branch'}</h2>
      </div>
      <div className={'mt-5 p-5 bg-white shadow rounded'}>
        <UserForm user_id={user_id} />
      </div>
    </div>
  )
}

export default EditBranch