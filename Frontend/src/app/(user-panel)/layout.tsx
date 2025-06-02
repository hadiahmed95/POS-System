import React from 'react'
import AdminSidebar from './_components/admin-sidebar'
import AdminHeader from './_components/header'
import ReduxProvider from './_lib/provider'
import { BASE_URL } from '@/config/constants'
import { getSession } from '../lib/session'
import { NetworkStatusProvider } from '@/context/NetworkStatusProvider'
import NetworkStatusIndicator from '@/components/NetworkStatusIndicator'
import { redirect } from 'next/navigation'
import NotFoundComponent from '../_components/not-found'

interface IDashboardLayout {
    children: React.ReactNode
}

const DashboardLayout = async ({
    children
}: IDashboardLayout) => {

    const userToken = await getSession('auth_token')

    const response = await fetch(`${BASE_URL}/api/logged-in-user`, {method: "POST", body: JSON.stringify({token: userToken})})
    .then(response => response.json())
    .catch(e => e)

    if(response.statusCode === 403) {
        return <NotFoundComponent />
    }

    const userData = response.status === "success" ? response.data.user  : null
    const permissions = response.data.permissions

    // const user_permissions = await fetch(`${BASE_URL}/api/user-permissions`, {method: "POST", body: JSON.stringify({token: userToken, id: userData?.id})})
    // .then(response => response.json())
    // .catch(e => e)
    // const permissionData = user_permissions.status === "success" ? user_permissions.data : null

    return (
        userData ? (
            <ReduxProvider
                preloadedState={{
                    user: { user: userData, permissions: permissions }
                }}
            >
            <NetworkStatusProvider>
                <div className={'flex bg-gray-50'}>
                    <AdminSidebar />
                    <div className='w-full h-screen overflow-y-auto'>
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