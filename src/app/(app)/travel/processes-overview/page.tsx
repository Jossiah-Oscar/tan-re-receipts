'use client';

import React, {useEffect, useState} from 'react';
import '@mantine/core/styles.css';
import {
    Group,
    Container,
    Grid,
    Card,
    Title,
    Text,
    Button,
    ThemeIcon,
    Stack,
    Badge,
    Loader,
    Center,
    Paper,
} from '@mantine/core';
import {
    IconArrowRight,
    IconFileCheck,
    IconAlertCircle,
    IconRefresh,
    IconClipboardList,
} from '@tabler/icons-react';
import {apiFetch} from "@/config/api";
import {useRouter} from "next/navigation";

type FlowableProcessDefinition = {
    id: string;
    key: string;
    name: string;
    version: number;
    deploymentId: string;
    suspended: boolean;
    activeTaskCount: number;
};

// Map process keys to icons and colors
const PROCESS_CONFIG: Record<string, { icon: React.ElementType; color: string; description: string }> = {
    'OFFER_ANALYSIS_APPROVAL': {
        icon: IconFileCheck,
        color: 'blue',
        description: 'Review and approve facultative offer analyses'
    },
    'TRAVEL_APPROVAL': {
        icon: IconClipboardList,
        color: 'teal',
        description: 'Approve employee travel requests'
    },
    'DEFAULT': {
        icon: IconClipboardList,
        color: 'gray',
        description: 'Process approval tasks'
    }
};

export default function PendingApprovals() {
    const router = useRouter();
    const [processes, setProcesses] = useState<FlowableProcessDefinition[]>([]);
    const [processesLoading, setProcessesLoading] = useState(false);

    useEffect(() => {
        fetchProcesses();
    },[]);

    const fetchProcesses = async () => {
        setProcessesLoading(true);
        try {
            const data = await apiFetch<FlowableProcessDefinition[]>(
                '/api/approvals/process-definitions',
                { cache: 'no-store' }
            );

            setProcesses(data || []);
        } catch (error) {
            console.error('Error fetching processes:', error);
        } finally {
            setProcessesLoading(false);
        }
    };

    const viewTasks = (processKey: string, processName: string) => {
        router.push(`/travel/tasks-list-2/${processKey}`);
        localStorage.setItem('processName', processName);
    };

    const getProcessConfig = (key: string) => {
        return PROCESS_CONFIG[key] || PROCESS_CONFIG['DEFAULT'];
    };

    const totalPendingTasks = processes.reduce((sum, p) => sum + p.activeTaskCount, 0);

    if (processesLoading) {
        return (
            <Container size="lg" py="xl">
                <Center style={{ minHeight: '400px' }}>
                    <Stack align="center" gap="md">
                        <Loader size="lg" />
                        <Text c="dimmed">Loading approval workflows...</Text>
                    </Stack>
                </Center>
            </Container>
        );
    }

    return (
        <Container size="lg" py="xl">
            {/* Header */}
            <Stack gap="xl">
                <Paper p="lg" withBorder radius="md" bg="blue.0">
                    <Group justify="space-between" align="center" wrap="wrap">
                        <Stack gap={4}>
                            <Title order={2}>My Pending Approvals</Title>
                            <Text c="dimmed" size="sm">
                                Review and action items requiring your approval
                            </Text>
                        </Stack>
                        <Group gap="md">
                            <Badge size="xl" variant="filled" color="blue">
                                {totalPendingTasks} Total Tasks
                            </Badge>
                            <Button
                                variant="light"
                                leftSection={<IconRefresh size={16} />}
                                onClick={fetchProcesses}
                                loading={processesLoading}
                            >
                                Refresh
                            </Button>
                        </Group>
                    </Group>
                </Paper>

                {/* Process Cards */}
                {processes.length === 0 ? (
                    <Paper p="xl" withBorder radius="md">
                        <Center>
                            <Stack align="center" gap="md">
                                <ThemeIcon size={64} radius="xl" variant="light" color="gray">
                                    <IconAlertCircle size={32} />
                                </ThemeIcon>
                                <Title order={3} c="dimmed">No Pending Approvals</Title>
                                <Text c="dimmed" size="sm">
                                    You don't have any pending approval tasks at the moment.
                                </Text>
                            </Stack>
                        </Center>
                    </Paper>
                ) : (
                    <Grid>
                        {processes.map((process) => {
                            const config = getProcessConfig(process.key);
                            const Icon = config.icon;
                            const hasTasks = process.activeTaskCount > 0;

                            return (
                                <Grid.Col key={process.id} span={{ base: 12, sm: 6, lg: 4 }}>
                                    <Card
                                        padding="lg"
                                        radius="md"
                                        withBorder
                                        shadow="sm"
                                        style={{
                                            transition: 'all 150ms ease',
                                            cursor: 'pointer',
                                            height: '100%'
                                        }}
                                        onMouseEnter={(e) => {
                                            (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--mantine-shadow-md)';
                                            (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)';
                                        }}
                                        onMouseLeave={(e) => {
                                            (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--mantine-shadow-sm)';
                                            (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                                        }}
                                        onClick={() => viewTasks(process.key, process.name)}
                                    >
                                        <Stack gap="md" style={{ height: '100%' }}>
                                            {/* Icon and Title */}
                                            <Group gap="md" wrap="nowrap">
                                                <ThemeIcon
                                                    variant="light"
                                                    radius="xl"
                                                    size={48}
                                                    color={config.color}
                                                >
                                                    <Icon size={24} />
                                                </ThemeIcon>
                                                <div style={{ flex: 1 }}>
                                                    <Title order={4} lineClamp={2}>
                                                        {process.name}
                                                    </Title>
                                                    <Badge
                                                        size="xs"
                                                        variant="dot"
                                                        color={process.suspended ? 'red' : 'green'}
                                                        mt={4}
                                                    >
                                                        {process.suspended ? 'Suspended' : 'Active'}
                                                    </Badge>
                                                </div>
                                            </Group>

                                            {/* Description */}
                                            <Text c="dimmed" size="sm" lineClamp={2} style={{ flex: 1 }}>
                                                {config.description}
                                            </Text>

                                            {/* Task Count and Button */}
                                            <Group justify="space-between" align="center" mt="auto">
                                                <div>
                                                    <Text
                                                        component="span"
                                                        fw={700}
                                                        size="2rem"
                                                        c={hasTasks ? config.color : 'dimmed'}
                                                    >
                                                        {process.activeTaskCount}
                                                    </Text>
                                                    <Text component="span" size="sm" c="dimmed" ml={4}>
                                                        {process.activeTaskCount === 1 ? 'task' : 'tasks'}
                                                    </Text>
                                                </div>

                                                {hasTasks && (
                                                    <Button
                                                        variant="light"
                                                        color={config.color}
                                                        rightSection={<IconArrowRight size={16} />}
                                                    >
                                                        Review
                                                    </Button>
                                                )}
                                            </Group>
                                        </Stack>
                                    </Card>
                                </Grid.Col>
                            );
                        })}
                    </Grid>
                )}
            </Stack>
        </Container>
    );
}
