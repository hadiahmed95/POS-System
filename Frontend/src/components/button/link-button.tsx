import Link from 'next/link'
import React, { AnchorHTMLAttributes } from 'react'

interface ILink extends AnchorHTMLAttributes<HTMLAnchorElement> {
    href: string
    className?: string
    children: React.ReactNode
}

const LinkButton = ({
    href,
    className,
    children,
    ...props
}: ILink) => {
  return (
    <Link
        href={href} 
        className={`px-3 py-2 rounded-lg bg-violet-800 text-violet-50 hover:text-violet-800 hover:border-violet-800 hover:bg-violet-100 ${className}`}
        {...props}
    >
        {children}
    </Link>
  )
}

export default LinkButton