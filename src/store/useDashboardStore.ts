
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

interface DashboardState {
    gwp: number | null
    gwpYear: number | null

    claims: number | null
    claimYear: number | null
    gwpList: CedantGwp[]
    gwpTrends: PremiumTrend[]
    cedantBalance: CedantBalance[]
    countryRisks: CountryRisk[]
    loading: boolean
    error: string | null
    fetchDashboardData: () => Promise<void>
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
    loading: false,
    error: null,
    fetchDashboardData: async () => {
        set({ loading: true, error: null })
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
                loading: false
            })
        } catch (error) {
            set({ error: (error as Error).message, loading: false })
        }
    }
}))

export default useDashboardStore
