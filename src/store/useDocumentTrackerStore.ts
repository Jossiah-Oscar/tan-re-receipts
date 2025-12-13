import { create } from 'zustand';
import { showNotification } from '@mantine/notifications';
import { apiFetch } from '@/config/api';

export interface ChecklistFile {
    id: number;
    checklistItemId: number;
    fileName: string;
    originalFileName: string;
    contentType: string;
    fileSize: number;
    uploadedBy: string;
    uploadedAt: string;
}

export interface ChecklistItem {
    id: number;
    caseId: number;
    documentName: string;
    section: 'OPERATIONS' | 'FINANCE';
    position: number;
    isRequired: boolean;
    isCompleted: boolean;
    files: ChecklistFile[];
    uploadedAt?: string;
    uploadedBy?: string;
}

export interface Case {
    id: number;
    caseName: string;
    cedant: string;
    reinsurer: string;
    lineOfBusiness: string;
    status: 'PENDING' | 'READY';
    progress: { collected: number; total: number };
    createdBy: string;
    createdAt: string;
    updatedAt: string;
    checklist: ChecklistItem[];
    operationsApprovalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
    operationsApprovedBy?: string;
    operationsApprovedAt?: string;
    operationsApprovalComment?: string;
}

interface DocumentTrackerState {
    // Data
    cases: Case[];
    currentCase: Case | null;
    loading: boolean;

    // Actions
    fetchCases: () => Promise<void>;
    fetchCaseDetail: (caseId: number) => Promise<void>;
    createCase: (data: { caseName: string; cedant: string; reinsurer: string; lineOfBusiness: string }) => Promise<boolean>;
    updateCase: (caseId: number, data: Partial<Omit<Case, 'id' | 'status' | 'progress' | 'createdBy' | 'createdAt' | 'checklist'>>) => Promise<boolean>;
    deleteCase: (caseId: number) => Promise<boolean>;
    uploadFiles: (caseId: number, itemId: number, files: File[]) => Promise<boolean>;
    deleteFile: (caseId: number, fileId: number, itemId: number) => Promise<boolean>;
    downloadFile: (caseId: number, fileId: number) => Promise<void>;
    approveOperations: (caseId: number, comment?: string) => Promise<boolean>;
    revokeOperationsApproval: (caseId: number) => Promise<boolean>;

    // Utility
    reset: () => void;
}

// Helper to transform API response to frontend Case format
const transformApiResponse = (apiCase: any): Case => {
    return {
        id: apiCase.id,
        caseName: apiCase.caseName,
        cedant: apiCase.cedant || '',
        reinsurer: apiCase.reinsurer || '',
        lineOfBusiness: apiCase.lineOfBusiness || '',
        status: apiCase.status,
        progress: apiCase.progress,
        createdBy: apiCase.createdBy,
        createdAt: apiCase.createdAt,
        updatedAt: apiCase.updatedAt,
        operationsApprovalStatus: apiCase.operationsApprovalStatus,
        operationsApprovedBy: apiCase.operationsApprovedBy,
        operationsApprovedAt: apiCase.operationsApprovedAt,
        operationsApprovalComment: apiCase.operationsApprovalComment,
        checklist: apiCase.checklist || [],
    };
};

const useDocumentTrackerStore = create<DocumentTrackerState>((set, get) => ({
    // Initial state
    cases: [],
    currentCase: null,
    loading: false,

    // Fetch all cases from API
    fetchCases: async () => {
        set({ loading: true });
        try {
            const response = await apiFetch<any[]>('/api/document-tracker/cases', {
                requiresAuth: true,
            });
            const cases = response.map(transformApiResponse);
            set({ cases, loading: false });
        } catch (error) {
            console.error('Error fetching cases:', error);
            showNotification({
                title: 'Error',
                message: 'Failed to fetch cases',
                color: 'red',
            });
            set({ loading: false });
        }
    },

    // Fetch case detail by ID
    fetchCaseDetail: async (caseId: number) => {
        set({ loading: true });
        try {
            const response = await apiFetch<any>(`/api/document-tracker/cases/${caseId}`, {
                requiresAuth: true,
            });
            const caseData = transformApiResponse(response);
            set({ currentCase: caseData, loading: false });
        } catch (error) {
            console.error('Error fetching case detail:', error);
            showNotification({
                title: 'Error',
                message: 'Failed to fetch case detail',
                color: 'red',
            });
            set({ loading: false });
        }
    },

    // Create new case
    createCase: async (data) => {
        try {
            const response = await apiFetch<any>('/api/document-tracker/cases', {
                method: 'POST',
                body: data,
                requiresAuth: true,
            });

            const newCase = transformApiResponse(response);
            const cases = get().cases;
            set({ cases: [newCase, ...cases] });

            showNotification({
                title: 'Success',
                message: `Case "${data.caseName}" created successfully`,
                color: 'green',
            });

            return true;
        } catch (error) {
            console.error('Error creating case:', error);
            showNotification({
                title: 'Error',
                message: 'Failed to create case',
                color: 'red',
            });
            return false;
        }
    },

    // Update case metadata
    updateCase: async (caseId, data) => {
        try {
            const response = await apiFetch<any>(`/api/document-tracker/cases/${caseId}`, {
                method: 'PUT',
                body: data,
                requiresAuth: true,
            });

            const updatedCase = transformApiResponse(response);
            const cases = get().cases.map(c => c.id === caseId ? updatedCase : c);
            set({ cases });

            // Update currentCase if it's the one being edited
            const currentCase = get().currentCase;
            if (currentCase && currentCase.id === caseId) {
                set({ currentCase: updatedCase });
            }

            showNotification({
                title: 'Success',
                message: 'Case updated successfully',
                color: 'green',
            });

            return true;
        } catch (error) {
            console.error('Error updating case:', error);
            showNotification({
                title: 'Error',
                message: 'Failed to update case',
                color: 'red',
            });
            return false;
        }
    },

    // Delete case
    deleteCase: async (caseId) => {
        try {
            await apiFetch(`/api/document-tracker/cases/${caseId}`, {
                method: 'DELETE',
                requiresAuth: true,
            });

            const cases = get().cases.filter(c => c.id !== caseId);
            set({ cases });

            // Clear currentCase if it's the one being deleted
            const currentCase = get().currentCase;
            if (currentCase && currentCase.id === caseId) {
                set({ currentCase: null });
            }

            showNotification({
                title: 'Success',
                message: 'Case deleted successfully',
                color: 'green',
            });

            return true;
        } catch (error) {
            console.error('Error deleting case:', error);
            showNotification({
                title: 'Error',
                message: 'Failed to delete case',
                color: 'red',
            });
            return false;
        }
    },

    // Upload files to checklist item
    uploadFiles: async (caseId, itemId, files) => {
        try {
            // Validate PDF only
            const invalidFiles = Array.from(files).filter(file => file.type !== 'application/pdf');
            if (invalidFiles.length > 0) {
                showNotification({
                    title: 'Invalid File Type',
                    message: 'Only PDF files are allowed',
                    color: 'red',
                });
                return false;
            }

            // Create FormData for multipart upload
            const formData = new FormData();
            files.forEach(file => {
                formData.append('files', file);
            });

            const response = await apiFetch<any>(
                `/api/document-tracker/cases/${caseId}/items/${itemId}/files`,
                {
                    method: 'POST',
                    body: formData,
                    requiresAuth: true,
                }
            );

            const updatedCase = transformApiResponse(response);

            // Update cases list
            const cases = get().cases.map(c => c.id === caseId ? updatedCase : c);
            set({ cases });

            // Update currentCase if it's the one being modified
            const currentCase = get().currentCase;
            if (currentCase && currentCase.id === caseId) {
                set({ currentCase: updatedCase });
            }

            showNotification({
                title: 'Success',
                message: `${files.length} file(s) uploaded successfully`,
                color: 'green',
            });

            return true;
        } catch (error: any) {
            console.error('Error uploading files:', error);

            // Handle specific error messages from backend
            const errorMessage = error?.message || 'Failed to upload files';
            showNotification({
                title: 'Upload Error',
                message: errorMessage,
                color: 'red',
            });
            return false;
        }
    },

    // Delete file from checklist item
    deleteFile: async (caseId, fileId, itemId) => {
        try {
            const response = await apiFetch<any>(
                `/api/document-tracker/cases/${caseId}/items/${itemId}/files/${fileId}`,
                {
                    method: 'DELETE',
                    requiresAuth: true,
                }
            );

            const updatedCase = transformApiResponse(response);

            // Update cases list
            const cases = get().cases.map(c => c.id === caseId ? updatedCase : c);
            set({ cases });

            // Update currentCase if it's the one being modified
            const currentCase = get().currentCase;
            if (currentCase && currentCase.id === caseId) {
                set({ currentCase: updatedCase });
            }

            showNotification({
                title: 'Success',
                message: 'File deleted successfully',
                color: 'green',
            });

            return true;
        } catch (error: any) {
            console.error('Error deleting file:', error);

            const errorMessage = error?.message || 'Failed to delete file';
            showNotification({
                title: 'Delete Error',
                message: errorMessage,
                color: 'red',
            });
            return false;
        }
    },

    // Download file
    downloadFile: async (caseId, fileId) => {
        try {
            // Use fetch directly for blob download
            const token = localStorage.getItem('jwt');
            const apiBaseUrl = process.env.NEXT_PUBLIC_API_DOC_URL || 'http://localhost:3003';

            const response = await fetch(`${apiBaseUrl}/api/document-tracker/files/${fileId}/download`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Download failed');
            }

            // Get filename from Content-Disposition header
            const contentDisposition = response.headers.get('Content-Disposition');
            let filename = 'download.pdf';
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="(.+)"/);
                if (filenameMatch) {
                    filename = filenameMatch[1];
                }
            }

            // Download blob
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading file:', error);
            showNotification({
                title: 'Error',
                message: 'Failed to download file',
                color: 'red',
            });
        }
    },

    // Approve Operations section
    approveOperations: async (caseId, comment) => {
        try {
            const response = await apiFetch<any>(
                `/api/document-tracker/cases/${caseId}/approve-operations`,
                {
                    method: 'POST',
                    body: { comment: comment || null },
                    requiresAuth: true,
                }
            );

            const updatedCase = transformApiResponse(response);

            // Update cases list
            const cases = get().cases.map(c => c.id === caseId ? updatedCase : c);
            set({ cases });

            // Update currentCase if it's the one being modified
            const currentCase = get().currentCase;
            if (currentCase && currentCase.id === caseId) {
                set({ currentCase: updatedCase });
            }

            showNotification({
                title: 'Success',
                message: 'Operations section approved successfully',
                color: 'green',
            });

            return true;
        } catch (error: any) {
            console.error('Error approving operations:', error);

            const errorMessage = error?.message || 'Failed to approve operations';
            showNotification({
                title: 'Approval Error',
                message: errorMessage,
                color: 'red',
            });
            return false;
        }
    },

    // Revoke Operations approval
    revokeOperationsApproval: async (caseId) => {
        try {
            const response = await apiFetch<any>(
                `/api/document-tracker/cases/${caseId}/revoke-approval`,
                {
                    method: 'POST',
                    requiresAuth: true,
                }
            );

            const updatedCase = transformApiResponse(response);

            // Update cases list
            const cases = get().cases.map(c => c.id === caseId ? updatedCase : c);
            set({ cases });

            // Update currentCase if it's the one being modified
            const currentCase = get().currentCase;
            if (currentCase && currentCase.id === caseId) {
                set({ currentCase: updatedCase });
            }

            showNotification({
                title: 'Success',
                message: 'Operations approval revoked. Finance documents are now locked.',
                color: 'orange',
            });

            return true;
        } catch (error) {
            console.error('Error revoking operations approval:', error);
            showNotification({
                title: 'Error',
                message: 'Failed to revoke approval',
                color: 'red',
            });
            return false;
        }
    },

    // Reset store
    reset: () => {
        set({
            cases: [],
            currentCase: null,
            loading: false,
        });
    },
}));

export default useDocumentTrackerStore;
