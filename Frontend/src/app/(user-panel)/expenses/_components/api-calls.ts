import { createEntityLocally, deleteEntityLocally, fetchAndMergeEntities, getLocalEntities, saveEntitiesLocally, updateEntityLocally } from "@/services/offline-storage";
import { ICategory } from "../../type";

/**
 * Fetch categories from server and merge with local changes
 */
export const fetchAndMergeCategories = async (): Promise<ICategory[]> => {
    return fetchAndMergeEntities('category', '/api/categories/view');
};

/**
 * Get categories from local storage
 */
export const getLocalCategories = (): ICategory[] => {
    return getLocalEntities('category');
};

/**
 * Create a new category locally and schedule for sync
 */
export const createCategoryLocally = (category: Omit<ICategory, 'id'>): ICategory => {
    return createEntityLocally('category', category, '/api/categories/add');
};

export const saveCategoriesLocally = (categories: ICategory[]): void => {
    saveEntitiesLocally('category', categories);
};

/**
 * Update an category locally and schedule for sync
 */
export const updateCategoryLocally = (category: ICategory): ICategory => {
  return updateEntityLocally('category', category, '/api/categories/update');
};

/**
 * Delete an category locally and schedule for sync
 */
export const deleteCategoryLocally = (id: string | number): void => {
  deleteEntityLocally('category', id, '/api/categories/delete');
};