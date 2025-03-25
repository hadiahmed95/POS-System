import React, { ButtonHTMLAttributes } from 'react'
import { RingCircle } from '../svg'

interface IButton extends ButtonHTMLAttributes<HTMLButtonElement> {
    className?: string
    children: React.ReactNode
    loading?: boolean
    variant?: 'primary' | 'danger'
}

const DarkButton = ({
    className,
    children,
    variant = 'primary',
    loading,
    ...props
}: IButton) => {

  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-violet-800 text-violet-50 hover:border-violet-800 hover:bg-violet-100 hover:text-violet-800'
      case 'danger':
        return 'bg-red-600 text-red-50 hover:border-red-800 hover:bg-red-100 hover:text-red-800'
    }
  }

  return (
    <button 
        className={`px-3 py-1 rounded transition-all duration-200 flex items-center disabled:bg-gray-200 disabled:text-black ${getVariantClasses()} ${className}`}
        {...props}
    >
        {children}
        {
          loading && 
          <RingCircle className={'w-5 h-5 ml-2'} />
        }
    </button>
  )
}

export default DarkButton