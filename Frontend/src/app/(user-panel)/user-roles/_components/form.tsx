'use client'

import { DarkButton } from '@/components/button'
import { TextField } from '@/components/Fields'
import { toastCustom } from '@/components/toastCustom'
import { BASE_URL } from '@/config/constants'
import { routes } from '@/config/routes'
import { useRouter } from 'next/navigation'
import React, { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { IRole, IModule, IPermissions } from '../../type'

interface IRoleForm {
    role?: IRole,
    modules: IModule[],
    permissions: IPermissions[]
    clearRole?: () => void
}

interface IModuleForm {
    module_id: number
    permissions: number[]
}

const RoleForm = ({ role, modules, permissions, clearRole }: IRoleForm) => {

    let initialValues: Pick<IRole, 'role_name'> = {
        role_name: ''
    }
    const router = useRouter()
    const [submiting, setSubmiting] = useState<boolean>(false)
    const [selectedModules, setSelectedModules] = useState<IModuleForm[]>([])

    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<IRole>({
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

    const submit = async (data: IRole) => {
        setSubmiting(true)
        let _data = {...data, role_permissions: selectedModules}
        if(!role?.id && !submiting)
        {
            const res = await fetch(`${BASE_URL}/api/roles/add`, {
                method: "POST",
                body: JSON.stringify(_data)
            }).then(response => response.json())
    
            if (res.status === "success") {
                reset()
                setSelectedModules([])
                toastCustom.success('Role added successfully.')
                router.push(routes.user_roles)
            }
        }
        else if(!submiting)
        {
            const res = await fetch(`${BASE_URL}/api/roles/update`, {
                method: "POST",
                body: JSON.stringify({..._data, id: role?.id})
            }).then(response => response.json())
    
            if (res.status === "success") {
                reset()
                setSelectedModules([])
                toastCustom.info('Role updated successfully.')
                router.push(routes.user_roles)
                if(typeof clearRole !== "undefined") {
                    clearRole()
                }
            }
        }
        setSubmiting(false)
    }

    useEffect(() => {
        const load = () => {
            if(role)
            {
                setValue('id', role.id)
                setValue('role_name', role.role_name)
                console.log('role', role.permissions.map(p => p.module))

                const filtered: IModuleForm[] = Object.values(
                role.permissions.reduce((acc, { module_id, permission_id }) => {
                    if (!acc[module_id]) {
                    acc[module_id] = {
                        module_id,
                        permissions: []
                    };
                    }
                    acc[module_id].permissions.push(permission_id);
                    return acc;
                }, {})
                );
                setSelectedModules(filtered)
            }
        }
        load()
    }, [role])

    return (
        <form className={'bg-white rounded grid grid-cols-3'}
            onSubmit={handleSubmit(submit)}
        >
            <div className={'col-span-1 border-r border-gray-200'}>
                <label htmlFor="" className={'block mb-1 font-medium py-2 px-5 bg-gray-100'}>Name *</label>
                <div className='py-2 px-5 sticky top-[60px]'>
                    <TextField
                        type="text"
                        placeholder={'Name'}
                        className={`${errors.role_name ? 'border-red-500' : 'border-gray-50'}`}
                        {...register('role_name', {
                            required: {
                                value: true,
                                message: "Name is required"
                            }
                        })}
                    />
                    {errors.role_name && (
                        <small className={'text-red-700'}>{errors.role_name.message}</small>
                    )}
                    <div className={'col-span-2 mt-5 flex gap-2'}>
                        <DarkButton 
                            variant={'danger'}
                            type={'button'} 
                            className={'w-max px-5 py-1'}
                            loading={submiting}
                            disabled={submiting}
                            onClick={() => {
                                router.push(routes.user_roles)
                                if(typeof clearRole !== "undefined") {
                                    clearRole()
                                }
                            }}
                        >{ 'Cancel'}
                        </DarkButton>
                        <DarkButton 
                            type={'submit'} 
                            className={'w-max px-5 py-1'}
                            loading={submiting}
                            disabled={submiting}
                        >{ role?.id ? 'Update' : 'Add'}
                        </DarkButton>
                    </div>
                </div>

            </div>

            <div className='mb-5 col-span-2'>
                <label htmlFor="" className={'block font-medium bg-gray-100 py-2 px-5'}>Screens</label>

                {/* Modules List  */}
                <div className={'text-sm grid grid-cols-2 py-2 px-5'}>
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