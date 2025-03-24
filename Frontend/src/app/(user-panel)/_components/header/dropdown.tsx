import { BASE_URL } from '@/config/constants'
import { routes } from '@/config/routes'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'

const Dropdown = () => {

    const dropdownRef = useRef<HTMLDivElement | null>(null)
    const buttonRef = useRef<HTMLButtonElement | null>(null)
    const [openDropDown, setOpenDropDown] = useState(false)

    const router = useRouter()

    const logout = () => {
        fetch(`${BASE_URL}/api/auth/logout`, {
            method: "POST"
        }).then(async response => {
            const res = await response.json()
            console.log('res', res)
            if(res.status === "success") {
                router.push(routes.login)
            }
        })
    }

    useEffect(() => {
        if(openDropDown)
        {
            dropdownRef.current?.classList.remove('hidden')
            setTimeout(() => {
                dropdownRef.current?.classList.remove('opacity-0')
                dropdownRef.current?.classList.remove('translate-y-2')
            }, 100);
        }
    }, [openDropDown])

    useEffect(() => {
        window.addEventListener('click', (e) => {
            if(!buttonRef.current?.contains(e.target as Node))
            {
                setOpenDropDown(false)

                dropdownRef.current?.classList.add('opacity-0')
                dropdownRef.current?.classList.add('translate-y-2')
                setTimeout(() => {
                    dropdownRef.current?.classList.add('hidden')
                }, 300);
            }
        })
    }, [])

    return (
        <div className={'relative'}>
            <button ref={buttonRef} className={'flex items-center min-w-[150px] w-max rounded overflow-hidden px-2 py-1 transition-all decoration-cyan-200 hover:bg-gray-100'}
            onClick={() => setOpenDropDown(!openDropDown)}
            >
                <span className={`relative block w-[30px] h-[30px] rounded-full overflow-hidden`}>
                    <Image src={'/images/dummy-profile.jpg'} alt={'profile image'} fill={true} className={'object-cover'} />
                </span>
                <span className='block text-left ml-1'>
                    <span className={'text-xs font-medium m-0'}>{'Carolyn Perkins'}</span>
                    <small className={'block text-[10px]'}>{'Admin'}</small>
                </span>

                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="ml-1 w-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                </svg>
            </button>

            <div ref={dropdownRef} className={'absolute right-4 bg-white min-w-[180px] rounded shadow text-sm hidden opacity-0 translate-y-2 transition-all duration-300'}>
                <ul>
                    <li>
                        <Link href={'#'} className={'block px-3 py-2'} >{'Settings'}</Link>
                    </li>
                </ul>
                <ul className={'border-t border-gray-200'}>
                    <li>
                        <Link 
                            href={'#'} 
                            className={'block px-3 py-2'} 
                            onClick={() => logout()}
                        >{'Logout'}</Link>
                    </li>
                </ul>
            </div>
        </div>
    )
}

export default Dropdown