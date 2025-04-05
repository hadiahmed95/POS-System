import React, { HTMLAttributes, useEffect, useRef } from 'react'

interface IPopup extends HTMLAttributes<HTMLDivElement> {
    show: boolean
    className?: string
    children: React.ReactNode
}

const Popup = ({ show, className, children, ...rest }:IPopup) => {

    const popupRef = useRef<HTMLDivElement | null>(null);

    useEffect(()=> {
        if(show)
        {
            document.body.classList.add('fix-body');
            popupRef.current?.classList.remove('hidden')
            popupRef.current?.classList.add('flex')
            setTimeout(() => {
                popupRef.current?.classList.remove('opacity-0')
            }, 100);
        }
        else
        {
            document.body.classList.remove('fix-body');
            popupRef.current?.classList.add('opacity-0')
            setTimeout(() => {
                popupRef.current?.classList.remove('flex')
                popupRef.current?.classList.add('hidden')
            }, 200);
        }
    },[show])
    
    return (
        <div 
            ref={popupRef} 
            className={`fixed inset-0 bg-black bg-opacity-30 z-10 justify-center items-center hidden opacity-0 p-2 transition-all duration-300`}
            {...rest}
        >
            <div className={`max-w-[600px] max-h-[90vh] w-full bg-white rounded-lg p-5 shadow-xl ${className}`}>
                {children}
            </div>
        </div>
    )
}

export default Popup

interface IPopupHeader {
    title: string
    onClose: () => void
}

export const PopupHeader = ({ title, onClose }:IPopupHeader) => {
    return (
        <div className={'flex justify-between items-center'}>
            <h3 className={'text-xl font-medium'}>{title}</h3>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 hover:text-red-500 cursor-pointer"
            onClick={() => onClose()}
            >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
        </div>
    )
}