import { create } from 'zustand';

// Type
export interface Contract {
    contractNumber: string;
    brokerName: string;
    cedantName: string;
    insuredName: string;
    typeOfBusiness: string;
    shareSigned: number;
    retroPercentage: number;
    surplusLine: string;
}

export interface ClaimDetails {
    dateOfLoss: string;
    dateReceived: string;
    originalInsured: string;
    causeOfLoss: string;
    currentReserve: string;
    salvage: string;
}

export interface RegisteredClaim {
    claimId: string;
    dateRegistered: string;
    dateOfLoss: string;
    dateReceived: string;
    originalInsured: string;
    causeOfLoss: string;
    currentReserve: number;
    salvage: number;
    netAmount: number;
    totalShareSigned: number;
    tanreTZS: number;
    retroAmount: number;
    tanreRetention: number;
    contractCount: number;
    contracts: string[];
}

// Mock Data
export const mockContracts: Contract[] = [
    {
        contractNumber: '0000014924',
        brokerName: 'ABC Brokers Ltd',
        cedantName: 'XYZ Insurance',
        insuredName: 'Major Corporation Ltd',
        typeOfBusiness: 'XL-RISK FIRST',
        shareSigned: 25.0,
        retroPercentage: 15.0,
        surplusLine: '1st Surplus'
    },
    {
        contractNumber: '0001233323',
        brokerName: 'DEF Brokers',
        cedantName: 'XYZ Insurance',
        insuredName: 'Global Industries Inc',
        typeOfBusiness: 'XL-RISK FIRST',
        shareSigned: 30.0,
        retroPercentage: 15.0,
        surplusLine: '1st Surplus'
    },
    {
        contractNumber: '0000098765',
        brokerName: 'GHI Reinsurance',
        cedantName: 'XYZ Insurance',
        insuredName: 'Tech Solutions Ltd',
        typeOfBusiness: 'XL-RISK FIRST',
        shareSigned: 15.0,
        retroPercentage: 15.0,
        surplusLine: '1st Surplus'
    },
    {
        contractNumber: '0000087654',
        brokerName: 'JKL Intermediaries',
        cedantName: 'XYZ Insurance',
        insuredName: 'Manufacturing Co Ltd',
        typeOfBusiness: 'XL-RISK FIRST',
        shareSigned: 20.0,
        retroPercentage: 15.0,
        surplusLine: '1st Surplus'
    }
];

export const mockClaims: RegisteredClaim[] = [
    {
        claimId: 'CLM-2024-001',
        dateRegistered: '2024-10-01',
        dateOfLoss: '2024-09-15',
        dateReceived: '2024-09-20',
        originalInsured: 'ABC Manufacturing Ltd',
        causeOfLoss: 'Fire damage to warehouse',
        currentReserve: 25000000,
        salvage: 2000000,
        netAmount: 23000000,
        totalShareSigned: 45.0,
        tanreTZS: 10350000,
        retroAmount: 1552500,
        tanreRetention: 8797500,
        contractCount: 2,
        contracts: ['0000014924', '0001233323']
    },
    {
        claimId: 'CLM-2024-002',
        dateRegistered: '2024-10-05',
        dateOfLoss: '2024-09-28',
        dateReceived: '2024-10-02',
        originalInsured: 'Global Industries Inc',
        causeOfLoss: 'Storm damage to building structure',
        currentReserve: 18500000,
        salvage: 0,
        netAmount: 18500000,
        totalShareSigned: 55.0,
        tanreTZS: 10175000,
        retroAmount: 1526250,
        tanreRetention: 8648750,
        contractCount: 3,
        contracts: ['0000014924', '0001233323', '0000098765']
    }
];

// Zustand Store
interface ClaimsStore {
    registeredClaims: RegisteredClaim[];
    selectedContracts: Contract[];
    claimDetails: ClaimDetails;
    searchCriteria: {
        underwritingYear: string;
        cedantCode: string;
        subProfitCentre: string;
        lobDescription: string;
        typeOfBusiness: string;
        contractNumber: string;
    };
    searchResults: Contract[];
    loading: boolean;
    editingClaimId: string | null;

    // Dropdown options
    cedantOptions: string[];
    subProfitCentreOptions: string[];
    lobOptions: string[];
    typeOfBusinessOptions: string[];

    setClaimDetails: (details: Partial<ClaimDetails>) => void;
    setSearchCriteria: (criteria: any) => void;
    toggleContractSelection: (contract: Contract) => void;
    searchContracts: () => Promise<void>;
    submitClaim: () => Promise<RegisteredClaim>;
    resetClaimForm: () => void;
    setEditingClaim: (claimId: string | null) => void;
    attachContractsToExistingClaim: (claimId: string, contracts: Contract[]) => Promise<void>;
    setSelectedContracts: (contracts: Contract[]) => void;
}

export const useClaimsStore = create<ClaimsStore>((set, get) => ({
    registeredClaims: mockClaims,
    selectedContracts: [],
    claimDetails: {
        dateOfLoss: '',
        dateReceived: '',
        originalInsured: '',
        causeOfLoss: '',
        currentReserve: '14598843.00',
        salvage: '0'
    },
    searchCriteria: {
        underwritingYear: '2020',
        cedantCode: '',
        subProfitCentre: '',
        lobDescription: '',
        typeOfBusiness: '',
        contractNumber: ''
    },
    searchResults: [],
    loading: false,
    editingClaimId: null,

    // Dropdown options with sample data
    cedantOptions: ['RTZ005', 'RTZ010', 'RTZ020', 'XYZ Insurance', 'ABC Reinsurance'],
    subProfitCentreOptions: ['EXCESS OF LOSS', 'PROPORTIONAL', 'FACULTATIVE', 'TREATY'],
    lobOptions: ['FIRE', 'MARINE', 'MOTOR', 'AVIATION', 'ENGINEERING'],
    typeOfBusinessOptions: ['XL-RISK FIRST', 'XL-RISK SECOND', 'QUOTA SHARE', 'SURPLUS'],

    setClaimDetails: (details) =>
        set((state) => ({ claimDetails: { ...state.claimDetails, ...details } })),

    setSearchCriteria: (criteria) =>
        set((state) => ({ searchCriteria: { ...state.searchCriteria, ...criteria } })),

    toggleContractSelection: (contract) =>
        set((state) => {
            const isSelected = state.selectedContracts.find(c => c.contractNumber === contract.contractNumber);
            return {
                selectedContracts: isSelected
                    ? state.selectedContracts.filter(c => c.contractNumber !== contract.contractNumber)
                    : [...state.selectedContracts, contract]
            };
        }),

    setSelectedContracts: (contracts) =>
        set({ selectedContracts: contracts }),

    setEditingClaim: (claimId) =>
        set({ editingClaimId: claimId }),

    searchContracts: async () => {
        set({ loading: true });
        await new Promise(resolve => setTimeout(resolve, 800));
        set({ searchResults: mockContracts, loading: false });
    },

    attachContractsToExistingClaim: async (claimId, contracts) => {
        set({ loading: true });

        // Recalculate totals with new contracts
        const claim = get().registeredClaims.find(c => c.claimId === claimId);
        if (!claim) return;

        const netAmount = claim.netAmount;
        const totalShareSigned = contracts.reduce((sum, c) => sum + c.shareSigned, 0);
        const retroPercentage = contracts[0]?.retroPercentage || 0;

        const tanreTZS = netAmount * (totalShareSigned / 100);
        const retroAmount = tanreTZS * (retroPercentage / 100);
        const tanreRetention = tanreTZS - retroAmount;

        await new Promise(resolve => setTimeout(resolve, 1000));

        // Update the claim with new contracts and recalculated values
        set((state) => ({
            registeredClaims: state.registeredClaims.map(c =>
                c.claimId === claimId
                    ? {
                        ...c,
                        contracts: contracts.map(con => con.contractNumber),
                        contractCount: contracts.length,
                        totalShareSigned,
                        tanreTZS,
                        retroAmount,
                        tanreRetention
                    }
                    : c
            ),
            loading: false,
            editingClaimId: null,
            selectedContracts: []
        }));
    },

    submitClaim: async () => {
        set({ loading: true });
        const state = get();
        const amount = parseFloat(state.claimDetails.currentReserve) || 0;
        const salvageAmount = parseFloat(state.claimDetails.salvage) || 0;
        const netAmount = amount - salvageAmount;
        const totalShareSigned = state.selectedContracts.reduce((sum, c) => sum + c.shareSigned, 0);
        const retroPercentage = state.selectedContracts[0]?.retroPercentage || 0;

        const tanreTZS = netAmount * (totalShareSigned / 100);
        const retroAmount = tanreTZS * (retroPercentage / 100);
        const tanreRetention = tanreTZS - retroAmount;

        const newClaim: RegisteredClaim = {
            claimId: `CLM-2024-${String(state.registeredClaims.length + 1).padStart(3, '0')}`,
            dateRegistered: new Date().toISOString().split('T')[0],
            dateOfLoss: state.claimDetails.dateOfLoss,
            dateReceived: state.claimDetails.dateReceived,
            originalInsured: state.claimDetails.originalInsured,
            causeOfLoss: state.claimDetails.causeOfLoss,
            currentReserve: amount,
            salvage: salvageAmount,
            netAmount,
            totalShareSigned,
            tanreTZS,
            retroAmount,
            tanreRetention,
            contractCount: state.selectedContracts.length,
            contracts: state.selectedContracts.map(c => c.contractNumber)
        };

        await new Promise(resolve => setTimeout(resolve, 1000));
        set((state) => ({
            registeredClaims: [newClaim, ...state.registeredClaims],
            loading: false
        }));

        return newClaim;
    },

    resetClaimForm: () => set({
        claimDetails: {
            dateOfLoss: '',
            dateReceived: '',
            originalInsured: '',
            causeOfLoss: '',
            currentReserve: '14598843.00',
            salvage: '0'
        },
        selectedContracts: [],
        searchResults: []
    })
}));
