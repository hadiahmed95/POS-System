'use client'

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { LayoutDashboard, Users, Boxes, ScanLine, UsersRound, Banknote, ClipboardList, Cog, ArrowRight, ChevronRight } from "lucide-react"
import { IrouteList } from '../type'

const AdminSidebar = () => {

    const routeList: IrouteList[] = [
        {
            active: true,
            icon: <LayoutDashboard size={20} strokeWidth={1.5} />,
            title: 'Dashboard',
            url: '/dashboard'
        },
        {
            icon: <Users size={20} strokeWidth={1.5} />,
            title: 'Users Management',
            children: [
                {
                    icon: null,
                    title: 'Users',
                    url: '/users'
                },
                {
                    icon: null,
                    title: 'Role Management',
                    url: '/user-roles'
                }
            ]
        },
        {
            icon: <Boxes size={20} strokeWidth={1.5} />,
            title: 'Items'
        },
        {
            icon: <ScanLine size={20} strokeWidth={1.5} />,
            title: 'Purchases'
        },
        {
            icon: <UsersRound size={20} strokeWidth={1.5} />,
            title: 'Customers'
        },
        {
            icon: <Banknote size={20} strokeWidth={1.5} />,
            title: 'Sell'
        },
        {
            icon: <ClipboardList size={20} strokeWidth={1.5} />,
            title: 'Reports'
        },
        {
            icon: <Cog size={20} strokeWidth={1.5} />,
            title: 'Settings'
        }
    ]

  return (
    <div className={`bg-white h-screen w-full max-w-[250px] shadow-lg`}>
        <div>
            <h2 className={'text-xl text-center leading-[50px]'}>Admin Logo</h2>
            <div>
                <ul className={'py-8'}>
                    {
                        routeList.map((route, index) => 
                            <li key={index} className={`px-5 py-1`}>
                                {
                                    !route.children ? (
                                        <Link href={route.url ?? '#'}
                                            className={`flex items-center gap-2 px-1 py-2 rounded-r text-sm hover:text-violet-800 hover:border-violet-800 hover:bg-violet-100 ${route.active && `border-l-2 text-violet-800 border-violet-800 bg-violet-100`}`}
                                        >
                                            <span>{route.icon && route.icon}</span>
                                            <span>{route.title}</span>
                                        </Link>
                                    ) : (
                                        <ChildrenComponent route={route} />
                                    )
                                }
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

    const [show,setShow] = useState(false)
    const ulRef = useRef<HTMLUListElement | null>(null)

    useEffect(() => {

        if(show && ulRef.current)
        {
            ulRef.current.classList.remove('hidden')
            setTimeout(() => {
                (ulRef.current as any).style.height = `${ulRef.current?.scrollHeight}px`
            }, 100);
        }
        else
        {
            (ulRef.current as any).style.height = `${0}px`
            setTimeout(() => {
                ulRef.current?.classList.add('hidden')
            }, 100);
        }

    }, [show])

    return <>
        <Link href={'#'}
            onClick={(e) => {
                e.preventDefault();
                setShow(!show)
            }}
            className={`flex items-center gap-2 px-1 py-2 rounded-r text-sm hover:text-violet-800 hover:border-violet-800 hover:bg-violet-100 ${route.active && `border-l-2 text-violet-800 border-violet-800 bg-violet-100`}`}
        >
            <span>{route.icon && route.icon}</span>
            <span>{route.title}</span>
            
            <span>
                <ChevronRight size={12} strokeWidth={2} className={`transition-all duration-150 ${show ? 'rotate-90' : 'rotate-0'}`} />
            </span>
        </Link>
        <ul ref={ulRef} className={'hidden transition-all duration-200 overflow-hidden'} style={{height: '0px'}}>
            {
                route.children && route.children.map((child, cIndex) => 
                    <li key={cIndex} className={'ml-5 py-1'}>
                        <Link href={child.url ?? '#'}
                            className={`flex items-center gap-2 px-1 py-1 rounded-r text-sm hover:text-violet-800 hover:border-violet-800 hover:bg-violet-100 border-l-2`}
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