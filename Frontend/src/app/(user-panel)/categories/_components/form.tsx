'use client'

import { DarkButton } from '@/components/button'
import { TextField } from '@/components/Fields'
import { toastCustom } from '@/components/toastCustom'
import { BASE_URL } from '@/config/constants'
import { routes } from '@/config/routes'
import { useRouter } from 'next/navigation'
import React, { useCallback, useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { ICategory } from '../../type'
import dynamic from 'next/dynamic'

const ReactSelect = dynamic(() => import("react-select"), {
    ssr: false,
});

interface IForm {
    isClose: boolean
    data?: ICategory | null
    onSubmit: () => void
}

type OptionType = {
    value: string;
    label: string;
};

type FormValueType = Omit<ICategory, 'parent_id'> & { parent_id: { value: string, label: string } }

const Form = ({ isClose, data, onSubmit }: IForm) => {

    let initialValues: FormValueType = {
        cat_name: '',
        parent_id: { value: '', label: 'Select Parent ...' }
    }

    const router = useRouter()
    const [submiting, setSubmiting] = useState<boolean>(false)
    const { register, handleSubmit, reset, setValue, getValues, control, formState: { errors } } = useForm<FormValueType>({
        defaultValues: initialValues
    })

    const submit = async (data: FormValueType) => {
        const _data = { ...data, parent_id: data.parent_id ? data.parent_id.value : '' }
        
        setSubmiting(true)
        if(!data?.id && !submiting)
        {
            const res = await fetch(`${BASE_URL}/api/categories/add`, {
                method: "POST",
                body: JSON.stringify(_data)
            }).then(response => response.json())
    
            if (res.status === "success") {
                reset()
                toastCustom.success('Category added successfully.')
                router.push(routes.categories)
            }
        }
        else if(!submiting)
        {
            const res = await fetch(`${BASE_URL}/api/categories/update`, {
                method: "POST",
                body: JSON.stringify({..._data, id: _data?.id})
            }).then(response => response.json())
    
            if (res.status === "success") {
                reset()
                toastCustom.info('Category updated successfully.')
                router.push(routes.categories)
            }
        }
        onSubmit()
        setSubmiting(false)
    }

    const updateFormValues = useCallback(() => {
        if (data?.id) {
            setValue("id", data.id);
            setValue('cat_name', data.cat_name);
            if(data.parent_id)
            {
                const op = options.find(op => op.value === data.parent_id) ?? initialValues.parent_id
                setValue('parent_id', op);
            }
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

    const options: OptionType[] = [
        { value : '', label: 'Select Parent ...'},
        { value: 'purple', label: 'Purple' },
        { value: 'orange', label: 'Orange' },
        { value: 'yellow', label: 'Yellow' },
        { value: 'green', label: 'Green' },
        { value: 'forest', label: 'Forest' },
        { value: 'slate', label: 'Slate' },
        { value: 'silver', label: 'Silver' },
      ];

    return (
        <form className={'grid grid-cols-1 gap-5'}
            onSubmit={handleSubmit(submit)}
        >
            <div>
                <label htmlFor="" className={'block mb-1'}>Select Parent</label>
                {/* <TextField
                    type="text"
                    placeholder={'Phone No'}
                    className={errors.parent_id ? 'border-red-500' : 'border-gray-50'}
                    {...register('parent_id', {
                        required: {
                            value: true,
                            message: "Phone no is required"
                        }
                    })}
                /> */}
                <Controller
                    name="parent_id"
                    control={control}
                    render={({ field }) => (
                        <ReactSelect
                            {...field}
                            // className="basic-single"
                            placeholder={'Select Parent ...'}
                            defaultValue={options[1]}
                            options={options}
                            onChange={(selectedOption) => field.onChange(selectedOption)}
                            styles={{
                                control: (styles) => ({...styles, backgroundColor: "rgb(249, 250, 251)", border: "none", boxShadow: "none"})
                            }}
                        />
                    )}
                />
                
                {errors.parent_id && (
                    <small className={'text-red-700'}>{errors.parent_id.message}</small>
                )}
            </div>

            <div>
                <label htmlFor="" className={'block mb-1'}>Name *</label>
                <TextField
                    type="text"
                    placeholder={'Name'}
                    className={errors.cat_name ? 'border-red-500' : 'border-gray-50'}
                    {...register('cat_name', {
                        required: {
                            value: true,
                            message: "Name is required"
                        }
                    })}
                />
                {errors.cat_name && (
                    <small className={'text-red-700'}>{errors.cat_name.message}</small>
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