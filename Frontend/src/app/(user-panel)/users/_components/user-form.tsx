import { DarkButton } from '@/components/button'
import { TextField } from '@/components/Fields'
import { toastCustom } from '@/components/toastCustom'
import { BASE_URL } from '@/config/constants'
import { routes } from '@/config/routes'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import React, { useCallback, useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { IBranch, IRole, IUser, OptionType } from '../../type'

const ReactSelect = dynamic(() => import("react-select"), {
  ssr: false,
});

interface IUserForm {
  user?: IUser | null,
  onSave: (data: IUser) => void
}
type IUserFormValues = Omit<IUser, 'id' | 'branch_id' | 'role_id' | 'branch' | 'role'> & { branch: OptionType, role: OptionType, password: string }

const UserForm = ({ user, onSave }: IUserForm) => {

  let initialValues: IUserFormValues = {
    branch: { value: '0', label: '' },
    role: { value: '0', label: '' },
    phone: '',
    name: '',
    email: '',
    password: '',
  }
  const [branches, setBranches] = useState<IBranch[]>([]);
  const [roles, setRoles] = useState<IRole[]>([]);

  const { register, handleSubmit, setValue, reset, control, formState: { errors } } = useForm<IUserFormValues>({
    defaultValues: initialValues
  })

  const router = useRouter()

  const submit = async (data: IUserFormValues) => {
    let _data: any = {
      name: data.name,
      phone: data.phone,
      email: data.email,
      branch_id: data.branch.value,
      role_id: data.role.value
    }

    if (!user) {
      _data.password = data.password;
      const res = await fetch(`${BASE_URL}/api/users/add`, {
        method: "POST",
        body: JSON.stringify(_data)
      }).then(response => response.json())

      if (res.status === "success") {
        toastCustom.success('User added successfully.')
        router.push(routes.users)
        reset();
        onSave(res.data)
      }
      if (res.status === "error") {
        Object.values(res.data).forEach((d: any) => {
          toastCustom.error(d[0]);
        })
      }
    } else {
      if(data.password) {
        _data.password = data.password;
      }
      const res = await fetch(`${BASE_URL}/api/users/update`, {
        method: "POST",
        body: JSON.stringify({ ..._data, id: user.id })
      }).then(response => response.json())

      if (res.status === "success") {
        toastCustom.success('User updated successfully.')
        router.push(routes.users)
        reset();
        onSave(res.data)
      }
    }
  }

  const updateFormValues = useCallback(() => {
    if (user) {

      setValue('name', user.name)
      setValue('email', user.email)
      setValue('phone', user.phone)
      setValue('password', '')

      setValue('branch', {
        value: user.branch_id.toString(),
        label: user.branch?.branch_name ?? ''
      })

      let role_values = {
        value: user.role_id.toString(),
        label: user.role?.role_name ?? ''
      }
      setValue('role', role_values)
    } else {
      reset();
    }
  }, [user, setValue, reset]);

  useEffect(() => {
    const load = async () => {
      const [_branches, _roles] = await Promise.all([
        fetch(`${BASE_URL}/api/branches/view`, {
          method: "POST",
        }).then(response => response.json()),
        fetch(`${BASE_URL}/api/roles/view`, {
          method: "POST",
        }).then(response => response.json())
      ])
      setBranches(_branches.data.data)
      if (_branches.data.data.length > 0) {
        setValue('branch', {
          value: _branches.data.data[0].id,
          label: _branches.data.data[0].branch_name
        })
      }

      setRoles(_roles.data.data)
      if (_roles.data.data.length > 0) {
        setValue('role', {
          value: _roles.data.data[0].id,
          label: _roles.data.data[0].role_name
        })
      }
    }
    load()
  }, [])

  useEffect(() => {
    updateFormValues()
  }, [updateFormValues])

  return (
    <form className={'grid grid-cols-1 gap-3 text-sm max-h-[80vh] overflow-auto p-1'}
      onSubmit={handleSubmit(submit)}
      autoComplete="off"
    >
      <div>
        <label htmlFor="" className={'block mb-1'}>Select Branch</label>
        <Controller
          name='branch'
          control={control}
          render={({ field }) => (
            <ReactSelect
              {...field}
              placeholder={'Select Branch ...'}
              defaultValue={field.value}
              options={branches.map(branch => ({ value: branch.id, label: branch.branch_name }))}
              onChange={(selectedOption) => field.onChange(selectedOption)}
              styles={{
                control: (styles) => ({ ...styles, backgroundColor: "rgb(249, 250, 251)", border: "none", boxShadow: "0 0 0 0px #fff, 0 0 0 calc(1px + 0px) rgb(209 213 219 / 1), 0 0 #0000, 0 0 #0000" })
              }}
            />
          )}
        />
      </div>

      <div>
        <label htmlFor="" className={'block mb-1'}>Select Role</label>
        <Controller
          name='role'
          control={control}
          render={({ field }) => (
            <ReactSelect
              {...field}
              placeholder={'Select Role ...'}
              defaultValue={field.value}
              options={roles.map(role => ({ value: role.id, label: role.role_name }))}
              onChange={(selectedOption) => field.onChange(selectedOption)}
              styles={{
                control: (styles) => ({ ...styles, backgroundColor: "rgb(249, 250, 251)", border: "none", boxShadow: "0 0 0 0px #fff, 0 0 0 calc(1px + 0px) rgb(209 213 219 / 1), 0 0 #0000, 0 0 #0000" })
              }}
            />
          )}
        />
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
          type="tel"
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
              value: user ? false : true,
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