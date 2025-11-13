
import { create } from 'zustand'
import { API_BASE_URL } from '@/config/api'

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
    fetchCriticalData: () => Promise<void>
    fetchSecondaryData: () => Promise<void>
    fetchCountryRisks: () => Promise<void>
    fetchMonthlyPerformance: () => Promise<void>
    fetchYearlyPerformance: () => Promise<void>
}

const useDashboardStore = create<DashboardState>((set) => ({
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
    fetchCriticalData: async () => {
        set({ criticalLoading: true, error: null })
        try {
            const [
                gwpResponse,
                gwpYearResponse,
                claimsResponse,
                claimYearResponse
            ] = await Promise.all([
                fetch(`${API_BASE_URL}/api/dashboard/gwp`),
                fetch(`${API_BASE_URL}/api/dashboard/year-gwp`),
                fetch(`${API_BASE_URL}/api/dashboard/claims`),
                fetch(`${API_BASE_URL}/api/dashboard/year-claim`),
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
    fetchSecondaryData: async () => {
        set({ secondaryLoading: true })
        try {
            const [
                gwpListResponse,
                gwpTrendsResponse,
                cedantBalanceResponse
            ] = await Promise.all([
                fetch(`${API_BASE_URL}/api/dashboard/gwp/top-cedants`),
                fetch(`${API_BASE_URL}/api/dashboard/monthly-trend`),
                fetch(`${API_BASE_URL}/api/dashboard/outstanding-balances`),
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
    fetchCountryRisks: async () => {
        set({ countryRisksLoading: true })
        try {
            const response = await fetch(`${API_BASE_URL}/api/dashboard/country-risks`)
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
    fetchMonthlyPerformance: async () => {
        set({ performanceLoading: true, performanceError: null })
        try {
            const response = await fetch(`${API_BASE_URL}/api/dashboard/month/performance`)
            const data = await response.json()
            set({
                monthlyPerformance: data || [],
                performanceLoading: false
            })
        } catch (error) {
            set({ performanceError: (error as Error).message, performanceLoading: false })
        }
    },
    fetchYearlyPerformance: async () => {
        set({ performanceLoading: true, performanceError: null })
        try {
            const response = await fetch(`${API_BASE_URL}/api/dashboard/year/performance`)
            const data = await response.json()
            set({
                yearlyPerformance: data || [],
                performanceLoading: false
            })
        } catch (error) {
            set({ performanceError: (error as Error).message, performanceLoading: false })
        }
    }
}))

export default useDashboardStore
