import React from 'react'
import { ArrowUp } from "lucide-react"

const Dashboard = async () => {

  return (
    <div>
        <h2 className={'text-xl font-semibold'}>Analytical Statistics</h2>
        <div className={`grid grid-cols-4 gap-5 mt-4`}>
            <div className={'p-5 bg-white shadow-lg rounded-lg'}>
                <p>Sells</p>
                <p className={`text-2xl font-medium text-violet-700 mt-1`}>{1500}</p>
                <p className={`text-xs flex items-center gap-1 mt-1 text-green-600 font-medium`}> <ArrowUp size={10} /> {3.2}%</p>
            </div>

            <div className={'p-5 bg-white shadow-lg rounded-lg'}>
                <p>Purchases</p>
                <p className={`text-2xl font-medium text-violet-700 mt-1`}>{1500}</p>
                <p className={`text-xs flex items-center gap-1 mt-1 text-green-600 font-medium`}> <ArrowUp size={10} /> {3.2}%</p>
            </div>
        </div>
    </div>
  )
}

export default Dashboard