import {API_BASE_URL, API_BASE_URl_DOC, apiFetch} from "@/config/api";

async function downloadFile(res: Response, filename: string) {
    if (!res.ok) throw new Error(`Server error: ${res.status}`);
    const blob = await res.blob();

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
}

export type ReportType = keyof typeof reportHandlers;
export type ReportHandler = (params: {
    reportType: ReportType;
    clientName?: string;
    clientCode?: string;
    startDate?: Date | null;
    endDate?: Date | null;
    contractNumber?: string;
    insuredName?: string;
    brokerCode?: string;
    userName?: string;
    underwritingYear?:number;
}) => Promise<void>;


// --- Broker Outstanding ---
export const brokerOutstandingHandler: ReportHandler = async ({
  clientName = "",
  clientCode = "",
  startDate,
  endDate,
}) => {
    const queryParams = new URLSearchParams();
    queryParams.append("clientCode", clientCode);
    if (startDate) queryParams.append("start", startDate.toISOString().split("T")[0]);
    if (endDate) queryParams.append("end", endDate.toISOString().split("T")[0]);

    const res = await fetch(
        `${API_BASE_URL}/api/reports/outstanding/broker-statement-of-account?${queryParams.toString()}`,
        {method: "GET"}
    );

    const today = new Date();
    const formattedDate = `${String(today.getDate()).padStart(2, "0")}-${String(
        today.getMonth() + 1
    ).padStart(2, "0")}-${today.getFullYear()}`;
    const filename = `Broker-SOA-${clientName}_${formattedDate}.xlsx`;

    await downloadFile(res, filename);
};

// --- Cedant Outstanding ---
export const cedantOutstandingHandler: ReportHandler = async ({
  clientName = "",
  clientCode = "",
  startDate,
  endDate,
}) => {
    const queryParams = new URLSearchParams();
    queryParams.append("clientCode", clientCode);
    if (startDate) queryParams.append("start", startDate.toISOString().split("T")[0]);
    if (endDate) queryParams.append("end", endDate.toISOString().split("T")[0]);

    const res = await fetch(
        `${API_BASE_URL}/api/reports/outstanding/cedant-statement-of-account?${queryParams.toString()}`,
        {method: "GET"}
    );

    const today = new Date();
    const formattedDate = `${String(today.getDate()).padStart(2, "0")}-${String(
        today.getMonth() + 1
    ).padStart(2, "0")}-${today.getFullYear()}`;
    const filename = `Cedant-SOA-${clientName}_${formattedDate}.xlsx`;

    await downloadFile(res, filename);
};


// --- TAN-RE Outstanding ---
export const tanreOutstandingHandler: ReportHandler = async ({
                                                                  startDate,
                                                                  endDate,
    clientCode = "",
    brokerCode = "",
    contractNumber = "",
    insuredName = "",
    underwritingYear

                                                              }) => {
    const queryParams = new URLSearchParams();
    if (startDate) queryParams.append("start", startDate.toISOString().split("T")[0]);
    if (endDate) queryParams.append("end", endDate.toISOString().split("T")[0]);if (clientCode) queryParams.append("clientCode", clientCode);
    if (brokerCode) queryParams.append("brokerCode", brokerCode);
    if (contractNumber) queryParams.append("contractNumber", contractNumber);
    if (insuredName) queryParams.append("insuredName", insuredName);
    if (underwritingYear !== undefined) {
        queryParams.append("underwritingYear", underwritingYear.toString());
    }


    const res = await fetch(
        `${API_BASE_URL}/api/reports/outstanding?${queryParams.toString()}`,
        {method: "GET"}
    );

    const today = new Date();
    const formattedDate = `${String(today.getDate()).padStart(2, "0")}-${String(
        today.getMonth() + 1
    ).padStart(2, "0")}-${today.getFullYear()}`;
    const filename = `OUTSTANDING_REPORT_${formattedDate}.xlsx`;

    await downloadFile(res, filename);
};

//---- Claim Document Report ----
export const claimDocumentsHandler: ReportHandler = async ({
                                                                 startDate,
                                                                 endDate,
                                                             }) => {
    const queryParams = new URLSearchParams();
    if (startDate) queryParams.append("start", startDate.toISOString().split("T")[0]);
    if (endDate) queryParams.append("end", endDate.toISOString().split("T")[0]);

    // Use direct fetch instead of apiFetch for file downloads
    const res = await fetch(
        `${API_BASE_URl_DOC}/api/reports/claim-documents?${queryParams.toString()}`,
        {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("jwt")}`
            }
        }
    );


    const today = new Date();
    const formattedDate = `${String(today.getDate()).padStart(2, "0")}-${String(
        today.getMonth() + 1
    ).padStart(2, "0")}-${today.getFullYear()}`;
    const filename = `CLAIM_DOCUMENT_REPORT_${formattedDate}.xlsx`;

    await downloadFile(res, filename);
};


//---- Debit Credit Note Report ----
export const debitNoteReportHandler: ReportHandler = async ({
                                                                startDate,
                                                                endDate,
                                                                userName
                                                            }) => {
    const queryParams = new URLSearchParams();
    if (startDate) queryParams.append("start", startDate.toISOString().split("T")[0]);
    if (endDate) queryParams.append("end", endDate.toISOString().split("T")[0]);
    if (userName) queryParams.append("userName", userName);


    const res = await fetch(
        `${API_BASE_URl_DOC}/api/reports/debit-note?${queryParams.toString()}`,
        {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("jwt")}`
            }
        }
    );


    const today = new Date();
    const formattedDate = `${String(today.getDate()).padStart(2, "0")}-${String(
        today.getMonth() + 1
    ).padStart(2, "0")}-${today.getFullYear()}`;
    const filename = `DEBIT-CREDIT-NOTE_REPORT_${formattedDate}.xlsx`;

    await downloadFile(res, filename);
};


// Registry of handlers
export const reportHandlers: Record<string, ReportHandler> = {
    broker_outstanding: brokerOutstandingHandler,
    cedant_outstanding: cedantOutstandingHandler,
    tanre_outstanding: tanreOutstandingHandler,
    claim_documents: claimDocumentsHandler,
    debit_note_report: debitNoteReportHandler,
};
