
import { create } from 'zustand'
import { apiFetch, API_BASE_URl_DOC } from '@/config/api'
import { showNotification } from '@mantine/notifications'

export interface ClaimDocument {
    id: number
    brokerCedant: string
    insured: string
    contractNumber: string
    claimNumber: string
    lossDate: string
    underwritingYear: number
    sequenceNo: number
    status: ClaimDocumentStatus
}

export interface ClaimDocumentStatus {
    id: number
    name: string
    description?: string
    active: boolean
}

export interface FinanceStatus {
    id: number
    name: string
    label: string
    description?: string
    active: boolean
    requiresComment: boolean
    mainStatus?: {
        id: number
        name: string
    }
}

export interface ClaimFinanceDocStatus {
    claimDocuments: ClaimDocument
    claimDocumentFinanceStatus: FinanceStatus
}

interface ClaimPaymentState {
    processingPaymentItems: ClaimFinanceDocStatus[]
    financeStatuses: FinanceStatus[]
    loading: boolean
    error: string | null
    popFile: File | null
    modalStates: {
        popModal: boolean
        financeStatusModal: boolean
    }
    selectedDocId: number | null
    comment: string
    financeStatusId: string | undefined

    // Actions
    fetchItems: () => Promise<void>
    fetchFinanceStatuses: () => Promise<void>
    setPopFile: (file: File | null) => void
    setModalState: (modal: 'popModal' | 'financeStatusModal', state: boolean) => void
    setSelectedDocId: (id: number | null) => void
    setComment: (comment: string) => void
    setFinanceStatusId: (id: string | undefined) => void
    submitEvidence: () => Promise<void>
    changeFinanceStatus: (mainStatusId: number) => Promise<void>
    changeMainStatus: (docId: number, statusId: number) => Promise<void>
}

const useClaimPaymentStore = create<ClaimPaymentState>((set, get) => ({
    processingPaymentItems: [],
    financeStatuses: [],
    loading: false,
    error: null,
    popFile: null,
    modalStates: {
        popModal: false,
        financeStatusModal: false,
    },
    selectedDocId: null,
    comment: '',
    financeStatusId: undefined,

    setPopFile: (file) => set({ popFile: file }),

    setModalState: (modal, state) => set((store) => ({
        modalStates: { ...store.modalStates, [modal]: state }
    })),

    setSelectedDocId: (id) => set({ selectedDocId: id }),

    setComment: (comment) => set({ comment }),

    setFinanceStatusId: (id) => set({ financeStatusId: id }),

    fetchItems: async () => {
        set({ loading: true, error: null })
        try {
            const data = await apiFetch<ClaimFinanceDocStatus[]>('/api/claim-documents/claim-process-payments')
            set({ processingPaymentItems: data, loading: false })
        } catch (error) {
            set({ error: (error as Error).message, loading: false })
            showNotification({ title: 'Error', message: (error as Error).message, color: 'red' })
        }
    },

    fetchFinanceStatuses: async () => {
        set({ loading: true, error: null })
        try {
            const data = await apiFetch<FinanceStatus[]>('/api/claim-documents/finance-status')
            set({ financeStatuses: data, loading: false })
        } catch (error) {
            set({ error: (error as Error).message, loading: false })
            showNotification({ title: 'Error', message: (error as Error).message, color: 'red' })
        }
    },

    submitEvidence: async () => {
        const { selectedDocId, popFile } = get()
        if (!selectedDocId || !popFile) return

        const form = new FormData()
        form.append('files', popFile)
        const token = localStorage.getItem('jwt')

        try {
            await fetch(`${API_BASE_URl_DOC}/api/claim-documents/${selectedDocId}/upload`, {
                method: 'POST',
                body: form,
                headers: { Accept: 'application/octet-stream', Authorization: `Bearer ${token}` },
            })
            await get().changeMainStatus(selectedDocId, 4)
            set((state) => ({
                modalStates: { ...state.modalStates, popModal: false },
                popFile: null
            }))
            showNotification({ title: 'Success', message: 'Evidence uploaded successfully', color: 'green' })
        } catch (error) {
            showNotification({ title: 'Error', message: (error as Error).message, color: 'red' })
        }
    },

    changeFinanceStatus: async (mainStatusId: number) => {
        const { selectedDocId, financeStatusId, comment, financeStatuses } = get()
        if (!selectedDocId || !financeStatusId) {
            showNotification({ title: 'Validation', message: 'Finance status is required', color: 'yellow' })
            return
        }

        const selectedStatus = financeStatuses.find(status => status.id === Number(financeStatusId))
        if (!selectedStatus) {
            showNotification({ title: 'Error', message: 'Selected status not found', color: 'red' })
            return
        }

        if (selectedStatus.name === 'OTHER' && (!comment || comment.trim() === '')) {
            showNotification({ title: 'Validation', message: 'Comment is required for Other status', color: 'yellow' })
            return
        }

        try {
            await apiFetch(`/api/claim-documents/${selectedDocId}/finance-status`, {
                method: 'POST',
                body: {
                    financeStatusId: Number(financeStatusId),
                    mainStatusId,
                    comment
                },
            })

            set((state) => ({
                modalStates: { ...state.modalStates, financeStatusModal: false },
                comment: '',
                financeStatusId: undefined
            }))

            showNotification({ title: 'Success', message: 'Finance status updated', color: 'green' })
            await get().fetchItems()
        } catch (error) {
            showNotification({ title: 'Error', message: (error as Error).message, color: 'red' })
        }
    },

    changeMainStatus: async (docId: number, statusId: number) => {
        if (!statusId) {
            showNotification({ title: 'Validation', message: 'Status is required', color: 'yellow' })
            return
        }

        try {
            await apiFetch(`/api/claim-documents/${docId}/status`, {
                method: 'POST',
                body: { statusId },
            })
            showNotification({ title: 'Success', message: 'Document status updated', color: 'green' })
            await get().fetchItems()
        } catch (error) {
            showNotification({ title: 'Error', message: (error as Error).message, color: 'red' })
        }
    },


}))

export default useClaimPaymentStore
