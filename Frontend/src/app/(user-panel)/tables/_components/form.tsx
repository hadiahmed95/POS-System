'use client'

import { DarkButton } from '@/components/button'
import { TextField } from '@/components/Fields'
import { toastCustom } from '@/components/toastCustom'
import { BASE_URL } from '@/config/constants'
import { routes } from '@/config/routes'
import { useRouter } from 'next/navigation'
import React, { useCallback, useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { ITable } from '../../type'
import { useAppSelector } from '../../_lib/store'
import dynamic from 'next/dynamic'

const ReactSelect = dynamic(() => import("react-select"), {
    ssr: false,
});

interface IForm {
    isClose: boolean
    data?: ITable | null
    onSubmit: () => void
}

type OptionType = {
    value: string;
    label: string;
};

const Statuses: OptionType[] = [
    { label: 'Available', value: 'available' },
    { label: 'Reserved', value: 'reserved' },
    { label: 'Occupied', value: 'occupied' },
]

const Types: OptionType[] = [
    { label: 'Indoor', value: 'indoor' },
    { label: 'Outdoor', value: 'outdoor' }
]

const Form = ({ isClose, data, onSubmit }: IForm) => {

    const { user } = useAppSelector(state => state.user)

    let initialValues: ITable = {
        table_no: '',
        capacity: '',
        type: 'indoor',
        status: 'available',
        added_by: user.id
    }

    const router = useRouter()
    const [submiting, setSubmiting] = useState<boolean>(false)
    const { register, handleSubmit, reset, setValue, control, formState: { errors } } = useForm<ITable>({
        defaultValues: initialValues
    })

    const submit = async (data: ITable) => {
        setSubmiting(true)
        if(!data?.id && !submiting)
        {
            const res = await fetch(`${BASE_URL}/api/tables/add`, {
                method: "POST",
                body: JSON.stringify(data)
            }).then(response => response.json())
    
            if (res.status === "success") {
                reset()
                toastCustom.success('Table added successfully.')
                router.push(routes.tables)
            }
        }
        else if(!submiting)
        {
            const res = await fetch(`${BASE_URL}/api/tables/update`, {
                method: "POST",
                body: JSON.stringify({...data, id: data?.id})
            }).then(response => response.json())
    
            if (res.status === "success") {
                reset()
                toastCustom.info('Table updated successfully.')
                router.push(routes.tables)
            }
        }
        onSubmit()
        setSubmiting(false)
    }

    const updateFormValues = useCallback(() => {
        if (data?.id) {
            setValue("id", data.id);
            setValue('table_no', data.table_no);
            setValue('capacity', data.capacity);
            setValue('type', data.type);
            setValue('status', data.status);
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
                <label htmlFor="" className={'block mb-1'}>Table no *</label>
                <TextField
                    type="text"
                    placeholder={'Table no'}
                    className={errors.table_no ? 'border-red-500' : 'border-gray-50'}
                    {...register('table_no', {
                        required: {
                            value: true,
                            message: "Table no is required"
                        }
                    })}
                />
                {errors.table_no && (
                    <small className={'text-red-700'}>{errors.table_no.message}</small>
                )}
            </div>

            <div>
                <label htmlFor="" className={'block mb-1'}>Capacity *</label>
                <TextField
                    type="text"
                    placeholder={'Capacity'}
                    className={errors.capacity ? 'border-red-500' : 'border-gray-50'}
                    {...register('capacity', {
                        required: {
                            value: true,
                            message: "Capacity is required"
                        }
                    })}
                />
                {errors.capacity && (
                    <small className={'text-red-700'}>{errors.capacity.message}</small>
                )}
            </div>

            <div>
                <label htmlFor="" className={'block mb-1'}>Type</label>
                <Controller
                    name='type'
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
                                control: (styles) => ({...styles, backgroundColor: "rgb(249, 250, 251)", border: "none", boxShadow: "none"})
                            }}
                        />
                    )}
                />
                {errors.status && (
                    <small className={'text-red-700'}>{errors.status.message}</small>
                )}
            </div>
            
            <div>
                <label htmlFor="" className={'block mb-1'}>Status</label>
                <Controller
                    name='status'
                    control={control}
                    render={({ field }) => (
                        <ReactSelect
                            {...field}
                            value={ Statuses.find(s => s.value === field.value) }
                            options={Statuses}
                            onChange={(selectedOption) => {
                                field.onChange((selectedOption as OptionType).value)
                            }}
                            styles={{
                                control: (styles) => ({...styles, backgroundColor: "rgb(249, 250, 251)", border: "none", boxShadow: "none"})
                            }}
                        />
                    )}
                />
                {errors.status && (
                    <small className={'text-red-700'}>{errors.status.message}</small>
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