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




/* ===========================
 * Dropdown Store
 * =========================== */

interface DropdownStore {
    programs: Program[];
    currencies: Currency[];
    contractTypes: ContractType[];
    users: User[];
    loading: boolean;
    error: string | null;

    setProgram: (cls: Program[]) => void;
    setUsers: (types: User[]) => void;
    setCurrencies: (curr: Currency[]) => void;
    setContractTypes: (types: ContractType[]) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;

    loadDropdownData: () => Promise<void>;

    getProgramSelectData: () => { value: string; label: string }[];
    getUserSelectionData: () => { value: string; label: string }[];
    getCurrencySelectData: () => { value: string; label: string }[];
    getContractTypeSelectData: () => { value: string; label: string }[];
}

const useDropdownStore = create<DropdownStore>((set, get) => ({
    programs: [],
    currencies: [],
    contractTypes: [],
    users: [],
    cedants: [],
    broker: [],
    loading: false,
    error: null,

    setProgram: (cls) => set({ programs: cls }),
    setCurrencies: (curr) => set({ currencies: curr }),
    setContractTypes: (types) => set({ contractTypes: types }),
    setUsers: (users) => set({users: users}),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),

    loadDropdownData: async () => {
        const { setLoading, setError, setProgram, setCurrencies, setContractTypes, setUsers } = get();
        setLoading(true);
        setError(null);
        try {
            // Load all dropdown data concurrently
            const [contractTypes, currencies, classes, users] = await Promise.all([
                apiFetch<ContractType[]>(`/api/contract-types`),
                apiFetch<Currency[]>('/api/currencies'),
                apiFetch<Program[]>('/api/program'),
                apiFetch<User[]>('/admin/users/list')
            ]);

            setContractTypes(contractTypes || []);
            setCurrencies(currencies || []);
            setProgram(classes || []);
            setUsers(users || []);


        } catch (err: any) {
            setError(err?.message || 'Unknown error loading dropdowns');
            throw err;
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

export interface OfferFormData {
    cedant: string;
    broker: string; // added
    offerReceivedDate: Date;
    insured: string;
    occupation: string;
    programId: string; // maps to programId
    contractTypeId: string;
    country: string;
    periodFrom: Date;
    periodTo: Date;
    currencyCode: string;
    exchangeRate: number;
    notes:string;

    sumInsuredOs: number;
    premiumOs: number;

    sumInsuredTz: number;
    premiumTz: number;

    shareOfferedPct: number;
    soExposureTz: number;
    soPremiumTz: number;

    shareAcceptedPct: number;
    saExposureTz: number;
    saPremiumTz: number;

    tanReRetentionPct: number;
    tanReRetExposureTz: number;
    tanReRetPremiumTz: number;

    suRetroPct: number;
    suRetroExposureTz: number;
    suRetroPremiumTz: number;

    facRetroPct: number;
    facRetroExposureTz: number;
    facRetroPremiumTz: number;
}

interface OfferStore extends OfferFormData {
    loading: boolean;
    calculating: boolean;
    error: string | null;
    calculationStatus: 'SUCCESS' | 'WARNING' | 'ERROR' | null;
    calculationMessage: string | null;

    setValues: (values: Partial<OfferFormData>) => void;
    setLoading: (loading: boolean) => void;
    setCalculating: (calculating: boolean) => void;
    setError: (error: string | null) => void;
    setCalculationStatus: (status: 'SUCCESS' | 'WARNING' | 'ERROR' | null) => void;
    setCalculationMessage: (message: string | null) => void;

    resetForm: () => void;
    getInitialValues: () => OfferFormData;
    validateForm: (values: OfferFormData) => Record<string, string>;
    calculateValues: () => Promise<void>;
    submitForm: (values: OfferFormData) => Promise<boolean>;
    updateCurrencyAndExchangeRate: (currencyCode: string) => void;
}

const useOfferStore = create<OfferStore>((set, get) => ({
    // form defaults
    cedant: '',
    broker: '',
    offerReceivedDate: new Date(),
    insured: '',
    occupation: '',
    programId: '',
    contractTypeId: '',
    country: '',
    periodFrom: new Date(),
    periodTo: new Date(),
    currencyCode: '',
    exchangeRate: 1,
    notes: '',

    sumInsuredOs: 0,
    premiumOs: 0,
    sumInsuredTz: 0,
    premiumTz: 0,

    shareOfferedPct: 0,
    soExposureTz: 0,
    soPremiumTz: 0,

    shareAcceptedPct: 0,
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

    // UI state
    loading: false,
    calculating: false,
    error: null,
    calculationStatus: null,
    calculationMessage: null,

    // state setters
    setValues: (values) => set((s) => ({ ...s, ...values })),
    setLoading: (loading) => set({ loading }),
    setCalculating: (calculating) => set({ calculating }),
    setError: (error) => set({ error }),
    setCalculationStatus: (status) => set({ calculationStatus: status }),
    setCalculationMessage: (message) => set({ calculationMessage: message }),

    // initial values for Mantine form
    getInitialValues: () => ({ ...get() }),

    // validation
    validateForm: (v) => {
        const errors: Record<string, string> = {};
        if (!v.cedant) errors.cedant = 'Cedant is required';
        if (!v.broker) errors.broker = 'Broker is required';
        if (!v.insured) errors.insured = 'Insured is required';
        if (!v.programId) errors.programId = 'Business class is required';
        if (!v.contractTypeId) errors.contractTypeId = 'Contract type is required';
        if (!v.country) errors.country = 'Country is required';
        if (!v.currencyCode) errors.currencyCode = 'Currency is required';
        if (v.exchangeRate <= 0) errors.exchangeRate = 'Exchange rate must be greater than 0';
        if (v.periodFrom >= v.periodTo) errors.periodTo = 'Period To must be after Period From';
        return errors;
    },

    // call backend to calculate analysis
    calculateValues: async () => {
        const s = get();
        const payload = {
            // mappings to backend DTO
            // programId: Number(s.programId), // program
            programId: Number(s.programId), // program
            contractTypeId: Number(s.contractTypeId),
            retroYear: s.periodFrom.getFullYear(),
            periodFrom: s.periodFrom.toISOString().slice(0, 10),
            exchangeRate: s.exchangeRate,
            sumInsuredOs: s.sumInsuredOs,
            premiumOs: s.premiumOs,
            shareOfferedPct: s.shareOfferedPct,
            shareAcceptedPct: s.shareAcceptedPct,
            currency: s.currencyCode,
            country: s.country,
            insured: s.insured,
            broker: s.broker,
            cedant: s.cedant,
        };

        set({ calculating: true, error: null });
        try {
            const res = await apiFetch<FacultativeOfferCalcResponseDto>(
                '/api/facultative-offers/analyze',
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: payload,
                }
            );

            console.log('This is the retention:', res);

            // map response into form state
            const updated: Partial<OfferFormData> = {
                sumInsuredTz: res.exposureOffered, // or res.sumInsuredOs, depending on what you want
                premiumTz: res.premiumTzs, // Note the 's' at the end

                soExposureTz: res.exposureOffered,
                soPremiumTz: res.premiumOffered,
                saExposureTz: res.exposureAccepted,
                saPremiumTz: res.premiumAccepted,

                // Calculate percentages since they're not in the API response
                tanReRetentionPct: res.totalExposure ? (res.retentionExposure / res.totalExposure) * 100 : 0,
                tanReRetExposureTz: res.retentionExposure,
                tanReRetPremiumTz: res.retentionPremium,

                suRetroPct: res.totalExposure ? (res.surplusExposure / res.totalExposure) * 100 : 0,
                suRetroExposureTz: res.surplusExposure,
                suRetroPremiumTz: res.surplusPremium,

                facRetroPct: res.totalExposure ? (res.facRetroExposure / res.totalExposure) * 100 : 0,
                facRetroExposureTz: res.facRetroExposure,
                facRetroPremiumTz: res.facRetroPremium,
            };

            set((st) => ({
                ...st,
                ...updated,
                calculationStatus: res.calculationStatus,
                calculationMessage: res.message,
            }));
        } catch (e: any) {
            set({ error: e?.message || 'Calculation failed' });
        } finally {
            set({ calculating: false });
        }
    },

    // submit (persist) analysis/offer
    submitForm: async (v): Promise<boolean> => {
        set({ loading: true, error: null });
        try {

            const payload = {
                // inputs
                programId: Number(v.programId),
                contractTypeId: Number(v.contractTypeId),
                retroYear: v.periodFrom.getFullYear(),
                periodFrom: v.periodFrom.toISOString().slice(0, 10),
                periodTo: v.periodTo.toISOString().slice(0, 10),
                currency: v.currencyCode,
                exchangeRate: v.exchangeRate,
                offerReceivedDate :v.offerReceivedDate,
                cedant: v.cedant,
                broker: v.broker,
                insured: v.insured,
                occupation: v.occupation,
                country: v.country,
                sumInsuredOs: v.sumInsuredOs,
                premiumOs: v.premiumOs,
                shareOfferedPct: v.shareOfferedPct,
                shareAcceptedPct: v.shareAcceptedPct,
                notes: v.notes,

                // computed snapshot (optional)
                sumInsuredTz: v.sumInsuredTz,
                premiumTz: v.premiumTz,
                soExposureTz: v.soExposureTz,
                soPremiumTz: v.soPremiumTz,
                saExposureTz: v.saExposureTz,
                saPremiumTz: v.saPremiumTz,
                tanReRetentionPct: v.tanReRetentionPct,
                tanReRetExposureTz: v.tanReRetExposureTz,
                tanReRetPremiumTz: v.tanReRetPremiumTz,
                suRetroPct: v.suRetroPct,
                suRetroExposureTz: v.suRetroExposureTz,
                suRetroPremiumTz: v.suRetroPremiumTz,
                facRetroPct: v.facRetroPct,
                facRetroExposureTz: v.facRetroExposureTz,
                facRetroPremiumTz: v.facRetroPremiumTz,
            };


            // await apiFetch('/api/facultative-offers/save', {
            //     method: 'POST',
            //     body: payload,
            //     headers: { 'Content-Type': 'application/json' },
            //     requiresAuth: true,
            // });

            await apiFetch('/api/facultative-offers/process/start', {
                method: 'POST',
                body: payload,
                headers: { 'Content-Type': 'application/json' },
                requiresAuth: true,
            });

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
            programId: '',
            contractTypeId: '',
            country: '',
            periodFrom: new Date(),
            periodTo: new Date(),
            currencyCode: '',
            exchangeRate: 1,

            sumInsuredOs: 0,
            premiumOs: 0,
            sumInsuredTz: 0,
            premiumTz: 0,

            shareOfferedPct: 0,
            soExposureTz: 0,
            soPremiumTz: 0,

            shareAcceptedPct: 0,
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

            loading: false,
            calculating: false,
            error: null,
            calculationStatus: null,
            calculationMessage: null,
        }),
}));

export { useDropdownStore, useOfferStore };
