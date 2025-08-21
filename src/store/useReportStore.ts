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

interface BrokerCedant {
    BROKER_CEDANT_CODE: string;
    BROKER_CEDANT_NAME: string;
}


interface ReportStore {
    // variables
    clientFormData: ClientFormData,
    clients: BrokerCedant[];


    //actions
    setClientFormData: (data: Partial<ClientFormData>) => void,
    getClientFormInitialValues: () => ClientFormData,
    setClients: (clients: BrokerCedant[]) => void;
    loadDropdownData: () => Promise<void>;
    handleDownload: (params: Parameters<ReportHandler>[0]) => Promise<void>;
    getClientSelectData: () => { value: string; label: string }[];
}




const useReportStore = create<ReportStore>((set,get) => ({
    clientFormData: {
        brokerCode: "",
        brokerName: "",
        startDate: null,
        endDate: null,
        reportType: ''
    },

    clients: [],


    setClients: (clients: BrokerCedant[]) => set({clients}),

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
            const clients: BrokerCedant[] = await res.json();

            // 4) Store it in state
            setClients(clients);
        } catch (err: any) {
            console.error(err);
            throw err;
        }
    },

    handleDownload: async (params: Parameters<ReportHandler>[0]) => {
        try {
            const handler = reportHandlers[params.reportType];
            if (!handler) throw new Error(`Unknown report type: ${params.reportType}`);
            await handler(params);
        } catch (err) {
            console.error("Download failed", err);
            throw err;
        }
    },
    // handleDownload: async (clientName:string, clientCode:string, startDate: Date|null, endDate: Date | null, reportType?: string) => {
    //     try {
    //         // Build query parameters
    //         const queryParams = new URLSearchParams();
    //         queryParams.append('clientCode', clientCode);
    //
    //         // Format dates to YYYY-MM-DD or your preferred format
    //         if (startDate) {
    //             const formattedStartDate = startDate.toISOString().split('T')[0]; // YYYY-MM-DD
    //             queryParams.append('start', formattedStartDate);
    //         }
    //
    //         if (endDate) {
    //             const formattedEndDate = endDate.toISOString().split('T')[0]; // YYYY-MM-DD
    //             queryParams.append('end', formattedEndDate);
    //         }
    //
    //         // Determine endpoint based on report type
    //         let endpoint: string;
    //
    //         switch (reportType) {
    //             case 'broker_outstanding':
    //                 endpoint = 'broker-statement-of-account';
    //                 break;
    //             case 'cedant_outstanding':
    //                 endpoint = 'cedant-statement-of-account';
    //                 break;
    //             default:
    //                 endpoint = 'cedant-statement-of-account';
    //                 break;
    //         }
    //
    //
    //         const res = await fetch(
    //             `${API_BASE_URL}/api/reports/outstanding/${endpoint}?${queryParams.toString()}`,
    //             { method: 'GET' }
    //         );
    //         if (!res.ok) {
    //             throw new Error(`Server error: ${res.status}`);
    //         }
    //
    //         const blob = await res.blob();
    //
    //         const today = new Date();
    //         const formattedDate = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`;
    //         let filename = `SOA-${clientName}_${formattedDate}.xlsx`;
    //
    //
    //         const url = window.URL.createObjectURL(blob);
    //         const a = document.createElement('a');
    //         a.href = url;
    //         a.download = filename;
    //         document.body.appendChild(a);
    //         a.click();
    //
    //         a.remove();
    //         window.URL.revokeObjectURL(url);
    //     } catch (err: any) {
    //         console.error('Download failed', err);
    //         throw err;
    //     }
    // },

    getClientSelectData: () => {
        const { clients } = get();
        return clients.map(client => ({
            value: client.BROKER_CEDANT_CODE,
            label: `${client.BROKER_CEDANT_NAME} (${client.BROKER_CEDANT_CODE})`,
        }));
    },

}));


export {useReportStore}
