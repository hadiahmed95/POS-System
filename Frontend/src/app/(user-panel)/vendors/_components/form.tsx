'use client'

import { DarkButton } from '@/components/button'
import { TextField } from '@/components/Fields'
import { toastCustom } from '@/components/toastCustom'
import { BASE_URL } from '@/config/constants'
import { routes } from '@/config/routes'
import { useRouter } from 'next/navigation'
import React, { useCallback, useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { IVendor } from '../../type'
import TextArea from '@/components/Fields/textarea'

interface IForm {
    isClose: boolean
    data?: IVendor | null
    onSubmit: () => void
}

const Form = ({ isClose, data, onSubmit }: IForm) => {

    let initialValues: IVendor = {
        vendor_name: '',
        vendor_phone: '',
        vendor_address: '',
        vendor_description: '',
    }

    const router = useRouter()
    const [submiting, setSubmiting] = useState<boolean>(false)
    const { register, handleSubmit, reset, setValue, control, formState: { errors } } = useForm<IVendor>({
        defaultValues: initialValues
    })

    const submit = async (data: IVendor) => {
        setSubmiting(true)
        if(!data?.id && !submiting)
        {
            const res = await fetch(`${BASE_URL}/api/vendors/add`, {
                method: "POST",
                body: JSON.stringify(data)
            }).then(response => response.json())
    
            if (res.status === "success") {
                reset()
                toastCustom.success('Vendor added successfully.')
                router.push(routes.vendors)
            }
        }
        else if(!submiting)
        {
            const res = await fetch(`${BASE_URL}/api/vendors/update`, {
                method: "POST",
                body: JSON.stringify({...data, id: data?.id})
            }).then(response => response.json())
    
            if (res.status === "success") {
                reset()
                toastCustom.info('Vendor updated successfully.')
                router.push(routes.vendors)
            }
        }
        onSubmit()
        setSubmiting(false)
    }

    const updateFormValues = useCallback(() => {
        if (data?.id) {
            setValue("id", data.id);
            setValue('vendor_name', data.vendor_name);
            setValue("vendor_phone", data.vendor_phone);
            setValue("vendor_address", data.vendor_address);
            setValue("vendor_description", data.vendor_description ?? '');
        } else {
            reset();
        }
    }, [data, setValue, reset]);

    useEffect(() => {
        updateFormValues()
    }, [updateFormValues])

    useEffect(() => {
        if(isClose)
        {
            reset()
        }
    }, [isClose])

    return (
        <form className={'grid grid-cols-1 gap-5'}
            onSubmit={handleSubmit(submit)}
        >
            <div>
                <label htmlFor="" className={'block mb-1'}>Name *</label>
                <TextField
                    type="text"
                    placeholder={'Name'}
                    className={errors.vendor_name ? 'border-red-500' : 'border-gray-50'}
                    {...register('vendor_name', {
                        required: {
                            value: true,
                            message: "Name is required"
                        }
                    })}
                />
                {errors.vendor_name && (
                    <small className={'text-red-700'}>{errors.vendor_name.message}</small>
                )}
            </div>
            <div>
                <label htmlFor="" className={'block mb-1'}>Phone No *</label>
                <TextField
                    type="text"
                    placeholder={'Phone No'}
                    className={errors.vendor_phone ? 'border-red-500' : 'border-gray-50'}
                    {...register('vendor_phone', {
                        required: {
                            value: true,
                            message: "Phone no is required"
                        }
                    })}
                />
                {errors.vendor_phone && (
                    <small className={'text-red-700'}>{errors.vendor_phone.message}</small>
                )}
            </div>

            <div>
                <label htmlFor="" className={'block mb-1'}>Address</label>
                <TextField
                    type="text"
                    placeholder={'Address'}
                    className={errors.vendor_address ? 'border-red-500' : 'border-gray-50'}
                    {...register('vendor_address', {
                        required: false,
                    })}
                />
                {errors.vendor_address && (
                    <small className={'text-red-700'}>{errors.vendor_address.message}</small>
                )}
            </div>

            <div>
                <label htmlFor="" className={'block mb-1'}>Description</label>
                <Controller
                    name="vendor_description"
                    control={control}
                    rules={{ required: false }}
                    render={({ field }) => <TextArea
                            {...field}
                            placeholder={'Description'}
                            className={errors.vendor_description ? 'border-red-500' : 'border-gray-50'}
                        />
                    }
                />
                {errors.vendor_description && (
                    <small className={'text-red-700'}>{errors.vendor_description.message}</small>
                )}
            </div>

            <div className={''}>
                <DarkButton 
                    type={'submit'} 
                    className={'w-full px-5 py-2 justify-center'}
                    loading={submiting}
                    disabled={submiting}
                >{ data ? 'Update' : 'Add'}
                </DarkButton>
            </div>
        </form>
    )
}

export default Form