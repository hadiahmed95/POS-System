'use client'

import { DarkButton } from '@/components/button'
import { TextField } from '@/components/Fields'
import { toastCustom } from '@/components/toastCustom'
import { BASE_URL } from '@/config/constants'
import { routes } from '@/config/routes'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { IBranch } from '../../type'

interface IBranchForm {
    branchId?: string | number
}

const BranchForm = ({ branchId }: IBranchForm) => {

    let initialValues: IBranch = {
        branch_name: '',
        branch_address: '',
        branch_description: '',
        branch_phone: ''
    }
    const router = useRouter()
    const [submiting, setSubmiting] = useState<boolean>(false)
    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<IBranch>({
        defaultValues: initialValues
    })

    const submit = async (data: IBranch) => {
        setSubmiting(true)
        if(!branchId && !submiting)
        {
            const res = await fetch(`${BASE_URL}/api/branches/add`, {
                method: "POST",
                body: JSON.stringify(data)
            }).then(response => response.json())
    
            if (res.status === "success") {
                reset()
                toastCustom.success('Branch added successfully.')
                router.push(routes.branches)
            }
        }
        else if(!submiting)
        {
            const res = await fetch(`${BASE_URL}/api/branches/update`, {
                method: "POST",
                body: JSON.stringify({...data, id: branchId})
            }).then(response => response.json())
    
            if (res.status === "success") {
                reset()
                toastCustom.info('Branch updated successfully.')
                router.push(routes.branches)
            }
        }
        setSubmiting(false)
    }

    useEffect(() => {
        const load = () => {
            if(branchId)
            {
                console.log('branch loading ...')
                fetch(`${BASE_URL}/api/branches/${branchId}`, {
                    method: "GET"
                })
                .then(async response => {
                    const res = await response.json()
                    setValue('id', res.data.id)
                    setValue('branch_name', res.data.branch_name)
                    setValue('branch_phone', res.data.branch_phone)
                    setValue('branch_address', res.data.branch_address)
                    setValue('branch_description', res.data.branch_description)
                })
            }
        }
        load()
    }, [branchId])

    return (
        <form className={'grid grid-cols-2 gap-5'}
            onSubmit={handleSubmit(submit)}
        >
            <div>
                <label htmlFor="" className={'block mb-1'}>Name *</label>
                <TextField
                    type="text"
                    placeholder={'Name'}
                    className={errors.branch_name ? 'border-red-500' : 'border-gray-50'}
                    {...register('branch_name', {
                        required: {
                            value: true,
                            message: "Name is required"
                        }
                    })}
                />
                {errors.branch_name && (
                    <small className={'text-red-700'}>{errors.branch_name.message}</small>
                )}
            </div>

            <div>
                <label htmlFor="" className={'block mb-1'}>Phone No. *</label>
                <TextField
                    type="text"
                    placeholder={'Phone No.'}
                    className={errors.branch_phone ? 'border-red-500' : 'border-gray-50'}
                    {...register('branch_phone', {
                        required: {
                            value: true,
                            message: "Phone is required"
                        }
                    })}
                />
                {
                    errors.branch_phone && (
                        <small className={'text-red-700'}>{errors.branch_phone.message}</small>
                    )
                }
            </div>

            <div className={'col-span-2'}>
                <label htmlFor="" className={'block mb-1'}>Address *</label>
                <TextField
                    type="text"
                    placeholder={'Address'}
                    className={errors.branch_address ? 'border-red-500' : 'border-gray-50'}
                    {...register('branch_address', {
                        required: {
                            value: true,
                            message: "Address is required"
                        }
                    })}
                />
                {
                    errors.branch_address && (
                        <small className={'text-red-700'}>{errors.branch_address.message}</small>
                    )
                }
            </div>

            <div className={'col-span-2'}>
                <label htmlFor="" className={'block mb-1'}>Description</label>
                <TextField
                    type="text"
                    className={errors.branch_description ? 'border-red-500' : 'border-gray-50'}
                    placeholder={'Enter Description'}
                    {...register('branch_description')}
                />
                {
                    errors.branch_description && (
                        <small className={'text-red-700'}>{errors.branch_description.message}</small>
                    )
                }
            </div>
            <div className={'col-span-2'}>
                <DarkButton 
                    type={'submit'} 
                    className={'w-max px-5 py-1'}
                    loading={submiting}
                    disabled={submiting}
                >{ branchId ? 'Update' : 'Add'}
                </DarkButton>
            </div>
        </form>
    )
}

export default BranchForm