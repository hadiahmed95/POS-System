'use client'

import { DarkButton } from '@/components/button'
import { TextField } from '@/components/Fields'
import { toastCustom } from '@/components/toastCustom'
import { BASE_URL } from '@/config/constants'
import { routes } from '@/config/routes'
import { useRouter } from 'next/navigation'
import React, { useCallback, useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { ICustomer } from '../../type'
import dynamic from 'next/dynamic'

const ReactSelect = dynamic(() => import("react-select"), {
    ssr: false,
});

interface IForm {
    isClose: boolean
    data?: ICustomer | null
    onSubmit: () => void
}

type OptionType = {
    value: string;
    label: string;
};

const Types: OptionType[] = [
    { label: 'Walkin', value: 'walkin' },
    { label: 'Online', value: 'online' },
    { label: 'Other', value: 'other' }
]

const Form = ({ isClose, data, onSubmit }: IForm) => {

    let initialValues: ICustomer = {
        name: '',
        phone: '',
        email: '',
        licence_plate: '',
        customer_type: 'walkin'
    }

    const router = useRouter()
    const [submiting, setSubmiting] = useState<boolean>(false)
    const { register, handleSubmit, reset, setValue, control, formState: { errors } } = useForm<ICustomer>({
        defaultValues: initialValues
    })

    const submit = async (data: ICustomer) => {
        setSubmiting(true)
        if(!data?.id && !submiting)
        {
            const res = await fetch(`${BASE_URL}/api/customers/add`, {
                method: "POST",
                body: JSON.stringify(data)
            }).then(response => response.json())
    
            if (res.status === "success") {
                reset()
                toastCustom.success('Customer added successfully.')
                router.push(routes.tables)
            }
        }
        else if(!submiting)
        {
            const res = await fetch(`${BASE_URL}/api/customers/update`, {
                method: "POST",
                body: JSON.stringify({...data, id: data?.id})
            }).then(response => response.json())
    
            if (res.status === "success") {
                reset()
                toastCustom.info('Customer updated successfully.')
                router.push(routes.tables)
            }
        }
        onSubmit()
        setSubmiting(false)
    }

    const updateFormValues = useCallback(() => {
        if (data?.id) {
            setValue("id", data.id);
            setValue('name', data.name);
            setValue('phone', data.phone);
            setValue('email', data.email);
            setValue('licence_plate', data.licence_plate);
            setValue('customer_type', data.customer_type);
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
                    className={errors.name ? 'border-red-500' : 'border-gray-50 ring-1 ring-gray-300'}
                    {...register('name', {
                        required: {
                            value: true,
                            message: "Name is required"
                        }
                    })}
                />
                {errors.name && (
                    <small className={'text-red-700'}>{errors.name.message}</small>
                )}
            </div>

            <div>
                <label htmlFor="" className={'block mb-1'}>Phone No *</label>
                <TextField
                    type="tel"
                    placeholder={'Phone no'}
                    className={errors.phone ? 'border-red-500' : 'border-gray-50 ring-1 ring-gray-300'}
                    {...register('phone', {
                        required: {
                            value: true,
                            message: "Phone no is required"
                        }
                    })}
                />
                {errors.phone && (
                    <small className={'text-red-700'}>{errors.phone.message}</small>
                )}
            </div>

            <div>
                <label htmlFor="" className={'block mb-1'}>Email *</label>
                <TextField
                    type="email"
                    placeholder={'Email'}
                    className={errors.phone ? 'border-red-500' : 'border-gray-50 ring-1 ring-gray-300'}
                    {...register('email')}
                />
                {errors.email && (
                    <small className={'text-red-700'}>{errors.email.message}</small>
                )}
            </div>

            <div>
                <label htmlFor="" className={'block mb-1'}>Customer Type</label>
                <Controller
                    name='customer_type'
                    control={control}
                    render={({ field }) => (
                        <ReactSelect
                            {...field}
                            value={ Types.find(t => t.value === field.value) }
                            options={Types}
                            onChange={(selectedOption) => {
                                field.onChange((selectedOption as OptionType).value)
                            }}
                            styles={{
                                control: (styles) => ({...styles, backgroundColor: "rgb(249, 250, 251)", border: "none", boxShadow: "0 0 0 0px #fff, 0 0 0 calc(1px + 0px) rgb(209 213 219 / 1), 0 0 #0000, 0 0 #0000"})
                            }}
                        />
                    )}
                />
                {errors.customer_type && (
                    <small className={'text-red-700'}>{errors.customer_type.message}</small>
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