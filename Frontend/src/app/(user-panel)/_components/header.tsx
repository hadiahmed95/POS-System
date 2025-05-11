'use client'

import React from 'react'
import { Search } from "lucide-react"
import Dropdown from './header/dropdown'

const AdminHeader = () => {
  return (
    <div className={`flex items-center min-h-[50px] border-b border-l border-gray-100 w-full bg-white sticky top-0`}>
      <div className='flex items-center w-full h-full px-4 py-1'>
        <Search size={20} color={'#aaa'} />
        <input type={'search'} className={'p-2 h-full w-full outline-none text-sm'} placeholder={'Search ...'} />

        <Dropdown />
      </div>
    </div>
  )
}

export default AdminHeader