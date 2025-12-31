'use client';

import {
    Card,
    Container,
    Group,
    Paper,
    SimpleGrid,
    Stack,
    Table,
    Text,
    ThemeIcon,
    Title,
    Badge,
    Tabs,
    Loader,
    Alert,
    Button,
} from '@mantine/core';
import {
    IconFileAnalytics,
    IconClock,
    IconChecks,
    IconX,
    IconAlertCircle,
    IconRefresh,
} from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/config/api';

// TypeScript interfaces for API response
interface Metrics {
    totalSubmissions: number;
    pendingApprovals: number;
    approvedThisMonth: number;
    rejectedThisMonth: number;
    averageProcessingTime: string;
}

interface Submission {
    offerId: number;
    cedant: string;
    insured: string;
    sumInsured: number;
    currency: string;
    submittedDate: string;
    shareOfferedPct: number;
    shareAcceptedPct: number;
    status: string;
    processInstanceId: string;
}

interface OverviewApiResponse {
    metrics: Metrics;
    recentSubmissions: Submission[];
}

// Mock data matching backend API format (fallback)
const mockApiResponse = {
    metrics: {
        totalSubmissions: 24,
        pendingApprovals: 8,
        approvedThisMonth: 12,
        rejectedThisMonth: 2,
        averageProcessingTime: "2.3 days"
    },
    recentSubmissions: [
        {
            offerId: 156,
            cedant: "CRDB Bank",
            insured: "Lake Oil Tanzania Ltd",
            sumInsured: 5000000.00,
            currency: "USD",
            submittedDate: "2025-12-28T14:30:00",
            shareOfferedPct: 0.50,
            shareAcceptedPct: 0.50,
            status: "In Progress",
            processInstanceId: "abc123-def456-ghi789"
        },
        {
            offerId: 155,
            cedant: "NMB Bank",
            insured: "XYZ Corporation",
            sumInsured: 3000000.00,
            currency: "TZS",
            submittedDate: "2025-12-27T10:15:00",
            shareOfferedPct: 0.60,
            shareAcceptedPct: 0.60,
            status: "Approved",
            processInstanceId: "xyz789-abc123-def456"
        },
        {
            offerId: 154,
            cedant: "CRDB Bank",
            insured: "ABC Industries",
            sumInsured: 2500000.00,
            currency: "USD",
            submittedDate: "2025-12-26T16:45:00",
            shareOfferedPct: 0.40,
            shareAcceptedPct: 0.40,
            status: "Rejected",
            processInstanceId: "def456-ghi789-jkl012"
        },
        {
            offerId: 153,
            cedant: "TPB Bank",
            insured: "Mining Corp Ltd",
            sumInsured: 4200000.00,
            currency: "USD",
            submittedDate: "2025-12-25T09:20:00",
            shareOfferedPct: 0.55,
            shareAcceptedPct: 0.45,
            status: "In Progress",
            processInstanceId: "ghi789-jkl012-mno345"
        },
        {
            offerId: 152,
            cedant: "Jubilee Insurance",
            insured: "Tech Industries Ltd",
            sumInsured: 1800000.00,
            currency: "TZS",
            submittedDate: "2025-12-24T11:00:00",
            shareOfferedPct: 0.70,
            shareAcceptedPct: 0.70,
            status: "Approved",
            processInstanceId: "jkl012-mno345-pqr678"
        }
    ]
};

// Utility function to format large numbers
const formatShortNumber = (num: number): string => {
    if (num >= 1_000_000_000) {
        return (num / 1_000_000_000).toFixed(2) + 'B';
    } else if (num >= 1_000_000) {
        return (num / 1_000_000).toFixed(1) + 'M';
    } else if (num >= 1_000) {
        return (num / 1_000).toFixed(0) + 'K';
    }
    return num.toLocaleString();
};

export default function UnderwritingTestPage() {
    const [data, setData] = useState<OverviewApiResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchOverviewData = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await apiFetch<OverviewApiResponse>(
                '/api/underwriting/facultative/overview?limit=10&offset=0'
            );
            setData(response);
        } catch (err: any) {
            console.error('Failed to fetch overview data:', err);
            setError(err?.message || 'Failed to load data');
            // Fallback to mock data if API fails
            setData(mockApiResponse as OverviewApiResponse);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOverviewData();
    }, []);

    return (
        <Container size="xl" py="xl">
            <Group justify="space-between" mb="xl">
                <Title order={1}>
                    Underwriting Analysis - Design Test
                </Title>
                <Button
                    leftSection={<IconRefresh size={16} />}
                    variant="light"
                    onClick={fetchOverviewData}
                    loading={loading}
                >
                    Refresh
                </Button>
            </Group>

            <Tabs defaultValue="overview" variant="pills">
                <Tabs.List mb="lg">
                    <Tabs.Tab value="overview" leftSection={<IconFileAnalytics size={16} />}>
                        Overview
                    </Tabs.Tab>
                    <Tabs.Tab value="new-analysis" leftSection={<IconFileAnalytics size={16} />}>
                        New Analysis
                    </Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="overview">
                    {/* Loading State */}
                    {loading && (
                        <Stack align="center" py="xl">
                            <Loader size="lg" />
                            <Text c="dimmed">Loading overview data...</Text>
                        </Stack>
                    )}

                    {/* Error State */}
                    {error && !data && (
                        <Alert
                            icon={<IconAlertCircle size={16} />}
                            title="Error Loading Data"
                            color="red"
                            mb="md"
                        >
                            {error}
                            <Button
                                size="xs"
                                variant="light"
                                onClick={fetchOverviewData}
                                mt="sm"
                            >
                                Try Again
                            </Button>
                        </Alert>
                    )}

                    {/* Data Display */}
                    {!loading && data && (
                        <Stack gap="xl">
                            {/* Warning if using fallback data */}
                            {error && (
                                <Alert
                                    icon={<IconAlertCircle size={16} />}
                                    title="Using Sample Data"
                                    color="yellow"
                                >
                                    Could not connect to API. Displaying sample data for demonstration.
                                </Alert>
                            )}

                            {/* Summary Metrics Cards */}
                            <div>
                                <Title order={3} mb="md">
                                    Summary Metrics
                                </Title>
                            <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
                                {/* Total Submissions */}
                                <Card
                                    shadow="sm"
                                    padding="lg"
                                    radius="md"
                                    withBorder
                                    className="hover:shadow-md transition-shadow"
                                >
                                    <Group gap="sm">
                                        <ThemeIcon size={48} radius="md" color="blue" variant="light">
                                            <IconFileAnalytics size={24} />
                                        </ThemeIcon>
                                        <div>
                                            <Text size="xs" c="dimmed">
                                                Total Submissions
                                            </Text>
                                            <Text size="xl" fw={700}>
                                                {data.metrics.totalSubmissions}
                                            </Text>
                                        </div>
                                    </Group>
                                </Card>

                                {/* Pending Approvals */}
                                <Card
                                    shadow="sm"
                                    padding="lg"
                                    radius="md"
                                    withBorder
                                    className="hover:shadow-md transition-shadow"
                                >
                                    <Group gap="sm">
                                        <ThemeIcon size={48} radius="md" color="orange" variant="light">
                                            <IconClock size={24} />
                                        </ThemeIcon>
                                        <div>
                                            <Text size="xs" c="dimmed">
                                                Pending Approvals
                                            </Text>
                                            <Text size="xl" fw={700}>
                                                {data.metrics.pendingApprovals}
                                            </Text>
                                        </div>
                                    </Group>
                                </Card>

                                {/* Approved This Month */}
                                <Card
                                    shadow="sm"
                                    padding="lg"
                                    radius="md"
                                    withBorder
                                    className="hover:shadow-md transition-shadow"
                                >
                                    <Group gap="sm">
                                        <ThemeIcon size={48} radius="md" color="green" variant="light">
                                            <IconChecks size={24} />
                                        </ThemeIcon>
                                        <div>
                                            <Text size="xs" c="dimmed">
                                                Approved This Month
                                            </Text>
                                            <Text size="xl" fw={700}>
                                                {data.metrics.approvedThisMonth}
                                            </Text>
                                        </div>
                                    </Group>
                                </Card>

                                {/* Rejected This Month */}
                                <Card
                                    shadow="sm"
                                    padding="lg"
                                    radius="md"
                                    withBorder
                                    className="hover:shadow-md transition-shadow"
                                >
                                    <Group gap="sm">
                                        <ThemeIcon size={48} radius="md" color="red" variant="light">
                                            <IconX size={24} />
                                        </ThemeIcon>
                                        <div>
                                            <Text size="xs" c="dimmed">
                                                Rejected This Month
                                            </Text>
                                            <Text size="xl" fw={700}>
                                                {data.metrics.rejectedThisMonth}
                                            </Text>
                                        </div>
                                    </Group>
                                </Card>
                            </SimpleGrid>
                        </div>

                        {/* Recent Submissions Table */}
                        <Paper shadow="sm" p="lg" radius="md" withBorder>
                            <Title order={4} mb="md">
                                Recent Submissions
                            </Title>
                            <Table striped highlightOnHover>
                                <Table.Thead>
                                    <Table.Tr>
                                        <Table.Th>Date</Table.Th>
                                        <Table.Th>Cedant</Table.Th>
                                        <Table.Th>Insured</Table.Th>
                                        <Table.Th style={{ textAlign: 'right' }}>Sum Insured</Table.Th>
                                        <Table.Th>Currency</Table.Th>
                                        <Table.Th style={{ textAlign: 'right' }}>Share Offered</Table.Th>
                                        <Table.Th style={{ textAlign: 'right' }}>Share Accepted</Table.Th>
                                        <Table.Th>Status</Table.Th>
                                    </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>
                                    {data.recentSubmissions.map((submission) => (
                                        <Table.Tr
                                            key={submission.offerId}
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => console.log('View details:', submission.offerId)}
                                        >
                                            <Table.Td>
                                                {new Date(submission.submittedDate).toLocaleDateString()}
                                            </Table.Td>
                                            <Table.Td>{submission.cedant}</Table.Td>
                                            <Table.Td>{submission.insured}</Table.Td>
                                            <Table.Td style={{ textAlign: 'right' }}>
                                                {submission.sumInsured.toLocaleString()}
                                            </Table.Td>
                                            <Table.Td>{submission.currency}</Table.Td>
                                            <Table.Td style={{ textAlign: 'right' }}>
                                                {(submission.shareOfferedPct * 100).toFixed(1)}%
                                            </Table.Td>
                                            <Table.Td style={{ textAlign: 'right' }}>
                                                {(submission.shareAcceptedPct * 100).toFixed(1)}%
                                            </Table.Td>
                                            <Table.Td>
                                                <Badge
                                                    color={
                                                        submission.status === 'Approved'
                                                            ? 'green'
                                                            : submission.status === 'In Progress'
                                                            ? 'orange'
                                                            : 'red'
                                                    }
                                                    variant="light"
                                                >
                                                    {submission.status}
                                                </Badge>
                                            </Table.Td>
                                        </Table.Tr>
                                    ))}
                                </Table.Tbody>
                            </Table>
                        </Paper>
                        </Stack>
                    )}
                </Tabs.Panel>

                <Tabs.Panel value="new-analysis">
                    <Paper shadow="sm" p="lg" radius="md" withBorder>
                        <Title order={4} mb="md">
                            New Analysis Form
                        </Title>
                        <Text c="dimmed">
                            This is where the existing underwriting analysis form would go...
                        </Text>
                    </Paper>
                </Tabs.Panel>
            </Tabs>
        </Container>
    );
}
