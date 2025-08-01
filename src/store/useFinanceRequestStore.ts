
import { create } from 'zustand'
import { apiFetch } from '@/config/api'
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
    createdAt: string
    updatedAt: string
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

interface FinanceRequestState {
    items: ClaimDocument[]
    financeStatuses: FinanceStatus[]
    loading: boolean
    error: string | null
    modalStates: {
        evidenceModal: boolean
    }
    selectedDocId: number | null
    financeStatusId: string | undefined
    comment: string

    // Actions
    setModalState: (modal: 'evidenceModal', state: boolean) => void
    setSelectedDocId: (id: number | null) => void
    setFinanceStatusId: (id: string | undefined) => void
    setComment: (comment: string) => void
    fetchItems: () => Promise<void>
    fetchFinanceStatuses: () => Promise<void>
    refreshAllocation: () => Promise<void>
    changeFinanceStatus: (mainStatusId: number) => Promise<void>
}

const useFinanceRequestStore = create<FinanceRequestState>((set, get) => ({
    items: [],
    financeStatuses: [],
    loading: false,
    error: null,
    modalStates: {
        evidenceModal: false
    },
    selectedDocId: null,
    financeStatusId: undefined,
    comment: '',

    setModalState: (modal, state) => set(store => ({
        modalStates: { ...store.modalStates, [modal]: state }
    })),

    setSelectedDocId: (id) => set({ selectedDocId: id }),

    setFinanceStatusId: (id) => set({ financeStatusId: id }),

    setComment: (comment) => set({ comment }),

    fetchItems: async () => {
        set({ loading: true, error: null })
        try {
            const data = await apiFetch<ClaimDocument[]>('/api/claim-documents/claim-payments')
            set({ items: data, loading: false })
        } catch (error) {
            set({ error: (error as Error).message, loading: false })
            showNotification({
                title: 'Error',
                message: (error as Error).message,
                color: 'red'
            })
        }
    },

    refreshAllocation: async () => {
        // set({ loading: true, error: null })
        try {
            const data = await apiFetch<ClaimDocument[]>('/api/claim-documents/refresh-statuses')
            // set({ items: data, loading: false })
        } catch (error) {
            set({ error: (error as Error).message, loading: false })
            showNotification({
                title: 'Error',
                message: (error as Error).message,
                color: 'red'
            })
        }
    },

    fetchFinanceStatuses: async () => {
        try {
            const data = await apiFetch<FinanceStatus[]>('/api/claim-documents/finance-status')
            set({ financeStatuses: data })
        } catch (error) {
            showNotification({
                title: 'Error',
                message: (error as Error).message,
                color: 'red'
            })
        }
    },

    changeFinanceStatus: async (mainStatusId: number) => {
        const { selectedDocId, financeStatusId, comment, financeStatuses } = get()

        if (!selectedDocId || !financeStatusId) {
            showNotification({
                title: 'Validation',
                message: 'Finance status is required',
                color: 'yellow'
            })
            return
        }

        const selectedStatus = financeStatuses.find(
            status => status.id === Number(financeStatusId)
        )

        if (!selectedStatus) {
            showNotification({
                title: 'Error',
                message: 'Selected status not found',
                color: 'red'
            })
            return
        }

        if (selectedStatus.name === 'OTHER' && (!comment || comment.trim() === '')) {
            showNotification({
                title: 'Validation',
                message: 'Comment is required for Other status',
                color: 'yellow'
            })
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

            set(state => ({
                modalStates: { ...state.modalStates, evidenceModal: false },
                comment: '',
                financeStatusId: undefined
            }))

            showNotification({
                title: 'Success',
                message: 'Finance status updated',
                color: 'green'
            })

            await get().fetchItems()
        } catch (error) {
            showNotification({
                title: 'Error',
                message: (error as Error).message,
                color: 'red'
            })
        }
    }
}))

export default useFinanceRequestStore