'use client'

import Popup, { PopupHeader } from '@/components/popup'
import React, { useState } from 'react'
import UserForm from './user-form'

interface IAddUser {
    user: any
    show: boolean
    setShow: (val: boolean) => void
}

const AddUser = ({ user, show, setShow } : IAddUser) => {

    const [] = useState()

    return (
        <Popup show={show}>
            <PopupHeader title='Add User' onClose={() => setShow(false) } />
            <div className={'mt-4'}>
                <UserForm user={user} />
            </div>
        </Popup>
    )
}

export default AddUser