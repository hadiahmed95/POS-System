import React, { HTMLAttributes, useEffect, useRef } from 'react'

interface IPopup extends HTMLAttributes<HTMLDivElement> {
    show: boolean
    className?: string
    children: React.ReactNode
}

const RightPopup = ({ show, className, children, ...rest }:IPopup) => {

    const popupRef = useRef<HTMLDivElement | null>(null);
    const innerPopupRef = useRef<HTMLDivElement | null>(null);

    useEffect(()=> {
        if(show)
        {
            document.body.classList.add('fix-body');
            popupRef.current?.classList.remove('hidden')
            popupRef.current?.classList.add('flex')
            setTimeout(() => {
                popupRef.current?.classList.remove('opacity-0')
                // popupRef.current?.classList.remove('translate-x-full')
            }, 100);

            setTimeout(() => {
                innerPopupRef.current?.classList.remove('translate-x-full')
            }, 200);
        }
        else
        {
            innerPopupRef.current?.classList.add('translate-x-full')
            
            setTimeout(() => {
                document.body.classList.remove('fix-body');
                popupRef.current?.classList.add('opacity-0')
                // popupRef.current?.classList.add('translate-x-full')

                setTimeout(() => {
                    popupRef.current?.classList.remove('flex')
                    popupRef.current?.classList.add('hidden')
                }, 200);
            }, 200);
        }
    },[show])
    
    return (
        <div 
            ref={popupRef} 
            className={`fixed inset-0 bg-black bg-opacity-30 z-10 pl-2 justify-right items-center hidden opacity-0 transition-all duration-200`}
            {...rest}
        >
            <div ref={innerPopupRef} className={`max-w-[100vw] md:max-w-[70vw] lg:max-w-[50vw] h-[100vh] ml-auto overflow-auto w-full bg-white rounded-l-2xl p-5 shadow shadow-gray-500 translate-x-full transition-all duration-200 ${className}`}>
                {children}
            </div>
        </div>
    )
}

export default RightPopup

interface IPopupHeader {
    title: string
    onClose: () => void
}

export const RightPopupHeader = ({ title, onClose }:IPopupHeader) => {
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