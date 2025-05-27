'use client'

import Popup, { PopupContent, PopupHeader } from '@/components/popup'
import React, { useState } from 'react'
import UserForm from './user-form'
import { IUser } from '../../type'

interface IAddUser {
    user: IUser | null
    show: boolean
    setShow: (val: boolean) => void
    onSave: (data: IUser) => void
}

const AddUser = ({ user, show, setShow, onSave } : IAddUser) => {

    return (
        <Popup show={show}>
            <PopupHeader title='Add User' onClose={() => setShow(false) } />
                <PopupContent>
                    <UserForm user={user} onSave={(data) => {
                        setShow(false)
                        onSave(data)
                    }} />
                </PopupContent>
        </Popup>
    )
}

export default AddUser