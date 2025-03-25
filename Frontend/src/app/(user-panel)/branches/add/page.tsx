'use client';

import { DarkButton } from '@/components/button'
import { TextField } from '@/components/Fields';
import { BASE_URL } from '@/config/constants';
import { routes } from '@/config/routes';
import { useRouter } from 'next/navigation';
import React from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify';
import BranchForm from '../_components/branchForm';

interface BranchInterface {
  branch_name: string
  branch_address: string
  branch_description: string
  branch_phone: string
}

const AddBranches = () => {

  let initialValues: BranchInterface = {
    branch_name: '',
    branch_address: '',
    branch_description: '',
    branch_phone: ''
  }
  const router = useRouter()

  const { register, handleSubmit, reset, formState: { errors } } = useForm<BranchInterface>({
    defaultValues: initialValues
  })

  const submit = async (data: BranchInterface) => {

    const res = await fetch(`${BASE_URL}/api/branches/add`, {
      method: "POST",
      body: JSON.stringify(data)
    }).then(response => response.json())

    if (res.status === "success") {
      reset()
      toast.success('Branch added successfully.')
      router.push(routes.branches)
    }
  }

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