import React from 'react'
import BranchForm from '../../_components/branchForm'

const EditBranch = async (props: any) => {

  const branchId = await props.params.branch_id

  return (
    <div>
      <div className={`flex justify-between`}>
        <h2 className={'text-xl font-semibold'}>{'Edit Branch'}</h2>
      </div>
      <div className={'mt-5 p-5 bg-white shadow rounded'}>
        <BranchForm branchId={branchId} />
      </div>
    </div>
  )
}

export default EditBranch