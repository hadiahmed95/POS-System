'use client'

import React, { useEffect, useState } from 'react'
import { useNetwork } from '@/context/NetworkStatusProvider'
import { CloudOff, RefreshCw } from 'lucide-react'
import { toastCustom } from './toastCustom'

const NetworkStatusIndicator = () => {
  const { isOnline, pendingChanges, syncData } = useNetwork()
  const [mounted, setMounted] = useState(false);

  
  const handleSync = async () => {
    if (!isOnline) {
      toastCustom.error('Cannot sync while offline')
      return
    }
    
    toastCustom.info('Syncing changes with server...')
    
    try {
      await syncData()
      
      if (pendingChanges === 0) {
        toastCustom.success('All changes synced successfully')
      } else {
        toastCustom.warning(`${pendingChanges} changes still pending`)
      }
    } catch (error) {
      console.error('Error syncing with server:', error)
      toastCustom.error('Error syncing with server')
    }
  }

  // Only run on client side
  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render anything on server
  if (!mounted) return null;
  
  if (isOnline && pendingChanges === 0) {
    return null // Don't show anything if we're online and no pending changes
  }
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="flex flex-col space-y-2">
        {!isOnline && (
          <div className="flex items-center bg-amber-600 text-white px-4 py-2 rounded-md shadow-lg">
            <CloudOff className="w-5 h-5 mr-2" />
            <span>Offline Mode</span>
          </div>
        )}
        
        {pendingChanges > 0 && (
          <button
            onClick={handleSync}
            disabled={!isOnline}
            className={`flex items-center px-4 py-2 rounded-md shadow-lg ${
              isOnline 
                ? 'bg-violet-600 text-white hover:bg-violet-700' 
                : 'bg-gray-400 text-gray-100 cursor-not-allowed'
            }`}
          >
            <RefreshCw className={`w-5 h-5 mr-2 ${isOnline && 'animate-spin'}`} />
            <span>Sync Changes ({pendingChanges})</span>
          </button>
        )}
      </div>
    </div>
  )
}

export default NetworkStatusIndicator