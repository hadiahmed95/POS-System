'use client';

import { DarkButton } from '@/components/button'
import React from 'react'
import { useForm } from 'react-hook-form'

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

    const { register, handleSubmit, formState: { errors } } = useForm<UserInterface>({
        defaultValues: initialValues
    })

    const submit = (data: UserInterface) => {
        console.log('data', data)
    }

    return (
        <div>
            <div className={`flex justify-between`}>
                <h2 className={'text-xl font-semibold'}>{'Add Users'}</h2>

            </div>
            <div className={'mt-5 p-5 bg-white'}>
                <form className={'grid grid-cols-2 gap-5'}
                    onSubmit={handleSubmit(submit)}
                >
                    <div>
                        <label htmlFor="" className={'block mb-1'}>Name</label>
                        <input 
                            type="text" 
                            className={`bg-gray-50 border outline-none px-4 py-2 w-full rounded ${errors.name ? 'border-red-500' : 'border-gray-50'}`}
                            placeholder={'Name'}
                            { ...register('name', { required: {
                                value: true,
                                message: "Name is required"
                            } }) }
                        />
                        {
                            errors.name && (
                                <small className={'text-red-700'}>{errors.name.message}</small>
                            )
                        }
                    </div>

                    <div>
                        <label htmlFor="" className={'block mb-1'}>Phone</label>
                        <input 
                            type="tel" 
                            className={`bg-gray-50 border outline-none px-4 py-2 w-full rounded ${errors.phone ? 'border-red-500' : 'border-gray-50'}`}
                            placeholder={'Phone'}
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
                        <input 
                            type="email" 
                            className={`bg-gray-50 border outline-none px-4 py-2 w-full rounded ${errors.email ? 'border-red-500' : 'border-gray-50'}`}
                            placeholder={'Email'}
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
                        <input 
                            type="password" 
                            className={`bg-gray-50 border outline-none px-4 py-2 w-full rounded ${errors.password ? 'border-red-500' : 'border-gray-50'}`}
                            placeholder={'Password'}
                            { ...register('password', { required: {
                                value: true,
                                message: "Password is required"
                            } }) }
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