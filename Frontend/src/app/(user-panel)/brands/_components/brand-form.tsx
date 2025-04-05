'use client'

import { DarkButton } from '@/components/button'
import { TextField } from '@/components/Fields'
import { toastCustom } from '@/components/toastCustom'
import { BASE_URL } from '@/config/constants'
import { routes } from '@/config/routes'
import { useRouter } from 'next/navigation'
import React, { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { IBrand } from '../../type'

interface IBrandForm {
    brand?: IBrand | null
    onSubmit: () => void
}

const BrandForm = ({ brand, onSubmit }: IBrandForm) => {

    let initialValues: IBrand = {
        brand_name: '',
    }
    const router = useRouter()
    const [submiting, setSubmiting] = useState<boolean>(false)
    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<IBrand>({
        defaultValues: initialValues
    })

    const submit = async (data: IBrand) => {
        setSubmiting(true)
        if(!brand?.id && !submiting)
        {
            const res = await fetch(`${BASE_URL}/api/brands/add`, {
                method: "POST",
                body: JSON.stringify(data)
            }).then(response => response.json())
    
            if (res.status === "success") {
                reset()
                toastCustom.success('Brand added successfully.')
                router.push(routes.brands)
            }
        }
        else if(!submiting)
        {
            const res = await fetch(`${BASE_URL}/api/brands/update`, {
                method: "POST",
                body: JSON.stringify({...data, id: brand?.id})
            }).then(response => response.json())
    
            if (res.status === "success") {
                reset()
                toastCustom.info('Brand updated successfully.')
                router.push(routes.brands)
            }
        }
        onSubmit()
        setSubmiting(false)
    }

    const updateFormValues = useCallback(() => {
        if (brand?.id) {
            setValue("id", brand.id);
            setValue("brand_name", brand.brand_name);
        } else {
            reset();
        }
    }, [brand, setValue, reset]);

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
                    className={errors.brand_name ? 'border-red-500' : 'border-gray-50'}
                    {...register('brand_name', {
                        required: {
                            value: true,
                            message: "Name is required"
                        }
                    })}
                />
                {errors.brand_name && (
                    <small className={'text-red-700'}>{errors.brand_name.message}</small>
                )}
            </div>
            <div className={''}>
                <DarkButton 
                    type={'submit'} 
                    className={'w-full px-5 py-2 justify-center'}
                    loading={submiting}
                    disabled={submiting}
                >{ brand ? 'Update' : 'Add'}
                </DarkButton>
            </div>
        </form>
    )
}

export default BrandForm