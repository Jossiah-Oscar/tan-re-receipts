import { create } from 'zustand'
import {apiFetch} from "@/config/api";

// Type definitions
interface BusinessClass {
    id: number;
    name: string;
}

interface BusinessClass {
    id: number;
    name: string;
}

interface Currency {
    code: string;
    name: string;
    exchange_rate: number;
}

interface BrokerCedant {
    brokerCedantCode: string;
    brokerCedantName: string;
}

interface ContractType {
    id: number;
    name: string;
}


interface DropdownStore {
    classes: BusinessClass[];
    currencies: Currency[];
    contractTypes: ContractType[];
    broker: BrokerCedant[];
    cedants: BrokerCedant[];
    loading: boolean;
    error: string | null;
    setClasses: (cls: BusinessClass[]) => void;
    setBroker: (br: BrokerCedant[]) => void;
    setCedants: (cd: BrokerCedant[]) => void;
    setCurrencies: (curr: Currency[]) => void;
    setContractTypes: (types: ContractType[]) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    loadDropdownData: () => Promise<void>;
    getClassSelectData: () => { value: string; label: string }[];
    getCurrencySelectData: () => { value: string; label: string }[];
    getContractTypeSelectData: () => { value: string; label: string }[];
    getBrokerSelectData: () => { value: string; label: string }[];
    getCedantSelectData: () => { value: string; label: string }[];
}

const useDropdownStore = create<DropdownStore>((set, get) => ({
    classes: [],
    currencies: [],
    contractTypes: [],
    cedants: [],
    broker:[],
    loading: false,
    error: null,

    setClasses: (cls: BusinessClass[]) => set({ classes: cls }),
    setCurrencies: (curr: Currency[]) => set({ currencies: curr }),
    setContractTypes: (types: ContractType[]) => set({ contractTypes: types }),
    setBroker: (br: BrokerCedant[]) => set({broker:br}),
    setCedants: (cd: BrokerCedant[]) => set({cedants:cd}),
    setLoading: (loading: boolean) => set({ loading }),
    setError: (error: string | null) => set({ error }),

    // Load all dropdown data
    loadDropdownData: async () => {
        const { setLoading, setError, setClasses, setCurrencies, setContractTypes,setCedants, setBroker } = get();

        setLoading(true);
        setError(null);

        try {
            // Load all data in parallel
            const [classesData, currenciesData, contractTypesData, brokerData, cedantData] = await Promise.all([
                apiFetch<BusinessClass[]>('/api/business-classes'),
                apiFetch<Currency[]>('/api/currencies'),
                apiFetch<ContractType[]>('/api/contract-types'),
                apiFetch<BrokerCedant[]>('/api/broker-cedants/brokers'),
                apiFetch<BrokerCedant[]>('/api/broker-cedants/cedants')

            ]);

            // Log successful data load
            console.log('Loaded dropdown data:', {
                classes: classesData?.length,
                currencies: currenciesData?.length,
                contractTypes: contractTypesData?.length
            });

            // Update store with fetched data
            setClasses(classesData);
            setCurrencies(currenciesData);
            setContractTypes(contractTypesData);
            setBroker(brokerData);
            setCedants(cedantData);

        } catch (err: any) {
            console.error('Dropdown load error:', err);
            setError(err.message || 'Unknown error loading dropdowns');

            // Re-throw to allow error handling in components
            throw err;
        } finally {
            setLoading(false);
        }
    }

,

    // Transform data for Mantine Select components
    getClassSelectData: () => {
        const { classes } = get();
        return classes.map(cls => ({ value: cls.id.toString(), label: cls.name }));
    },

    getCurrencySelectData: () => {
        const { currencies } = get();
        return currencies.map(curr => ({
            value: curr.code,
            label: `${curr.name} (${curr.code})`
        }));
    },

    getContractTypeSelectData: () => {
        const { contractTypes } = get();
        return contractTypes.map(type => ({
            value: type.id.toString(),
            label: type.name
        }));
    },

    getBrokerSelectData: () => {
        const { broker } = get();
        return broker.map(type => ({
            value: type.brokerCedantCode,
            label: type.brokerCedantName
        }));
    },

    getCedantSelectData: () => {
        const { cedants } = get();
        return cedants.map(type => ({
            value: type.brokerCedantCode,
            label: type.brokerCedantName
        }));
    },
}));

export interface FacultativeOfferCalcResponseDto {
    businessClassId:       number;
    contractTypeId:        number;

    // 1) Converted to Tz
    sumInsuredTz:          number;
    premiumTz:             number;

    // 2) Shares
    soExposureTz:          number;
    soPremiumTz:           number;
    saExposureTz:          number;
    saPremiumTz:           number;

    // 3) TAN-RE
    tanReRetentionPct:     number;
    tanReRetExposureTz:    number;
    tanReRetPremiumTz:     number;

    // 4) Surplus Retro
    suRetroPct:            number;
    suRetroExposureTz:     number;
    suRetroPremiumTz:      number;

    // 5) Facultative Retro
    facRetroPct:           number;
    facRetroExposureTz:    number;
    facRetroPremiumTz:     number;

    // status & messaging
    calculationStatus:     'SUCCESS' | 'WARNING' | 'ERROR';
    message:               string;

    // program transparency
    retentionAmount:       number;
    treatyLimit:           number;
    totalTreatyCapacity:   number;
}

interface OfferFormData {
    cedant: string;
    dateTimeCreated: Date;
    insured: string;
    occupation: string;
    businessClassId: string;
    contractTypeId: string;
    country: string;
    periodFrom: Date;
    periodTo: Date;
    currencyCode: string;
    exchangeRate: number;
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

// Enhanced Zustand store for form state with all form logic
const useOfferStore = create<OfferStore>((set, get) => ({
    // Form data
    cedant: '',
    dateTimeCreated: new Date(),
    insured: '',
    occupation: '',
    businessClassId: '',
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

    // UI state
    loading: false,
    calculating: false,
    error: null,

    //Calculation Status State
    calculationStatus: null,
    calculationMessage: null,
    setCalculationStatus: (status) => set({ calculationStatus: status }),
    setCalculationMessage: (message) => set({ calculationMessage: message }),


    // Actions
    setValues: (values: Partial<OfferFormData>) => set((state) => ({
        ...state,
        ...values
    })),

    setLoading: (loading: boolean) => set({ loading }),
    setCalculating: (calculating: boolean) => set({ calculating }),
    setError: (error: string | null) => set({ error }),

    // Get initial values for Mantine form
    getInitialValues: (): OfferFormData => {
        const state = get();
        return {
            cedant: state.cedant,
            dateTimeCreated: state.dateTimeCreated,
            insured: state.insured,
            occupation: state.occupation,
            businessClassId: state.businessClassId,
            contractTypeId: state.contractTypeId,
            country: state.country,
            periodFrom: state.periodFrom,
            periodTo: state.periodTo,
            currencyCode: state.currencyCode,
            exchangeRate: state.exchangeRate,
            sumInsuredOs: state.sumInsuredOs,
            premiumOs: state.premiumOs,
            sumInsuredTz: state.sumInsuredTz,
            premiumTz: state.premiumTz,
            shareOfferedPct: state.shareOfferedPct,
            soExposureTz: state.soExposureTz,
            soPremiumTz: state.soPremiumTz,
            shareAcceptedPct: state.shareAcceptedPct,
            saExposureTz: state.saExposureTz,
            saPremiumTz: state.saPremiumTz,
            tanReRetentionPct: state.tanReRetentionPct,
            tanReRetExposureTz: state.tanReRetExposureTz,
            tanReRetPremiumTz: state.tanReRetPremiumTz,
            suRetroPct: state.suRetroPct,
            suRetroExposureTz: state.suRetroExposureTz,
            suRetroPremiumTz: state.suRetroPremiumTz,
            facRetroPct: state.facRetroPct,
            facRetroExposureTz: state.facRetroExposureTz,
            facRetroPremiumTz: state.facRetroPremiumTz,
        };
    },

    // Validation logic
    validateForm: (values: OfferFormData): Record<string, string> => {
        const errors: Record<string, string> = {};

        if (!values.cedant) errors.cedant = 'Cedant is required';
        if (!values.insured) errors.insured = 'Insured is required';
        if (!values.occupation) errors.occupation = 'Occupation is required';
        if (!values.businessClassId) errors.businessClassId = 'Business class is required';
        if (!values.contractTypeId) errors.contractTypeId = 'Contract type is required';
        if (!values.country) errors.country = 'Country is required';
        if (!values.currencyCode) errors.currencyCode = 'Currency is required';
        if (values.exchangeRate <= 0) errors.exchangeRate = 'Exchange rate must be greater than 0';
        if (values.periodFrom >= values.periodTo) errors.periodTo = 'Period To must be after Period From';

        return errors;
    },

    // Calculate values using backend
    calculateValues: async () => {
        const {
            businessClassId,
            contractTypeId,
            periodFrom,
            exchangeRate,
            sumInsuredOs,
            premiumOs,
            shareOfferedPct,
            shareAcceptedPct,
            setCalculationStatus,
            setCalculationMessage,
            setCalculating,
            setError,
            setValues,
        } = get();

        setCalculating(true);
        setError(null);

        // Build the request DTO
        const payload: Record<string, unknown> = {
            businessClassId:   Number(businessClassId),
            contractTypeId:    Number(contractTypeId),
            periodFrom:        periodFrom.toISOString().slice(0, 10), // "YYYY-MM-DD"
            exchangeRate,
            sumInsuredOs,
            premiumOs,
            shareOfferedPct,
            shareAcceptedPct,
        };

        try {
            const res = await apiFetch<FacultativeOfferCalcResponseDto>(
                '/api/facultative-offer-analysis/calculate',
                {
                    method:  'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body:    payload,
                }
            );

            console.log('Calculate Response:', res);


            // Update all calculated values in the store
            const updatedValues: Partial<OfferFormData> = {
                // Converted amounts
                sumInsuredTz: res.sumInsuredTz,
                premiumTz: res.premiumTz,

                // Share calculations
                soExposureTz: res.soExposureTz,
                soPremiumTz: res.soPremiumTz,
                saExposureTz: res.saExposureTz,
                saPremiumTz: res.saPremiumTz,

                // TAN-RE retention
                tanReRetentionPct: res.tanReRetentionPct,
                tanReRetExposureTz: res.tanReRetExposureTz,
                tanReRetPremiumTz: res.tanReRetPremiumTz,

                // Surplus retro
                suRetroPct: res.suRetroPct,
                suRetroExposureTz: res.suRetroExposureTz,
                suRetroPremiumTz: res.suRetroPremiumTz,

                // Facultative retro
                facRetroPct: res.facRetroPct,
                facRetroExposureTz: res.facRetroExposureTz,
                facRetroPremiumTz: res.facRetroPremiumTz,
            };

            // Update the store
            setValues(updatedValues);

            // Store calculation status and message
            setCalculationStatus(res.calculationStatus);
            setCalculationMessage(res.message);

        } catch (err: any) {
            setError(err.message);
        } finally {
            setCalculating(false);
        }
    },

    // Submit form
    submitForm: async (values: OfferFormData): Promise<boolean> => {
        const { setLoading, setError, setValues } = get();

        setLoading(true);
        setError(null);

        const payload: Record<string, unknown> = {
            // raw inputs
            cedant:           values.cedant,
            dateTimeCreated:  values.dateTimeCreated.toISOString(),
            insured:          values.insured,
            occupation:       values.occupation,
            businessClassId:  Number(values.businessClassId),
            contractTypeId:   Number(values.contractTypeId),
            country:          values.country,
            periodFrom:       values.periodFrom.toISOString().slice(0,10),
            periodTo:         values.periodTo.toISOString().slice(0,10),
            currencyCode:     values.currencyCode,
            exchangeRate:     values.exchangeRate,
            sumInsuredOs:     values.sumInsuredOs,
            premiumOs:        values.premiumOs,
            shareOfferedPct:  values.shareOfferedPct,
            shareAcceptedPct: values.shareAcceptedPct,

            // computed fields
            sumInsuredTz:         values.sumInsuredTz,
            premiumTz:            values.premiumTz,
            soExposureTz:         values.soExposureTz,
            soPremiumTz:          values.soPremiumTz,
            saExposureTz:         values.saExposureTz,
            saPremiumTz:          values.saPremiumTz,
            tanReRetentionPct:    values.tanReRetentionPct,
            tanReRetExposureTz:   values.tanReRetExposureTz,
            tanReRetPremiumTz:    values.tanReRetPremiumTz,
            suRetroPct:           values.suRetroPct,
            suRetroExposureTz:    values.suRetroExposureTz,
            suRetroPremiumTz:     values.suRetroPremiumTz,
            facRetroPct:          values.facRetroPct,
            facRetroExposureTz:   values.facRetroExposureTz,
            facRetroPremiumTz:    values.facRetroPremiumTz,
        };

        try {
            // Update store with form values
            setValues(values);

            const res = await apiFetch('/api/facultative-offer-analysis', {
                method: "POST",
                body: payload,
                requiresAuth: true
            });

            if (!res.ok) {
                throw new Error('Failed to save offer analysis');
            }

            return true;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to save offer analysis';
            setError(errorMessage);
            return false;
        } finally {
            setLoading(false);
        }
    },

    // Reset form to initial state
    resetForm: () => set({
        cedant: '',
        dateTimeCreated: new Date(),
        insured: '',
        occupation: '',
        businessClassId: '',
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
    }),

    updateCurrencyAndExchangeRate: (currencyCode: string) => {
        const { currencies } = useDropdownStore.getState();
        const selectedCurrency = currencies.find(curr => curr.code === currencyCode);

        console.log('Full currency object:', selectedCurrency); // Let's see the complete object structure

        if (selectedCurrency) {
            // The property might be named differently, like 'rate', 'value', or 'exchangeRate'
            console.log('Currency object keys:', Object.keys(selectedCurrency));

            set(state => ({
                ...state,
                currencyCode,
                exchangeRate: Number(selectedCurrency.exchange_rate) // We'll adjust this based on the actual property name
            }));
        }
    }


}));

export { useDropdownStore, useOfferStore };