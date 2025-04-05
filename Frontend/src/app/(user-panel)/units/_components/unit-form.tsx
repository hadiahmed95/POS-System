'use client'

import { DarkButton } from '@/components/button'
import { TextField } from '@/components/Fields'
import { toastCustom } from '@/components/toastCustom'
import { BASE_URL } from '@/config/constants'
import { routes } from '@/config/routes'
import { useRouter } from 'next/navigation'
import React, { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { IUnit } from '../../type'

interface IUnitForm {
    unit?: IUnit | null
    onSubmit: () => void
}

const UnitForm = ({ unit, onSubmit }: IUnitForm) => {

    let initialValues: IUnit = {
        unit_name: '',
        unit_abbr: '',
    }
    const router = useRouter()
    const [submiting, setSubmiting] = useState<boolean>(false)
    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<IUnit>({
        defaultValues: initialValues
    })

    const submit = async (data: IUnit) => {
        setSubmiting(true)
        if(!unit?.id && !submiting)
        {
            const res = await fetch(`${BASE_URL}/api/units/add`, {
                method: "POST",
                body: JSON.stringify(data)
            }).then(response => response.json())
    
            if (res.status === "success") {
                reset()
                toastCustom.success('Unit added successfully.')
                router.push(routes.units)
            }
        }
        else if(!submiting)
        {
            const res = await fetch(`${BASE_URL}/api/units/update`, {
                method: "POST",
                body: JSON.stringify({...data, id: unit?.id})
            }).then(response => response.json())
    
            if (res.status === "success") {
                reset()
                toastCustom.info('Unit updated successfully.')
                router.push(routes.units)
            }
        }
        onSubmit()
        setSubmiting(false)
    }

    const updateFormValues = useCallback(() => {
        if (unit?.id) {
            setValue("id", unit.id);
            setValue("unit_name", unit.unit_name);
            setValue("unit_abbr", unit.unit_abbr);
        } else {
            reset();
        }
    }, [unit, setValue, reset]);

    useEffect(() => {
        updateFormValues()
    }, [updateFormValues])

    return (
        <form className={'grid grid-cols-1 gap-5'}
            onSubmit={handleSubmit(submit)}
        >
            <div>
                <label htmlFor="" className={'block mb-1'}>Name *</label>
                <TextField
                    type="text"
                    placeholder={'Name'}
                    className={errors.unit_name ? 'border-red-500' : 'border-gray-50'}
                    {...register('unit_name', {
                        required: {
                            value: true,
                            message: "Name is required"
                        }
                    })}
                />
                {errors.unit_name && (
                    <small className={'text-red-700'}>{errors.unit_name.message}</small>
                )}
            </div>
            <div>
                <label htmlFor="" className={'block mb-1'}>Abbrevation Value *</label>
                <TextField
                    type="text"
                    placeholder={'Abbrevation Value'}
                    className={errors.unit_name ? 'border-red-500' : 'border-gray-50'}
                    {...register('unit_abbr', {
                        required: {
                            value: true,
                            message: "Abbrevation value is required"
                        }
                    })}
                />
                {errors.unit_abbr && (
                    <small className={'text-red-700'}>{errors.unit_abbr.message}</small>
                )}
            </div>
            <div className={''}>
                <DarkButton 
                    type={'submit'} 
                    className={'w-full px-5 py-2 justify-center'}
                    loading={submiting}
                    disabled={submiting}
                >{ unit ? 'Update' : 'Add'}
                </DarkButton>
            </div>
        </form>
    )
}

export default UnitForm