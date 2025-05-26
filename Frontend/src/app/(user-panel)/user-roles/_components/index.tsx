'use client'

import { DarkButton, LinkButton } from '@/components/button'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { BASE_URL } from '@/config/constants';
import { IRole } from '../../type';
import { PenIcon, Trash2 } from 'lucide-react';
import { confirmAlert } from 'react-confirm-alert';
import { toastCustom } from '@/components/toastCustom';
import TableLoader from '../../_components/table-loader';
import PageTitleOver from '../../_components/page-title-over';
import EditRole from './edit-role';

interface IRolesTableList {
  modules: any
  permissions: any
}

const RolesTableList = ({modules, permissions}: IRolesTableList) => {

  const hasFetched = useRef(false);

  const [list, setList] = useState<IRole[]>([])
  const [formData, setFormData] = useState<IRole | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const delRecord = (id: number) => {
    confirmAlert({
      title: 'Confirm Delete',
      message: 'Are you sure to delete this record.',
      buttons: [
        {
          label: 'Yes',
          onClick: () => {
            fetch(`${BASE_URL}/api/roles/delete`, {
              method: "POST",
              body: JSON.stringify({ id })
            }).then(_ => {
              toastCustom.error('Table deleted successfully.')
              setList(list.filter(li => Number(li.id) !== id))
            })
          }
        },
        {
          label: 'No',
          onClick: () => { }
        }
      ]
    });
  };

  const load = useCallback(async () => {
    if (hasFetched.current) return

    hasFetched.current = true;
    setIsLoading(true)
    try {
      const res = await fetch(`${BASE_URL}/api/roles/view`, {
        method: "POST"
      }).then(async response => response.json())
      if (res?.data?.data) {
        setList(res.data.data)
      }
      setIsLoading(false)
    }
    catch (error) {
      console.error("Error fetching data:", error);
    }
    finally {
      setIsLoading(false);
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return !formData ? (
    <div>
      <PageTitleOver>
        <h2 className={'text-xl font-semibold'}>{'Roles'}</h2>
        <LinkButton href='/user-roles/add'>{'Add Role'}</LinkButton>
      </PageTitleOver>

      <div className={'relative overflow-x-auto mt-5 bg-white shadow-sm rounded-lg'}>
        <table className={'w-full text-sm text-left rtl:text-right text-gray-500'}>
            <thead className={'text-xs text-gray-700 uppercase bg-gray-100'}>
            <tr>
                <th scope="col" className="px-6 py-3">Sr #</th>
                <th scope="col" className="px-6 py-3">Name</th>
                <th scope="col" className="px-6 py-3 max-w-[400px]">Permissions</th>
                <th scope="col" className="px-6 py-3">Actions</th>
            </tr>
            </thead>
            <tbody>
                {
                  isLoading ?
                    <tr>
                      <td colSpan={5}>
                        <TableLoader />
                      </td>
                    </tr>
                  :
                    list.length > 0 ? list.map((l, index) => {
                        const perm = [...new Set(l.permissions.map(p => p.module.module_name))]
                        return <tr key={index}>
                            <td className="px-6 py-4">{index+1}</td>
                            <td className="px-6 py-4">{l.role_name}</td>
                            <td className="px-6 py-4 max-w-[500px] flex flex-wrap gap-2 rounded-lg">{
                                perm.map((permission: any, i: number) =>
                                    <span key={i} className='px-2 bg-gray-50 ring-1 ring-gray-100 text-xs text-[var(--primary-color)] rounded'>
                                    {permission}
                                    </span>
                                )
                            }</td>
                            <td className="px-6 py-4">
                                <div className='flex flex-wrap items-center'>
                                    <DarkButton 
                                        className='mr-2 inline-block w-max shadow-lg !p-[5px]'
                                        onClick={(e) => {
                                          setFormData(l)
                                        }}
                                    >
                                        <PenIcon className='p-1' />
                                    </DarkButton>
                                    <DarkButton 
                                        variant='danger'
                                        className={'inline-block w-max shadow-lg !p-[5px]'}
                                        onClick={() => delRecord(Number(l.id ?? 0))}
                                    >
                                        <Trash2 className={'w-5'} />
                                    </DarkButton>
                                </div>
                            </td>
                        </tr>
                    }) : (
                    <tr>
                      <td colSpan={5}>
                        <p className={'p-4 text-center'}>{'No Record Found!'}</p>
                      </td>
                    </tr>
                  )
                }
            </tbody>
        </table>
      </div>
    </div>
  ) : (
    <EditRole modules={modules} permissions={permissions} role={formData} clearRole={() => {
      setFormData(null)
    }} />
  )
}

export default RolesTableList