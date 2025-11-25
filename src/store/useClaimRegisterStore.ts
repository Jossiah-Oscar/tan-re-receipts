import { create } from 'zustand';
import { API_BASE_URL, API_BASE_URl_DOC, apiFetch } from '@/config/api';

// Helper function to convert DD/MM/YYYY to YYYY-MM-DD (ISO format for backend)
const convertDateToISO = (dateStr: string): string => {
    if (!dateStr || dateStr.trim() === '') return '';

    // Check if already in ISO format (YYYY-MM-DD)
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        return dateStr;
    }

    // Convert from DD/MM/YYYY to YYYY-MM-DD
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
        const [day, month, year] = dateStr.split('/');
        return `${year}-${month}-${day}`;
    }

    // If format is unexpected, return as-is and let backend validate
    return dateStr;
};

// Helper function to convert YYYY-MM-DD to DD/MM/YYYY for display
const convertDateToDDMMYYYY = (dateStr: string): string => {
    if (!dateStr || dateStr.trim() === '') return '';

    // Check if already in DD/MM/YYYY format
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
        return dateStr;
    }

    // Convert from YYYY-MM-DD to DD/MM/YYYY
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        const [year, month, day] = dateStr.split('-');
        return `${day}/${month}/${year}`;
    }

    // If format is unexpected, return as-is
    return dateStr;
};

// Export helper functions for use in components
export { convertDateToISO, convertDateToDDMMYYYY };

// Type
export interface Contract {
    contractNumber: string;
    brokerName: string;
    cedantName: string;
    insuredName: string;
    domicileCountry?: string;
    riskRegion?: string;
    typeOfBusiness: string;
    lineOfBusiness?: string;
    subProfitCentre?: string;
    underwritingYear?: number;
    inceptionDate?: string;
    expiryDate?: string;
    premiumCurrency?: string;
    exchangeRate?: number;
    shareSigned: number;
    retroPercentage: number;
    surplusLine: string;
}

export interface ClaimDetails {
    dateOfLoss: string;
    dateReceived: string;
    originalInsured: string;
    causeOfLoss: string;
    causeOfLossCustom?: string; // For custom "Other" cause
    currentReserve: string;
    salvage: string;
    dateOfLossIsMissing?: boolean; // Flag to track if dateOfLoss needs to be filled later
    claimCurrency: string; // Currency selected for the claim
    claimExchangeRate: number; // Exchange rate for the selected currency
    statusRemarksId?: number; // Status/Remarks dropdown
    osDocumentStatusId?: number; // O/S Documents dropdown
}

// Status option types
export interface StatusOption {
    id: number;
    name: string;
    label: string;
    description?: string;
    active: boolean;
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
    totalShareSigned: number;
    tanreTZS: number;
    retroAmount: number;
    tanreRetention: number;
    contractCount: number;
    contracts: string[];
    statusRemarks?: { id: number; name: string; label: string } | null;
    osDocumentStatus?: { id: number; name: string; label: string } | null;
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
        totalShareSigned: 55.0,
        tanreTZS: 10175000,
        retroAmount: 1526250,
        tanreRetention: 8648750,
        contractCount: 3,
        contracts: ['0000014924', '0001233323', '0000098765']
    }
];

// API Response Types
interface SubProfitCentre {
    SUB_PROFIT_CENTRE_CODE: string;
    SUB_PROFIT_CENTRE: string;
}

interface LOB {
    LOB_CODE: string;
    LOB_DESCRIPTION: string;
}

interface TypeOfBusiness {
    TYPE_OF_BUSINESS_CODE: string;
    TYPE_OF_BUSINESS: string;
}

interface Client {
    BROKER_CEDANT_CODE: string;
    BROKER_CEDANT_NAME: string;
    BROKER_CEDANT_TYPE: string;
}

interface CurrencyExchangeRate {
    CURRENCY_CODE: string;
    CURRENCY_DESCRIPTION: string;
    EXCHANGE_RATE: number;
}

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

    // Dropdown options (for Select component)
    cedantOptions: { value: string; label: string }[];
    subProfitCentreOptions: { value: string; label: string }[];
    lobOptions: { value: string; label: string }[];
    typeOfBusinessOptions: { value: string; label: string }[];
    currencyOptions: { value: string; label: string; exchangeRate: number }[];
    statusRemarksOptions: StatusOption[];
    osDocumentStatusOptions: StatusOption[];

    setClaimDetails: (details: Partial<ClaimDetails>) => void;
    setSearchCriteria: (criteria: any) => void;
    toggleContractSelection: (contract: Contract) => void;
    searchContracts: () => Promise<void>;
    submitClaim: () => Promise<RegisteredClaim>;
    resetClaimForm: () => void;
    setEditingClaim: (claimId: string | null) => void;
    attachContractsToExistingClaim: (claimId: string, contracts: Contract[]) => Promise<void>;
    setSelectedContracts: (contracts: Contract[]) => void;
    loadDropdownData: () => Promise<void>;
    loadRegisteredClaims: () => Promise<void>;
    loadCurrencies: () => Promise<void>;
    loadStatusOptions: () => Promise<void>;
}

export const useClaimsStore = create<ClaimsStore>((set, get) => ({
    registeredClaims: [],
    selectedContracts: [],
    claimDetails: {
        dateOfLoss: '',
        dateReceived: '',
        originalInsured: '',
        causeOfLoss: '',
        causeOfLossCustom: '',
        currentReserve: '00.00',
        salvage: '0',
        dateOfLossIsMissing: false,
        claimCurrency: '',
        claimExchangeRate: 0,
        statusRemarksId: undefined,
        osDocumentStatusId: undefined
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

    // Dropdown options (empty initially, loaded from API)
    cedantOptions: [],
    subProfitCentreOptions: [],
    lobOptions: [],
    typeOfBusinessOptions: [],
    currencyOptions: [],
    statusRemarksOptions: [],
    osDocumentStatusOptions: [],

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
        try {
            const criteria = get().searchCriteria;

            // Build query parameters
            const params = new URLSearchParams();

            // Client code (cedant) is required with default
            if (criteria.cedantCode) {
                params.append('clientCode', criteria.cedantCode);
            }

            // Optional parameters
            if (criteria.underwritingYear) {
                params.append('underwritingYear', criteria.underwritingYear);
            }
            if (criteria.subProfitCentre) {
                params.append('subProfitCentre', criteria.subProfitCentre);
            }
            if (criteria.lobDescription) {
                params.append('lobDescription', criteria.lobDescription);
            }
            if (criteria.typeOfBusiness) {
                params.append('typeOfBusiness', criteria.typeOfBusiness);
            }

            console.log('Searching contracts with params:', params.toString());

            const response = await fetch(`${API_BASE_URL}/api/contract/list?${params.toString()}`);

            if (!response.ok) {
                throw new Error(`Failed to fetch contracts: ${response.statusText}`);
            }

            const data = await response.json();
            console.log('Contract search results:', data);

            // Transform API response to Contract format with all fields
            const contracts: Contract[] = data.map((item: any) => ({
                contractNumber: item.CONTRACT_NUMBER || item.contractNumber || '',
                brokerName: item.BROKER_NAME || item.brokerName || '',
                cedantName: item.CEDANT_NAME || item.cedantName || '',
                insuredName: item.INSURED_NAME || item.insuredName || '',
                domicileCountry: item.DOMICILE_COUNTRY_DESCRIPTION || item.domicileCountry || '',
                riskRegion: item.RISK_REGION_DESCRIPTION || item.riskRegion || '',
                typeOfBusiness: item.TYPE_OF_BUSINESS || item.typeOfBusiness || '',
                lineOfBusiness: item.LOB_DESCRIPTION || item.lineOfBusiness || '',
                subProfitCentre: item.SUB_PROFIT_CENTRE || item.subProfitCentre || '',
                underwritingYear: item.UNDERWRITING_YEAR ? parseInt(item.UNDERWRITING_YEAR) : undefined,
                inceptionDate: item.INCEPTION_DATE || item.inceptionDate || undefined,
                expiryDate: item.EXPIRY_DATE || item.expiryDate || undefined,
                premiumCurrency: item.PREMIUM_CURRENCY || item.premiumCurrency || '',
                exchangeRate: item.EXCHANGE_RATE ? parseFloat(item.EXCHANGE_RATE) : undefined,
                shareSigned: parseFloat(item.SHARE_SIGNED || item.shareSigned || '0'),
                retroPercentage: parseFloat(item.RETRO_PERCENTAGE || item.retroPercentage || '0'),
                surplusLine: item.SURPLUS_LINE || item.surplusLine || ''
            }));

            set({ searchResults: contracts, loading: false });
        } catch (error) {
            console.error('Error searching contracts:', error);
            set({ searchResults: [], loading: false });
            throw error;
        }
    },

    attachContractsToExistingClaim: async (claimId, contracts) => {
        set({ loading: true });
        try {
            // Recalculate totals with new contracts
            const claim = get().registeredClaims.find(c => c.claimId === claimId);
            if (!claim) {
                throw new Error('Claim not found');
            }

            const netAmount = claim.currentReserve;
            const totalShareSigned = contracts.reduce((sum, c) => sum + c.shareSigned, 0);
            const retroPercentage = contracts[0]?.retroPercentage || 0;

            const tanreTZS = netAmount * (totalShareSigned / 100);
            const retroAmount = tanreTZS * (retroPercentage / 100);
            const tanreRetention = tanreTZS - retroAmount;

            // Prepare the request payload with full contract details
            const requestPayload = {
                // Send full contract details (snapshot from search results)
                contracts: contracts.map(c => ({
                    contractNumber: c.contractNumber,
                    brokerName: c.brokerName || '',
                    cedantName: c.cedantName || '',
                    insuredName: c.insuredName || '',
                    domicileCountry: c.domicileCountry || '',
                    riskRegion: c.riskRegion || '',
                    typeOfBusiness: c.typeOfBusiness || '',
                    lineOfBusiness: c.lineOfBusiness || c.typeOfBusiness || '',
                    subProfitCentre: c.subProfitCentre || '',
                    underwritingYear: c.underwritingYear || null,
                    inceptionDate: c.inceptionDate ? convertDateToISO(c.inceptionDate) : null,
                    expiryDate: c.expiryDate ? convertDateToISO(c.expiryDate) : null,
                    premiumCurrency: c.premiumCurrency || '',
                    exchangeRate: c.exchangeRate || null,
                    shareSigned: c.shareSigned,
                    retroPercentage: c.retroPercentage,
                    surplusLine: c.surplusLine || ''
                })),
                totalShareSigned,
                tanreTZS,
                retroAmount,
                tanreRetention
            };

            console.log('Attaching contracts to claim:', claimId, requestPayload);

            // Call the backend API
            const response = await apiFetch<{
                id: number;
                claimId: string;
                referenceNumber: string;
                lineOfBusiness: string;
                dateOfLoss: string;
                dateReceived: string;
                dateRegistered: string;
                originalInsured: string;
                causeOfLoss: string;
                currentReserve: number;
                salvage: number;
                totalShareSigned: number;
                tanreTZS: number;
                retroAmount: number;
                tanreRetention: number;
                contractCount: number;
                contracts: string[];
                createdBy: string;
                createdAt: string;
                updatedAt: string;
            }>(`/api/claims/${claimId}/attach-contracts`, {
                method: 'POST',
                body: requestPayload,
                requiresAuth: true
            });

            console.log('Contracts attached successfully:', response);

            // Update the claim with the response from backend
            set((state) => ({
                registeredClaims: state.registeredClaims.map(c =>
                    c.claimId === claimId
                        ? {
                            ...c,
                            contracts: response.contracts,
                            contractCount: response.contractCount,
                            totalShareSigned: response.totalShareSigned,
                            tanreTZS: response.tanreTZS,
                            retroAmount: response.retroAmount,
                            tanreRetention: response.tanreRetention
                        }
                        : c
                ),
                loading: false,
                editingClaimId: null,
                selectedContracts: []
            }));
        } catch (error) {
            console.error('Error attaching contracts:', error);
            set({ loading: false });
            throw error;
        }
    },

    submitClaim: async () => {
        set({ loading: true });
        try {
            const state = get();
            const amount = parseFloat(state.claimDetails.currentReserve) || 0;
            const salvageAmount = parseFloat(state.claimDetails.salvage) || 0;
            const netAmount = amount - salvageAmount;
            const totalShareSigned = state.selectedContracts.reduce((sum, c) => sum + c.shareSigned, 0);
            const retroPercentage = state.selectedContracts[0]?.retroPercentage || 0;

            const tanreTZS = netAmount * (totalShareSigned / 100);
            const retroAmount = tanreTZS * (retroPercentage / 100);
            const tanreRetention = tanreTZS - retroAmount;

            // Determine the final causeOfLoss value (use custom if "Other" is selected)
            const finalCauseOfLoss = state.claimDetails.causeOfLoss === 'Other'
                ? state.claimDetails.causeOfLossCustom
                : state.claimDetails.causeOfLoss;

            // Prepare the request payload with full contract details
            const requestPayload = {
                lineOfBusiness: state.selectedContracts[0]?.lineOfBusiness || state.selectedContracts[0]?.typeOfBusiness || '',
                dateOfLoss: state.claimDetails.dateOfLoss ? convertDateToISO(state.claimDetails.dateOfLoss) : null,
                dateReceived: convertDateToISO(state.claimDetails.dateReceived),
                originalInsured: state.claimDetails.originalInsured,
                causeOfLoss: finalCauseOfLoss,
                currentReserve: amount,
                salvage: salvageAmount,
                // Send full contract details (snapshot from search results)
                contracts: state.selectedContracts.map(c => ({
                    contractNumber: c.contractNumber,
                    brokerName: c.brokerName || '',
                    cedantName: c.cedantName || '',
                    insuredName: c.insuredName || '',
                    domicileCountry: c.domicileCountry || '',
                    riskRegion: c.riskRegion || '',
                    typeOfBusiness: c.typeOfBusiness || '',
                    lineOfBusiness: c.lineOfBusiness || c.typeOfBusiness || '',
                    subProfitCentre: c.subProfitCentre || '',
                    underwritingYear: c.underwritingYear || null,
                    inceptionDate: c.inceptionDate ? convertDateToISO(c.inceptionDate) : null,
                    expiryDate: c.expiryDate ? convertDateToISO(c.expiryDate) : null,
                    premiumCurrency: c.premiumCurrency || '',
                    exchangeRate: c.exchangeRate || null,
                    shareSigned: c.shareSigned,
                    retroPercentage: c.retroPercentage,
                    surplusLine: c.surplusLine || ''
                })),
                totalShareSigned,
                tanreTZS,
                retroAmount,
                tanreRetention,
                claimCurrency: state.claimDetails.claimCurrency,
                claimExchangeRate: state.claimDetails.claimExchangeRate,
                statusRemarksId: state.claimDetails.statusRemarksId || null,
                osDocumentStatusId: state.claimDetails.osDocumentStatusId || null
            };

            console.log('Submitting claim:', requestPayload);

            // Call the backend API
            const response = await apiFetch<{
                id: number;
                claimId: string;
                referenceNumber: string;
                lineOfBusiness: string;
                dateOfLoss: string;
                dateReceived: string;
                dateRegistered: string;
                originalInsured: string;
                causeOfLoss: string;
                currentReserve: number;
                salvage: number;
                totalShareSigned: number;
                tanreTZS: number;
                retroAmount: number;
                tanreRetention: number;
                contractCount: number;
                contracts: string[];
                createdBy: string;
                createdAt: string;
                updatedAt: string;
                statusRemarks: { id: number; name: string; label: string } | null;
                osDocumentStatus: { id: number; name: string; label: string } | null;
            }>('/api/claims/register', {
                method: 'POST',
                body: requestPayload,
                requiresAuth: true
            });

            console.log('Claim registered successfully:', response);

            // Transform the response to match our RegisteredClaim interface
            const newClaim: RegisteredClaim = {
                claimId: response.claimId,
                dateRegistered: response.dateRegistered,
                dateOfLoss: response.dateOfLoss,
                dateReceived: response.dateReceived,
                originalInsured: response.originalInsured,
                causeOfLoss: response.causeOfLoss,
                currentReserve: response.currentReserve,
                salvage: response.salvage,
                totalShareSigned: response.totalShareSigned,
                tanreTZS: response.tanreTZS,
                retroAmount: response.retroAmount,
                tanreRetention: response.tanreRetention,
                contractCount: response.contractCount,
                contracts: response.contracts,
                statusRemarks: response.statusRemarks,
                osDocumentStatus: response.osDocumentStatus
            };

            // Update the store with the new claim
            set((state) => ({
                registeredClaims: [newClaim, ...state.registeredClaims],
                loading: false
            }));

            return newClaim;
        } catch (error) {
            console.error('Error submitting claim:', error);
            set({ loading: false });
            throw error;
        }
    },

    resetClaimForm: () => set({
        claimDetails: {
            dateOfLoss: '',
            dateReceived: '',
            originalInsured: '',
            causeOfLoss: '',
            causeOfLossCustom: '',
            currentReserve: '00.00',
            salvage: '0',
            dateOfLossIsMissing: false,
            claimCurrency: '',
            claimExchangeRate: 0,
            statusRemarksId: undefined,
            osDocumentStatusId: undefined
        },
        selectedContracts: [],
        searchResults: []
    }),

    loadDropdownData: async () => {
        try {
            console.log('Starting to load dropdown data...');
            // Fetch all dropdown data in parallel
            const [clientsRes, subProfitCentreRes, lobRes, typeOfBusinessRes] = await Promise.all([
                fetch(`${API_BASE_URL}/api/client/list`),
                fetch(`${API_BASE_URL}/api/business-type/sub-profit-centre`),
                fetch(`${API_BASE_URL}/api/business-type/line-of-business`),
                fetch(`${API_BASE_URL}/api/business-type/type-of-business`)
            ]);

            if (!clientsRes.ok || !subProfitCentreRes.ok || !lobRes.ok || !typeOfBusinessRes.ok) {
                throw new Error('Failed to load dropdown data');
            }

            const clients: Client[] = await clientsRes.json();
            const subProfitCentres: SubProfitCentre[] = await subProfitCentreRes.json();
            const lobs: LOB[] = await lobRes.json();
            const typeOfBusinesses: TypeOfBusiness[] = await typeOfBusinessRes.json();

            console.log('Raw API data:', { clients: clients.length, subProfitCentres: subProfitCentres.length, lobs: lobs.length, typeOfBusinesses: typeOfBusinesses.length });

            // Filter only cedants (type 'C')
            const cedants = clients.filter(client => client.BROKER_CEDANT_TYPE?.trim() === 'C');

            // Transform to Select component format - filter out any items with missing codes
            const cedantOptions = cedants
                .filter(cedant => cedant.BROKER_CEDANT_CODE && cedant.BROKER_CEDANT_NAME)
                .map(cedant => ({
                    value: cedant.BROKER_CEDANT_CODE,
                    label: `${cedant.BROKER_CEDANT_NAME} (${cedant.BROKER_CEDANT_CODE})`
                }));

            const subProfitCentreOptions = subProfitCentres
                .filter(spc => spc.SUB_PROFIT_CENTRE_CODE && spc.SUB_PROFIT_CENTRE)
                .map(spc => ({
                    value: spc.SUB_PROFIT_CENTRE_CODE,
                    label: spc.SUB_PROFIT_CENTRE
                }));

            const lobOptions = lobs
                .filter(lob => lob.LOB_CODE && lob.LOB_DESCRIPTION)
                .map(lob => ({
                    value: lob.LOB_CODE,
                    label: lob.LOB_DESCRIPTION
                }));

            const typeOfBusinessOptions = typeOfBusinesses
                .filter(tob => tob.TYPE_OF_BUSINESS_CODE && tob.TYPE_OF_BUSINESS)
                .map(tob => ({
                    value: tob.TYPE_OF_BUSINESS_CODE,
                    label: tob.TYPE_OF_BUSINESS
                }));

            console.log('Transformed options:', {
                cedantOptions: cedantOptions.length,
                subProfitCentreOptions: subProfitCentreOptions.length,
                lobOptions: lobOptions.length,
                typeOfBusinessOptions: typeOfBusinessOptions.length
            });
            console.log('Sample cedant option:', cedantOptions[0]);

            set({
                cedantOptions,
                subProfitCentreOptions,
                lobOptions,
                typeOfBusinessOptions
            });

            console.log('Dropdown data loaded successfully');
        } catch (error) {
            console.error('Error loading dropdown data:', error);
            // Set empty arrays on error to ensure we have valid data
            set({
                cedantOptions: [],
                subProfitCentreOptions: [],
                lobOptions: [],
                typeOfBusinessOptions: []
            });
            throw error;
        }
    },

    loadCurrencies: async () => {
        try {
            console.log('Loading currencies and exchange rates...');

            const response = await fetch(`${API_BASE_URL}/api/currency/exchange-rates`);

            if (!response.ok) {
                throw new Error(`Failed to load currencies: ${response.statusText}`);
            }

            const currencies: CurrencyExchangeRate[] = await response.json();

            console.log('Raw currency data:', currencies.length, 'currencies');

            // Transform to Select component format with exchange rates
            const currencyOptions = currencies
                .filter(currency => currency.CURRENCY_CODE && currency.CURRENCY_DESCRIPTION)
                .map(currency => ({
                    value: currency.CURRENCY_CODE,
                    label: `${currency.CURRENCY_DESCRIPTION} (${currency.CURRENCY_CODE})`,
                    exchangeRate: currency.EXCHANGE_RATE || 0
                }))
                .sort((a, b) => a.value.localeCompare(b.value));

            console.log('Transformed currency options:', currencyOptions.length, 'options');

            set({ currencyOptions });
            console.log('Currencies loaded successfully');
        } catch (error) {
            console.error('Error loading currencies:', error);
            set({ currencyOptions: [] });
            throw error;
        }
    },

    loadRegisteredClaims: async () => {
        try {
            console.log('Loading registered claims from database...');

            // Call the backend API to get all claims
            const response = await apiFetch<Array<{
                id: number;
                claimId: string;
                referenceNumber: string;
                lineOfBusiness: string;
                dateOfLoss: string;
                dateReceived: string;
                dateRegistered: string;
                originalInsured: string;
                causeOfLoss: string;
                currentReserve: number;
                salvage: number;
                totalShareSigned: number;
                tanreTZS: number;
                retroAmount: number;
                tanreRetention: number;
                contractCount: number;
                contracts: string[];
                createdBy: string;
                createdAt: string;
                updatedAt: string;
                statusRemarks: { id: number; name: string; label: string } | null;
                osDocumentStatus: { id: number; name: string; label: string } | null;
            }>>('/api/claims', {
                method: 'GET',
                requiresAuth: true
            });

            console.log('Successfully loaded claims from database:', response.length, 'claims');

            // Transform the response to match our RegisteredClaim interface
            const claims: RegisteredClaim[] = response.map(item => ({
                claimId: item.claimId,
                dateRegistered: item.dateRegistered,
                dateOfLoss: item.dateOfLoss,
                dateReceived: item.dateReceived,
                originalInsured: item.originalInsured,
                causeOfLoss: item.causeOfLoss,
                currentReserve: item.currentReserve,
                salvage: item.salvage,
                totalShareSigned: item.totalShareSigned,
                tanreTZS: item.tanreTZS,
                retroAmount: item.retroAmount,
                tanreRetention: item.tanreRetention,
                contractCount: item.contractCount,
                contracts: item.contracts,
                statusRemarks: item.statusRemarks,
                osDocumentStatus: item.osDocumentStatus
            }));

            set({ registeredClaims: claims });
        } catch (error: any) {
            console.error('Error loading registered claims from database:', error);
            console.error('Error details:', error.message);

            // If it's a 500 error, log more details for debugging
            if (error.message?.includes('500')) {
                console.error('500 Internal Server Error - Check backend logs for details');
                console.error('This could be due to:');
                console.error('1. Database not initialized');
                console.error('2. Authentication issue');
                console.error('3. Missing database tables');
                console.error('4. Backend service not running');
            }

            // Keep empty array on error - don't block the UI
            set({ registeredClaims: [] });
        }
    },

    loadStatusOptions: async () => {
        try {
            console.log('Loading status options...');

            // Fetch both status options in parallel
            const [statusRemarksRes, osDocumentStatusRes] = await Promise.all([
                apiFetch<StatusOption[]>('/api/claims/status-remarks', {
                    method: 'GET',
                    requiresAuth: true
                }),
                apiFetch<StatusOption[]>('/api/claims/os-document-statuses', {
                    method: 'GET',
                    requiresAuth: true
                })
            ]);

            console.log('Status remarks options:', statusRemarksRes);
            console.log('O/S Document status options:', osDocumentStatusRes);

            set({
                statusRemarksOptions: statusRemarksRes,
                osDocumentStatusOptions: osDocumentStatusRes
            });

            console.log('Status options loaded successfully');
        } catch (error) {
            console.error('Error loading status options:', error);
            set({
                statusRemarksOptions: [],
                osDocumentStatusOptions: []
            });
        }
    }
}));
