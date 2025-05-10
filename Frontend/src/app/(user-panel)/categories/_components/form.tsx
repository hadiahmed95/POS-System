'use client'

import { DarkButton } from '@/components/button'
import { TextField } from '@/components/Fields'
import { toastCustom } from '@/components/toastCustom'
import { BASE_URL } from '@/config/constants'
import { routes } from '@/config/routes'
import { useRouter } from 'next/navigation'
import React, { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { ICategory } from '../../type'
import dynamic from 'next/dynamic'
import { isOnline } from '@/services/offline-storage'
import { CloudOff } from 'lucide-react'
import { createCategoryLocally, updateCategoryLocally } from './api-calls'

// const ReactSelect = dynamic(() => import("react-select"), {
//     ssr: false,
// });

interface IForm {
    show: boolean
    isClose: boolean
    data?: ICategory | null
    onSubmit: () => void
}

type OptionType = {
    value: string;
    label: string;
};

type FormValueType = Omit<ICategory, 'parent_id'> & { parent_id: { value: string, label: string } }

const Form = ({ show, isClose, data, onSubmit }: IForm) => {

    let initialValues: FormValueType = {
        cat_name: '',
        parent_id: { value: '', label: 'Select Parent ...' }
    }

    const router = useRouter()
    const [submiting, setSubmiting] = useState<boolean>(false)
    const [isOffline, setIsOffline] = useState<boolean>(!isOnline())
    const { register, handleSubmit, reset, setValue, getValues, control, formState: { errors } } = useForm<FormValueType>({
        defaultValues: initialValues
    })

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

    const submit = async (data: FormValueType) => {
        const _data = { ...data, parent_id: data.parent_id ? data.parent_id.value : '' }
        
        setSubmiting(true)
        try {
            // Check if we're online or offline
            if (isOnline()) {
                // We're online, use regular API call
                if(!data?.id && !submiting) {
                    // Creating new category
                    const res = await fetch(`${BASE_URL}/api/categories/add`, {
                        method: "POST",
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(_data)
                    }).then(response => response.json())
            
                    if (res.status === "success") {
                        reset()
                        toastCustom.success('Category added successfully.')
                        router.push(routes.categories)
                        onSubmit()
                    } else {
                        toastCustom.error(res.message || 'Error adding category')
                    }
                }
                else if(!submiting) {
                    // Updating existing category
                    const res = await fetch(`${BASE_URL}/api/categories/update`, {
                        method: "POST",
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({..._data, id: data?.id})
                    }).then(response => response.json())
            
                    if (res.status === "success") {
                        reset()
                        toastCustom.info('Category updated successfully.')
                        router.push(routes.categories)
                        onSubmit()
                    } else {
                        toastCustom.error(res.message || 'Error updating category')
                    }
                }
            } else {
                // We're offline, use local storage
                if(!data?.id && !submiting) {
                    // Create category locally
                    createCategoryLocally(_data as ICategory);
                    reset();
                    toastCustom.success('Category added locally. Will sync when online.');
                    router.push(routes.categories);
                    onSubmit();
                } else if(!submiting) {
                    // Update category locally
                    updateCategoryLocally({..._data, id: data?.id} as ICategory);
                    reset();
                    toastCustom.info('Category updated locally. Will sync when online.');
                    router.push(routes.categories);
                    onSubmit();
                }
            }
        } catch (error) {
            console.error('Error submitting category:', error)
            toastCustom.error('Error saving category. Please try again.')
        } finally {
            setSubmiting(false)
        }
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

    // Update offline status when network state changes
    useEffect(() => {
        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);
        
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        
        return () => {
          window.removeEventListener('online', handleOnline);
          window.removeEventListener('offline', handleOffline);
        };
    }, []);

    return (
        <form className={'grid grid-cols-1 gap-5'}
            onSubmit={handleSubmit(submit)}
            autoComplete="off"
        >
            {isOffline && (
                <div className="bg-amber-50 border border-amber-300 rounded-md p-3 flex items-start">
                    <CloudOff className="text-amber-500 w-5 h-5 mr-2 mt-0.5" />
                    <div>
                        <p className="text-amber-800 font-medium">Working in offline mode</p>
                        <p className="text-sm text-amber-700">Changes will be saved locally and synced when you're back online.</p>
                    </div>
                </div>
            )}
            
            {/* <div>
                <label htmlFor="" className={'block mb-1'}>Select Parent</label>
                <Controller
                    name="parent_id"
                    control={control}
                    render={({ field }) => (
                        <ReactSelect
                            {...field}
                            placeholder={'Select Parent ...'}
                            defaultValue={options[0]}
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
            </div> */}

            <div>
                <label htmlFor="" className={'block mb-1'}>Name *</label>
                <TextField
                    type="text"
                    placeholder={'Name'}
                    className={errors.cat_name ? 'border-red-500' : 'border-gray-50 ring-1 ring-gray-300'}
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