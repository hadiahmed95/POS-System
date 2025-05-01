import React from 'react'
import style from "./switcher.module.css"

interface ISwitcher {
    title: string
    checked: boolean
    onChange: (value: boolean) => void
}

const Switcher = ({
    title,
    checked,
    onChange
}: ISwitcher) => {
  return (
    <label htmlFor="item_type" className={'mb-1 flex items-center cursor-pointer select-none w-max'}>
        <span className={'text-sm mr-3'}>{title}</span>
        <input type="checkbox" id="item_type" className={'hidden'} checked={checked}
            onChange={(e) => {
                onChange(e.target.checked)
            }}
        />
        <span className={`block w-[50px] h-[26px] rounded-full shadow ${checked ? 'bg-white shadow-violet-400' : 'bg-gray-100 shadow-gray-400'} relative`}>
            <span className={`absolute  top-1/2 -translate-y-1/2 block w-[20px] h-[20px] rounded-full transition-all duration-200 ${checked ? `${style.active} -translate-x-full bg-violet-700` : 'left-[6px] bg-gray-700'}`}></span>
        </span>
    </label>
  )
}

export default Switcher