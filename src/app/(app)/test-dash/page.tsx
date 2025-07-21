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
    rem,
} from '@mantine/core';
import {
    IconTrendingUp,
    IconTrendingDown,
    IconReceipt2,
    IconAlertTriangle,
    IconFileAnalytics,
    IconUserCheck,
    IconDotsVertical,
} from '@tabler/icons-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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

const mockClaims = [
    { id: 'CLM001', insured: 'Tanzania Ports Authority', amount: 'TSh 250.0M', status: 'PENDING' },
    { id: 'CLM002', insured: 'TIPER Co Ltd', amount: 'TSh 180.0M', status: 'APPROVED' },
    { id: 'CLM003', insured: 'TANESCO', amount: 'TSh 320.0M', status: 'UNDER REVIEW' },
    { id: 'CLM004', insured: 'Tanzania Railways Corporation', amount: 'TSh 150.0M', status: 'PENDING' },
];

interface StatCardProps {
    title: string;
    value: string;
    trend: 'up' | 'down';
    trendText: string;
    icon: React.ElementType;
    color: string;
}

function StatCard({ title, value, trend, trendText, icon: Icon, color }: StatCardProps) {
    const TrendIcon = trend === 'up' ? IconTrendingUp : IconTrendingDown;

    return (
        <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Group justify="space-between" align="flex-start" wrap="nowrap">
                <Stack gap="xs">
                    <Text size="sm" c="dimmed">
                        {title}
                    </Text>
                    <Text size="xl" fw={700} style={{ lineHeight: 1 }}>
                        {value}
                    </Text>
                    <Group gap={4} c={trend === 'up' ? 'teal.6' : 'red.6'}>
                        <TrendIcon size={16} style={{ flexShrink: 0 }} />
                        <Text size="sm" fw={500}>
                            {trendText}
                        </Text>
                    </Group>
                </Stack>
                <ThemeIcon
                    size={56}
                    radius="md"
                    variant="light"
                    color={color}
                    style={{ backgroundColor: `var(--mantine-color-${color}-0)` }}
                >
                    <Icon size={24} />
                </ThemeIcon>
            </Group>
        </Card>
    );
}

export default function DashboardPage() {
    return (
        <div className="p-6">
            <Text size="xl" fw={700} mb="md">Dashboard Overview</Text>

            <Grid>
                <Grid.Col span={{ base: 12, md: 3 }}>
                    <StatCard
                        title="Gross Written Premiums"
                        value="TZS 19.3 B"
                        trend="up"
                        trendText="12% vs last month"
                        icon={IconReceipt2}
                        color="teal"
                    />
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 3 }}>
                    <StatCard
                        title="Claim Ratio"
                        value="42.3%"
                        trend="down"
                        trendText="2.1% vs last month"
                        icon={IconAlertTriangle}
                        color="red"
                    />
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 3 }}>
                    <StatCard
                        title="Active Policies"
                        value="1,284"
                        trend="up"
                        trendText="8.3% vs last month"
                        icon={IconFileAnalytics}
                        color="blue"
                    />
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 3 }}>
                    <StatCard
                        title="Customer Satisfaction"
                        value="94.2%"
                        trend="up"
                        trendText="1.2% vs last month"
                        icon={IconUserCheck}
                        color="indigo"
                    />
                </Grid.Col>

                {/* Charts Section */}
                <Grid.Col span={{ base: 12, md: 8 }}>
                    <Card shadow="sm" padding="lg" radius="md" withBorder>
                        <Group justify="space-between" mb="md">
                            <Text fw={600}>Premium vs Claims Trend</Text>
                            <Select
                                size="xs"
                                defaultValue="8"
                                data={[
                                    { value: '8', label: 'Last 8 Months' },
                                    { value: '6', label: 'Last 6 Months' },
                                    { value: '3', label: 'Last 3 Months' },
                                ]}
                            />
                        </Group>

                        {/*<div style={{ height: 300 }}>*/}
                        {/*    <ResponsiveContainer width="100%" height="100%">*/}
                        {/*        <LineChart data={mockChartData}>*/}
                        {/*            <CartesianGrid strokeDasharray="3 3" />*/}
                        {/*            <XAxis dataKey="month" />*/}
                        {/*            <YAxis />*/}
                        {/*            <Tooltip />*/}
                        {/*            <Legend />*/}
                        {/*            <Line*/}
                        {/*                type="monotone"*/}
                        {/*                dataKey="premiums"*/}
                        {/*                stroke="var(--mantine-color-blue-6)"*/}
                        {/*                name="Premiums (TSh B)"*/}
                        {/*            />*/}
                        {/*            <Line*/}
                        {/*                type="monotone"*/}
                        {/*                dataKey="claims"*/}
                        {/*                stroke="var(--mantine-color-red-6)"*/}
                        {/*                name="Claims (TSh B)"*/}
                        {/*            />*/}
                        {/*        </LineChart>*/}
                        {/*    </ResponsiveContainer>*/}
                        {/*</div>*/}
                    </Card>
                </Grid.Col>

                {/* Recent Claims */}
                <Grid.Col span={{ base: 12, md: 4 }}>
                    <Card shadow="sm" padding="lg" radius="md" withBorder>
                        <Group justify="space-between" mb="md">
                            <Text fw={600}>Recent Claims</Text>
                            <Text size="xs" c="dimmed">Showing latest 5 of 125 claims</Text>
                        </Group>

                        <Table>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>Claim ID</Table.Th>
                                    <Table.Th>Insured</Table.Th>
                                    <Table.Th>Amount</Table.Th>
                                    <Table.Th>Status</Table.Th>
                                    <Table.Th />
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {mockClaims.map((claim) => (
                                    <Table.Tr key={claim.id}>
                                        <Table.Td>{claim.id}</Table.Td>
                                        <Table.Td>{claim.insured}</Table.Td>
                                        <Table.Td>{claim.amount}</Table.Td>
                                        <Table.Td>
                                            <Text
                                                size="xs"
                                                c={
                                                    claim.status === 'APPROVED' ? 'teal.6' :
                                                        claim.status === 'PENDING' ? 'yellow.6' : 'blue.6'
                                                }
                                                fw={500}
                                            >
                                                {claim.status}
                                            </Text>
                                        </Table.Td>
                                        <Table.Td>
                                            <ActionIcon variant="subtle" color="gray">
                                                <IconDotsVertical style={{ width: rem(16), height: rem(16) }} />
                                            </ActionIcon>
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