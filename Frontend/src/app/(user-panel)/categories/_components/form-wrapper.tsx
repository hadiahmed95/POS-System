'use client'

import Popup, { PopupContent, PopupHeader } from '@/components/popup'
import React, { useState } from 'react'
import { ICategory } from '../../type'
import Form from './form'

interface IFormWrapper {
    title: string
    formData: ICategory | null
    show: boolean
    setShow: (val: boolean) => void
    onSubmit: () => void
}

const FormWrapper = ({ title, formData, show, setShow, onSubmit } : IFormWrapper) => {
    const [isClose, setClose] = useState(false)

    return (
        <Popup show={show}>
            <PopupHeader title={title} onClose={() => {
                setClose(true)
                setShow(false)
            }} />
            <PopupContent>
                <Form show={show} isClose={isClose} data={formData} onSubmit={() => {
                    onSubmit()
                    setShow(false)
                }} />
            </PopupContent>
        </Popup>
    )
}

export default FormWrapper