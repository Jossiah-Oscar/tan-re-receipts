import { create } from 'zustand';
import {API_BASE_URL, apiFetch} from '@/config/api';

/* ===========================
 * Types for dropdown data
 * =========================== */

export interface ContractType {
    contractTypesId: number;
    contractTypeId: number;
    typeCode: string;
    typeName: string;
}


export interface Currency {
    code: string;           // 'TZS'
    name: string;           // 'Tanzanian Shilling'
    exchange_rate?: number; // backend may use any of: exchange_rate | exchangeRate | rate
    exchangeRate?: number;
    rate?: number;
}

export interface BrokerCedant {
    brokerCedantCode: string;
    brokerCedantName: string;
}

export interface Program {
    programId: number;
    programName: string;
}

export interface User {
    id: number;
    username: string;
}

export interface LineOfBusiness {
    id: number;
    name: string;
}

export interface RetroType {
    id: number;
    name: string;
    description: string;
    lobId: number;
    businessTypeId: number;
}




/* ===========================
 * Dropdown Store
 * =========================== */

interface DropdownStore {
    programs: Program[];
    currencies: Currency[];
    contractTypes: ContractType[];
    users: User[];
    lineOfBusinesses: LineOfBusiness[];
    retroTypes: RetroType[];
    loading: boolean;
    error: string | null;

    setProgram: (cls: Program[]) => void;
    setUsers: (types: User[]) => void;
    setCurrencies: (curr: Currency[]) => void;
    setContractTypes: (types: ContractType[]) => void;
    setLineOfBusinesses: (lobs: LineOfBusiness[]) => void;
    setRetroTypes: (types: RetroType[]) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;

    loadDropdownData: () => Promise<void>;

    getProgramSelectData: () => { value: string; label: string }[];
    getUserSelectionData: () => { value: string; label: string }[];
    getCurrencySelectData: () => { value: string; label: string }[];
    getContractTypeSelectData: () => { value: string; label: string }[];
    getLineOfBusinessSelectData: () => { value: string; label: string }[];
    getRetroTypeSelectData: (lobId?: number) => { value: string; label: string }[];
}

const useDropdownStore = create<DropdownStore>((set, get) => ({
    programs: [],
    currencies: [
        { code: 'TZS', name: 'Tanzanian Shilling', exchangeRate: 1 },
        { code: 'USD', name: 'US Dollar', exchangeRate: 2500 },
        { code: 'EUR', name: 'Euro', exchangeRate: 2750 },
        { code: 'GBP', name: 'British Pound', exchangeRate: 3200 },
    ],
    contractTypes: [],
    users: [],
    lineOfBusinesses: [
        { id: 1, name: 'Fire' },
        { id: 2, name: 'Engineering' },
        { id: 3, name: 'Energy' },
    ],
    retroTypes: [
        { id: 1, name: 'Fire & Engineering', description: 'Fire and Engineering', lobId: 1, businessTypeId: 2 },
        { id: 2, name: 'Fire', description: 'Fire', lobId: 1, businessTypeId: 1 },
        { id: 3, name: 'Fire & Engineering - Prop', description: 'Fire and Engineering Proportional Treaty', lobId: 1, businessTypeId: 2 },
        { id: 4, name: 'Fire & Engineering - Non-Prop', description: 'Fire and Engineering Non Proportional Treaty', lobId: 1, businessTypeId: 2 },
    ],
    loading: false,
    error: null,

    setProgram: (cls) => set({ programs: cls }),
    setCurrencies: (curr) => set({ currencies: curr }),
    setContractTypes: (types) => set({ contractTypes: types }),
    setUsers: (users) => set({ users: users }),
    setLineOfBusinesses: (lobs) => set({ lineOfBusinesses: lobs }),
    setRetroTypes: (types) => set({ retroTypes: types }),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),

    loadDropdownData: async () => {
        const { setLoading, setError, setProgram, setCurrencies, setContractTypes, setUsers, setLineOfBusinesses, setRetroTypes } = get();
        setLoading(true);
        setError(null);
        try {
            // Load all dropdown data concurrently
            const [contractTypes, currencies, classes, users, lobs, retroTypes] = await Promise.all([
                apiFetch<ContractType[]>(`/api/contract-types`).catch(() => []),
                apiFetch<Currency[]>('/api/currencies').catch(() => get().currencies), // Keep default currencies if API fails
                apiFetch<Program[]>('/api/program').catch(() => []),
                apiFetch<User[]>('/admin/users/list').catch(() => []),
                apiFetch<LineOfBusiness[]>('/api/underwriting/line-of-business').catch(() => get().lineOfBusinesses), // Keep default LOBs if API fails
                apiFetch<RetroType[]>('/api/underwriting/retro-types').catch(() => get().retroTypes) // Keep default retro types if API fails
            ]);

            setContractTypes(contractTypes || []);
            // Only update if API returned data, otherwise keep defaults
            if (currencies && currencies.length > 0) setCurrencies(currencies);
            setProgram(classes || []);
            setUsers(users || []);
            if (lobs && lobs.length > 0) setLineOfBusinesses(lobs);
            if (retroTypes && retroTypes.length > 0) setRetroTypes(retroTypes);

        } catch (err: any) {
            setError(err?.message || 'Unknown error loading dropdowns');
            // Don't throw - we have fallback data
        } finally {
            setLoading(false);
        }
    },

    getProgramSelectData: () => get().programs.map((c) => ({ value: String(c.programId), label: c.programName })),
    getUserSelectionData: () => get().users.map((c) => ({ value: String(c.id), label: c.username })),
    getCurrencySelectData: () =>
        get().currencies.map((c) => ({ value: c.code, label: `${c.name} (${c.code})` })),

    getContractTypeSelectData: () =>{
        const {contractTypes} = get();
        return contractTypes.map(contractType => ({
            value:String(contractType.contractTypeId || contractType.contractTypesId),
            label: contractType.typeName
        }));
    },

    getLineOfBusinessSelectData: () =>
        get().lineOfBusinesses.map((lob) => ({
            value: String(lob.id),
            label: lob.name
        })),

    getRetroTypeSelectData: (lobId?: number) => {
        const { retroTypes } = get();
        const filtered = lobId
            ? retroTypes.filter(rt => rt.lobId === lobId)
            : retroTypes;
        return filtered.map((rt) => ({
            value: String(rt.id),
            label: rt.name
        }));
    }

}));

/* ===========================
 * Calc Response DTO (backend)
 * =========================== */

export interface FacultativeOfferCalcResponseDto {
    programId?: number;
    contractTypeId?: number;

    // Status & messaging (these match your API)
    calculationStatus: 'SUCCESS' | 'WARNING' | 'ERROR';
    message: string;

    // Original amounts
    sumInsuredOs: number;
    premiumOs: number;

    // Converted to TZS (note: API returns 'premiumTzs' not 'premiumTz')
    premiumTzs: number; // API returns this name

    // Exposures and premiums (these match your API response)
    exposureOffered: number;    // maps to soExposureTz in your store
    premiumOffered: number;     // maps to soPremiumTz in your store
    exposureAccepted: number;   // maps to saExposureTz in your store
    premiumAccepted: number;    // maps to saPremiumTz in your store

    // Retention breakdown
    retentionExposure: number;  // maps to tanReRetExposureTz
    retentionPremium: number;   // maps to tanReRetPremiumTz

    // Surplus breakdown
    surplusExposure: number;    // maps to suRetroExposureTz
    surplusPremium: number;     // maps to suRetroPremiumTz

    // Facultative retro
    facRetroExposure: number;   // maps to facRetroExposureTz
    facRetroPremium: number;    // maps to facRetroPremiumTz

    // Totals
    totalExposure: number;
    totalPremium: number;
}

/* ===========================
 * Offer form + store
 * =========================== */

/* ===========================
 * Retro Configuration (line item)
 * =========================== */

export interface RetroConfiguration {
    // Unique identifier
    id: string; // generated client-side, UUID-like

    // Configuration details
    lineOfBusinessId: string;
    retroTypeId: string;
    retroYear: number;
    periodFrom: Date;
    periodTo: Date;

    // Financial details
    sumInsuredOs: number;
    premiumOs: number;
    shareOfferedPct: number;
    shareAcceptedPct: number;

    // Calculated results (TZ-converted)
    sumInsuredTz: number;
    premiumTz: number;
    soExposureTz: number;
    soPremiumTz: number;
    saExposureTz: number;
    saPremiumTz: number;

    // Retention breakdown
    tanReRetentionPct: number;
    tanReRetExposureTz: number;
    tanReRetPremiumTz: number;

    // Surplus breakdown
    suRetroPct: number;
    suRetroExposureTz: number;
    suRetroPremiumTz: number;

    // Facultative retro
    facRetroPct: number;
    facRetroExposureTz: number;
    facRetroPremiumTz: number;

    // Calculation state for this config
    calculationStatus: 'SUCCESS' | 'WARNING' | 'ERROR' | null;
    calculationMessage: string | null;
    isCalculating: boolean;
}

export interface OfferFormData {
    // Shared offer-level details
    cedant: string;
    broker: string;
    offerReceivedDate: Date;
    insured: string;
    occupation: string;
    programId: string; // Keep for backend compatibility
    contractTypeId: string; // Keep for backend compatibility
    country: string;
    currencyCode: string;
    exchangeRate: number;
    notes: string;

    // Array of retro configurations
    retroConfigurations: RetroConfiguration[];
}

interface OfferStore extends OfferFormData {
    loading: boolean;
    calculating: boolean;
    error: string | null;

    setValues: (values: Partial<OfferFormData>) => void;
    setLoading: (loading: boolean) => void;
    setCalculating: (calculating: boolean) => void;
    setError: (error: string | null) => void;

    // Retro configuration management
    addRetroConfig: (config?: Partial<RetroConfiguration>) => string; // returns config ID
    updateRetroConfig: (configId: string, updates: Partial<RetroConfiguration>) => void;
    removeRetroConfig: (configId: string) => void;
    getRetroConfig: (configId: string) => RetroConfiguration | undefined;

    // Calculations per config
    calculateRetroConfig: (configId: string) => Promise<void>;

    resetForm: () => void;
    getInitialValues: () => OfferFormData;
    validateForm: (values: OfferFormData) => Record<string, string>;
    submitForm: (values: OfferFormData) => Promise<boolean>;
    updateCurrencyAndExchangeRate: (currencyCode: string) => void;
}

// Helper function to generate unique ID for retro config
const generateConfigId = (): string => {
    // Use crypto.getRandomUUID for truly unique IDs, fallback to random string
    if (typeof crypto !== 'undefined' && crypto.getRandomUUID) {
        return `config_${crypto.getRandomUUID()}`;
    }
    // Fallback for environments without crypto API
    return `config_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${Math.random().toString(36).substr(2, 9)}`;
};

// Helper to create default retro config
const createDefaultRetroConfig = (overrides?: Partial<RetroConfiguration>): RetroConfiguration => ({
    id: generateConfigId(),
    lineOfBusinessId: '',
    retroTypeId: '',
    retroYear: new Date().getFullYear(),
    periodFrom: new Date(),
    periodTo: new Date(),
    sumInsuredOs: 0,
    premiumOs: 0,
    shareOfferedPct: 0,
    shareAcceptedPct: 0,
    sumInsuredTz: 0,
    premiumTz: 0,
    soExposureTz: 0,
    soPremiumTz: 0,
    saExposureTz: 0,
    saPremiumTz: 0,
    tanReRetentionPct: 0,
    tanReRetExposureTz: 0,
    tanReRetPremiumTz: 0,
    suRetroPct: 0,
    suRetroExposureTz: 0,
    suRetroPremiumTz: 0,
    facRetroPct: 0,
    facRetroExposureTz: 0,
    facRetroPremiumTz: 0,
    calculationStatus: null,
    calculationMessage: null,
    isCalculating: false,
    ...overrides,
});

const useOfferStore = create<OfferStore>((set, get) => ({
    // form defaults
    cedant: '',
    broker: '',
    offerReceivedDate: new Date(),
    insured: '',
    occupation: '',
    programId: '1', // Default to avoid validation errors
    contractTypeId: '1', // Default to avoid validation errors
    country: '',
    currencyCode: '',
    exchangeRate: 1,
    notes: '',

    // Array of retro configurations
    retroConfigurations: [],

    // UI state
    loading: false,
    calculating: false,
    error: null,

    // state setters
    setValues: (values) => set((s) => ({ ...s, ...values })),
    setLoading: (loading) => set({ loading }),
    setCalculating: (calculating) => set({ calculating }),
    setError: (error) => set({ error }),

    // initial values for Mantine form
    getInitialValues: () => ({ ...get() }),

    // Retro configuration management
    addRetroConfig: (config?: Partial<RetroConfiguration>) => {
        const newConfig = createDefaultRetroConfig(config);
        set((s) => ({
            retroConfigurations: [...s.retroConfigurations, newConfig],
        }));
        return newConfig.id;
    },

    updateRetroConfig: (configId: string, updates: Partial<RetroConfiguration>) => {
        set((s) => ({
            retroConfigurations: s.retroConfigurations.map((c) =>
                c.id === configId ? { ...c, ...updates } : c
            ),
        }));
    },

    removeRetroConfig: (configId: string) => {
        set((s) => ({
            retroConfigurations: s.retroConfigurations.filter((c) => c.id !== configId),
        }));
    },

    getRetroConfig: (configId: string) => {
        return get().retroConfigurations.find((c) => c.id === configId);
    },

    // validation
    validateForm: (v) => {
        const errors: Record<string, string> = {};
        if (!v.cedant) errors.cedant = 'Cedant is required';
        if (!v.insured) errors.insured = 'Insured is required';
        if (!v.currencyCode) errors.currencyCode = 'Currency is required';
        if (v.exchangeRate <= 0) errors.exchangeRate = 'Exchange rate must be greater than 0';
        if (v.retroConfigurations.length === 0) {
            errors.retroConfigurations = 'At least one retro configuration is required';
        }
        // Validate each retro config
        v.retroConfigurations.forEach((config, idx) => {
            if (!config.lineOfBusinessId) {
                errors[`config_${idx}_lob`] = 'Line of Business is required';
            }
            if (!config.retroTypeId) {
                errors[`config_${idx}_retroType`] = 'Retro Type is required';
            }
            if (config.periodFrom >= config.periodTo) {
                errors[`config_${idx}_period`] = 'Period To must be after Period From';
            }
        });
        return errors;
    },

    // Calculate for a specific retro configuration
    calculateRetroConfig: async (configId: string) => {
        const s = get();
        const config = s.retroConfigurations.find((c) => c.id === configId);
        if (!config) {
            set({ error: 'Configuration not found' });
            return;
        }

        const payload = {
            retroTypeId: Number(config.retroTypeId),
            year: config.retroYear,
            currency: s.currencyCode,
            exchangeRate: s.exchangeRate,
            sumInsuredOs: config.sumInsuredOs,
            premiumOs: config.premiumOs,
            shareOfferedPct: config.shareOfferedPct,
            shareAcceptedPct: config.shareAcceptedPct,
        };

        set((st) => ({
            retroConfigurations: st.retroConfigurations.map((c) =>
                c.id === configId ? { ...c, isCalculating: true } : c
            ),
            error: null,
        }));

        try {
            const res = await apiFetch<FacultativeOfferCalcResponseDto>(
                '/api/underwriting/facultative/analyze',
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: payload,
                }
            );

            console.log('Calculation result for config:', res);

            // Update this specific config with calculation results
            const updates: Partial<RetroConfiguration> = {
                sumInsuredTz: res.exposureOffered,
                premiumTz: res.premiumTzs,
                soExposureTz: res.exposureOffered,
                soPremiumTz: res.premiumOffered,
                saExposureTz: res.exposureAccepted,
                saPremiumTz: res.premiumAccepted,
                tanReRetentionPct: res.totalExposure ? (res.retentionExposure / res.totalExposure) * 100 : 0,
                tanReRetExposureTz: res.retentionExposure,
                tanReRetPremiumTz: res.retentionPremium,
                suRetroPct: res.totalExposure ? (res.surplusExposure / res.totalExposure) * 100 : 0,
                suRetroExposureTz: res.surplusExposure,
                suRetroPremiumTz: res.surplusPremium,
                facRetroPct: res.totalExposure ? (res.facRetroExposure / res.totalExposure) * 100 : 0,
                facRetroExposureTz: res.facRetroExposure,
                facRetroPremiumTz: res.facRetroPremium,
                calculationStatus: res.calculationStatus,
                calculationMessage: res.message,
                isCalculating: false,
            };

            set((st) => ({
                retroConfigurations: st.retroConfigurations.map((c) =>
                    c.id === configId ? { ...c, ...updates } : c
                ),
            }));
        } catch (e: any) {
            set((st) => ({
                retroConfigurations: st.retroConfigurations.map((c) =>
                    c.id === configId ? { ...c, isCalculating: false, calculationStatus: 'ERROR' as const } : c
                ),
                error: e?.message || 'Calculation failed',
            }));
        }
    },

    // Legacy calculateValues for backward compatibility - calculates all configs
    calculateValues: async () => {
        const s = get();
        // Calculate all configs
        const promises = s.retroConfigurations.map((config) =>
            get().calculateRetroConfig(config.id)
        );
        await Promise.all(promises);
    },

    // submit (persist) analysis/offer - creates separate offer for each retro config
    submitForm: async (v): Promise<boolean> => {
        set({ loading: true, error: null });
        try {
            if (!v.retroConfigurations || v.retroConfigurations.length === 0) {
                set({ error: 'At least one retro configuration is required' });
                return false;
            }

            // Submit each retro configuration as a separate offer
            const submissions = v.retroConfigurations.map((config) => {
                const payload = {
                    // Required by backend model
                    programId: Number(v.programId) || 1,
                    contractTypeId: Number(v.contractTypeId) || 1,
                    retroYear: config.retroYear,
                    periodFrom: config.periodFrom.toISOString().slice(0, 10),
                    periodTo: config.periodTo.toISOString().slice(0, 10),
                    currency: v.currencyCode,
                    exchangeRate: v.exchangeRate,
                    offerReceivedDate: v.offerReceivedDate.toISOString().slice(0, 10),
                    cedant: v.cedant,
                    broker: v.broker || '',
                    insured: v.insured,
                    occupation: v.occupation || '',
                    country: v.country,
                    sumInsuredOs: config.sumInsuredOs,
                    premiumOs: config.premiumOs,
                    shareOfferedPct: config.shareOfferedPct,
                    shareAcceptedPct: config.shareAcceptedPct,
                    notes: v.notes,

                    // Retro configuration specific
                    retroTypeId: Number(config.retroTypeId),
                    lineOfBusinessId: Number(config.lineOfBusinessId),

                    // computed snapshot
                    sumInsuredTz: config.sumInsuredTz,
                    premiumTz: config.premiumTz,
                    soExposureTz: config.soExposureTz,
                    soPremiumTz: config.soPremiumTz,
                    saExposureTz: config.saExposureTz,
                    saPremiumTz: config.saPremiumTz,
                    tanReRetentionPct: config.tanReRetentionPct,
                    tanReRetExposureTz: config.tanReRetExposureTz,
                    tanReRetPremiumTz: config.tanReRetPremiumTz,
                    suRetroPct: config.suRetroPct,
                    suRetroExposureTz: config.suRetroExposureTz,
                    suRetroPremiumTz: config.suRetroPremiumTz,
                    facRetroPct: config.facRetroPct,
                    facRetroExposureTz: config.facRetroExposureTz,
                    facRetroPremiumTz: config.facRetroPremiumTz,
                };

                return apiFetch<{
                    offerId: number;
                    analysisId: number;
                    processInstanceId: string;
                    businessKey: string;
                    status: string;
                    message: string;
                }>('/api/underwriting/facultative/submit', {
                    method: 'POST',
                    body: payload,
                    headers: { 'Content-Type': 'application/json' },
                    requiresAuth: true,
                });
            });

            // Execute all submissions in parallel
            const responses = await Promise.all(submissions);
            console.log('All submissions successful:', responses);

            return true;
        } catch (e: any) {
            set({ error: e?.message || 'Failed to save offer analysis' });
            return false;
        } finally {
            set({ loading: false });
        }
    },

    // pick currency + set rate
    updateCurrencyAndExchangeRate: (currencyCode: string) => {
        const { currencies } = useDropdownStore.getState();
        const selected = currencies.find((c) => c.code === currencyCode);
        if (!selected) return;

        // tolerate different API shapes
        const rate =
            (selected.exchange_rate ?? selected.exchangeRate ?? selected.rate ?? 1) as number;

        set((st) => ({
            ...st,
            currencyCode,
            exchangeRate: Number(rate) || 1,
        }));
    },

    // reset
    resetForm: () =>
        set({
            cedant: '',
            broker: '',
            offerReceivedDate: new Date(),
            insured: '',
            occupation: '',
            programId: '1',
            contractTypeId: '1',
            country: '',
            currencyCode: '',
            exchangeRate: 1,
            notes: '',
            retroConfigurations: [],
            loading: false,
            calculating: false,
            error: null,
        }),
}));

export { useDropdownStore, useOfferStore };
