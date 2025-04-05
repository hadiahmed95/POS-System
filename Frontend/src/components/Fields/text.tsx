import React, { InputHTMLAttributes, useEffect, useRef } from 'react'

interface ITextField extends InputHTMLAttributes<HTMLInputElement> {
    className?: string
}


const TextField = ({ className, ...props }: ITextField) => {

    return (
        <input
            className={`bg-gray-50 border outline-none px-4 py-2 w-full rounded border-gray-50 ${className}`}
            {...props}
        />
    )
}

export default TextField