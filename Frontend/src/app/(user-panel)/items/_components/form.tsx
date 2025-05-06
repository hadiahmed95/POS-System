'use client'

import { DarkButton, LiteButton, Switcher } from '@/components/button'
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

type ItemType = Omit<IItem, 'cat_id'> & { category: OptionType }

const Form = ({ categories, isClose, data, onSubmit }: IForm) => {

    let initialValues: ItemType = {
        name: '',
        image: '',
        description: '',
        category: { value: '0', label: 'Select Category ...' },
        variations: [],
        available: 1,
        price: 0
    }

    const variationValues = { name: '', price: '', discountedPrice: '' }

    const [submiting, setSubmiting] = useState<boolean>(false)
    const [selectCategories, setSelectCategories] = useState<OptionType[]>([])
    const [image, setImage] = useState<any>()
    const [type, setType] = useState<'normal' | 'group'>('normal')
    const [variations, setVariations] = useState([variationValues])

    const router = useRouter()
    const { register, handleSubmit, reset, setValue, getValues, control, formState: { errors } } = useForm<ItemType>({
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

    const submit = async (data: ItemType) => {
        let _data = {
            name: data.name,
            cat_id: data.category.value,
            description: data.description,
            price: data.price,
            image: data.image,
            box_quantity: 1
        }
        
        setSubmiting(true)
        if(!data?.id && !submiting)
        {
            const res = await fetch(`${BASE_URL}/api/items/add`, {
                method: "POST",
                body: JSON.stringify(_data)
            }).then(response => response.json())
    
            if (res.status === "success") {
                reset()
                toastCustom.success('Item added successfully.')
                router.push(routes.items)
            }
        }
        else if(!submiting)
        {
            const res = await fetch(`${BASE_URL}/api/items/update`, {
                method: "POST",
                body: JSON.stringify({..._data, id: data?.id})
            }).then(response => response.json())
    
            if (res.status === "success") {
                reset()
                toastCustom.info('Item updated successfully.')
                router.push(routes.items)
            }
        }
        onSubmit()
        setSubmiting(false)
    }

    const updateFormValues = useCallback(() => {
        if (data?.id) {
            setValue("id", data.id);
            setValue('name', data.name);
            setValue('description', data.description);
            setValue('price', data.price);

            let edit_cat = categories.find(cat => cat.id && Number(cat.id) == Number(data.cat_id))
            setValue('category', {label: edit_cat?.cat_name ?? '', value: (edit_cat?.id as string) ?? ''});
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
                value: (cat.id as string) ?? ''
            }))
            setSelectCategories(_options)
        }
    }, [categories])

    return (
        <form className={'grid grid-cols-1 gap-5'}
            onSubmit={handleSubmit(submit)}
            autoComplete="off"
        >
            <div className={'border-2 border-violet-600 shadow-xl ring-2 ring-violet-100 ring-offset-violet-50 p-2 rounded-xl'}>
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
                <label htmlFor="" className={'block mb-1 font-medium'}>Categories</label>
                <Controller
                    name='category'
                    control={control}
                    render={({ field }) => (
                        <ReactSelect
                            {...field}
                            placeholder={'Select Categories ...'}
                            defaultValue={selectCategories[1]}
                            options={selectCategories}
                            isClearable
                            onChange={(selectedOption) => field.onChange(selectedOption)}
                            classNames={{
                                control: () => "ring-1 ring-gray-300"
                            }}
                            styles={{
                                control: (styles) => ({...styles, backgroundColor: "rgb(249, 250, 251)", border: "none", boxShadow: "0 0 0 0px #fff, 0 0 0 calc(1px + 0px) rgb(209 213 219 / 1), 0 0 #0000, 0 0 #0000"})
                            }}
                        />
                    )}
                />
                {errors.category && (
                    <small className={'text-red-700'}>{errors.category.message}</small>
                )}
            </div>

            <div>
                <label htmlFor="name" className={'block mb-1 font-medium'}>Name *</label>
                <TextField
                    id='name'
                    type="text"
                    placeholder={'Name'}
                    error={!!errors.name}
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
                <label htmlFor="description" className={'block mb-1 font-medium'}>Description</label>
                <TextArea
                    id='description'
                    placeholder={'Description'}
                    error={!!errors.description}
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

            <div className={'grid grid-cols-1 md:grid-cols-2 gap-5'}>
                <div>
                    <label htmlFor="price" className={'block mb-1 font-medium'}>Price *</label>
                    <TextField
                        type="text"
                        id='price'
                        placeholder={'Price'}
                        {...register('price', {
                            required: {
                                value: true,
                                message: "Price is required"
                            }
                        })}
                    />
                </div>
            </div>

            <div>
                <Switcher title={'Group Items'} checked={type === "group"} onChange={(value) => {
                    setType(value ? 'group' : 'normal')
                }} />
            </div>


            {
                type === "group" && (
                    <>
                    <hr />
                    <h4 className={'text-lg font-medium'}>{'Group Items'}</h4>
                    {
                        variations.map((variation, index) => {
                            return (
                            <div key={index} className={'p-5 bg-white rounded-lg text-sm relative shadow-sm shadow-gray-400'}>
                                {
                                    index > 0 && (
                                        <Trash2 
                                            className={'w-4 absolute right-3 text-red-600 cursor-pointer'}
                                            onClick={() => delVariation(index)}
                                        />
                                    )
                                }

                                <div className={'mb-4'}>
                                    <label htmlFor="" className={'block mb-1'}>Item *</label>
                                    <TextField
                                        type="text"
                                        placeholder={'Select Item ...'}
                                        value={variation.name}
                                        onChange={(e) => {
                                            changeVariationValue(index, 'name', e.target.value)
                                        }}
                                    />
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
                    >
                        {'Add New Item'}
                    </LiteButton>
                    </>
                )
            }
            {/* <hr /> */}

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