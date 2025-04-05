import React, { InputHTMLAttributes, TextareaHTMLAttributes } from 'react'

interface ITextArea extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    className?: string
    rows?: number
}


const TextArea = ({ className, rows = 4, ...rest }: ITextArea) => {
    return (
        <textarea 
            {...rest}
            className={`bg-gray-50 border outline-none px-4 py-2 w-full rounded border-gray-50 ${className}`}
            rows={rows}
        />
    )
}

export default TextArea