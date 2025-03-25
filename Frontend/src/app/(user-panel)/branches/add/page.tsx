import React from 'react'
import BranchForm from '../_components/branchForm';
const AddBranches = () => {
  return (
    <div>
      <div className={`flex justify-between`}>
        <h2 className={'text-xl font-semibold'}>{'Add Branch'}</h2>
      </div>
      <div className={'mt-5 p-5 bg-white shadow rounded'}>
        <BranchForm />
      </div>
    </div>
  )
}

export default AddBranches