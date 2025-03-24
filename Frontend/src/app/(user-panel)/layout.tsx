import React from 'react'
import AdminSidebar from './_components/admin-sidebar'
import AdminHeader from './_components/header'

interface IDashboardLayout {
    children: React.ReactNode
}

const DashboardLayout = ({
    children
}: IDashboardLayout) => {
    return (
        <div className={'flex bg-[rgba(245,243,255,0.3)]'}>
            <AdminSidebar />
            <div className='w-full'>
                <AdminHeader />
                <div className={'px-10 py-8'}>
                    {children}
                </div>
            </div>
        </div>
    )
}

export default DashboardLayout