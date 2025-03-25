'use client';

import { DarkButton } from '@/components/button'
import { TextField } from '@/components/Fields';
import { BASE_URL } from '@/config/constants';
import { routes } from '@/config/routes';
import { useRouter } from 'next/navigation';
import React from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify';

interface UserInterface {
    name: string
    email: string
    password: string
    phone: string
}

const AddUser = () => {

    let initialValues = {
        name: '',
        email: '',
        password: '',
    }
    const router = useRouter()

    const { register, handleSubmit, formState: { errors } } = useForm<UserInterface>({
        defaultValues: initialValues
    })

    const submit = async (data: UserInterface) => {
        console.log('data', data)
        const res = await fetch(`${BASE_URL}/api/users/add`, {
            method: "POST",
            body: JSON.stringify(data)
        }).then(response => response.json())
        console.log('res', res)
        if(res.status === 200)
        {
            toast.success('User added successfully.')
            router.push(routes.users)
        }
    }

    return (
        <div>
            <div className={`flex justify-between`}>
                <h2 className={'text-xl font-semibold'}>{'Add Users'}</h2>

            </div>
            <div className={'mt-5 p-5 bg-white shadow rounded'}>
                <form className={'grid grid-cols-2 gap-5'}
                    onSubmit={handleSubmit(submit)}
                >
                    <div>
                        <label htmlFor="" className={'block mb-1'}>Name</label>
                        <TextField 
                            type="text"
                            placeholder={'Name'}
                            className={errors.name ? 'border-red-500' : 'border-gray-50'}
                            { ...register('name', { required: {
                                value: true,
                                message: "Name is required"
                            } }) }
                        />
                        { errors.name && (
                            <small className={'text-red-700'}>{errors.name.message}</small>
                        ) }
                    </div>

                    <div>
                        <label htmlFor="" className={'block mb-1'}>Phone No.</label>
                        <TextField 
                            type="text"
                            placeholder={'Phone No.'}
                            className={errors.phone ? 'border-red-500' : 'border-gray-50'}
                            { ...register('phone', { required: {
                                value: true,
                                message: "Phone is required"
                            } }) }
                        />
                        {
                            errors.phone && (
                                <small className={'text-red-700'}>{errors.phone.message}</small>
                            )
                        }
                    </div>

                    <div>
                        <label htmlFor="" className={'block mb-1'}>Email</label>
                        <TextField 
                            type="email"
                            placeholder={'Email'}
                            className={errors.email ? 'border-red-500' : 'border-gray-50'}
                            { ...register('email', { required: {
                                value: true,
                                message: "Email is required"
                            } }) }
                        />
                        {
                            errors.email && (
                                <small className={'text-red-700'}>{errors.email.message}</small>
                            )
                        }
                    </div>

                    <div>
                        <label htmlFor="" className={'block mb-1'}>Password</label>
                        <TextField 
                            type="password" 
                            className={errors.password ? 'border-red-500' : 'border-gray-50'}
                            placeholder={'Password'}
                            { ...register('password', { required: {
                                value: true,
                                message: "Password is required"
                            }, minLength: { value: 8, message: "Password length will be minimum 8." } }) }
                        />
                        {
                            errors.password && (
                                <small className={'text-red-700'}>{errors.password.message}</small>
                            )
                        }
                    </div>
                    <div className={'col-span-2'}>
                        <DarkButton type={'submit'} className={'w-max px-5 py-1'}>{'Add'}</DarkButton>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default AddUser