import { DarkButton } from '@/components/button'
import { TextField } from '@/components/Fields'
import { toastCustom } from '@/components/toastCustom'
import { BASE_URL } from '@/config/constants'
import { routes } from '@/config/routes'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import React from 'react'
import { Controller, useForm } from 'react-hook-form'

const ReactSelect = dynamic(() => import("react-select"), {
  ssr: false,
});

interface IUserForm {
  user?: any
}
interface UserInterface {
  branch_id: string
  name: string
  email: string
  password: string
  phone: string
}

const branches = [{
  value: 1,
  label: 'Main Branch'
}]

const UserForm = ({ user }: IUserForm) => {

  let initialValues = {
    branch_id: '',
    name: '',
    email: '',
    password: '',
  }
  const router = useRouter()

  const { register, handleSubmit, control, formState: { errors } } = useForm<UserInterface>({
    defaultValues: initialValues
  })

  const submit = async (data: UserInterface) => {
    const res = await fetch(`${BASE_URL}/api/users/add`, {
      method: "POST",
      body: JSON.stringify(data)
    }).then(response => response.json())

    if (res.status === 200) {
      toastCustom.success('User added successfully.')
      router.push(routes.users)
    }
  }

  return (
    <form className={'grid grid-cols-1 gap-3 text-sm'}
      onSubmit={handleSubmit(submit)}
    >
      <div>
        <label htmlFor="" className={'block mb-1'}>Select Branch</label>
        <Controller
          name='branch_id'
          control={control}
          render={({ field }) => (
            <ReactSelect
              {...field}
              placeholder={'Select Branch ...'}
              defaultValue={branches[1]}
              options={branches}
              onChange={(selectedOption) => field.onChange(selectedOption)}
              styles={{
                control: (styles) => ({ ...styles, backgroundColor: "rgb(249, 250, 251)", border: "none", boxShadow: "none" })
              }}
            />
          )}
        />
        {/* <TextField
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
        )} */}
      </div>

      <div>
        <label htmlFor="" className={'block mb-1'}>Name</label>
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
        <label htmlFor="" className={'block mb-1'}>Phone No.</label>
        <TextField
          type="text"
          placeholder={'Phone No.'}
          className={errors.phone ? 'border-red-500' : 'border-gray-50'}
          {...register('phone', {
            required: {
              value: true,
              message: "Phone is required"
            }
          })}
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
          {...register('email', {
            required: {
              value: true,
              message: "Email is required"
            }
          })}
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
          {...register('password', {
            required: {
              value: true,
              message: "Password is required"
            }, minLength: { value: 8, message: "Password length will be minimum 8." }
          })}
        />
        {
          errors.password && (
            <small className={'text-red-700'}>{errors.password.message}</small>
          )
        }
      </div>
      <div className={'w-full text-center'}>
        <DarkButton type={'submit'} className={'w-full px-5 py-2 justify-center'}>{'Add'}</DarkButton>
      </div>
    </form>
  )
}

export default UserForm