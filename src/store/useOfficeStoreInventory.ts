import { create } from 'zustand';
import { apiFetch } from '@/config/api';
import { showNotification } from '@mantine/notifications';

// Types
export interface InventoryItem {
    id: number;
    name: string;
    quantity: number;
}

export interface RequestLine {
    itemId?: number;
    quantity?: number;
    reason?: string;
}

export interface ItemRequest {
    id: number;
    createdBy: string;
    createdAt: string;
    lines: {
        itemName: string;
        quantity: number;
        reason?: string;
    }[];
}

interface OfficeStoreState {
    // Inventory Items
    items: InventoryItem[];
    itemsLoading: boolean;
    itemsError: string | null;

    // Requests
    requests: ItemRequest[];
    requestsLoading: boolean;
    requestsError: string | null;

    // Actions for Items
    fetchItems: () => Promise<void>;
    addItem: (name: string, quantity: number) => Promise<boolean>;
    deleteItem: (id: number) => Promise<boolean>;
    updateItemQuantity: (id: number, quantity: number) => Promise<boolean>;

    // Actions for Requests
    fetchRequests: () => Promise<void>;
    submitRequest: (lines: RequestLine[]) => Promise<boolean>;

    // Utility
    reset: () => void;
}

const useOfficeStoreInventory = create<OfficeStoreState>((set, get) => ({
    // Initial state
    items: [],
    itemsLoading: false,
    itemsError: null,

    requests: [],
    requestsLoading: false,
    requestsError: null,

    // Fetch all inventory items
    fetchItems: async () => {
        set({ itemsLoading: true, itemsError: null });
        try {
            const data = await apiFetch<InventoryItem[]>('/api/items');
            set({ items: data, itemsLoading: false });
        } catch (error: any) {
            set({ itemsError: error.message, itemsLoading: false });
            showNotification({
                title: 'Error Loading Items',
                message: error.message || 'Failed to load inventory items',
                color: 'red',
            });
        }
    },

    // Add a new inventory item
    addItem: async (name: string, quantity: number) => {
        try {
            await apiFetch('/api/items', {
                method: 'POST',
                body: { name, quantity },
            });
            showNotification({
                title: 'Success',
                message: `Item "${name}" added successfully`,
                color: 'green',
            });
            await get().fetchItems(); // Refresh the list
            return true;
        } catch (error: any) {
            showNotification({
                title: 'Error Adding Item',
                message: error.message || 'Failed to add item',
                color: 'red',
            });
            return false;
        }
    },

    // Delete an inventory item
    deleteItem: async (id: number) => {
        try {
            await apiFetch(`/api/items/${id}`, { method: 'DELETE' });
            showNotification({
                title: 'Success',
                message: 'Item deleted successfully',
                color: 'green',
            });
            await get().fetchItems(); // Refresh the list
            return true;
        } catch (error: any) {
            showNotification({
                title: 'Error Deleting Item',
                message: error.message || 'Failed to delete item',
                color: 'red',
            });
            return false;
        }
    },

    // Update item quantity
    updateItemQuantity: async (id: number, quantity: number) => {
        try {
            await apiFetch(`/api/items/${id}`, {
                method: 'PUT',
                body: { quantity },
            });
            showNotification({
                title: 'Success',
                message: 'Item quantity updated',
                color: 'green',
            });
            await get().fetchItems(); // Refresh the list
            return true;
        } catch (error: any) {
            showNotification({
                title: 'Error Updating Item',
                message: error.message || 'Failed to update item',
                color: 'red',
            });
            return false;
        }
    },

    // Fetch all requests
    fetchRequests: async () => {
        set({ requestsLoading: true, requestsError: null });
        try {
            const data = await apiFetch<ItemRequest[]>('/api/items/requests');
            set({ requests: data, requestsLoading: false });
        } catch (error: any) {
            set({ requestsError: error.message, requestsLoading: false });
            showNotification({
                title: 'Error Loading Requests',
                message: error.message || 'Failed to load requests',
                color: 'red',
            });
        }
    },

    // Submit a new request
    submitRequest: async (lines: RequestLine[]) => {
        // Validation
        for (const line of lines) {
            if (!line.itemId || !line.quantity) {
                showNotification({
                    title: 'Validation Error',
                    message: 'Each row must have an item and quantity',
                    color: 'yellow',
                });
                return false;
            }
        }

        try {
            await apiFetch('/api/items/requests', {
                method: 'POST',
                body: lines,
            });
            showNotification({
                title: 'Success',
                message: 'Request submitted successfully',
                color: 'green',
            });
            // Refresh both items and requests
            await Promise.all([get().fetchItems(), get().fetchRequests()]);
            return true;
        } catch (error: any) {
            showNotification({
                title: 'Error Submitting Request',
                message: error.message || 'Failed to submit request',
                color: 'red',
            });
            return false;
        }
    },

    // Reset store
    reset: () => {
        set({
            items: [],
            itemsLoading: false,
            itemsError: null,
            requests: [],
            requestsLoading: false,
            requestsError: null,
        });
    },
}));

export default useOfficeStoreInventory;
