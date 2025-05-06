import React from 'react'
import { ArrowUp } from "lucide-react"
import OrdersWidget from './_components/orders-widget'

const Dashboard = async () => {

  return (
    <div className="space-y-8">
    <div>
      <h2 className={'text-xl font-semibold mb-4'}>Analytical Statistics</h2>
      <div className={`grid grid-cols-2 md:grid-cols-4 gap-5`}>
          <div className={'p-5 bg-white shadow-lg rounded-lg'}>
              <p>Sales</p>
              <p className={`text-2xl font-medium text-violet-700 mt-1`}>{1500}</p>
              <p className={`text-xs flex items-center gap-1 mt-1 text-green-600 font-medium`}> <ArrowUp size={10} /> {3.2}%</p>
          </div>

          <div className={'p-5 bg-white shadow-lg rounded-lg'}>
              <p>Purchases</p>
              <p className={`text-2xl font-medium text-violet-700 mt-1`}>{1500}</p>
              <p className={`text-xs flex items-center gap-1 mt-1 text-green-600 font-medium`}> <ArrowUp size={10} /> {3.2}%</p>
          </div>
          
          <div className={'p-5 bg-white shadow-lg rounded-lg'}>
              <p>Customers</p>
              <p className={`text-2xl font-medium text-violet-700 mt-1`}>{250}</p>
              <p className={`text-xs flex items-center gap-1 mt-1 text-green-600 font-medium`}> <ArrowUp size={10} /> {5.7}%</p>
          </div>
          
          <div className={'p-5 bg-white shadow-lg rounded-lg'}>
              <p>Products</p>
              <p className={`text-2xl font-medium text-violet-700 mt-1`}>{324}</p>
              <p className={`text-xs flex items-center gap-1 mt-1 text-green-600 font-medium`}> <ArrowUp size={10} /> {1.8}%</p>
          </div>
      </div>
    </div>
    
    <div>
      <h2 className={'text-xl font-semibold mb-4'}>Orders Overview</h2>
      <OrdersWidget />
    </div>
  </div>
  )
}

export default Dashboard