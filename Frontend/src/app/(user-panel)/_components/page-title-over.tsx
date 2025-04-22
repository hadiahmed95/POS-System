import React from 'react'

interface IPopOver {
  children: React.ReactNode
  className?: string
}

const PageTitleOver = ({ children, className }: IPopOver) => {
  return (
    <div className={`flex items-center justify-between bg-white py-2 px-5 rounded-lg shadow-sm ${className}`}>
      {children}
    </div>
  )
}

export default PageTitleOver