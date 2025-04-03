'use client'

import { DarkButton } from '@/components/button'
import { TextField } from '@/components/Fields'
import { toastCustom } from '@/components/toastCustom'
import { BASE_URL } from '@/config/constants'
import { routes } from '@/config/routes'
import { IloginForm } from '@/config/types'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'

const LoginForm = () => {

    const [loading, setLoading] = useState<boolean>(false)

    const initalValues: IloginForm = {
        email: '', password: ''
    }

    const router = useRouter()
    const { register, handleSubmit, formState: { errors } } = useForm<IloginForm>({
        defaultValues: initalValues
    })

    const submit = (data: IloginForm) => {
        setLoading(true)
        fetch(`${BASE_URL}/api/auth/login`, {
            method: "POST",
            body: JSON.stringify(data)
        }).then(async response => {
            const res = await response.json()
            if(res.status === "error") {
                toastCustom.error(res.message)
            }
            if(res.status === "success")
            {
                router.push(routes.dahsboard)
            }
        }).catch(e => {
            toastCustom.error(e.message);
            setLoading(false)
        })
    }

    return (
        <div className="md:p-10">
            <div className="text-center">
                <div className="logo" style={{ width: 'auto' }}>
                    {/* <img className="mx-auto" alt="Elstar logo" src="/img/logo/logo-light-streamline.png" /> */}
                </div>
            </div>
            <div className="mb-4 text-center">
                <h3 className="mb-1 text-xl font-semibold">Welcome back!</h3>
                <p>Please enter your credentials to sign in!</p>
            </div>
            <form onSubmit={handleSubmit(submit)} autoComplete="off">
                <div className="form-container vertical">
                    <div className="mb-4">
                        <label className="form-label">User Name</label>
                        <div className="mt-2">
                            <TextField
                                className={`${errors.email && 'border-red-500'}`}
                                placeholder="Email"
                                type="email"
                                {...register("email", { 
                                    required: {
                                        value: true,
                                        message: "Email is required!"
                                    }
                                })}
                            />
                            {errors.email && (
                                <p className={'text-sm text-red-500 text-left'}>{errors.email.message}</p>
                            )}
                        </div>
                    </div>
                    <div className="mb-4">
                        <label className="form-label">Password</label>
                        <div className="mt-2">
                            <TextField
                                className={`${errors.password && 'border-red-500'}`}
                                placeholder="Password"
                                type="password"
                                style={{ paddingRight: '2.25rem' }}
                                {...register("password", { 
                                    required: {
                                        value: true,
                                        message: "Password is required!"
                                    }
                                })}
                            />
                            {errors.password && (
                                <p className={'text-sm text-red-500 text-left'}>{errors.password.message}</p>
                            )}
                        </div>
                    </div>
                    <div className="flex justify-between mb-6">
                        <label className="checkbox-label mb-0">
                            <input className="" type="checkbox" name="rememberMe" />
                            <span className="ml-2">Remember Me</span>
                        </label>
                    </div>
                    <DarkButton 
                        type="submit"
                        loading={loading}
                        disabled={loading}
                        className={'w-full'}
                    >
                        {'Sign In'}
                    </DarkButton>
                </div>
            </form>
        </div>
    )
}

export default LoginForm