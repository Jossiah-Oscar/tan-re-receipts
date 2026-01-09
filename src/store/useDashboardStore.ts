
import { create } from 'zustand'
import { API_BASE_URL, apiFetch } from '@/config/api'
import type { YearlyTargetResponse } from '@/types/target'

export interface CedantGwp {
    cedantName: string
    cedantCode: string
    totalBookedPremium: number
}

export interface PremiumTrend {
    month: string
    thisYearPremium: number
    lastYearPremium: number
}

export interface CedantBalance {
    brokerCedantName: string
    balanceRepCcy: number
}

export interface CountryRisk {
    countryName: string
    contractCount: number
    premium: number
}

export interface GwpPerformanceDTO {
    category: string
    actualGwp: number | null | undefined
    target: number | null | undefined
    performancePercent: number | null | undefined
}

interface DashboardState {
    selectedYear: number
    gwp: number | null
    gwpYear: number | null

    claims: number | null
    claimYear: number | null
    gwpList: CedantGwp[]
    gwpTrends: PremiumTrend[]
    cedantBalance: CedantBalance[]
    countryRisks: CountryRisk[]
    monthlyPerformance: GwpPerformanceDTO[]
    yearlyPerformance: GwpPerformanceDTO[]
    criticalLoading: boolean
    secondaryLoading: boolean
    countryRisksLoading: boolean
    performanceLoading: boolean
    error: string | null
    performanceError: string | null

    // Yearly targets
    yearlyTarget: number | null
    monthlyTarget: number | null
    targetLoading: boolean
    targetError: string | null
    targetIsFallback: boolean
    targetFallbackYear: number | null

    setSelectedYear: (year: number) => void
    fetchCriticalData: (year?: number) => Promise<void>
    fetchSecondaryData: (year?: number) => Promise<void>
    fetchCountryRisks: (year?: number) => Promise<void>
    fetchMonthlyPerformance: (year?: number) => Promise<void>
    fetchYearlyPerformance: (year?: number) => Promise<void>
    fetchYearlyTarget: (year?: number) => Promise<void>
}

const useDashboardStore = create<DashboardState>((set, get) => ({
    selectedYear: new Date().getFullYear(),
    gwp: null,
    gwpYear: null,
    claims: null,
    claimYear: null,
    gwpList: [],
    gwpTrends: [],
    cedantBalance: [],
    countryRisks: [],
    monthlyPerformance: [],
    yearlyPerformance: [],
    criticalLoading: false,
    secondaryLoading: false,
    countryRisksLoading: false,
    performanceLoading: false,
    error: null,
    performanceError: null,
    yearlyTarget: null,
    monthlyTarget: null,
    targetLoading: false,
    targetError: null,
    targetIsFallback: false,
    targetFallbackYear: null,
    setSelectedYear: (year: number) => set({ selectedYear: year }),
    fetchCriticalData: async (year?: number) => {
        const selectedYear = year ?? get().selectedYear;
        set({ criticalLoading: true, error: null })
        try {
            const [
                gwpResponse,
                gwpYearResponse,
                claimsResponse,
                claimYearResponse
            ] = await Promise.all([
                fetch(`${API_BASE_URL}/api/dashboard/gwp?year=${selectedYear}`),
                fetch(`${API_BASE_URL}/api/dashboard/year-gwp?year=${selectedYear}`),
                fetch(`${API_BASE_URL}/api/dashboard/claims?year=${selectedYear}`),
                fetch(`${API_BASE_URL}/api/dashboard/year-claim?year=${selectedYear}`),
            ])

            const [
                gwp,
                gwpYear,
                claims,
                claimYear
            ] = await Promise.all([
                gwpResponse.json(),
                gwpYearResponse.json(),
                claimsResponse.json(),
                claimYearResponse.json(),
            ])

            set({
                gwp,
                gwpYear,
                claims,
                claimYear,
                criticalLoading: false
            })
        } catch (error) {
            set({ error: (error as Error).message, criticalLoading: false })
        }
    },
    fetchSecondaryData: async (year?: number) => {
        const selectedYear = year ?? get().selectedYear;
        set({ secondaryLoading: true })
        try {
            const [
                gwpListResponse,
                gwpTrendsResponse,
                cedantBalanceResponse
            ] = await Promise.all([
                fetch(`${API_BASE_URL}/api/dashboard/gwp/top-cedants?year=${selectedYear}`),
                fetch(`${API_BASE_URL}/api/dashboard/monthly-trend?year=${selectedYear}`),
                fetch(`${API_BASE_URL}/api/dashboard/outstanding-balances?year=${selectedYear}`),
            ])

            const [
                gwpList,
                gwpTrends,
                cedantBalance
            ] = await Promise.all([
                gwpListResponse.json(),
                gwpTrendsResponse.json(),
                cedantBalanceResponse.json(),
            ])

            set({
                gwpList,
                gwpTrends,
                cedantBalance,
                secondaryLoading: false
            })
        } catch (error) {
            set({ error: (error as Error).message, secondaryLoading: false })
        }
    },
    fetchCountryRisks: async (year?: number) => {
        const selectedYear = year ?? get().selectedYear;
        set({ countryRisksLoading: true })
        try {
            const response = await fetch(`${API_BASE_URL}/api/dashboard/country-risks?year=${selectedYear}`)
            const countryRisks = await response.json()
            set({
                countryRisks: countryRisks || [],
                countryRisksLoading: false
            })
        } catch (error) {
            set({ countryRisks: [], countryRisksLoading: false })
        }
    },
    fetchDashboardData: async () => {
        set({ criticalLoading: true, error: null })
        try {
            const [
                gwpResponse,
                gwpYearResponse,
                claimsResponse,
                claimYearResponse,
                gwpListResponse,
                gwpTrendsResponse,
                cedantBalanceResponse,
                countryRisksResponse
            ] = await Promise.all([
                fetch(`${API_BASE_URL}/api/dashboard/gwp`),
                fetch(`${API_BASE_URL}/api/dashboard/year-gwp`),
                fetch(`${API_BASE_URL}/api/dashboard/claims`),
                fetch(`${API_BASE_URL}/api/dashboard/year-claim`),
                fetch(`${API_BASE_URL}/api/dashboard/gwp/top-cedants`),
                fetch(`${API_BASE_URL}/api/dashboard/monthly-trend`),
                fetch(`${API_BASE_URL}/api/dashboard/outstanding-balances`),
                fetch(`${API_BASE_URL}/api/dashboard/country-risks`).catch(() => ({ json: async () => [] }))
            ])

            const [
                gwp,
                gwpYear,
                claims,
                claimYear,
                gwpList,
                gwpTrends,
                cedantBalance,
                countryRisks
            ] = await Promise.all([
                gwpResponse.json(),
                gwpYearResponse.json(),
                claimsResponse.json(),
                claimYearResponse.json(),
                gwpListResponse.json(),
                gwpTrendsResponse.json(),
                cedantBalanceResponse.json(),
                countryRisksResponse.json()
            ])

            set({
                gwp,
                gwpYear,
                claims,
                claimYear,
                gwpList,
                gwpTrends,
                cedantBalance,
                countryRisks: countryRisks || [],
                criticalLoading: false,
                secondaryLoading: false,
                countryRisksLoading: false
            })
        } catch (error) {
            set({ error: (error as Error).message, criticalLoading: false })
        }
    },
    fetchMonthlyPerformance: async (year?: number) => {
        const selectedYear = year ?? get().selectedYear;
        set({ performanceLoading: true, performanceError: null })
        try {
            const response = await fetch(`${API_BASE_URL}/api/dashboard/month/performance?year=${selectedYear}`)
            const data = await response.json()
            set({
                monthlyPerformance: data || [],
                performanceLoading: false
            })
        } catch (error) {
            set({ performanceError: (error as Error).message, performanceLoading: false })
        }
    },
    fetchYearlyPerformance: async (year?: number) => {
        const selectedYear = year ?? get().selectedYear;
        set({ performanceLoading: true, performanceError: null })
        try {
            const response = await fetch(`${API_BASE_URL}/api/dashboard/year/performance?year=${selectedYear}`)
            const data = await response.json()
            set({
                yearlyPerformance: data || [],
                performanceLoading: false
            })
        } catch (error) {
            set({ performanceError: (error as Error).message, performanceLoading: false })
        }
    },
    fetchYearlyTarget: async (year?: number) => {
        const selectedYear = year ?? get().selectedYear;
        set({ targetLoading: true, targetError: null });

        try {
            const response = await apiFetch<YearlyTargetResponse>(`/api/targets/${selectedYear}`);

            set({
                yearlyTarget: response.targetAmount,
                monthlyTarget: response.targetAmount / 12,
                targetIsFallback: response.isFallback || false,
                targetFallbackYear: response.fallbackYear || null,
                targetLoading: false
            });
        } catch (error) {
            // Fallback to hardcoded value on error
            console.error('Error fetching target, using fallback:', error);
            const fallback = 336_903_845_564;
            set({
                yearlyTarget: fallback,
                monthlyTarget: fallback / 12,
                targetIsFallback: false,
                targetFallbackYear: null,
                targetError: (error as Error).message,
                targetLoading: false
            });
        }
    }
}))

export default useDashboardStore
