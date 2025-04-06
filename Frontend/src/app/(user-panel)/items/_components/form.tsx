'use client'

import { DarkButton, LiteButton } from '@/components/button'
import { TextField } from '@/components/Fields'
import { toastCustom } from '@/components/toastCustom'
import { BASE_URL } from '@/config/constants'
import { routes } from '@/config/routes'
import { useRouter } from 'next/navigation'
import React, { useCallback, useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { ICategory, IItem } from '../../type'
import dynamic from 'next/dynamic'
import TextArea from '@/components/Fields/textarea'
import { CloudUpload, Trash2 } from 'lucide-react'

const ReactSelect = dynamic(() => import("react-select"), {
    ssr: false,
});

interface IForm {
    categories: ICategory[]
    isClose: boolean
    data?: IItem | null
    onSubmit: () => void
}

type OptionType = {
    value: string;
    label: string;
};

const Form = ({ categories, isClose, data, onSubmit }: IForm) => {

    let initialValues: IItem = {
        name: '',
        image: '',
        description: '',
        categories: [],
        variations: [],
        available: 1
    }

    const variationValues = { name: '', price: '', discountedPrice: '' }

    const [submiting, setSubmiting] = useState<boolean>(false)
    const [selectCategories, setSelectCategories] = useState<OptionType[]>([])
    const [image, setImage] = useState<any>()
    const [variations, setVariations] = useState([variationValues])

    const router = useRouter()
    const { register, handleSubmit, reset, setValue, getValues, control, formState: { errors } } = useForm<IItem>({
        defaultValues: initialValues
    })

    const addVariations = () => {
        setVariations(prev => [...prev, variationValues])
    }

    const changeVariationValue = useCallback(async (index: number, field: string, value: string) => {
        const result = await variations.map((variation, i) => {
            return (i === index) ? { ...variation, [field]: value } : variation
        })

        setVariations(result)
    }, [variations])

    const delVariation = async (index: number) => {
        setVariations(prev => prev.filter((_, i) => i !== index))
    }

    const submit = async (data: IItem) => {
        const _data = { ...data }

        return false
        
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
            setValue('name', data.name);
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

    useEffect(() => {
        if(categories.length > 0)
        {
            const _options: OptionType[] = categories.map(cat => ({
                label: cat.cat_name,
                value: cat.id ?? ''
            }))
            setSelectCategories(_options)
        }
    }, [categories])

    return (
        <form className={'grid grid-cols-1 gap-5'}
            onSubmit={handleSubmit(submit)}
            autoComplete="off"
        >
            <div className={'border-2 border-violet-800 p-2 rounded-xl'}>
                <label htmlFor='image' className={'border border-gray-400 border-dashed bg-gray-50 h-[200px] rounded-xl flex flex-wrap flex-col items-center justify-center cursor-pointer select-none'}>
                    <input type="file" id="image" className={'hidden'}
                    onChange={(e) => {
                        if(e.target.files)
                        {
                            setImage(e.target.files[0])
                        }
                    }}
                    />
                    <p><CloudUpload className={'text-violet-800'} size={50} strokeWidth={1.3} /></p>
                    <span className={'block text-gray-700 font-medium text-sm'}>Click to choose photo of item</span>
                </label>
            </div>
            <div>
                <label htmlFor="" className={'block mb-1'}>Categories</label>
                <Controller
                    name='categories'
                    control={control}
                    render={({ field }) => (
                        <ReactSelect
                            {...field}
                            placeholder={'Select Categories ...'}
                            defaultValue={selectCategories[1]}
                            options={selectCategories}
                            isClearable
                            isMulti
                            onChange={(selectedOption) => field.onChange(selectedOption)}
                            styles={{
                                control: (styles) => ({...styles, backgroundColor: "rgb(249, 250, 251)", border: "none", boxShadow: "none"})
                            }}
                        />
                    )}
                />
                {errors.categories && (
                    <small className={'text-red-700'}>{errors.categories.message}</small>
                )}
            </div>

            <div>
                <label htmlFor="" className={'block mb-1'}>Name *</label>
                <TextField
                    type="text"
                    placeholder={'Name'}
                    className={errors.name ? 'border-red-500' : 'border-gray-50'}
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
                <label htmlFor="" className={'block mb-1'}>Description</label>
                <TextArea
                    placeholder={'Description'}
                    className={errors.description ? 'border-red-500' : 'border-gray-50'}
                    {...register('description', {
                        required: {
                            value: true,
                            message: "Description is required"
                        }
                    })}
                />
                {errors.description && (
                    <small className={'text-red-700'}>{errors.description.message}</small>
                )}
            </div>

            <hr />

            <h4 className={'text-lg font-medium'}>{'Variations'}</h4>
            
            {
                variations.map((variation, index) => {
                    return (
                    <div key={index} className={'p-2 border-8 border-gray-50 rounded-lg text-sm relative'}>
                        {
                            index > 0 && (
                                <Trash2 
                                    className={'w-4 absolute right-3 text-red-600 cursor-pointer'}
                                    onClick={() => delVariation(index)}
                                />
                            )
                        }

                        <div className={'mb-4'}>
                            <label htmlFor="" className={'block mb-1'}>Name *</label>
                            <TextField
                                type="text"
                                placeholder={'Variation Name'}
                                value={variation.name}
                                onChange={(e) => {
                                    changeVariationValue(index, 'name', e.target.value)
                                }}
                            />
                        </div>
                        
                        <div className={'grid grid-cols-1 md:grid-cols-2 gap-5'}>
                            <div>
                                <label htmlFor="" className={'block mb-1'}>Price *</label>
                                <TextField
                                    type="text"
                                    placeholder={'Price'}
                                    className={errors.name ? 'border-red-500' : 'border-gray-50'}
                                    onChange={(e) => {
                                        changeVariationValue(index, 'price', e.target.value)
                                    }}
                                />
                            </div>

                            <div>
                                <label htmlFor="" className={'block mb-1'}>Discounted Price *</label>
                                <TextField
                                    type="text"
                                    placeholder={'Discounted Price'}
                                    className={errors.name ? 'border-red-500' : 'border-gray-50'}
                                    onChange={(e) => {
                                        changeVariationValue(index, 'discountedPrice', e.target.value)
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                    )
                })
            }

            <LiteButton 
                type="button" 
                className={'w-max'}
                onClick={() => {
                    addVariations()
                }}
            >{'Add Variation'}</LiteButton>

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