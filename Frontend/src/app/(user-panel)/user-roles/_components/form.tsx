'use client'

import { DarkButton } from '@/components/button'
import { TextField } from '@/components/Fields'
import { toastCustom } from '@/components/toastCustom'
import { BASE_URL } from '@/config/constants'
import { routes } from '@/config/routes'
import { useRouter } from 'next/navigation'
import React, { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { IBranch, IModule, IPermissions } from '../../type'

interface IRoleForm {
    roleId?: string | number,
    modules: IModule[],
    permissions: IPermissions[]
}

interface IModuleForm {
    module_id: number
    permissions: number[]
}

const RoleForm = ({ roleId, modules, permissions }: IRoleForm) => {

    let initialValues: Pick<IBranch, 'branch_name'> = {
        branch_name: ''
    }
    const router = useRouter()
    const [submiting, setSubmiting] = useState<boolean>(false)
    const [selectedModules, setSelectedModules] = useState<IModuleForm[]>([])

    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<IBranch>({
        defaultValues: initialValues
    })

    const permission_ids = permissions.map(p => Number(p.id))

    const setPermission = useCallback(async (e: React.ChangeEvent<HTMLInputElement>, module_id: number, permission_id: 'all' | number) => {
        
        let _selectedModules = [...selectedModules];
        let _selectedModulesIndex = await _selectedModules.findIndex(m => m.module_id === module_id);
        
        if(e.target.checked)
        {
            let _selectedPermissions = permission_id === "all" ? permission_ids : [permission_id];
            if(_selectedModulesIndex > -1) {
                let _selectedModule: IModuleForm = {..._selectedModules[_selectedModulesIndex]};
                const newPermissions = [...new Set([..._selectedModule.permissions, ..._selectedPermissions])];
                _selectedModules[_selectedModulesIndex] = { ..._selectedModule, module_id, permissions: newPermissions }
            }
            else {
                _selectedModules.push({ module_id, permissions: _selectedPermissions  })
            }
        }
        else
        {
            if(_selectedModulesIndex > -1) {
                let _selectedModule: IModuleForm = {..._selectedModules[_selectedModulesIndex]};
                let updatePermissions = permission_id === "all" ? [] : _selectedModule.permissions.filter(p => p !== permission_id)

                _selectedModules[_selectedModulesIndex] = {..._selectedModule, permissions: updatePermissions}
            }
        }
        setSelectedModules(_selectedModules)

    }, [selectedModules, permission_ids])

    const submit = async (data: IBranch) => {
        setSubmiting(true)
        console.log('data', {...data, role_permissions: selectedModules})
        if(!roleId && !submiting)
        {
            // const res = await fetch(`${BASE_URL}/api/branches/add`, {
            //     method: "POST",
            //     body: JSON.stringify(data)
            // }).then(response => response.json())
    
            // if (res.status === "success") {
            //     reset()
            //     toastCustom.success('Branch added successfully.')
            //     router.push(routes.branches)
            // }
        }
        else if(!submiting)
        {
            // const res = await fetch(`${BASE_URL}/api/branches/update`, {
            //     method: "POST",
            //     body: JSON.stringify({...data, id: roleId})
            // }).then(response => response.json())
    
            // if (res.status === "success") {
            //     reset()
            //     toastCustom.info('Branch updated successfully.')
            //     router.push(routes.branches)
            // }
        }
        setSubmiting(false)
    }

    useEffect(() => {
        const load = () => {
            if(roleId)
            {
                console.log('branch loading ...')
                fetch(`${BASE_URL}/api/branches/${roleId}`, {
                    method: "GET"
                })
                .then(async response => {
                    const res = await response.json()
                    setValue('id', res.data.id)
                    setValue('branch_name', res.data.branch_name)
                    setValue('branch_phone', res.data.branch_phone)
                    setValue('branch_address', res.data.branch_address)
                    setValue('branch_description', res.data.branch_description)
                })
            }
        }
        load()
    }, [roleId])

    return (
        <form className={'p-5 bg-white rounded'}
            onSubmit={handleSubmit(submit)}
        >
            
            <div>
                <label htmlFor="" className={'block mb-1 font-medium'}>Name *</label>
                <TextField
                    type="text"
                    placeholder={'Name'}
                    className={errors.branch_name ? 'border-red-500' : 'border-gray-50'}
                    {...register('branch_name', {
                        required: {
                            value: true,
                            message: "Name is required"
                        }
                    })}
                />
                {errors.branch_name && (
                    <small className={'text-red-700'}>{errors.branch_name.message}</small>
                )}
            </div>

            <div className='my-5'>
                <label htmlFor="" className={'block font-medium'}>Screens</label>

                {/* Modules List  */}
                <div className={'text-sm grid grid-cols-2'}>
                    {
                        modules.map((module, mIndex) =>
                            <div key={mIndex} className={'grid grid-cols-6 gap-3 border-b border-gray-200 my-5 pb-2'}>
                                <p className={'font-medium col-span-2'}> {module.module_name} </p>
                                
                                {/* Permissions List */}
                                <div className={'col-span-2'}>
                                    <label className={'flex items-center w-max cursor-pointer'}>
                                        <input type="checkbox" className={'hidden'}
                                        onChange={(e) => {
                                            setPermission(e, module?.id ?? 0, 'all')
                                        }}
                                        />
                                        <span className={`w-[20px] h-[20px] mr-2 rounded text-gray-200 flex justify-center transition-all duration-300 ${selectedModules.find(m => m.module_id === module.id && m.permissions.length === 5) !== undefined ? 'bg-[var(--primary-color)]' : 'bg-gray-200'}`}>
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-[15px] ${selectedModules.find(m => m.module_id === module.id && m.permissions.length === 5) !== undefined ? 'scale-1' : 'scale-0'}`}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                            </svg>
                                        </span>
                                        <span> {'All Access'} </span>
                                    </label>
                                
                                    { permissions.map((p, pIndex) => 
                                        <PermissionComponent 
                                            key={pIndex}
                                            module={module} 
                                            permission={p} 
                                            setPermission={setPermission}
                                            selected={selectedModules.find(m => m.module_id === module.id && m.permissions.find(_p => _p === p.id) !== undefined) !== undefined}
                                        />
                                    )}
                                </div>
                            </div>
                        )
                    }
                </div>
            </div>

            <div className={'col-span-2'}>
                <DarkButton 
                    type={'submit'} 
                    className={'w-max px-5 py-1'}
                    loading={submiting}
                    disabled={submiting}
                >{ roleId ? 'Update' : 'Add'}
                </DarkButton>
            </div>
        </form>
    )
}

export default RoleForm

interface IPermissionComponent {
    module: IModule,
    permission: IPermissions,
    setPermission: (e: React.ChangeEvent<HTMLInputElement>, module_id: number, permission_id: 'all' | number) => void
    selected?: boolean
}

const PermissionComponent = ({ module, permission, setPermission, selected }: IPermissionComponent) => {
    
    return <label className={'flex items-center w-max cursor-pointer my-2'}>
        <input 
            type="checkbox" 
            className={'hidden'}
            onChange={(e) => {
                setPermission(e, Number(module?.id), Number(permission.id))
            }}
        />
        <span className={`w-[20px] h-[20px] mr-2 rounded text-gray-200 flex justify-center transition-all duration-300 ${selected ? 'bg-[var(--primary-color)]' : 'bg-gray-200'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-[15px] ${selected ? 'scale-1' : 'scale-0'}`}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
        </span>
        <span> {permission.permission_name} </span>
    </label>
    
}