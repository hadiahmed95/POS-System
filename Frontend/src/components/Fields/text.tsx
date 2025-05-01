import React, { InputHTMLAttributes, useEffect, useRef } from 'react'

interface ITextField extends InputHTMLAttributes<HTMLInputElement> {
    className?: string
    error?: boolean
}


const TextField = ({ className, error, ...props }: ITextField) => {

    return (
        <input
            className={`bg-gray-50 outline-none px-4 py-2 w-full rounded ring-1 ${error ? 'ring-red-500' : 'ring-gray-300'} ${className}`}
            {...props}
        />
    )
}

export default TextField