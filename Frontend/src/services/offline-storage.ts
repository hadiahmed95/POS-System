/**
 * Generic Offline Storage Service for managing local data
 * Handles storing data locally and syncing with server when connected
 */

import { toastCustom } from '@/components/toastCustom';
import { BASE_URL } from '@/config/constants';
import { 
  IItem, 
  ICategory, 
  ITable, 
  IBranch, 
  IUnit, 
  IVendor 
} from '@/app/(user-panel)/type';

// Prefix for all local storage keys to avoid conflicts
const STORAGE_PREFIX = 'pos_offline_';

// Types of operations that can be performed
export type OperationType = 'create' | 'update' | 'delete';

// Supported entity types
export type EntityType = 'item' | 'category' | 'table' | 'branch' | 'unit' | 'vendor';

// Entity type mapping to TypeScript interfaces
export interface EntityTypeMap {
  'item': IItem;
  'category': ICategory;
  'table': ITable;
  'branch': IBranch;
  'unit': IUnit;
  'vendor': IVendor;
}

// Structure for pending operations
export interface PendingOperation {
  id: string; // Unique ID for the operation
  type: OperationType;
  entityType: EntityType;
  data: any; // Data for the operation
  timestamp: number; // When the operation was performed
  endpoint: string; // API endpoint to call when online
}

/**
 * Get the local storage key for an entity type
 */
export const getStorageKey = (entityType: EntityType): string => {
  return `${STORAGE_PREFIX}${entityType}s`;
};

/**
 * Check if we're online
 */
export const isOnline = (): boolean => {
  // Check if window is defined (we're in the browser, not SSR)
  if (typeof window === 'undefined') return true;
  return navigator.onLine;
};

/**
 * Get pending operations key
 */
const PENDING_OPS_KEY = `${STORAGE_PREFIX}pending_operations`;

/**
 * Get last sync key
 */
const LAST_SYNC_KEY = `${STORAGE_PREFIX}last_sync`;

// Sync lock to prevent concurrent syncs
let isSyncing = false;
const SYNC_LOCK_KEY = `${STORAGE_PREFIX}sync_lock`;
const SYNC_LOCK_TIMEOUT = 60000; // 1 minute timeout for sync lock

/**
 * Check if sync is already in progress
 */
const checkSyncLock = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const syncLock = localStorage.getItem(SYNC_LOCK_KEY);
  if (!syncLock) return false;
  
  try {
    const { timestamp } = JSON.parse(syncLock);
    const now = Date.now();
    
    // If the lock is older than the timeout, release it
    if (now - timestamp > SYNC_LOCK_TIMEOUT) {
      releaseSyncLock();
      return false;
    }
    
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Acquire sync lock
 */
const acquireSyncLock = (): boolean => {
  if (typeof window === 'undefined') return false;
  if (isSyncing) return false;
  
  // Check if sync is already in progress
  if (checkSyncLock()) return false;
  
  // Set sync lock
  isSyncing = true;
  localStorage.setItem(SYNC_LOCK_KEY, JSON.stringify({
    timestamp: Date.now()
  }));
  
  return true;
};

/**
 * Release sync lock
 */
const releaseSyncLock = (): void => {
  if (typeof window === 'undefined') return;
  
  isSyncing = false;
  localStorage.removeItem(SYNC_LOCK_KEY);
};

/**
 * Save entities to local storage
 */
export const saveEntitiesLocally = <T extends EntityType>(
  entityType: T, 
  entities: EntityTypeMap[T][]
): void => {
  try {
    if (typeof window === 'undefined') return;
    
    localStorage.setItem(getStorageKey(entityType), JSON.stringify(entities));
    localStorage.setItem(LAST_SYNC_KEY, Date.now().toString());
  } catch (error) {
    console.error(`Error saving ${entityType}s to local storage:`, error);
  }
};

/**
 * Get entities from local storage
 */
export const getLocalEntities = <T extends EntityType>(
  entityType: T
): EntityTypeMap[T][] => {
  try {
    if (typeof window === 'undefined') return [];
    
    const entities = localStorage.getItem(getStorageKey(entityType));
    return entities ? JSON.parse(entities) : [];
  } catch (error) {
    console.error(`Error getting ${entityType}s from local storage:`, error);
    return [];
  }
};

/**
 * Add a pending operation to be synced when online
 */
export const addPendingOperation = (
  type: OperationType,
  entityType: EntityType,
  data: any,
  endpoint: string
): void => {
  try {
    if (typeof window === 'undefined') return;
    
    const pendingOps = getPendingOperations();
    
    // Create a unique ID for this operation
    const operationId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Add the new operation
    pendingOps.push({
      id: operationId,
      type,
      entityType,
      data,
      timestamp: Date.now(),
      endpoint
    });
    
    // Save back to local storage
    localStorage.setItem(PENDING_OPS_KEY, JSON.stringify(pendingOps));
  } catch (error) {
    console.error('Error adding pending operation:', error);
  }
};

/**
 * Get all pending operations
 */
export const getPendingOperations = (): PendingOperation[] => {
  try {
    if (typeof window === 'undefined') return [];
    
    const ops = localStorage.getItem(PENDING_OPS_KEY);
    return ops ? JSON.parse(ops) : [];
  } catch (error) {
    console.error('Error getting pending operations:', error);
    return [];
  }
};

/**
 * Remove a pending operation after it's been processed
 */
export const removePendingOperation = (id: string): void => {
  try {
    if (typeof window === 'undefined') return;
    
    const pendingOps = getPendingOperations();
    const updatedOps = pendingOps.filter(op => op.id !== id);
    localStorage.setItem(PENDING_OPS_KEY, JSON.stringify(updatedOps));
  } catch (error) {
    console.error('Error removing pending operation:', error);
  }
};

/**
 * Create a new entity locally and schedule for sync
 */
export const createEntityLocally = <T extends EntityType>(
  entityType: T, 
  entity: Omit<EntityTypeMap[T], 'id'>,
  endpoint: string
): EntityTypeMap[T] => {
  try {
    if (typeof window === 'undefined') {
      throw new Error('Cannot create entity locally during server-side rendering');
    }
    
    // Get existing entities
    const entities = getLocalEntities(entityType);
    
    // Create a temporary ID for the new entity
    const tempId = `temp-${Date.now()}`;
    
    // Create the new entity with temp ID
    const newEntity = {
      ...entity,
      id: tempId
    } as EntityTypeMap[T];
    
    // Add to local entities
    entities.push(newEntity);
    saveEntitiesLocally(entityType, entities);
    
    // Add pending operation for syncing later
    addPendingOperation('create', entityType, entity, endpoint);
    
    return newEntity;
  } catch (error) {
    console.error(`Error creating ${entityType} locally:`, error);
    throw error;
  }
};

/**
 * Update an entity locally and schedule for sync
 */
export const updateEntityLocally = <T extends EntityType>(
  entityType: T,
  entity: EntityTypeMap[T],
  endpoint: string
): EntityTypeMap[T] => {
  try {
    if (typeof window === 'undefined') {
      throw new Error('Cannot update entity locally during server-side rendering');
    }
    
    // Get existing entities
    const entities = getLocalEntities(entityType);
    
    // Find and update the entity
    const updatedEntities = entities.map(e => 
      e.id === entity.id ? entity : e
    );
    
    saveEntitiesLocally(entityType, updatedEntities);
    
    // Only add pending operation if it's not a temporary entity
    if (!entity.id?.toString().startsWith('temp-')) {
      addPendingOperation('update', entityType, entity, endpoint);
    }
    
    return entity;
  } catch (error) {
    console.error(`Error updating ${entityType} locally:`, error);
    throw error;
  }
};

/**
 * Delete an entity locally and schedule for sync
 */
export const deleteEntityLocally = <T extends EntityType>(
  entityType: T,
  id: string | number,
  endpoint: string
): void => {
  try {
    if (typeof window === 'undefined') {
      throw new Error('Cannot delete entity locally during server-side rendering');
    }
    
    // Get existing entities
    const entities = getLocalEntities(entityType);
    
    // Remove the entity
    const updatedEntities = entities.filter(e => e.id !== id);
    saveEntitiesLocally(entityType, updatedEntities);
    
    // Only add pending operation if it's not a temporary entity
    if (!id.toString().startsWith('temp-')) {
      addPendingOperation('delete', entityType, { id }, endpoint);
    }
  } catch (error) {
    console.error(`Error deleting ${entityType} locally:`, error);
    throw error;
  }
};

/**
 * Convert a data URL to a File object
 */
export function dataURLtoFile(dataurl: string, filename: string): File {
  // Split the data URL to get the base64 data and mime type
  const arr = dataurl.split(',');
  
  // Extract the mime type from the data URL
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
  
  // Convert base64 to binary
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  
  // Convert binary to Uint8Array
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  
  // Create File object from array buffer
  return new File([u8arr], filename, { type: mime });
}

/**
 * Fetch entities from server and merge with local changes
 */
export const fetchAndMergeEntities = async <T extends EntityType>(
  entityType: T,
  fetchEndpoint: string
): Promise<EntityTypeMap[T][]> => {
  try {
    // Only fetch if online
    if (!isOnline()) {
      return getLocalEntities(entityType);
    }
    
    const response = await fetch(`${BASE_URL}${fetchEndpoint}`, {
      method: 'POST',
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (result?.data?.data) {
      const serverEntities = result.data.data;
      const localEntities = getLocalEntities(entityType);
      
      // Get pending operations for this entity type
      const pendingOps = getPendingOperations()
        .filter(op => op.entityType === entityType)
        .sort((a, b) => a.timestamp - b.timestamp);
      
      // Apply pending operations to server entities
      const mergedEntities = [...serverEntities];
      
      // First, apply all local entities that don't exist on server (temporary IDs)
      const tempEntities = localEntities.filter(entity => 
        typeof entity.id === 'string' && entity.id.startsWith('temp-')
      );
      mergedEntities.push(...tempEntities);
      
      // Then apply updates and deletes
      for (const op of pendingOps) {
        if (op.type === 'update') {
          // Find and update the entity
          const index = mergedEntities.findIndex(entity => entity.id === op.data.id);
          if (index !== -1) {
            mergedEntities[index] = { ...mergedEntities[index], ...op.data };
          }
        } else if (op.type === 'delete') {
          // Remove the entity
          const index = mergedEntities.findIndex(entity => entity.id === op.data.id);
          if (index !== -1) {
            mergedEntities.splice(index, 1);
          }
        }
      }
      
      // Save merged entities locally
      saveEntitiesLocally(entityType, mergedEntities);
      
      return mergedEntities;
    }
    
    return getLocalEntities(entityType);
  } catch (error) {
    console.error(`Error fetching and merging ${entityType}s:`, error);
    return getLocalEntities(entityType);
  }
};

/**
 * Sync all pending operations with the server
 */
export const syncWithServer = async (): Promise<void> => {
  if (!isOnline()) {
    console.log('Offline, skipping sync');
    return;
  }

  // Check if sync is already in progress
  if (!acquireSyncLock()) {
    console.log('Sync already in progress, skipping');
    return;
  }

  try {
    const pendingOps = getPendingOperations();
    
    if (pendingOps.length === 0) {
      console.log('No pending operations to sync');
      return;
    }
    
    console.log(`Syncing ${pendingOps.length} pending operations...`);
    
    // Track which operations have been processed to avoid duplicates
    const processedOps = new Set<string>();
    
    // Process operations in the order they were created
    const sortedOps = [...pendingOps].sort((a, b) => a.timestamp - b.timestamp);
    
    // First, group operations by entity ID to determine the final state
    // This helps eliminate intermediate operations that would be overwritten
    const entityOperations = new Map<string, Map<string | number, PendingOperation>>();

    console.log('sortedOps', sortedOps);
    
    // Group operations by entity type and ID
    for (const op of sortedOps) {
      // Skip operations without an ID (should not happen in practice)
      if (!op.data.id && op.type !== 'create') continue;
      
      // Get or create the map for this entity type
      if (!entityOperations.has(op.entityType)) {
        entityOperations.set(op.entityType, new Map<string | number, PendingOperation>());
      }
      
      const entityMap = entityOperations.get(op.entityType)!;
      
      // Special handling for create operations
      if (op.type === 'create') {
        // For create operations with temp IDs, use the timestamp as the key
        const key = `temp-${op.timestamp}`;
        entityMap.set(key, op);
      } 
      // For update and delete, the last operation wins
      else if (op.data.id) {
        entityMap.set(op.data.id, op);
      }
    }
    
    // Now process the final state operations
    for (const [entityType, entityMap] of entityOperations.entries()) {
      for (const [entityId, op] of entityMap.entries()) {
        try {
          // Skip if this operation has already been processed
          const opKey = `${op.type}-${op.entityType}-${entityId}`;
          if (processedOps.has(opKey)) continue;
          
          let response;
          
          // Special handling for operations with file data
          if ((op.type === 'create' || op.type === 'update') && 
              (op.data.image || op.data.file || op.data.photo) && 
              typeof (op.data.image || op.data.file || op.data.photo) === 'string' && 
              (op.data.image || op.data.file || op.data.photo).startsWith('data:')) {
            
            // Create FormData for file upload
            const formData = new FormData();
            
            // Find which field contains the file data
            const fileField = op.data.image ? 'image' : (op.data.file ? 'file' : 'photo');
            const dataURL = op.data[fileField];
            
            // Add all entity fields except the file field
            for (const [key, value] of Object.entries(op.data)) {
              if (key !== fileField || !value?.toString().startsWith('data:')) {
                formData.append(key, (value as string).toString());
              }
            }
            
            // Convert data URL to File and append to FormData
            const file = dataURLtoFile(dataURL, `${op.entityType}-${Date.now()}.png`);
            formData.append(fileField, file);
            
            // Make API call with FormData
            response = await fetch(`${BASE_URL}${op.endpoint}`, {
              method: 'POST',
              body: formData
            });
          } else {
            // Regular JSON operation
            response = await fetch(`${BASE_URL}${op.endpoint}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(op.data),
            });
          }
          
          if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
          }
          
          const result = await response.json();
          
          if (result.status === 'success') {
            // Mark this operation as processed
            processedOps.add(opKey);
            
            // Remove all operations for this entity from the pending list
            // This ensures we don't process earlier operations that modify the same entity
            const ops = pendingOps.filter(p => 
              p.entityType === op.entityType && 
              (p.data.id === entityId || 
              (p.type === 'create' && p.timestamp === parseInt(entityId.toString().replace('temp-', ''))))
            );
            
            for (const pendingOp of ops) {
              removePendingOperation(pendingOp.id);
            }
            
            // If this was a create operation, we need to update the local entity with the real ID
            if (op.type === 'create' && result.data?.id) {
              const entities = getLocalEntities(op.entityType);
              const tempId = `temp-${op.timestamp}`;
              
              // Find the temp entity and update its ID
              const updatedEntities = entities.map(entity => {
                if (entity.id === tempId) {
                  return { ...entity, id: result.data.id };
                }
                return entity;
              });
              
              saveEntitiesLocally(op.entityType, updatedEntities);
            }
          } else {
            console.error(`Operation failed: ${result.message || 'Unknown error'}`);
          }
        } catch (error) {
          console.error(`Error syncing operation for ${op.entityType} ${entityId}:`, error);
          // We'll keep the operation in pending and try again later
        }
      }
    }
    
    // Check if we still have pending operations
    const remainingOps = getPendingOperations();
    if (remainingOps.length > 0) {
      console.log(`${remainingOps.length} operations still pending`);
    } else {
      console.log('All operations synced successfully');
      toastCustom.success('All changes synced with server');
    }
    
    // Update last sync time
    localStorage.setItem(LAST_SYNC_KEY, Date.now().toString());
  } catch (error) {
    console.error('Error in syncWithServer:', error);
  } finally {
    // Always release the sync lock when done
    releaseSyncLock();
  }
};

/**
 * Initialize the sync listener
 * This sets up event listeners for online/offline status
 */
export const initSyncListener = (): void => {
  if (typeof window === 'undefined') return;
  
  // Sync when coming back online
  window.addEventListener('online', () => {
    console.log('Back online, syncing...');
    toastCustom.info('Internet connection restored. Syncing data...');
    syncWithServer();
  });
  
  // Log when going offline
  window.addEventListener('offline', () => {
    console.log('Offline, operations will be queued');
    toastCustom.warning('Internet connection lost. Working in offline mode.');
  });
  
  // Try to sync on init if online
  if (isOnline()) {
    syncWithServer();
  }
};

// Items-specific helper functions that use the generic functions above

/**
 * Save items to local storage
 */
export const saveItemsLocally = (items: IItem[]): void => {
  saveEntitiesLocally('item', items);
};

/**
 * Get items from local storage
 */
export const getLocalItems = (): IItem[] => {
  return getLocalEntities('item');
};

/**
 * Create a new item locally and schedule for sync
 */
export const createItemLocally = (item: Omit<IItem, 'id'>): IItem => {
  return createEntityLocally('item', item, '/api/items/add');
};

/**
 * Update an item locally and schedule for sync
 */
export const updateItemLocally = (item: IItem): IItem => {
  return updateEntityLocally('item', item, '/api/items/update');
};

/**
 * Delete an item locally and schedule for sync
 */
export const deleteItemLocally = (id: string | number): void => {
  deleteEntityLocally('item', id, '/api/items/delete');
};

/**
 * Fetch items from server and merge with local changes
 */
export const fetchAndMergeItems = async (): Promise<IItem[]> => {
  return fetchAndMergeEntities('item', '/api/items/view');
};

// Categories helper functions
export const saveCategoriesLocally = (categories: ICategory[]): void => {
  saveEntitiesLocally('category', categories);
};

export const getLocalCategories = (): ICategory[] => {
  return getLocalEntities('category');
};

export const createCategoryLocally = (category: Omit<ICategory, 'id'>): ICategory => {
  return createEntityLocally('category', category, '/api/categories/add');
};

export const updateCategoryLocally = (category: ICategory): ICategory => {
  return updateEntityLocally('category', category, '/api/categories/update');
};

export const deleteCategoryLocally = (id: string | number): void => {
  deleteEntityLocally('category', id, '/api/categories/delete');
};

export const fetchAndMergeCategories = async (): Promise<ICategory[]> => {
  return fetchAndMergeEntities('category', '/api/categories/view');
};

// Tables helper functions
export const saveTablesLocally = (tables: ITable[]): void => {
  saveEntitiesLocally('table', tables);
};

export const getLocalTables = (): ITable[] => {
  return getLocalEntities('table');
};

export const createTableLocally = (table: Omit<ITable, 'id'>): ITable => {
  return createEntityLocally('table', table, '/api/tables/add');
};

export const updateTableLocally = (table: ITable): ITable => {
  return updateEntityLocally('table', table, '/api/tables/update');
};

export const deleteTableLocally = (id: string | number): void => {
  deleteEntityLocally('table', id, '/api/tables/delete');
};

export const fetchAndMergeTables = async (): Promise<ITable[]> => {
  return fetchAndMergeEntities('table', '/api/tables/view');
};

// Branches helper functions
export const saveBranchesLocally = (branches: IBranch[]): void => {
  saveEntitiesLocally('branch', branches);
};

export const getLocalBranches = (): IBranch[] => {
  return getLocalEntities('branch');
};

export const createBranchLocally = (branch: Omit<IBranch, 'id'>): IBranch => {
  return createEntityLocally('branch', branch, '/api/branches/add');
};

export const updateBranchLocally = (branch: IBranch): IBranch => {
  return updateEntityLocally('branch', branch, '/api/branches/update');
};

export const deleteBranchLocally = (id: string | number): void => {
  deleteEntityLocally('branch', id, '/api/branches/delete');
};

export const fetchAndMergeBranches = async (): Promise<IBranch[]> => {
  return fetchAndMergeEntities('branch', '/api/branches/view');
};

// Units helper functions
export const saveUnitsLocally = (units: IUnit[]): void => {
  saveEntitiesLocally('unit', units);
};

export const getLocalUnits = (): IUnit[] => {
  return getLocalEntities('unit');
};

export const createUnitLocally = (unit: Omit<IUnit, 'id'>): IUnit => {
  return createEntityLocally('unit', unit, '/api/units/add');
};

export const updateUnitLocally = (unit: IUnit): IUnit => {
  return updateEntityLocally('unit', unit, '/api/units/update');
};

export const deleteUnitLocally = (id: string | number): void => {
  deleteEntityLocally('unit', id, '/api/units/delete');
};

export const fetchAndMergeUnits = async (): Promise<IUnit[]> => {
  return fetchAndMergeEntities('unit', '/api/units/view');
};

// Vendors helper functions
export const saveVendorsLocally = (vendors: IVendor[]): void => {
  saveEntitiesLocally('vendor', vendors);
};

export const getLocalVendors = (): IVendor[] => {
  return getLocalEntities('vendor');
};

export const createVendorLocally = (vendor: Omit<IVendor, 'id'>): IVendor => {
  return createEntityLocally('vendor', vendor, '/api/vendors/add');
};

export const updateVendorLocally = (vendor: IVendor): IVendor => {
  return updateEntityLocally('vendor', vendor, '/api/vendors/update');
};

export const deleteVendorLocally = (id: string | number): void => {
  deleteEntityLocally('vendor', id, '/api/vendors/delete');
};

export const fetchAndMergeVendors = async (): Promise<IVendor[]> => {
  return fetchAndMergeEntities('vendor', '/api/vendors/view');
};