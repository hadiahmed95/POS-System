import React, { InputHTMLAttributes } from 'react'

interface ITextField extends InputHTMLAttributes<HTMLInputElement> {
    className?: string
}


const TextField = ({ className, ...rest }: ITextField) => {
    return (
        <input 
            {...rest}
            className={`bg-gray-50 border outline-none px-4 py-2 w-full rounded border-gray-50 ${className}`}
        />
    )
}

export default TextField