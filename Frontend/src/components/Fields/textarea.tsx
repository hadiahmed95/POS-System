import React, { InputHTMLAttributes, TextareaHTMLAttributes } from 'react'

interface ITextArea extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    className?: string
    rows?: number,
    error?: boolean
}


const TextArea = ({ className, error, rows = 4, ...rest }: ITextArea) => {
    return (
        <textarea 
            {...rest}
            className={`bg-gray-50 outline-none px-4 py-2 w-full rounded ring-1 ${error ? 'ring-red-500' : 'ring-gray-300'} ${className}`}
            rows={rows}
        />
    )
}

export default TextArea