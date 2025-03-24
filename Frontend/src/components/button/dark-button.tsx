import React, { ButtonHTMLAttributes } from 'react'

interface IButton extends ButtonHTMLAttributes<HTMLButtonElement> {
    className?: string
    children: React.ReactNode
}

const DarkButton = ({
    className,
    children,
    ...props
}: IButton) => {
  return (
    <button 
        className={`px-3 py-1 rounded bg-violet-800 text-violet-50 hover:border-violet-800 hover:bg-violet-100 hover:text-violet-800 ${className}`}
        {...props}
    >
        {children}
    </button>
  )
}

export default DarkButton