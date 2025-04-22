'use client'

import Popup, { PopupContent, PopupHeader } from '@/components/popup'
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
                <PopupContent>
                    <UserForm user={user} />
                </PopupContent>
        </Popup>
    )
}

export default AddUser