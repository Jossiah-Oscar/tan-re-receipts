import {create} from "zustand";
import {API_BASE_URL} from "@/config/api";
import {ReportHandler, reportHandlers} from "@/components/reports/handlers";

interface ClientFormData {
    brokerCode: string,
    brokerName: string,
    startDate: Date | null;
    endDate: Date | null;
    reportType?: string; // Add this line
}




const reportEndpoints: Record<string, string> = {
    broker_outstanding: "broker-statement-of-account",
    cedant_outstanding: "cedant-statement-of-account",
    // add more here as you grow
};

interface ReportType {
    reportType: string;
    reportName: string;
}

interface Client {
    BROKER_CEDANT_CODE: string;
    BROKER_CEDANT_NAME: string;
    BROKER_CEDANT_TYPE: string;
}


interface ReportStore {
    // variables
    clientFormData: ClientFormData,
    clients: Client[];
    brokers: Client[];
    cedants: Client[];
    downloading: boolean;
    downloadProgress: number;



    //actions
    setClientFormData: (data: Partial<ClientFormData>) => void,
    getClientFormInitialValues: () => ClientFormData,
    setClients: (clients: Client[]) => void;
    setBrokers: (brokers: Client[]) => void;
    setCedants: (cedants: Client[]) => void;
    loadDropdownData: () => Promise<void>;
    handleDownload: (params: Parameters<ReportHandler>[0]) => Promise<void>;
    getClientSelectData: () => { value: string; label: string }[];
    getBrokerSelectData: () => { value: string; label: string }[];
    getCedantSelectData: () => { value: string; label: string }[];
    setDownloading: (downloading: boolean) => void;
    setDownloadProgress: (progress: number) => void;

}


const useReportStore = create<ReportStore>((set,get) => ({
    clientFormData: {
        brokerCode: "",
        brokerName: "",
        startDate: null,
        endDate: null,
        reportType: '',
    },

    clients: [],
    brokers: [],
    cedants: [],


    downloading: false,
    downloadProgress: 0,

    setDownloading: (downloading: boolean) => set({ downloading }),
    setDownloadProgress: (progress: number) => set({ downloadProgress: progress }),



    setClients: (clients: Client[]) => {
        set({ clients });
        // Automatically filter and set brokers and cedants
        const brokers = clients.filter(client =>
            client.BROKER_CEDANT_TYPE?.trim() === 'B'
        );
        const cedants = clients.filter(client =>
            client.BROKER_CEDANT_TYPE?.trim() === 'C'
        );


        set({ brokers, cedants });
    },
    setBrokers: (brokers: Client[]) => set({ brokers }),
    setCedants: (cedants: Client[]) => set({ cedants }),



    getClientFormInitialValues: (): ClientFormData => {
        const state = get();
        return {
            ...state.clientFormData,
        }
    },

    setClientFormData: (data: Partial<ClientFormData>) => set((state) => ({
        ...state,
        clientFormData: {
            ...state.clientFormData,
            ...data
        }

    })),

    loadDropdownData: async () => {
        const { setClients } = get();

        try {
            // 1) Fetch the response
            const res = await fetch(`${API_BASE_URL}/api/client/list`, { method: 'GET' });

            // 2) Make sure it succeeded
            if (!res.ok) {
                throw new Error(`Failed to load clients: ${res.status} ${res.statusText}`);
            }

            // 3) Parse the JSON body as your BrokerCedant[]
            const clients: Client[] = await res.json();

            // 4) Store it in state
            setClients(clients);
        } catch (err: any) {
            console.error(err);
            throw err;
        }
    },

    handleDownload: async (params: Parameters<ReportHandler>[0]) => {
        const { setDownloading, setDownloadProgress } = get();

        setDownloading(true);
        setDownloadProgress(0);

        try {
            setDownloadProgress(25);
            const handler = reportHandlers[params.reportType];

            if (!handler) throw new Error(`Unknown report type: ${params.reportType}`);
            setDownloadProgress(50);

            await handler(params);
            setDownloadProgress(75);


            setDownloadProgress(100);
        } catch (err) {
            console.error("Download failed", err);
            throw err;
        } finally {
            setTimeout(() => {
                setDownloading(false);
                setDownloadProgress(0);
            }, 1000);

        }
    },

    getClientSelectData: () => {
        const { clients } = get();
        return clients.map(client => ({
            value: client.BROKER_CEDANT_CODE,
            label: `${client.BROKER_CEDANT_NAME} (${client.BROKER_CEDANT_CODE})`
        }));
    },

    getBrokerSelectData: () => {
        const { brokers } = get();
        return brokers.map(broker => ({
            value: broker.BROKER_CEDANT_CODE,
            label: `${broker.BROKER_CEDANT_NAME} (${broker.BROKER_CEDANT_CODE})`
        }));
    },

    getCedantSelectData: () => {
        const { cedants } = get();
        return cedants.map(cedant => ({
            value: cedant.BROKER_CEDANT_CODE,
            label: `${cedant.BROKER_CEDANT_NAME} (${cedant.BROKER_CEDANT_CODE})`
        }));
    },


}));


export {useReportStore}
