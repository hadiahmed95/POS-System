import React from 'react'
import AdminSidebar from './_components/admin-sidebar'
import AdminHeader from './_components/header'
import ReduxProvider from './_lib/provider'
import { cookies } from 'next/headers'
import { BASE_URL } from '@/config/constants'
import { getSession } from '../lib/session'
import { NetworkStatusProvider } from '@/context/NetworkStatusProvider'
import NetworkStatusIndicator from '@/components/NetworkStatusIndicator'

interface IDashboardLayout {
    children: React.ReactNode
}

const DashboardLayout = async ({
    children
}: IDashboardLayout) => {

    const userToken = await getSession('auth_token')

    const user = await fetch(`${BASE_URL}/api/logged-in-user`, {method: "POST", body: JSON.stringify({token: userToken})})
    .then(response => response.json())
    .catch(e => e)
    const userData = user.status === "success" ? user.data  : null

    const user_permissions = await fetch(`${BASE_URL}/api/user-permissions`, {method: "POST", body: JSON.stringify({token: userToken, id: userData?.id})})
    .then(response => response.json())
    .catch(e => e)
    const permissionData = user_permissions.status === "success" ? user_permissions.data : null

    return (
        userData ? (
            <ReduxProvider
                preloadedState={{
                    user: { user: userData, permissions: permissionData }
                }}
            >
            <NetworkStatusProvider>
                <div className={'flex bg-gray-50'}>
                    <AdminSidebar />
                    <div className='w-full'>
                        <AdminHeader />
                        <div className={'px-10 py-8'}>
                            {children}
                        </div>
                    </div>
                </div>
                <NetworkStatusIndicator />
            </NetworkStatusProvider>
            </ReduxProvider>
        )
        : (
            <></>
        )
    )
}

export default DashboardLayout