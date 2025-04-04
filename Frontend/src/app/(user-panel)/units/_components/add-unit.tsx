'use client'

import Popup, { PopupHeader } from '@/components/popup'
import React from 'react'
import { IUnit } from '../../type'
import UnitForm from './unit-form'
import RightPopup, { RightPopupHeader } from '@/components/popup/right-popup'

interface IAddUnit {
    title: string
    unit: IUnit | null
    show: boolean
    setShow: (val: boolean) => void
    onSubmit: () => void
}

const AddUnit = ({ title, unit, show, setShow, onSubmit } : IAddUnit) => {

    return (
        <RightPopup show={show}>
            <RightPopupHeader title={title} onClose={() => setShow(false) } />
            <div className={'mt-4'}>
                <UnitForm unit={unit} onSubmit={() => {
                    onSubmit()
                    setShow(false)
                }} />
            </div>
        </RightPopup>
    )
}

export default AddUnit