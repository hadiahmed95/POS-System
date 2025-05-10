'use client'

import React, { useEffect, useState } from 'react'
import { ICategory, IItem } from '../../type'
import Form from './form'
import RightPopup, { RightPopupHeader } from '@/components/popup/right-popup'
import { Categories } from '@/api-calls'

interface IFormWrapper {
    title: string
    formData: IItem | null
    show: boolean
    items: IItem[]
    setShow: (val: boolean) => void
    onSubmit: () => void
}

const FormWrapper = ({ title, formData, show, items, setShow, onSubmit } : IFormWrapper) => {

    const [isClose, setClose] = useState(false)

    const [categories, setCategories] = useState<ICategory[]>([])

    useEffect(() => {
        Categories.getCategories().then(response => {
            setCategories(response.data)
        })
    }, [])

    return (
        <RightPopup show={show}>
            <RightPopupHeader title={title} onClose={() => {
                setClose(true)
                setShow(false)
            }} />
            <div className={'mt-4'}>
                <Form 
                    categories={categories} 
                    isClose={isClose} 
                    data={formData} 
                    items={items}
                    onSubmit={() => {
                    onSubmit()
                    setShow(false)
                }} />
            </div>
        </RightPopup>
    )
}

export default FormWrapper