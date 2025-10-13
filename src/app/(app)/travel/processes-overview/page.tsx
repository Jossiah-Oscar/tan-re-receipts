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

} from '@mantine/core';
import {
    IconArrowRight,
} from '@tabler/icons-react';
import {apiFetch} from "@/config/api";
import {useRouter} from "next/navigation";

type TaskCard = {
    title: string;
    description: string;
    color: string;
    count: number;
    // icon: React.FC<React.ComponentProps<'svg'>>;
};

type FlowableProcessDefinition = {
    id: string;
    key: string;
    name: string;
    version: number;
    deploymentId: string;
    suspended: boolean;
    activeTaskCount: number;
};

const TASKS: TaskCard[] = [
    { title: 'Review Documents', description: 'These tasks are related to document verification and approval.', color: 'brand', count: 5  },
    { title: 'Approve Expenses', description: 'Review and approve employee Memos and Financial Requests.', color: 'green', count: 3  },
    { title: 'Customer Onboarding', description: 'Complete the onboarding process for new customers.', color: 'violet', count: 2 },
];

export default function PendingTasks() {
    const router = useRouter(); // Use Next.js router instead of useNavigate
    const [processes, setProcesses] = useState<FlowableProcessDefinition[]>([]);
    const [processesLoading, setProcessesLoading] = useState(false);

    useEffect(() => {
        fetchProcesses();
    },[]);

    const fetchProcesses = async () => {
        setProcessesLoading(true);
        try {
            // apiFetch returns the JSON body directly
            const data = await apiFetch<FlowableProcessDefinition[]>(
                '/api/approvals/process-definitions',
                { cache: 'no-store' }
            );

            const mappedProcesses: FlowableProcessDefinition[] = data.map(proc => ({
                id: proc.id,
                key: proc.key,
                name: proc.name,
                version: proc.version,
                deploymentId: proc.deploymentId,
                suspended: proc.suspended,
                activeTaskCount: proc.activeTaskCount,
            }));

            setProcesses(mappedProcesses);
        } catch (error) {
            console.error('Error fetching processes:', error);
            // Optionally show a toast here
        } finally {
            setProcessesLoading(false);
        }
    };

    const viewTasks = (processKey: string, processName: string) => {
        router.push(`/travel/tasks-list-2/${processKey}`); // Use router.push instead of navigate
        localStorage.setItem('processName', processName);
    };


    return (
        <Container size="lg" py="xl">
            <Group justify="space-between" mb="lg">
                <Title order={2}>Pending Approvals</Title>
            </Group>

            <Grid>
                {processes.map((t) => {
                    // const Icon = t.icon;
                    return (
                        <Grid.Col key={t.id} span={{ base: 12, sm: 6, lg: 4 }}>
                            <Card
                                padding="lg"
                                radius="md"
                                withBorder
                                shadow="sm"
                                style={{ transition: 'box-shadow 150ms ease' }}
                                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--mantine-shadow-md)'; }}
                                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--mantine-shadow-sm)'; }}
                            >
                                <Group align="start" mb="md">
                                    <ThemeIcon variant="light" radius="xl" size={40} >
                                        {/*<Icon size={20} />*/}
                                    </ThemeIcon>
                                    <Title order={4}>{t.name}</Title>
                                </Group>

                                <Text c="dimmed" size="sm" mb="lg">
                                    {t.key}
                                </Text>

                                <Group justify="space-between" align="center">
                                    <Text fw={500}>
                                        <Text component="span" fw={800} size="xl" mr={4}>
                                            {t.activeTaskCount}
                                        </Text>
                                        pending tasks
                                    </Text>

                                    <Button onClick={() =>  viewTasks(t.key,t.name)} component="a" rightSection={<IconArrowRight size={16} />} >
                                        View Pending
                                    </Button>
                                </Group>
                            </Card>
                        </Grid.Col>
                    );
                })}
            </Grid>
        </Container>
    );
}
