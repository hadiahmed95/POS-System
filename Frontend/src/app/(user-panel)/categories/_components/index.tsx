'use client'

import { toastCustom } from '@/components/toastCustom';
import { BASE_URL } from '@/config/constants';
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { confirmAlert } from 'react-confirm-alert';
import { ICategory } from '../../type';
import { DarkButton } from '@/components/button';
import TableLoader from '../../_components/table-loader';
import { PenIcon, Trash2, CloudOff, RefreshCw } from 'lucide-react';
import FormWrapper from './form-wrapper';
import 'react-confirm-alert/src/react-confirm-alert.css';
import { isOnline, syncWithServer } from '@/services/offline-storage';
import { fetchAndMergeCategories, deleteCategoryLocally, getLocalCategories } from './api-calls';

const CategoryPage = () => {
  const title = 'Categories'
  const buttonTitle = 'Add Category';

  const hasFetched = useRef(false);

  const [list, setList] = useState<ICategory[]>([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState<ICategory | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isOffline, setIsOffline] = useState<boolean>(!isOnline())
  const [pendingChanges, setPendingChanges] = useState<number>(0)

  // Initialize sync listener
  useEffect(() => {
    
    // Set up handlers for online/offline events
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Check for pending operations
    const checkPendingOps = () => {
      const pendingOps = JSON.parse(localStorage.getItem('pos_offline_pending_operations') || '[]');
      const categoryOps = pendingOps.filter((op: any) => op.entityType === 'category');
      setPendingChanges(categoryOps.length);
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
              fetch(`${BASE_URL}/api/categories/delete`, {
                method: "POST",
                body: JSON.stringify({ id })
              }).then(_ => {
                toastCustom.error('Category deleted successfully.');
                setList(list.filter(li => Number(li.id) !== id));
              });
            } else {
              // If offline, use offline storage
              try {
                deleteCategoryLocally(id);
                toastCustom.error('Category deleted locally. Will sync when online.');
                setList(list.filter(li => Number(li.id) !== id));
              } catch (error) {
                console.error('Error deleting category locally:', error);
                toastCustom.error('Failed to delete category. Please try again.');
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

  const load = useCallback(async () => {
    if (hasFetched.current) return;

    hasFetched.current = true;
    setIsLoading(true);
    
    try {
      // Use the fetchAndMergeCategories function which handles both online and offline scenarios
      const categories = await fetchAndMergeCategories();
      setList(categories);
    } catch (error) {
      console.error("Error fetching data:", error);
      
      // If fetch fails, try loading from local storage
      const localCategories = getLocalCategories();
      setList(localCategories);
      
      if (localCategories.length > 0) {
        toastCustom.info('Loaded categories from local storage');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);
  
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
      const categoryOps = pendingOps.filter((op: any) => op.entityType === 'category');
      setPendingChanges(categoryOps.length);
      
      if (categoryOps.length === 0) {
        toastCustom.success('All changes synced successfully');
      } else {
        toastCustom.warning(`${categoryOps.length} changes still pending`);
      }
    } catch (error) {
      console.error('Error syncing with server:', error);
      toastCustom.error('Error syncing with server');
    }
  };

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
              <th scope="col" className="px-6 py-3">Name</th>
              <th scope="col" className="px-6 py-3">Parent</th>
              <th scope="col" className="px-6 py-3">Status</th>
              <th scope="col" className="px-6 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {
              isLoading ?
                <tr>
                  <td colSpan={5}>
                    <TableLoader />
                  </td>
                </tr>
              :
              list.length > 0 ? list.map((category, index) => (
                <tr key={index}>
                  <td className="px-6 py-4">{index + 1}</td>
                  <td className="px-6 py-4">{category.cat_name}</td>
                  <td className="px-6 py-4">{category.parent_id ?? '-'}</td>
                  <td className="px-6 py-4">
                    {typeof category.id === 'string' && category.id.startsWith('temp-') ? (
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
                        setFormData(category)
                        setShowForm(true)
                      }}
                    >
                      <PenIcon className='p-1' />
                    </DarkButton>
                    <DarkButton 
                      variant='danger'
                      className={'inline-block w-max shadow-lg !p-[5px]'}
                      onClick={() => delRecord(Number(category.id ?? 0))}
                    >
                      <Trash2 className={'w-5'} />
                    </DarkButton>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5}>
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

export default CategoryPage