"use client";

import { useEffect, useState, useMemo, lazy, Suspense } from "react";
import {
    Container,
    Grid,
    Loader,
    Center,
    Text,
    Paper,
    Group,
    Badge,
    Title,
    SimpleGrid,
    Card,
    ThemeIcon,
    Stack,
    Progress,
    Tabs,
    Alert,
} from "@mantine/core";
import {
    IconTrendingUp,
    IconAlertTriangle,
    IconCoin,
    IconChartBar,
    IconMapPin,
    IconFileAnalytics,
    IconCalendar,
} from "@tabler/icons-react";
import { StatCard } from "@/components/dashboard/gwpCard";
import { ClaimStatCard } from "@/components/dashboard/claimCard";
import { formatShortNumber } from "@/utils/format";
import { BarChart, CartesianGrid, XAxis, YAxis, Legend, Bar, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import useDashboardStore from "@/store/useDashboardStore";
import GlobalRiskDistribution from "@/components/dashboard/GlobalRiskDistribution";

// Code-split modal component for better initial bundle size
const PerformanceBreakdownModal = lazy(() =>
    import("@/components/dashboard/PerformanceBreakdownModal")
);

// Fallback component for modal loading state
const ModalFallback = () => (
    <div style={{ padding: "20px", textAlign: "center" }}>
        <Loader size="sm" />
    </div>
);

export default function Dashboard() {
    const {
        selectedYear,
        setSelectedYear,
        gwp,
        gwpYear,
        claims,
        claimYear,
        gwpList,
        gwpTrends,
        cedantBalance,
        countryRisks,
        monthlyPerformance,
        yearlyPerformance,
        criticalLoading,
        secondaryLoading,
        countryRisksLoading,
        performanceLoading,
        performanceError,
        yearlyTarget,
        monthlyTarget,
        targetLoading,
        targetIsFallback,
        targetFallbackYear,
        fetchCriticalData,
        fetchSecondaryData,
        fetchCountryRisks,
        fetchMonthlyPerformance,
        fetchYearlyPerformance,
        fetchYearlyTarget,
    } = useDashboardStore();

    const [monthlyModalOpen, setMonthlyModalOpen] = useState(false);
    const [yearlyModalOpen, setYearlyModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<string | null>("overview");

    // Phase 1: Load critical data first
    useEffect(() => {
        fetchCriticalData();
        fetchYearlyTarget();
    }, [fetchCriticalData, fetchYearlyTarget]);

    // Phase 2: Load secondary data after critical data loads
    useEffect(() => {
        if (!criticalLoading && (gwpList.length === 0 && gwpTrends.length === 0)) {
            fetchSecondaryData();
        }
    }, [criticalLoading, fetchSecondaryData, gwpList.length, gwpTrends.length]);

    // Refetch data when year changes
    useEffect(() => {
        fetchCriticalData(selectedYear);
        fetchSecondaryData(selectedYear);
        fetchCountryRisks(selectedYear);
        fetchMonthlyPerformance(selectedYear);
        fetchYearlyPerformance(selectedYear);
        fetchYearlyTarget(selectedYear);
    }, [selectedYear]);

    // Memoize expensive computations (must be before any conditional returns)
    const topCedantsData = useMemo(
        () =>
            gwpList.slice(0, 5).map((cedant) => ({
                name: cedant.cedantName,
                value: cedant.totalBookedPremium,
            })),
        [gwpList]
    );

    const COLORS = useMemo(
        () => ["#3b82f6", "#7c3aed", "#06b6d4", "#10b981", "#f59e0b"],
        []
    );

    const portfolioConcentration = useMemo(
        () =>
            topCedantsData.length > 0
                ? (topCedantsData.reduce((sum, c) => sum + c.value, 0) /
                      (gwpYear || 1)) *
                  100
                : 0,
        [topCedantsData, gwpYear]
    );

    const handleMonthlyCardClick = () => {
        setMonthlyModalOpen(true);
        if (monthlyPerformance.length === 0) {
            fetchMonthlyPerformance();
        }
    };

    const handleYearlyCardClick = () => {
        setYearlyModalOpen(true);
        if (yearlyPerformance.length === 0) {
            fetchYearlyPerformance();
        }
    };

    if (criticalLoading || gwp === null || gwpYear === null || monthlyTarget === null || yearlyTarget === null) {
        return (
            <Center h="80vh">
                <Stack align="center" gap="md">
                    <Loader size="xl" variant="bars" />
                    <Text c="dimmed">Loading dashboard data...</Text>
                </Stack>
            </Center>
        );
    }

    const progress = (gwp / monthlyTarget) * 100;
    const yearProgress = (gwpYear / yearlyTarget) * 100;
    const lossRatio = claims && gwp ? (claims / gwp) * 100 : 0;

    return (
        <Container size="xl" py="md">
            {/* Header */}
            <Paper shadow="sm" p="lg" radius="md" mb="xl">
                <Group justify="space-between">
                    <div>
                        <Title order={1}>Dashboard Overview</Title>
                        <Text size="sm" c="dimmed" mt={4}>
                            Real-time business intelligence and analytics
                        </Text>
                    </div>
                    <Group>
                        <Badge size="lg" variant="light" color="blue">
                            Live Data
                        </Badge>
                        <Badge size="lg" variant="light" color="green">
                            {new Date().toLocaleDateString()}
                        </Badge>
                    </Group>
                </Group>
            </Paper>

            {/* Fallback Warning */}
            {targetIsFallback && targetFallbackYear && (
                <Alert
                    icon={<IconAlertTriangle size={16} />}
                    color="yellow"
                    variant="light"
                    mb="md"
                >
                    <Text size="sm">
                        Using {targetFallbackYear} target for {selectedYear} (no target configured for this year)
                    </Text>
                </Alert>
            )}

            {/* Key Metrics */}
            <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md" mb="xl">
                <Card
                    shadow="sm"
                    padding="lg"
                    radius="md"
                    withBorder
                    onClick={handleMonthlyCardClick}
                    style={{ cursor: "pointer" }}
                    className="hover:shadow-md transition-shadow"
                >
                    <Group justify="space-between" mb="md">
                        <ThemeIcon size="xl" radius="md" variant="light" color="blue">
                            <IconTrendingUp size={24} />
                        </ThemeIcon>
                        <Badge color="blue" variant="light">
                            Monthly
                        </Badge>
                    </Group>
                    <Text size="xs" c="dimmed" mb={4}>
                        GWP This Month
                    </Text>
                    <Text size="xl" fw={700}>
                        {formatShortNumber(gwp)}
                    </Text>
                    <Progress value={progress} mt="md" size="sm" color="blue" />
                    <Text size="xs" c="dimmed" mt={4}>
                        {progress.toFixed(1)}% of monthly target
                    </Text>
                </Card>

                <Card
                    shadow="sm"
                    padding="lg"
                    radius="md"
                    withBorder
                    onClick={handleYearlyCardClick}
                    style={{ cursor: "pointer" }}
                    className="hover:shadow-md transition-shadow"
                >
                    <Group justify="space-between" mb="md">
                        <ThemeIcon size="xl" radius="md" variant="light" color="violet">
                            <IconChartBar size={24} />
                        </ThemeIcon>
                        <Badge color="violet" variant="light">
                            Yearly
                        </Badge>
                    </Group>
                    <Text size="xs" c="dimmed" mb={4}>
                        GWP This Year
                    </Text>
                    <Text size="xl" fw={700}>
                        {formatShortNumber(gwpYear)}
                    </Text>
                    <Progress value={yearProgress} mt="md" size="sm" color="violet" />
                    <Text size="xs" c="dimmed" mt={4}>
                        {yearProgress.toFixed(1)}% of yearly target
                    </Text>
                </Card>

                <Card shadow="sm" padding="lg" radius="md" withBorder>
                    <Group justify="space-between" mb="md">
                        <ThemeIcon size="xl" radius="md" variant="light" color="red">
                            <IconAlertTriangle size={24} />
                        </ThemeIcon>
                        <Badge color="red" variant="light">
                            Monthly
                        </Badge>
                    </Group>
                    <Text size="xs" c="dimmed" mb={4}>
                        Claims Payout
                    </Text>
                    <Text size="xl" fw={700}>
                        {formatShortNumber(claims || 0)}
                    </Text>
                    <Group mt="md" gap={4}>
                        <Text size="xs" c="dimmed">
                            Loss Ratio:
                        </Text>
                        <Badge color={lossRatio > 70 ? "red" : lossRatio > 50 ? "orange" : "green"} size="sm">
                            {lossRatio.toFixed(1)}%
                        </Badge>
                    </Group>
                </Card>

                <Card shadow="sm" padding="lg" radius="md" withBorder>
                    <Group justify="space-between" mb="md">
                        <ThemeIcon size="xl" radius="md" variant="light" color="orange">
                            <IconCoin size={24} />
                        </ThemeIcon>
                        <Badge color="orange" variant="light">
                            Yearly
                        </Badge>
                    </Group>
                    <Text size="xs" c="dimmed" mb={4}>
                        Total Claims (YTD)
                    </Text>
                    <Text size="xl" fw={700}>
                        {formatShortNumber(claimYear || 0)}
                    </Text>
                    <Text size="xs" c="dimmed" mt="md">
                        Year-to-date claims paid
                    </Text>
                </Card>
            </SimpleGrid>

            {/* Year Filter Tabs */}
            <Paper shadow="sm" p="md" radius="md" withBorder mb="lg">
                <Group justify="space-between" align="center">
                    <Group gap="xs">
                        <IconCalendar size={18} />
                        <Text size="sm" fw={500} c="dimmed">Please Select Data Year</Text>
                    </Group>
                    <Tabs
                        value={String(selectedYear)}
                        onChange={(year) => year && setSelectedYear(Number(year))}
                        variant="pills"
                    >
                        <Tabs.List>
                            <Tabs.Tab value="2026">
                                <Group gap={5}>
                                    2026
                                    {selectedYear === 2026 && <Badge size="xs" variant="filled" color="blue">Live</Badge>}
                                </Group>
                            </Tabs.Tab>
                            <Tabs.Tab value="2025">
                                2025
                            </Tabs.Tab>
                            <Tabs.Tab value="2024">
                                2024
                            </Tabs.Tab>
                            <Tabs.Tab value="2023">
                                2023
                            </Tabs.Tab>
                        </Tabs.List>
                    </Tabs>
                </Group>
            </Paper>

            {/* Tabs for different views */}
            <Tabs
                value={activeTab}
                onChange={(tab) => {
                    setActiveTab(tab);
                    // Lazy load country-risks data when user clicks Map tab
                    if (tab === "map" && countryRisks.length === 0 && !countryRisksLoading) {
                        fetchCountryRisks();
                    }
                }}
                defaultValue="overview"
                variant="pills"
                mb="xl"
            >
                <Tabs.List>
                    <Tabs.Tab value="overview" leftSection={<IconChartBar size={16} />}>
                        Overview
                    </Tabs.Tab>
                    <Tabs.Tab value="map" leftSection={<IconMapPin size={16} />}>
                        Global Distribution
                    </Tabs.Tab>
                    <Tabs.Tab value="analytics" leftSection={<IconFileAnalytics size={16} />}>
                        Analytics
                    </Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="overview" pt="md">
                    <Grid>
                        {/* Premium Trend Chart */}
                        <Grid.Col span={{ base: 12, md: 12 }}>
                            <Paper shadow="sm" p="lg" radius="md" withBorder>
                                <Group justify="space-between" mb="md">
                                    <div>
                                        <Title order={4}>Premium Trend Analysis</Title>
                                        <Text size="sm" c="dimmed">
                                            Current year vs last year monthly comparison
                                        </Text>
                                    </div>
                                </Group>

                                <ResponsiveContainer width="100%" height={400}>
                                    <BarChart data={gwpTrends}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="month" />
                                        <Tooltip
                                            formatter={(value: any) =>
                                                new Intl.NumberFormat("en-US", {
                                                    style: "currency",
                                                    currency: "TZS",
                                                    notation: "compact",
                                                }).format(value)
                                            }
                                        />
                                        <YAxis
                                            tickFormatter={(value) =>
                                                new Intl.NumberFormat("en-US", {
                                                    notation: "compact",
                                                    maximumFractionDigits: 1,
                                                }).format(value)
                                            }
                                        />
                                        <Legend />
                                        <Bar dataKey="lastYearPremium" name="Last Year" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                                        <Bar dataKey="thisYearPremium" name="This Year" fill="#7c3aed" radius={[8, 8, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Paper>
                        </Grid.Col>

                        {/* Top Cedants */}
                        <Grid.Col span={{ base: 12, md: 7 }}>
                            <Paper shadow="sm" p="lg" radius="md" withBorder h="100%">
                                <Group justify="space-between" mb="md">
                                    <div>
                                        <Title order={4}>Top 10 Cedants by GWP</Title>
                                        <Text size="sm" c="dimmed">
                                            2025 Year-to-date rankings
                                        </Text>
                                    </div>
                                    <Badge variant="light" color="blue">
                                        {gwpList.length} Total
                                    </Badge>
                                </Group>
                                <Stack gap="sm">
                                    {gwpList.map((cedant, index) => (
                                        <Group key={cedant.cedantCode} justify="space-between" p="xs" style={{ borderRadius: 8, background: index < 3 ? "var(--mantine-color-blue-0)" : "transparent" }}>
                                            <Group gap="sm">
                                                <Badge size="lg" variant={index < 3 ? "filled" : "light"} color={index === 0 ? "yellow" : index === 1 ? "gray" : index === 2 ? "orange" : "blue"}>
                                                    #{index + 1}
                                                </Badge>
                                                <div>
                                                    <Text size="sm" fw={500}>
                                                        {cedant.cedantName}
                                                    </Text>
                                                    <Text size="xs" c="dimmed">
                                                        {cedant.cedantCode}
                                                    </Text>
                                                </div>
                                            </Group>
                                            <Text size="sm" fw={600}>
                                                {formatShortNumber(cedant.totalBookedPremium)}
                                            </Text>
                                        </Group>
                                    ))}
                                </Stack>
                            </Paper>
                        </Grid.Col>

                        {/* Outstanding Balances */}
                        <Grid.Col span={{ base: 12, md: 5 }}>
                            <Paper shadow="sm" p="lg" radius="md" withBorder h="100%">
                                <Group justify="space-between" mb="md">
                                    <div>
                                        <Title order={4}>Outstanding Balances</Title>
                                        <Text size="sm" c="dimmed">
                                            Since 2021
                                        </Text>
                                    </div>
                                    <Badge variant="light" color="orange">
                                        {cedantBalance.length} Cedants
                                    </Badge>
                                </Group>
                                <Stack gap="sm" style={{ maxHeight: 400, overflowY: "auto" }}>
                                    {cedantBalance.map((cedant) => (
                                        <Group key={cedant.brokerCedantName} justify="space-between" p="sm" style={{ borderRadius: 8, border: "1px solid var(--mantine-color-gray-3)" }}>
                                            <Text size="sm" fw={500} style={{ flex: 1 }}>
                                                {cedant.brokerCedantName}
                                            </Text>
                                            <Text size="sm" fw={600} c="orange">
                                                {new Intl.NumberFormat("en-TZ", {
                                                    style: "currency",
                                                    currency: "TZS",
                                                    notation: "compact",
                                                }).format(cedant.balanceRepCcy)}
                                            </Text>
                                        </Group>
                                    ))}
                                </Stack>
                            </Paper>
                        </Grid.Col>
                    </Grid>
                </Tabs.Panel>

                <Tabs.Panel value="map" pt="md">
                    {countryRisksLoading ? (
                        <Center h={400}>
                            <Stack align="center" gap="md">
                                <Loader size="md" variant="bars" />
                                <Text c="dimmed" size="sm">Loading global distribution data...</Text>
                            </Stack>
                        </Center>
                    ) : (
                        <GlobalRiskDistribution data={countryRisks} />
                    )}
                </Tabs.Panel>

                <Tabs.Panel value="analytics" pt="md">
                    <Grid>
                        <Grid.Col span={{ base: 12, md: 6 }}>
                            <Paper shadow="sm" p="lg" radius="md" withBorder>
                                <Title order={4} mb="md">
                                    Top 5 Cedants Distribution
                                </Title>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={topCedantsData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }: any) => `${name?.substring(0, 15) || ''}: ${((percent as number) * 100).toFixed(0)}%`}
                                            outerRadius={100}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {topCedantsData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            formatter={(value: any) =>
                                                new Intl.NumberFormat("en-US", {
                                                    style: "currency",
                                                    currency: "TZS",
                                                    notation: "compact",
                                                }).format(value)
                                            }
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </Paper>
                        </Grid.Col>

                        <Grid.Col span={{ base: 12, md: 6 }}>
                            <Paper shadow="sm" p="lg" radius="md" withBorder>
                                <Title order={4} mb="md">
                                    Key Performance Indicators
                                </Title>
                                <Stack gap="md">
                                    <div>
                                        <Group justify="space-between" mb="xs">
                                            <Text size="sm">Monthly Target Achievement</Text>
                                            <Text size="sm" fw={600} c={progress >= 100 ? "green" : "orange"}>
                                                {progress.toFixed(1)}%
                                            </Text>
                                        </Group>
                                        <Progress value={progress} color={progress >= 100 ? "green" : "orange"} size="lg" />
                                    </div>

                                    <div>
                                        <Group justify="space-between" mb="xs">
                                            <Text size="sm">Yearly Target Achievement</Text>
                                            <Text size="sm" fw={600} c={yearProgress >= 100 ? "green" : "blue"}>
                                                {yearProgress.toFixed(1)}%
                                            </Text>
                                        </Group>
                                        <Progress value={yearProgress} color={yearProgress >= 100 ? "green" : "blue"} size="lg" />
                                    </div>

                                    <div>
                                        <Group justify="space-between" mb="xs">
                                            <Text size="sm">Loss Ratio</Text>
                                            <Text size="sm" fw={600} c={lossRatio > 70 ? "red" : lossRatio > 50 ? "orange" : "green"}>
                                                {lossRatio.toFixed(1)}%
                                            </Text>
                                        </Group>
                                        <Progress value={lossRatio} color={lossRatio > 70 ? "red" : lossRatio > 50 ? "orange" : "green"} size="lg" />
                                    </div>

                                    <div>
                                        <Group justify="space-between" mb="xs">
                                            <Text size="sm">Portfolio Concentration (Top 5)</Text>
                                            <Text size="sm" fw={600}>
                                                {portfolioConcentration.toFixed(1)}%
                                            </Text>
                                        </Group>
                                        <Progress value={portfolioConcentration} color="cyan" size="lg" />
                                    </div>
                                </Stack>
                            </Paper>
                        </Grid.Col>
                    </Grid>
                </Tabs.Panel>
            </Tabs>

            {/* Performance Breakdown Modals */}
            <Suspense fallback={<ModalFallback />}>
                <PerformanceBreakdownModal
                    opened={monthlyModalOpen}
                    onClose={() => setMonthlyModalOpen(false)}
                    type="monthly"
                    data={monthlyPerformance}
                    loading={performanceLoading}
                    error={performanceError}
                />
            </Suspense>

            <Suspense fallback={<ModalFallback />}>
                <PerformanceBreakdownModal
                    opened={yearlyModalOpen}
                    onClose={() => setYearlyModalOpen(false)}
                    type="yearly"
                    data={yearlyPerformance}
                    loading={performanceLoading}
                    error={performanceError}
                />
            </Suspense>
        </Container>
    );
}
