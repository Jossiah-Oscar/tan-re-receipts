export interface ClaimFinanceDocStatus {
    claimDocuments: {
        id: number;
        brokerCedant: string;
        insured: string;
        contractNumber: string;
        claimNumber: string;
        lossDate: string; // ISO date string from Java LocalDate
        underwritingYear: number;
        sequenceNo: number;
        status: {
            id: number;
            name: string;
            description?: string;
            active: boolean;
        };
        createdAt: string; // ISO datetime string
        updatedAt: string;
    };
    claimDocumentFinanceStatus: {
        id: number;
        name: string;
        label: string;
        description?: string;
        active: boolean;
        requiresComment: boolean;
        mainStatus: {
            id: number;
            name: string;
            description?: string;
            active: boolean;
        };
    };
}