'use client'

import Popup, { PopupContent, PopupHeader } from '@/components/popup'
import React from 'react'
import { IUnit } from '../../type'
import UnitForm from './unit-form'

interface IAddUnit {
    title: string
    unit: IUnit | null
    show: boolean
    setShow: (val: boolean) => void
    onSubmit: () => void
}

const AddUnit = ({ title, unit, show, setShow, onSubmit } : IAddUnit) => {

    return (
        <Popup show={show}>
            <PopupHeader title={title} onClose={() => setShow(false) } />
            <PopupContent>
                <UnitForm unit={unit} onSubmit={() => {
                    onSubmit()
                    setShow(false)
                }} />
            </PopupContent>
        </Popup>
    )
}

export default AddUnit