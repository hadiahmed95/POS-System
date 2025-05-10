'use client'

import { toastCustom } from '@/components/toastCustom';
import { API_URL, BASE_URL } from '@/config/constants';
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { confirmAlert } from 'react-confirm-alert';
import { IItem } from '../../type';
import { DarkButton } from '@/components/button';
import TableLoader from '../../_components/table-loader';
import { PenIcon, Trash2, CloudOff, RefreshCw } from 'lucide-react';
import FormWrapper from './form-wrapper';
import 'react-confirm-alert/src/react-confirm-alert.css';

import {
  fetchAndMergeItems,
  deleteItemLocally,
  getLocalItems,
  initSyncListener,
  isOnline,
  syncWithServer
} from '@/services/offline-services';
import Image from 'next/image';

const ItemPage = () => {

  const title = 'Items'
  const buttonTitle = 'Add Item';

  const hasFetched = useRef(false);

  const [list, setList] = useState<IItem[]>([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState<IItem | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [pendingChanges, setPendingChanges] = useState<number>(0)

  const delRecord = (id: number) => {
    confirmAlert({
      title: 'Confirm Delete',
      message: 'Are you sure to delete this record.',
      buttons: [
        {
          label: 'Yes',
          onClick: () => {
            // If online, use standard API call
            if (isOnline()) {
              fetch(`${BASE_URL}/api/items/delete`, {
                method: "POST",
                body: JSON.stringify({ id })
              }).then(_ => {
                toastCustom.error('Item deleted successfully.');
                setList(list.filter(li => Number(li.id) !== id));
              });
            } else {
              // If offline, use offline storage
              try {
                deleteItemLocally(id);
                toastCustom.error('Item deleted locally. Will sync when online.');
                setList(list.filter(li => Number(li.id) !== id));
              } catch (error) {
                console.error('Error deleting item locally:', error);
                toastCustom.error('Failed to delete item. Please try again.');
              }
            }
          }
        },
        {
          label: 'No',
          onClick: () => { }
        }
      ]
    });
  };

  const handleSync = async () => {
    if (!isOnline()) {
      toastCustom.error('Cannot sync while offline');
      return;
    }
    
    try {
      toastCustom.info('Syncing changes with server...');
      await syncWithServer();
      
      // Reload data to ensure we have the latest
      hasFetched.current = false;
      await load();
      
      // Check for pending changes again
      const pendingOps = JSON.parse(localStorage.getItem('pos_offline_pending_operations') || '[]');
      setPendingChanges(pendingOps.length);
      
      if (pendingOps.length === 0) {
        toastCustom.success('All changes synced successfully');
      } else {
        toastCustom.warning(`${pendingOps.length} changes still pending`);
      }
    } catch (error) {
      console.error('Error syncing with server:', error);
      toastCustom.error('Error syncing with server');
    }
  };

  const load = useCallback(async () => {
    if (hasFetched.current) return;

    hasFetched.current = true;
    setIsLoading(true);
    
    try {
      // Use the fetchAndMergeItems function which handles both online and offline scenarios
      const items = await fetchAndMergeItems();
      setList(items);
    } catch (error) {
      console.error("Error fetching data:", error);
      
      // If fetch fails, try loading from local storage
      const localItems = getLocalItems();
      setList(localItems);
      
      if (localItems.length > 0) {
        toastCustom.info('Loaded items from local storage');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);


  useEffect(() => {
    load()
  }, [load])

  // Initialize sync listener
  useEffect(() => {
    // Set initial offline status once mounted
    setIsOffline(!isOnline());

    initSyncListener();
    // Set up handlers for online/offline events
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    // Check for pending operations

    const checkPendingOps = () => {
      const pendingOps = JSON.parse(localStorage.getItem('pos_offline_pending_operations') || '[]');
      setPendingChanges(pendingOps.length);
    };
    checkPendingOps();
    // Set up interval to check pending operations
    const interval = setInterval(checkPendingOps, 3000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  return (
    <div>
      <div className={`flex items-center justify-between bg-white py-4 px-6 rounded-lg shadow-sm`}>
        <h2 className={'text-xl font-semibold'}>{title}</h2>

        <div className="flex items-center space-x-2">
          {isOffline && (
            <div className="flex items-center text-amber-600 bg-amber-50 px-3 py-1 rounded-md text-sm mr-2">
              <CloudOff className="w-4 h-4 mr-1" />
              <span>Offline Mode</span>
            </div>
          )}
          
          {pendingChanges > 0 && (
            <button 
              onClick={handleSync}
              disabled={isOffline}
              className={`flex items-center text-sm mr-2 px-3 py-1 rounded-md ${
                isOffline 
                  ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
                  : 'bg-green-50 text-green-600 hover:bg-green-100'
              }`}
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              <span>Sync ({pendingChanges})</span>
            </button>
          )}
          
          <DarkButton
            onClick={(e) => {
              setFormData(null)
              setShowForm(true)
            }}
          >{buttonTitle}</DarkButton>
        </div>
      </div>

      <FormWrapper 
        title={buttonTitle}
        show={showForm} 
        setShow={setShowForm}
        formData={formData}
        items={list}
        onSubmit={() => {
          hasFetched.current = false;
          load()
        }}
      />

      <div className={'relative overflow-x-auto mt-5 bg-white shadow-sm rounded-lg'}>
        <table className={'w-full text-sm text-left rtl:text-right text-gray-500'}>
          <thead className={'text-xs text-gray-700 uppercase bg-gray-100'}>
            <tr>
              <th scope="col" className="px-6 py-3">Sr #</th>
              <th scope="col" className="px-6 py-3">Image</th>
              <th scope="col" className="px-6 py-3">Name</th>
              <th scope="col" className="px-6 py-3">Price</th>
              <th scope="col" className="px-6 py-3">Status</th>
              <th scope="col" className="px-6 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {
              isLoading ?
                <tr>
                  <td colSpan={6}>
                    <TableLoader />
                  </td>
                </tr>
              :
              list.length > 0 ? list.map((item, index) => (
                <tr key={index}>
                  <td className="px-6 py-4">{index + 1}</td>
                  <td className="px-6 py-4">
                    <div className={'relative w-[80px] h-[80px] rounded-full overflow-hidden bg-gray-100'}>
                      {
                        item.image && 
                          <Image src={`${process.env.NEXT_PUBLIC_API_URL ?? ''}/storage/${item.image}`} alt={item.name} fill={true} className={'object-cover'} />
                      }
                    </div>
                  </td>
                  <td className="px-6 py-4">{item.name ?? '-'}</td>
                  <td className="px-6 py-4">{item.price}</td>
                  <td className="px-6 py-4">
                    {typeof item.id === 'string' && item.id.startsWith('temp-') ? (
                      <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded-full text-xs">
                        Pending Sync
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                        Synced
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 flex items-center">
                    <DarkButton 
                      className='mr-2 inline-block w-max shadow-lg !p-[5px]'
                      onClick={(e) => {
                        setFormData(item)
                        setShowForm(true)
                      }}
                    >
                      <PenIcon className='p-1' />
                    </DarkButton>
                    <DarkButton 
                      variant='danger'
                      className={'inline-block w-max shadow-lg !p-[5px]'}
                      onClick={() => delRecord(Number(item.id ?? 0))}
                    >
                      <Trash2 className={'w-5'} />
                    </DarkButton>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6}>
                    <p className={'p-4 text-center'}>{'No Record Found!'}</p>
                  </td>
                </tr>
              )
            }
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ItemPage