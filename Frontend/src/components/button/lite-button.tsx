import React, { ButtonHTMLAttributes } from 'react'

interface IButton extends ButtonHTMLAttributes<HTMLButtonElement> {
    className?: string
    children: React.ReactNode
}

const LiteButton = ({
    className,
    children,
    ...props
}: IButton) => {
  return (
    <button 
        className={`px-3 py-1 rounded bg-violet-50 text-violet-800 hover:border-violet-800 hover:bg-violet-100 ${className}`}
        {...props}
    >
        {children}
    </button>
  )
}

export default LiteButton