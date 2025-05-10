'use client'

import { DarkButton, Switcher } from '@/components/button'
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
import { CloudUpload, CloudOff } from 'lucide-react'
import { 
  isOnline, 
  createItemLocally, 
  updateItemLocally 
} from '@/services/offline-services'

const ReactSelect = dynamic(() => import("react-select"), {
    ssr: false,
});

interface IForm {
    categories: ICategory[]
    isClose: boolean
    data?: IItem | null
    items: IItem[]
    onSubmit: () => void
}

type OptionType = {
    value: string;
    label: string;
};

type ItemType = Omit<IItem, 'cat_id'> & { category: OptionType, items: OptionType[] | null }

const Form = ({ categories, isClose, data, items, onSubmit }: IForm) => {

    let initialValues: ItemType = {
        name: '',
        image: '',
        description: '',
        category: { value: '0', label: 'Select Category ...' },
        available: 1,
        price: 0,
        items: null,
        box_quantity: 1,
        item_type: 'single'
    }

    const [submiting, setSubmiting] = useState<boolean>(false)
    const [selectCategories, setSelectCategories] = useState<OptionType[]>([])
    const [image, setImage] = useState<any>()
    const [openMultiItems, setOpenMultiItems] = useState<boolean>(false)
    const [isOffline, setIsOffline] = useState<boolean>(false);
    const [itemsList, setItemsList] = useState(items.map(item => ({value: item.id, label: item.name})))

    const router = useRouter()
    const { register, handleSubmit, reset, setValue, getValues, control, formState: { errors } } = useForm<ItemType>({
        defaultValues: initialValues
    })

    const submit = async (data: ItemType) => {
        
        // Add text fields to FormData
        const formData = new FormData()
        formData.append('name', data.name)
        formData.append('cat_id', data.category.value)
        formData.append('description', data.description || '')
        formData.append('price', data.price.toString())
        formData.append('box_quantity', '1')
        formData.append('available', '1')
        formData.append('item_type', data.item_type)
        if (image && image instanceof File) {
            formData.append('image', image)
        }

        // If editing, add the ID
        if (data.id) {
            formData.append('id', data.id.toString())
        }

        for(let i = 0; Number(data?.items?.length) > i; i++) {
            formData.append('grouped_items[]', (data?.items ?? [])[i].value)
        }
        setSubmiting(true)
        
        try {
            // Check if we're online or offline
            if (isOnline()) {
                // We're online, use regular API call
                if(!submiting) {
                    // We're online, use regular API call with FormData
                    const url = data.id 
                    ? `${BASE_URL}/api/items/update` 
                    : `${BASE_URL}/api/items/add`

                    // Creating new item
                    const res = await fetch(url, {
                        method: "POST",
                        body: formData
                    }).then(response => response.json())
                    .catch(e => {
                        console.log('error while adding:', e);
                    })
            
                    if (res.status === "success") {
                        reset()
                        toastCustom.success(data.id ? 'Item updated successfully.' : 'Item added successfully.')
                        router.push(routes.items)
                        onSubmit()
                    }
                }
            } else {
                let imageDataUrl = ''
                // For offline mode, we need to handle files differently
                // Convert image to Data URL for offline storage
                if (image && image instanceof File) {
                    const reader = new FileReader()
                        reader.onload = async (e) => {
                        imageDataUrl = e.target?.result as string
                    }
                    reader.readAsDataURL(image)
                }

                // Create item object with image as data URL
                const itemData: IItem = {
                    name: data.name,
                    cat_id: Number(data.category.value),
                    description: data.description || '',
                    price: data.price,
                    box_quantity: 1,
                    image: imageDataUrl,
                    available: 1,
                    item_type: data.item_type
                }
                
                if (data.id) {
                    // Update existing item
                    updateItemLocally({...itemData, id: data.id} as IItem)
                    toastCustom.info('Item updated. Will sync when online.')
                } else {
                    // Create new item
                    createItemLocally(itemData as IItem)
                    toastCustom.success('Item added. Will sync when online.')
                }
                
                reset()
                router.push(routes.items)
            }
            onSubmit();
        } catch (error) {
            console.error('Error submitting item:', error);
            toastCustom.error('Error saving item. Please try again.');
        } finally {
            setSubmiting(false);
        }
    }

    const updateFormValues = useCallback(() => {
        console.log('data', data);
        if (data?.id) {
            setValue("id", data.id);
            setValue('name', data.name);
            setValue('description', data.description);
            setValue('price', data.price);
            setValue('item_type', data.item_type);
            // setOpenMultiItems(data.item_type !== "single")

            let edit_cat = categories.find(cat => cat.id && Number(cat.id) == Number(data.cat_id))
            setValue('category', {label: edit_cat?.cat_name ?? '', value: (edit_cat?.id as string) ?? ''});
        } else {
            reset();
        }
    }, [data, setValue, reset, categories]);

    useEffect(() => {
        updateFormValues()
    }, [updateFormValues])

    useEffect(() => {
        if(isClose)
        {
            reset()
        }
    }, [isClose, reset])

    useEffect(() => {
        if(categories.length > 0)
        {
            const _options: OptionType[] = categories.map(cat => ({
                label: cat.cat_name,
                value: (cat.id as string) ?? ''
            }))
            setSelectCategories(_options)
        }
        if(items.length > 0) {
            const _options: OptionType[] = items.map(item => ({
                label: item.name,
                value: (item.id as string) ?? ''
            }))
            setItemsList(_options)
        }
    }, [categories, items])

    // Update offline status when network state changes
    useEffect(() => {
        // Set initial offline status once mounted in browser
        setIsOffline(!isOnline());
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
            
            <div className={'border-2 border-violet-600 shadow-xl ring-2 ring-violet-100 ring-offset-violet-50 p-2 rounded-xl'}>
                <label htmlFor='image' className={'border border-gray-400 border-dashed bg-gray-50 h-[200px] rounded-xl flex flex-wrap flex-col items-center justify-center cursor-pointer select-none'}>
                    <input type="file" id="image" className={'hidden'}
                    onChange={(e) => {
                        if(e.target.files && e.target.files[0])
                        {
                            setImage(e.target.files[0])

                            // For preview purposes only
                            const fileUrl = URL.createObjectURL(e.target.files[0]);
                            // You can store this URL in a separate state if needed for preview
                            // setImagePreview(fileUrl);
                        }
                    }}
                    />
                    {image ? (
                        <div className="text-center">
                            <img 
                                src={typeof image === 'string' ? image : URL.createObjectURL(image)} 
                                alt="Preview" 
                                className="h-[150px] object-contain mx-auto"
                            />
                            <p className="text-sm text-gray-600 mt-2">Click to change</p>
                        </div>
                    ) : (
                        <>
                            <p><CloudUpload className={'text-violet-800'} size={50} strokeWidth={1.3} /></p>
                            <span className={'block text-gray-700 font-medium text-sm'}>Click to choose photo of item</span>
                        </>
                    )}
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
                <Controller
                    name='item_type'
                    control={control}
                    render={({ field }) => (
                        <Switcher title={'Group Items'} checked={field.value === "group"} onChange={(value) => {
                            field.onChange(value ? 'group' : 'single')
                        }} />
                    )}
                />
            </div>


            {
                getValues('item_type') === "group" && (
                    <>
                    <div>
                        <label htmlFor="" className={'block mb-1 font-medium'}>Items *</label>
                        <Controller
                            name='items'
                            control={control}
                            render={({ field }) => (
                                <ReactSelect
                                    {...field}
                                    placeholder={'Select Items ...'}
                                    defaultValue={itemsList[1]}
                                    options={itemsList}
                                    isClearable
                                    isMulti
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
                    {/* <LiteButton 
                        type="button" 
                        className={'w-max'}
                        onClick={() => {
                            addVariations()
                        }}
                    >
                        {'Add New Item'}
                    </LiteButton> */}
                    </>
                )
            }

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