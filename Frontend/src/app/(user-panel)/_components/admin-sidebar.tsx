'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ChevronRight } from "lucide-react"
import { IrouteList } from '../type'
import { routeList } from './route-list'
import { usePathname } from 'next/navigation'

const AdminSidebar = () => {

    const pathName = usePathname()

    return (
        <div className={`bg-white h-screen w-full max-w-[250px] shadow-lg`}>
            <div>
                <h2 className={'text-xl text-center h-[55px] leading-[50px] border-b border-gray-100'}>Admin Logo</h2>
                <div className='h-max overflow-auto' style={{height: 'calc(100vh - 55px)'}}>
                    <ul className={'py-8'}>
                        {
                            routeList.map((route, index) => 
                                route.type !== 'group'  ? <li key={index} className={`px-5 py-1`}>
                                    {
                                        !route.children ? (
                                            <Link href={route.url ?? '#'}
                                                className={`flex items-center gap-2 px-1 py-2 rounded-r text-sm hover:text-violet-800 hover:border-violet-800 hover:bg-violet-100 ${pathName.includes(route.slug ?? '') && `border-l-2 text-violet-800 border-violet-800 bg-violet-100`}`}
                                            >
                                                <span>{route.icon && route.icon}</span>
                                                <span>{route.title}</span>
                                            </Link>
                                        ) : (
                                            <ChildrenComponent route={route} />
                                        )
                                    }
                                </li> : <li key={index} className={`px-5 py-1`}>
                                    <p className={`px-1 py-2 rounded-r text-sm text-gray-500`}>
                                        <span>{route.title}</span>
                                    </p>
                                </li>
                            )
                        }
                    </ul>
                </div>
            </div>
        </div>
    )
}

export default AdminSidebar


const ChildrenComponent = ({
    route
} : {
    route: IrouteList
}) => {

    const pathName = usePathname()

    const [show, setShow] = useState(false)
    const [scrollHeight, setScrollHeight] = useState(0);
    const ulRef = useRef<any | null>(null)

    useEffect(() => {
        setScrollHeight(ulRef.current?.scrollHeight ?? 0)
    }, [ulRef, setScrollHeight])

    useEffect(() => {
        let active = !!route.match?.find(s => pathName.includes(s))
        setShow(active)
    }, [pathName, route, setShow])

    return <>
        <Link href={'#'}
            onClick={(e) => {
                e.preventDefault();
                setShow(!show)
            }}
            className={`flex items-center gap-2 px-1 py-2 rounded-r text-sm hover:text-violet-800 hover:border-violet-800 hover:bg-violet-100 ${show && `border-l-2 text-violet-800 border-violet-800 bg-violet-100`}`}
        >
            <span>{route.icon && route.icon}</span>
            <span>{route.title}</span>
            
            <span>
                <ChevronRight size={12} strokeWidth={2} className={`transition-all duration-150 ${show ? 'rotate-90' : 'rotate-0'}`} />
            </span>
        </Link>
        <ul ref={ulRef} className={`transition-all duration-200 overflow-hidden`} style={{height: show ? `${scrollHeight}px` : '0px'}}>
            {
                route.children && route.children.map((child, cIndex) => 
                    <li key={cIndex} className={'ml-5 py-1'}>
                        <Link href={child.url ?? '#'}
                            className={`flex items-center gap-2 px-1 py-1 rounded-r text-sm hover:text-violet-800 hover:border-violet-800 hover:bg-violet-100 border-l-2 ${child.url && pathName.includes(child.url) && `text-violet-800 border-violet-800 bg-violet-100`}`}
                        >
                            <span>{child.icon && child.icon}</span>
                            <span>{child.title}</span>
                        </Link>
                    </li>
                )
            }
        </ul>
    </>
}