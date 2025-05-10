'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { initSyncListener, syncWithServer } from '@/services/offline-storage'

// Define the context type
interface NetworkContextType {
  isOnline: boolean
  pendingChanges: number
  syncData: () => Promise<void>
}

// Create the context
const NetworkContext = createContext<NetworkContextType | undefined>(undefined)

// Provider component
export const NetworkStatusProvider = ({ children }: { children: ReactNode }) => {
  const [isOnline, setIsOnline] = useState<boolean>(true)
  const [pendingChanges, setPendingChanges] = useState<number>(0)
  
  useEffect(() => {
    // Set initial online status once mounted
    setIsOnline(typeof navigator !== 'undefined' ? navigator.onLine : true);

    // Initialize sync listener
    initSyncListener()
    
    // Set up handlers for online/offline events
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    // Check for pending operations initially and periodically
    const checkPendingOps = () => {
      const pendingOps = JSON.parse(localStorage.getItem('pos_offline_pending_operations') || '[]')
      setPendingChanges(pendingOps.length)
    }
    
    checkPendingOps()
    
    // Set up interval to check pending operations
    const interval = setInterval(checkPendingOps, 3000)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      clearInterval(interval)
    }
  }, [])
  
  // Function to sync data manually
  const syncData = async () => {
    if (!isOnline) {
      console.log('Cannot sync while offline')
      return
    }
    
    await syncWithServer()
    
    // Update pending changes count
    const pendingOps = JSON.parse(localStorage.getItem('pos_offline_pending_operations') || '[]')
    setPendingChanges(pendingOps.length)
  }
  
  // Context value
  const value: NetworkContextType = {
    isOnline,
    pendingChanges,
    syncData
  }
  
  return (
    <NetworkContext.Provider value={value}>
      {children}
    </NetworkContext.Provider>
  )
}

// Custom hook to use the network context
export const useNetwork = (): NetworkContextType => {
  const context = useContext(NetworkContext)
  
  if (context === undefined) {
    throw new Error('useNetwork must be used within a NetworkStatusProvider')
  }
  
  return context
}