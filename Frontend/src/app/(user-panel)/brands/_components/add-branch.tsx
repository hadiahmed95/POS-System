'use client'

import Popup, { PopupHeader } from '@/components/popup'
import React, { useState } from 'react'
import { IBrand } from '../../type'
import BrandForm from './brand-form'

interface IAddBrand {
    brand: IBrand | null
    show: boolean
    setShow: (val: boolean) => void
    onSubmit: () => void
}

const AddBrand = ({ brand, show, setShow, onSubmit } : IAddBrand) => {

    const [] = useState()

    return (
        <Popup show={show}>
            <PopupHeader title='Add Brand' onClose={() => setShow(false) } />
            <div className={'mt-4'}>
                <BrandForm brand={brand} onSubmit={() => {
                    onSubmit()
                    setShow(false)
                }} />
            </div>
        </Popup>
    )
}

export default AddBrand