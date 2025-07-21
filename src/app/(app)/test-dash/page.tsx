'use client'

import {
    Grid,
    Card,
    Text,
    Group,
    Stack,
    ThemeIcon,
    Select,
    Table,
    ActionIcon,
    rem, Progress, RingProgress,
} from '@mantine/core';
import { LineChart ,BarChart} from '@mantine/charts';
import {
    IconTrendingUp,
    IconTrendingDown,
    IconReceipt2,
    IconAlertTriangle,
    IconFileAnalytics,
    IconUserCheck,
    IconDotsVertical,
} from '@tabler/icons-react';
import {useEffect, useState} from "react";
import {API_BASE_URL} from "@/config/api";

const mockChartData = [
    { month: 'Jan', premiums: 5.0, claims: 2.1 },
    { month: 'Feb', premiums: 5.8, claims: 2.3 },
    { month: 'Mar', premiums: 6.2, claims: 2.5 },
    { month: 'Apr', premiums: 6.0, claims: 2.4 },
    { month: 'May', premiums: 7.0, claims: 2.7 },
    { month: 'Jun', premiums: 7.8, claims: 2.8 },
    { month: 'Jul', premiums: 7.5, claims: 2.8 },
    { month: 'Aug', premiums: 8.0, claims: 2.9 },
];

interface StatCardProps {
    title: string;
    value: string;
    trend: 'up' | 'down';
    trendText: string;
    icon: React.ElementType;
    color: string;
}

type CedantGwp = {
    cedantName: string;
    cedantCode: string;
    totalBookedPremium: number;
};

type PremiumTrend = {
    month: string;
    thisYearPremium: number;
    lastYearPremium: number;
};


function StatCard({ title, value, trend, trendText, icon: Icon, color }: StatCardProps) {
    const TrendIcon = trend === 'up' ? IconTrendingUp : IconTrendingDown;

    return (
        <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Group justify="center" align="flex-start" wrap="nowrap">
                <Stack gap="xs" justify="center">

                    <Group justify="center">

                    <Text size="sm" c="dimmed">
                        {title}
                    </Text>
                    </Group>

                    <Group justify="center">
                    <RingProgress
                        size={120}
                        thickness={12}
                        sections={[{ value: 15, color: 'blue' }]}
                        label={
                            <Text c="blue" fw={700} ta="center" size="xl">
                                {15}%
                            </Text>
                        }
                    />
                    </Group>

                    <Group gap={4} c="black">
                        {/*<TrendIcon size={16} style={{ flexShrink: 0 }} />*/}
                        <Text size="sm" fw={500}>
                            {`Target: ${trendText}`}
                        </Text>
                    </Group>

                    <Group gap={4} c="dimmed">
                    {/*<TrendIcon size={16} style={{ flexShrink: 0 }} />*/}
                        <Text size="sm" fw={500}>
                            {`Target: ${trendText}`}
                        </Text>
                </Group>

                </Stack>
            </Group>
        </Card>
    );
}

export default function DashboardPage() {

    const [gwpList, setGwpList] = useState<CedantGwp[]>([]);
    const [gwpTrends, setGwpTrends] = useState<PremiumTrend[]>([]);


    useEffect(() => {
        fetch(`${API_BASE_URL}/api/dashboard/gwp/top-cedants`)
            .then((res) => res.json())
            .then((data) => setGwpList(data));

        fetch(`${API_BASE_URL}/api/dashboard/monthly-trend`)
            .then((res) => res.json())
            .then((data) => setGwpTrends(data))


        ;
    }, []);


    return (
        <div className="p-6">
            <Text size="xl" fw={700} mb="md">Dashboard Overview</Text>

            <Grid>
                <Grid.Col span={{ base: 12, md: 3 }}>
                    <StatCard
                        title="Current Month GWP"
                        value="TZS 4,181,118,809.7"
                        trend="up"
                        trendText="12% vs last month"
                        icon={IconReceipt2}
                        color="teal"
                    />
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 3 }}>
                    <StatCard
                        title="Current Year GWP"
                        value="TZS 164,142,367,262.2"
                        trend="down"
                        trendText="2.1% vs last month"
                        icon={IconAlertTriangle}
                        color="red"
                    />
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 3 }}>
                    <StatCard
                        title="Claim Payout this Month"
                        value="TZS 164,142,367,262.2"
                        trend="up"
                        trendText="TZS 164,142,367,262.2"
                        icon={IconFileAnalytics}
                        color="blue"
                    />
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 3 }}>
                    <StatCard
                        title="Claim Payout this Year"
                        value="TZS 164,142,367,262.2"
                        trend="up"
                        trendText="1.2% vs last month"
                        icon={IconUserCheck}
                        color="black"
                    />
                </Grid.Col>

                {/* Charts Section */}
                <Grid.Col span={{ base: 12, md: 12 }}>
                    <Card shadow="sm" padding="lg" radius="md" withBorder>
                        <Group justify="space-between" mb="md">
                            <Text fw={600}>Current Year vs Last Year Premium Trend</Text>

                        </Group>

                        {/*<div style={{ height: 300 }}>*/}
                            <BarChart
                                h={300}
                                data={gwpTrends}
                                dataKey="month"
                                series={[
                                    { name: 'thisYearPremium', label: 'This Year', color: 'blue.6' },
                                    { name: 'lastYearPremium', label: 'Last Year', color: 'gray.5' },
                                ]}
                                withLegend
                                yAxisProps={{
                                    tickFormatter: (value) => {
                                        if (value >= 1_000_000_000) return (value / 1_000_000_000).toFixed(1) + 'B';
                                        if (value >= 1_000_000) return (value / 1_000_000).toFixed(1) + 'M';
                                        if (value >= 1_000) return (value / 1_000).toFixed(1) + 'K';
                                        return value;
                                    },
                                }}
                                tooltipProps={{
                                    labelFormatter: (value) => `Month: ${value}`,
                                    formatter: (val) => [
                                        Intl.NumberFormat('en-US', {
                                            style: 'currency',
                                            currency: 'TZS',
                                            maximumFractionDigits: 0,
                                        }).format(val),
                                    ],
                                }}
                                // grid={{ y: true }}
                            />
                        {/*</div>*/}
                    </Card>
                </Grid.Col>

                {/* Recent Claims */}
                <Grid.Col span={{ base: 12, md: 4 }}>
                    <Card shadow="sm" padding="lg" radius="md" withBorder>
                        <Group justify="space-between" mb="md">
                            <Text fw={600}>2025 Top 10 Cedant by GWP</Text>
                            {/*<Text size="xs" c="dimmed">Showing latest 5 of 125 claims</Text>*/}
                        </Group>

                        <Table>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>Cedant</Table.Th>
                                    <Table.Th>Amount</Table.Th>
                                    <Table.Th />
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {gwpList.map((cedant) => (

                                    <Table.Tr key={cedant.cedantCode}>
                                        <Table.Td>{cedant.cedantName}</Table.Td>
                                        <Table.Td>
                                            TZS {new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(cedant.totalBookedPremium)}
                                        </Table.Td>
                                        <Table.Td>
                                            {/*<ActionIcon variant="subtle" color="gray">*/}
                                                <IconDotsVertical style={{ width: rem(16), height: rem(16) }} />
                                            {/*</ActionIcon>*/}
                                        </Table.Td>
                                    </Table.Tr>
                                ))}
                            </Table.Tbody>
                        </Table>
                    </Card>
                </Grid.Col>
            </Grid>
        </div>
    );
}