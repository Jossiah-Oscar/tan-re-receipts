export interface YearlyTarget {
    id: number;
    year: number;
    targetAmount: number;
    createdAt: string;
    updatedAt: string;
    createdBy: string | null;
    updatedBy: string | null;
    notes: string | null;
}

export interface YearlyTargetResponse {
    year: number;
    targetAmount: number;
    isFallback: boolean;
    fallbackYear?: number;
}
