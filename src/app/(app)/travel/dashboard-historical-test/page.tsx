'use client';

import { useState } from 'react';
import {
    Container,
    Tabs,
    Title,
    Paper,
    SimpleGrid,
    Card,
    ThemeIcon,
    Text,
    Group,
    Stack,
    Badge,
    Progress,
    Loader,
    Alert,
} from '@mantine/core';
import {
    IconCalendar,
    IconTrendingUp,
    IconCoin,
    IconAlertTriangle,
    IconInfoCircle,
} from '@tabler/icons-react';

// Mock data for different years
const mockDataByYear: Record<string, any> = {
    '2026': {
        gwp: 245_000_000_000,
        gwpTarget: 336_903_845_564,
        claims: 45_000_000_000,
        claimRatio: 18.37,
        cedantBalance: 125_000_000_000,
        topCedants: [
            { name: 'Cedant A', premium: 85_000_000_000 },
            { name: 'Cedant B', premium: 65_000_000_000 },
            { name: 'Cedant C', premium: 45_000_000_000 },
        ],
    },
    '2025': {
        gwp: 312_000_000_000,
        gwpTarget: 320_000_000_000,
        claims: 58_000_000_000,
        claimRatio: 18.59,
        cedantBalance: 98_000_000_000,
        topCedants: [
            { name: 'Cedant A', premium: 105_000_000_000 },
            { name: 'Cedant D', premium: 72_000_000_000 },
            { name: 'Cedant C', premium: 55_000_000_000 },
        ],
    },
    '2024': {
        gwp: 298_000_000_000,
        gwpTarget: 300_000_000_000,
        claims: 52_000_000_000,
        claimRatio: 17.45,
        cedantBalance: 89_000_000_000,
        topCedants: [
            { name: 'Cedant B', premium: 92_000_000_000 },
            { name: 'Cedant A', premium: 88_000_000_000 },
            { name: 'Cedant E', premium: 48_000_000_000 },
        ],
    },
    '2023': {
        gwp: 275_000_000_000,
        gwpTarget: 280_000_000_000,
        claims: 48_000_000_000,
        claimRatio: 17.45,
        cedantBalance: 76_000_000_000,
        topCedants: [
            { name: 'Cedant A', premium: 78_000_000_000 },
            { name: 'Cedant B', premium: 68_000_000_000 },
            { name: 'Cedant F', premium: 42_000_000_000 },
        ],
    },
};

const formatCurrency = (value: number): string => {
    if (value >= 1_000_000_000) {
        return `${(value / 1_000_000_000).toFixed(2)}B`;
    } else if (value >= 1_000_000) {
        return `${(value / 1_000_000).toFixed(1)}M`;
    }
    return value.toLocaleString();
};

export default function DashboardHistoricalTest() {
    const [selectedYear, setSelectedYear] = useState('2026');
    const [loading, setLoading] = useState(false);

    const currentData = mockDataByYear[selectedYear];
    const gwpProgress = (currentData.gwp / currentData.gwpTarget) * 100;

    const handleYearChange = (year: string | null) => {
        if (!year) return;

        setLoading(true);
        setSelectedYear(year);

        // Simulate API loading
        setTimeout(() => {
            setLoading(false);
        }, 500);
    };

    return (
        <Container size="xl" py="xl">
            <Stack gap="lg">
                <Group justify="space-between">
                    <Title order={1}>Dashboard - Historical Data Test</Title>
                    <Badge size="lg" variant="light" color="blue">
                        Year: {selectedYear}
                    </Badge>
                </Group>

                <Alert icon={<IconInfoCircle size={16} />} title="Test Feature" color="cyan">
                    This is a test page to explore historical data filtering by year.
                    In production, this would fetch real data from the backend using year parameters.
                </Alert>

                <Tabs value={selectedYear} onChange={handleYearChange} variant="pills">
                    <Tabs.List>
                        <Tabs.Tab value="2026" leftSection={<IconCalendar size={16} />}>
                            2026 (Current)
                        </Tabs.Tab>
                        <Tabs.Tab value="2025" leftSection={<IconCalendar size={16} />}>
                            2025
                        </Tabs.Tab>
                        <Tabs.Tab value="2024" leftSection={<IconCalendar size={16} />}>
                            2024
                        </Tabs.Tab>
                        <Tabs.Tab value="2023" leftSection={<IconCalendar size={16} />}>
                            2023
                        </Tabs.Tab>
                    </Tabs.List>

                    {['2026', '2025', '2024', '2023'].map((year) => (
                        <Tabs.Panel key={year} value={year} pt="md">
                            {loading ? (
                                <Paper p="xl" withBorder>
                                    <Stack align="center" gap="md">
                                        <Loader size="lg" />
                                        <Text c="dimmed">Loading {year} data...</Text>
                                    </Stack>
                                </Paper>
                            ) : (
                                <Stack gap="lg">
                                    {/* Summary Cards */}
                                    <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
                                        {/* GWP Card */}
                                        <Card shadow="sm" padding="lg" radius="md" withBorder>
                                            <Group gap="sm" mb="xs">
                                                <ThemeIcon size={48} radius="md" color="blue" variant="light">
                                                    <IconCoin size={24} />
                                                </ThemeIcon>
                                                <div>
                                                    <Text size="xs" c="dimmed">
                                                        Gross Written Premium
                                                    </Text>
                                                    <Text size="xl" fw={700}>
                                                        TZS {formatCurrency(currentData.gwp)}
                                                    </Text>
                                                </div>
                                            </Group>
                                            <Progress value={gwpProgress} size="sm" radius="xl" mb="xs" />
                                            <Text size="xs" c="dimmed">
                                                {gwpProgress.toFixed(1)}% of target (TZS {formatCurrency(currentData.gwpTarget)})
                                            </Text>
                                        </Card>

                                        {/* Claims Card */}
                                        <Card shadow="sm" padding="lg" radius="md" withBorder>
                                            <Group gap="sm">
                                                <ThemeIcon size={48} radius="md" color="red" variant="light">
                                                    <IconAlertTriangle size={24} />
                                                </ThemeIcon>
                                                <div>
                                                    <Text size="xs" c="dimmed">
                                                        Total Claims
                                                    </Text>
                                                    <Text size="xl" fw={700}>
                                                        TZS {formatCurrency(currentData.claims)}
                                                    </Text>
                                                    <Text size="xs" c="dimmed">
                                                        Claim ratio: {currentData.claimRatio}%
                                                    </Text>
                                                </div>
                                            </Group>
                                        </Card>

                                        {/* Cedant Balance Card */}
                                        <Card shadow="sm" padding="lg" radius="md" withBorder>
                                            <Group gap="sm">
                                                <ThemeIcon size={48} radius="md" color="green" variant="light">
                                                    <IconTrendingUp size={24} />
                                                </ThemeIcon>
                                                <div>
                                                    <Text size="xs" c="dimmed">
                                                        Cedant Balance
                                                    </Text>
                                                    <Text size="xl" fw={700}>
                                                        TZS {formatCurrency(currentData.cedantBalance)}
                                                    </Text>
                                                </div>
                                            </Group>
                                        </Card>

                                        {/* Year Info Card */}
                                        <Card shadow="sm" padding="lg" radius="md" withBorder>
                                            <Stack gap="xs">
                                                <Group justify="space-between">
                                                    <Text size="sm" fw={500}>Year</Text>
                                                    <Badge size="lg" variant="filled">{year}</Badge>
                                                </Group>
                                                <Text size="xs" c="dimmed">
                                                    {year === '2026' ? 'Current year (Live data)' : 'Historical data'}
                                                </Text>
                                                <Text size="xs" c="dimmed">
                                                    Data as of {year === '2026' ? 'today' : `Dec 31, ${year}`}
                                                </Text>
                                            </Stack>
                                        </Card>
                                    </SimpleGrid>

                                    {/* Top Cedants */}
                                    <Paper shadow="sm" p="lg" radius="md" withBorder>
                                        <Title order={4} mb="md">
                                            Top Cedants - {year}
                                        </Title>
                                        <Stack gap="md">
                                            {currentData.topCedants.map((cedant: any, index: number) => (
                                                <div key={index}>
                                                    <Group justify="space-between" mb={5}>
                                                        <Text size="sm" fw={500}>
                                                            {index + 1}. {cedant.name}
                                                        </Text>
                                                        <Text size="sm" fw={700}>
                                                            TZS {formatCurrency(cedant.premium)}
                                                        </Text>
                                                    </Group>
                                                    <Progress
                                                        value={(cedant.premium / currentData.gwp) * 100}
                                                        size="sm"
                                                        radius="xl"
                                                        color={index === 0 ? 'blue' : index === 1 ? 'cyan' : 'gray'}
                                                    />
                                                </div>
                                            ))}
                                        </Stack>
                                    </Paper>

                                    {/* Implementation Notes */}
                                    <Alert icon={<IconInfoCircle size={16} />} title="Implementation Notes" color="gray">
                                        <Stack gap="xs">
                                            <Text size="sm">
                                                <strong>Backend Changes Needed:</strong>
                                            </Text>
                                            <Text size="sm">
                                                • Update API endpoints to accept <code>year</code> query parameter
                                            </Text>
                                            <Text size="sm">
                                                • Example: <code>/api/dashboard/year-gwp?year={year}</code>
                                            </Text>
                                            <Text size="sm">
                                                • Default to current year (2026) when parameter is not provided
                                            </Text>
                                            <Text size="sm" mt="xs">
                                                <strong>Frontend Changes:</strong>
                                            </Text>
                                            <Text size="sm">
                                                • Add year parameter to store fetch functions
                                            </Text>
                                            <Text size="sm">
                                                • Update dashboard page to pass selected year to store
                                            </Text>
                                            <Text size="sm">
                                                • Integrate year tabs into main dashboard
                                            </Text>
                                        </Stack>
                                    </Alert>
                                </Stack>
                            )}
                        </Tabs.Panel>
                    ))}
                </Tabs>
            </Stack>
        </Container>
    );
}
