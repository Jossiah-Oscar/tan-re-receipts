"use client";

import {
    ActionIcon,
    Badge,
    Button,
    Card,
    Group,
    Loader,
    Modal,
    Paper,
    Stack,
    Table,
    Text,
    Textarea,
    ThemeIcon,
    Title,
    Center,
    Divider,
    Alert,
    Tabs,
    SimpleGrid,
} from "@mantine/core";
import {
    IconAlertCircle,
    IconArrowLeft,
    IconCalendarEvent,
    IconCheck,
    IconClock,
    IconEye,
    IconRefresh,
    IconUser,
    IconX,
    IconArrowBack,
    IconFileCheck,
    IconInfoCircle,
    IconBuildingBank,
    IconCoin,
    IconPercentage,
} from "@tabler/icons-react";
import React, { useEffect, useState } from "react";
import { apiFetch } from "@/config/api";
import { useDisclosure } from "@mantine/hooks";
import { useParams, useRouter } from "next/navigation";

type FlowableTask = {
    id: string;
    name: string;
    assignee: string;
    createTime: string;
    dueDate: string;
    priority: 'low' | 'medium' | 'high';
    processInstanceId: string;
    processDefinitionName: string;
    description?: string;
    variables?: Record<string, any>;
};

type OfferAnalysisData = {
    offer: {
        id: number;
        rmsNumber: string;
        cedant: string;
        insured: string;
        broker: string;
        country: string;
        occupation: string;
        currencyCode: string;
        exchangeRate: number;
        periodFrom: string;
        periodTo: string;
        offerReceivedDate: string;
        sumInsured: number;
        premium: number;
        rateDecimal: number;
        shareOfferedPct: number;
        notes: string;
    };
    analysis: {
        id: number;
        tanreSharePercent: number;
        tanreExposure: number;
        tanrePremium: number;
        acceptedSharePercent: number;
        acceptedExposure: number;
        acceptedPremium: number;
        retentionSharePercent: number;
        retentionExposure: number;
        retentionPremium: number;
        surplusSharePercent: number;
        surplusExposure: number;
        surplusPremium: number;
        facRetroPercent: number;
        facRetroExposure: number;
        facRetroPremium: number;
        totalExposure: number;
        totalPremium: number;
    };
};

export default function FlowableTasksCenter() {
    const [loading, setLoading] = useState(false);
    const [tasks, setTasks] = useState<FlowableTask[]>([]);
    const [actionLoading, setActionLoading] = useState(false);
    const params = useParams();
    const router = useRouter();
    const processID = params?.processID as string;
    const [processName, setProcessName] = useState<string>("");

    // Modal state
    const [selectedTask, setSelectedTask] = useState<FlowableTask | null>(null);
    const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);
    const [taskComment, setTaskComment] = useState("");
    const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);

    // Offer analysis data
    const [offerAnalysisData, setOfferAnalysisData] = useState<OfferAnalysisData | null>(null);
    const [offerDataLoading, setOfferDataLoading] = useState(false);

    useEffect(() => {
        fetchTasks();
        const processName = localStorage.getItem('processName');
        if (processName) setProcessName(processName);
    }, [processID]);

    const fetchTasks = async () => {
        setLoading(true);
        try {
            const res = await apiFetch<FlowableTask[]>(`/api/approvals/tasks/${processID}`, { cache: "no-store" });
            setTasks(res || []);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    async function handleApprove() {
        if (!selectedTask) return;

        setActionLoading(true);
        try {
            await apiFetch(`/api/approvals/tasks/${selectedTask.id}/approve`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: {
                    userId: "jkibona",
                    comment: taskComment || "Approved"
                },
                requiresAuth: true,
            });

            closeModal();
            setTaskComment("");
            setSelectedTask(null);
            setActionType(null);
            await fetchTasks(); // Refresh task list
        } catch (error) {
            console.error('Error approving task:', error);
        } finally {
            setActionLoading(false);
        }
    }

    async function handleReject() {
        if (!selectedTask) return;

        setActionLoading(true);
        try {
            await apiFetch(`/api/approvals/tasks/${selectedTask.id}/reject`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: {
                    userId: "jkibona",
                    comment: taskComment || "Rejected"
                },
                requiresAuth: true,
            });

            closeModal();
            setTaskComment("");
            setSelectedTask(null);
            setActionType(null);
            await fetchTasks(); // Refresh task list
        } catch (error) {
            console.error('Error rejecting task:', error);
        } finally {
            setActionLoading(false);
        }
    }

    async function fetchOfferAnalysisData(offerId: number) {
        setOfferDataLoading(true);
        try {
            const data = await apiFetch<OfferAnalysisData>(
                `/api/underwriting/facultative/offer/${offerId}`,
                { cache: "no-store" }
            );
            setOfferAnalysisData(data);
        } catch (error) {
            console.error('Error fetching offer analysis data:', error);
            setOfferAnalysisData(null);
        } finally {
            setOfferDataLoading(false);
        }
    }

    function openTaskDetails(task: FlowableTask) {
        setSelectedTask(task);
        setTaskComment("");
        setActionType(null);
        setOfferAnalysisData(null);

        // If this is an offer analysis task, fetch the offer data
        if (processID === 'OFFER_ANALYSIS_APPROVAL' && task.variables?.offerId) {
            fetchOfferAnalysisData(task.variables.offerId);
        }

        openModal();
    }

    function formatDate(iso: string) {
        try {
            return new Intl.DateTimeFormat("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            }).format(new Date(iso));
        } catch {
            return iso;
        }
    }

    function formatCurrency(value: number, currency: string = 'TZS') {
        return new Intl.NumberFormat('en-US', {
            style: 'decimal',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(value) + ` ${currency}`;
    }

    function formatPercentage(value: number) {
        return new Intl.NumberFormat('en-US', {
            style: 'decimal',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(value) + '%';
    }

    function getPriorityColor(priority: string): string {
        switch (priority?.toLowerCase()) {
            case 'high':
                return 'red';
            case 'medium':
                return 'yellow';
            case 'low':
                return 'blue';
            default:
                return 'gray';
        }
    }

    function goBack() {
        router.push('/travel/processes-overview');
    }

    if (loading) {
        return (
            <Container size="xl" py="xl">
                <Center style={{ minHeight: '400px' }}>
                    <Stack align="center" gap="md">
                        <Loader size="lg" />
                        <Text c="dimmed">Loading tasks...</Text>
                    </Stack>
                </Center>
            </Container>
        );
    }

    return (
        <Stack gap="lg" p={{ base: "md", sm: "lg" }}>
            {/* Header */}
            <Paper p="lg" withBorder radius="md" bg="blue.0">
                <Group justify="space-between" align="center" wrap="wrap">
                    <Group gap="md">
                        <ActionIcon
                            variant="light"
                            size="lg"
                            onClick={goBack}
                        >
                            <IconArrowLeft size={20} />
                        </ActionIcon>
                        <div>
                            <Title order={2}>{processName || 'Approval Tasks'}</Title>
                            <Text c="dimmed" size="sm">
                                Review and action pending approval requests
                            </Text>
                        </div>
                    </Group>
                    <Group gap="md">
                        <Badge size="lg" variant="filled" color="blue">
                            {tasks.length} {tasks.length === 1 ? 'Task' : 'Tasks'}
                        </Badge>
                        <Button
                            variant="light"
                            leftSection={<IconRefresh size={16} />}
                            onClick={fetchTasks}
                            loading={loading}
                        >
                            Refresh
                        </Button>
                    </Group>
                </Group>
            </Paper>

            {/* Tasks Content */}
            {tasks.length === 0 ? (
                <Paper p="xl" withBorder radius="md">
                    <Center>
                        <Stack align="center" gap="md">
                            <ThemeIcon size={64} radius="xl" variant="light" color="gray">
                                <IconFileCheck size={32} />
                            </ThemeIcon>
                            <Title order={3} c="dimmed">No Pending Tasks</Title>
                            <Text c="dimmed" size="sm" ta="center">
                                All approval tasks for this workflow have been completed.
                            </Text>
                            <Button variant="light" onClick={goBack} leftSection={<IconArrowBack size={16} />}>
                                Back to Workflows
                            </Button>
                        </Stack>
                    </Center>
                </Paper>
            ) : (
                <Card withBorder radius="md" shadow="sm" padding={0}>
                    <Table highlightOnHover verticalSpacing="md">
                        <Table.Thead>
                            <Table.Tr style={{ backgroundColor: 'var(--mantine-color-gray-0)' }}>
                                <Table.Th>
                                    <Group gap={6}>
                                        <IconFileCheck size={16} />
                                        <Text fw={600}>Task Details</Text>
                                    </Group>
                                </Table.Th>
                                <Table.Th>
                                    <Group gap={6}>
                                        <IconUser size={16} />
                                        <Text fw={600}>Assignee</Text>
                                    </Group>
                                </Table.Th>
                                <Table.Th>
                                    <Group gap={6}>
                                        <IconCalendarEvent size={16} />
                                        <Text fw={600}>Created</Text>
                                    </Group>
                                </Table.Th>
                                <Table.Th>
                                    <Group gap={6}>
                                        <Text fw={600}>Priority</Text>
                                    </Group>
                                </Table.Th>
                                <Table.Th>
                                    <Text fw={600}>Actions</Text>
                                </Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {tasks.map((task) => {
                                return (
                                    <Table.Tr key={task.id} style={{ cursor: 'pointer' }} onClick={() => openTaskDetails(task)}>
                                        <Table.Td>
                                            <Stack gap={4}>
                                                <Text fw={600} size="sm">{task.name}</Text>
                                                {task.description && (
                                                    <Text size="xs" c="dimmed" lineClamp={1}>
                                                        {task.description}
                                                    </Text>
                                                )}
                                            </Stack>
                                        </Table.Td>

                                        <Table.Td>
                                            <Group gap="xs">
                                                <ThemeIcon size="sm" variant="light" color="blue">
                                                    <IconUser size={12} />
                                                </ThemeIcon>
                                                <Text size="sm" fw={500}>{task.assignee || 'Unassigned'}</Text>
                                            </Group>
                                        </Table.Td>

                                        <Table.Td>
                                            <Group gap="xs">
                                                <IconClock size={14} />
                                                <Text size="sm">
                                                    {formatDate(task.createTime)}
                                                </Text>
                                            </Group>
                                        </Table.Td>

                                        <Table.Td>
                                            <Badge
                                                size="sm"
                                                color={getPriorityColor(task.priority)}
                                                variant="light"
                                            >
                                                {task.priority || 'normal'}
                                            </Badge>
                                        </Table.Td>

                                        <Table.Td>
                                            <Group gap="xs" wrap="nowrap">
                                                <ActionIcon
                                                    variant="light"
                                                    color="blue"
                                                    size="lg"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        openTaskDetails(task);
                                                    }}
                                                >
                                                    <IconEye size={18} />
                                                </ActionIcon>
                                            </Group>
                                        </Table.Td>
                                    </Table.Tr>
                                );
                            })}
                        </Table.Tbody>
                    </Table>
                </Card>
            )}

            {/* Task Detail Modal */}
            <Modal
                opened={modalOpened}
                onClose={() => {
                    closeModal();
                    setActionType(null);
                    setTaskComment("");
                    setOfferAnalysisData(null);
                }}
                title={
                    <Group gap="xs">
                        <ThemeIcon variant="light" size="lg">
                            <IconInfoCircle size={20} />
                        </ThemeIcon>
                        <Text fw={600} size="lg">
                            {processID === 'OFFER_ANALYSIS_APPROVAL' ? 'Offer Analysis Approval' : 'Task Details'}
                        </Text>
                    </Group>
                }
                size={processID === 'OFFER_ANALYSIS_APPROVAL' ? 'xl' : 'lg'}
            >
                {selectedTask && (
                    <Stack gap="md">
                        {/* Task Info */}
                        <Paper p="md" withBorder radius="md" bg="gray.0">
                            <Stack gap="sm">
                                <Group justify="space-between" align="flex-start">
                                    <div style={{ flex: 1 }}>
                                        <Text fw={700} size="lg">{selectedTask.name}</Text>
                                        {selectedTask.description && (
                                            <Text c="dimmed" size="sm" mt={4}>
                                                {selectedTask.description}
                                            </Text>
                                        )}
                                    </div>
                                    <Badge
                                        size="lg"
                                        color={getPriorityColor(selectedTask.priority)}
                                        variant="filled"
                                    >
                                        {selectedTask.priority || 'normal'} priority
                                    </Badge>
                                </Group>

                                <Divider my="xs" />

                                <Group gap="xl" grow>
                                    <div>
                                        <Text size="xs" c="dimmed" tt="uppercase" fw={600}>Assignee</Text>
                                        <Group gap="xs" mt={4}>
                                            <IconUser size={16} />
                                            <Text size="sm" fw={500}>{selectedTask.assignee || 'Unassigned'}</Text>
                                        </Group>
                                    </div>
                                    <div>
                                        <Text size="xs" c="dimmed" tt="uppercase" fw={600}>Created</Text>
                                        <Group gap="xs" mt={4}>
                                            <IconClock size={16} />
                                            <Text size="sm" fw={500}>
                                                {formatDate(selectedTask.createTime)}
                                            </Text>
                                        </Group>
                                    </div>
                                </Group>

                                {/* Process Variables */}
                                {selectedTask.variables && Object.keys(selectedTask.variables).length > 0 && (
                                    <>
                                        <Divider my="xs" />
                                        <div>
                                            <Text size="sm" fw={600} mb="xs">Process Information</Text>
                                            <Stack gap="xs">
                                                {Object.entries(selectedTask.variables).map(([key, value]) => (
                                                    <Group key={key} justify="space-between" gap="md">
                                                        <Text size="sm" c="dimmed" tt="capitalize">
                                                            {key.replace(/([A-Z])/g, ' $1').trim()}:
                                                        </Text>
                                                        <Text size="sm" fw={500}>
                                                            {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                                        </Text>
                                                    </Group>
                                                ))}
                                            </Stack>
                                        </div>
                                    </>
                                )}
                            </Stack>
                        </Paper>

                        {/* Offer Analysis Details - Only for OFFER_ANALYSIS_APPROVAL */}
                        {processID === 'OFFER_ANALYSIS_APPROVAL' && (
                            <>
                                {offerDataLoading ? (
                                    <Paper p="md" withBorder>
                                        <Center>
                                            <Stack align="center" gap="sm">
                                                <Loader size="sm" />
                                                <Text size="sm" c="dimmed">Loading offer details...</Text>
                                            </Stack>
                                        </Center>
                                    </Paper>
                                ) : offerAnalysisData ? (
                                    <Stack gap="md">
                                        {/* Offer Information */}
                                        <Paper p="md" withBorder radius="md" bg="blue.0">
                                            <Stack gap="sm">
                                                <Group justify="space-between">
                                                    <Group gap="xs">
                                                        <ThemeIcon variant="light" color="blue">
                                                            <IconBuildingBank size={18} />
                                                        </ThemeIcon>
                                                        <Text fw={700} size="md">Offer Information</Text>
                                                    </Group>
                                                    <Badge size="lg" variant="filled">
                                                        {offerAnalysisData.offer.currencyCode}
                                                    </Badge>
                                                </Group>

                                                <Divider />

                                                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                                                    <div>
                                                        <Text size="xs" c="dimmed" tt="uppercase">Cedant</Text>
                                                        <Text fw={600}>{offerAnalysisData.offer.cedant}</Text>
                                                    </div>
                                                    <div>
                                                        <Text size="xs" c="dimmed" tt="uppercase">Insured</Text>
                                                        <Text fw={600}>{offerAnalysisData.offer.insured}</Text>
                                                    </div>
                                                    <div>
                                                        <Text size="xs" c="dimmed" tt="uppercase">Country</Text>
                                                        <Text fw={600}>{offerAnalysisData.offer.country}</Text>
                                                    </div>
                                                    <div>
                                                        <Text size="xs" c="dimmed" tt="uppercase">Broker</Text>
                                                        <Text fw={600}>{offerAnalysisData.offer.broker || 'N/A'}</Text>
                                                    </div>
                                                    <div>
                                                        <Text size="xs" c="dimmed" tt="uppercase">Sum Insured</Text>
                                                        <Text fw={600}>{formatCurrency(offerAnalysisData.offer.sumInsured, offerAnalysisData.offer.currencyCode)}</Text>
                                                    </div>
                                                    <div>
                                                        <Text size="xs" c="dimmed" tt="uppercase">Premium</Text>
                                                        <Text fw={600}>{formatCurrency(offerAnalysisData.offer.premium, offerAnalysisData.offer.currencyCode)}</Text>
                                                    </div>
                                                    <div>
                                                        <Text size="xs" c="dimmed" tt="uppercase">Period</Text>
                                                        <Text fw={600}>
                                                            {new Date(offerAnalysisData.offer.periodFrom).toLocaleDateString()} - {new Date(offerAnalysisData.offer.periodTo).toLocaleDateString()}
                                                        </Text>
                                                    </div>
                                                    <div>
                                                        <Text size="xs" c="dimmed" tt="uppercase">Exchange Rate</Text>
                                                        <Text fw={600}>{offerAnalysisData.offer.exchangeRate.toFixed(6)}</Text>
                                                    </div>
                                                </SimpleGrid>
                                            </Stack>
                                        </Paper>

                                        {/* Analysis Breakdown */}
                                        {offerAnalysisData.analysis && (
                                            <Paper p="md" withBorder radius="md" bg="green.0">
                                                <Stack gap="sm">
                                                    <Group gap="xs">
                                                        <ThemeIcon variant="light" color="green">
                                                            <IconCoin size={18} />
                                                        </ThemeIcon>
                                                        <Text fw={700} size="md">Analysis Breakdown</Text>
                                                    </Group>

                                                    <Divider />

                                                    {/* TAN-RE Share */}
                                                    <Paper p="sm" withBorder bg="white">
                                                        <Stack gap="xs">
                                                            <Text fw={700} size="sm" c="blue">TAN-RE Share Offered</Text>
                                                            <SimpleGrid cols={3} spacing="xs">
                                                                <div>
                                                                    <Text size="xs" c="dimmed">Share %</Text>
                                                                    <Text fw={600}>{formatPercentage(offerAnalysisData.analysis.tanreSharePercent)}</Text>
                                                                </div>
                                                                <div>
                                                                    <Text size="xs" c="dimmed">Exposure</Text>
                                                                    <Text fw={600}>{formatCurrency(offerAnalysisData.analysis.tanreExposure, 'TZS')}</Text>
                                                                </div>
                                                                <div>
                                                                    <Text size="xs" c="dimmed">Premium</Text>
                                                                    <Text fw={600}>{formatCurrency(offerAnalysisData.analysis.tanrePremium, 'TZS')}</Text>
                                                                </div>
                                                            </SimpleGrid>
                                                        </Stack>
                                                    </Paper>

                                                    {/* Accepted Share */}
                                                    <Paper p="sm" withBorder bg="white">
                                                        <Stack gap="xs">
                                                            <Text fw={700} size="sm" c="teal">Share Accepted by TAN-RE</Text>
                                                            <SimpleGrid cols={3} spacing="xs">
                                                                <div>
                                                                    <Text size="xs" c="dimmed">Share %</Text>
                                                                    <Text fw={600}>{formatPercentage(offerAnalysisData.analysis.acceptedSharePercent)}</Text>
                                                                </div>
                                                                <div>
                                                                    <Text size="xs" c="dimmed">Exposure</Text>
                                                                    <Text fw={600}>{formatCurrency(offerAnalysisData.analysis.acceptedExposure, 'TZS')}</Text>
                                                                </div>
                                                                <div>
                                                                    <Text size="xs" c="dimmed">Premium</Text>
                                                                    <Text fw={600}>{formatCurrency(offerAnalysisData.analysis.acceptedPremium, 'TZS')}</Text>
                                                                </div>
                                                            </SimpleGrid>
                                                        </Stack>
                                                    </Paper>

                                                    <Divider label="Breakdown of Accepted Share" labelPosition="center" />

                                                    {/* Retention */}
                                                    <Paper p="sm" withBorder bg="white">
                                                        <Stack gap="xs">
                                                            <Text fw={700} size="sm" c="violet">TAN-RE Retention</Text>
                                                            <SimpleGrid cols={3} spacing="xs">
                                                                <div>
                                                                    <Text size="xs" c="dimmed">Share %</Text>
                                                                    <Text fw={600}>{formatPercentage(offerAnalysisData.analysis.retentionSharePercent)}</Text>
                                                                </div>
                                                                <div>
                                                                    <Text size="xs" c="dimmed">Exposure</Text>
                                                                    <Text fw={600}>{formatCurrency(offerAnalysisData.analysis.retentionExposure, 'TZS')}</Text>
                                                                </div>
                                                                <div>
                                                                    <Text size="xs" c="dimmed">Premium</Text>
                                                                    <Text fw={600}>{formatCurrency(offerAnalysisData.analysis.retentionPremium, 'TZS')}</Text>
                                                                </div>
                                                            </SimpleGrid>
                                                        </Stack>
                                                    </Paper>

                                                    {/* Surplus */}
                                                    <Paper p="sm" withBorder bg="white">
                                                        <Stack gap="xs">
                                                            <Text fw={700} size="sm" c="orange">Surplus Retro</Text>
                                                            <SimpleGrid cols={3} spacing="xs">
                                                                <div>
                                                                    <Text size="xs" c="dimmed">Share %</Text>
                                                                    <Text fw={600}>{formatPercentage(offerAnalysisData.analysis.surplusSharePercent)}</Text>
                                                                </div>
                                                                <div>
                                                                    <Text size="xs" c="dimmed">Exposure</Text>
                                                                    <Text fw={600}>{formatCurrency(offerAnalysisData.analysis.surplusExposure, 'TZS')}</Text>
                                                                </div>
                                                                <div>
                                                                    <Text size="xs" c="dimmed">Premium</Text>
                                                                    <Text fw={600}>{formatCurrency(offerAnalysisData.analysis.surplusPremium, 'TZS')}</Text>
                                                                </div>
                                                            </SimpleGrid>
                                                        </Stack>
                                                    </Paper>

                                                    {/* Fac Retro */}
                                                    <Paper p="sm" withBorder bg="white">
                                                        <Stack gap="xs">
                                                            <Text fw={700} size="sm" c="red">Facultative Retro</Text>
                                                            <SimpleGrid cols={3} spacing="xs">
                                                                <div>
                                                                    <Text size="xs" c="dimmed">Share %</Text>
                                                                    <Text fw={600}>{formatPercentage(offerAnalysisData.analysis.facRetroPercent)}</Text>
                                                                </div>
                                                                <div>
                                                                    <Text size="xs" c="dimmed">Exposure</Text>
                                                                    <Text fw={600}>{formatCurrency(offerAnalysisData.analysis.facRetroExposure, 'TZS')}</Text>
                                                                </div>
                                                                <div>
                                                                    <Text size="xs" c="dimmed">Premium</Text>
                                                                    <Text fw={600}>{formatCurrency(offerAnalysisData.analysis.facRetroPremium, 'TZS')}</Text>
                                                                </div>
                                                            </SimpleGrid>
                                                        </Stack>
                                                    </Paper>

                                                    <Divider />

                                                    {/* Total */}
                                                    <Paper p="sm" withBorder bg="gray.1">
                                                        <Group justify="space-between">
                                                            <Text fw={700} size="md">Total</Text>
                                                            <Group gap="xl">
                                                                <div>
                                                                    <Text size="xs" c="dimmed" ta="right">Total Exposure</Text>
                                                                    <Text fw={700} size="lg">{formatCurrency(offerAnalysisData.analysis.totalExposure, 'TZS')}</Text>
                                                                </div>
                                                                <div>
                                                                    <Text size="xs" c="dimmed" ta="right">Total Premium</Text>
                                                                    <Text fw={700} size="lg">{formatCurrency(offerAnalysisData.analysis.totalPremium, 'TZS')}</Text>
                                                                </div>
                                                            </Group>
                                                        </Group>
                                                    </Paper>
                                                </Stack>
                                            </Paper>
                                        )}
                                    </Stack>
                                ) : null}
                            </>
                        )}

                        {/* Action Selection */}
                        {!actionType ? (
                            <Alert icon={<IconInfoCircle size={16} />} color="blue">
                                Please select an action to proceed with this task
                            </Alert>
                        ) : (
                            <>
                                {/* Comment Field */}
                                <Textarea
                                    label={actionType === 'approve' ? 'Approval Comments (Optional)' : 'Rejection Comments (Required)'}
                                    placeholder={actionType === 'approve'
                                        ? 'Add any comments or notes about your approval...'
                                        : 'Please provide a reason for rejection...'
                                    }
                                    value={taskComment}
                                    onChange={(e) => setTaskComment(e.currentTarget.value)}
                                    rows={4}
                                    required={actionType === 'reject'}
                                />
                            </>
                        )}

                        {/* Action Buttons */}
                        <Group justify="flex-end" gap="sm" mt="md">
                            {!actionType ? (
                                <>
                                    <Button
                                        variant="light"
                                        color="green"
                                        leftSection={<IconCheck size={16} />}
                                        onClick={() => setActionType('approve')}
                                    >
                                        Approve Task
                                    </Button>
                                    <Button
                                        variant="light"
                                        color="red"
                                        leftSection={<IconX size={16} />}
                                        onClick={() => setActionType('reject')}
                                    >
                                        Reject Task
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button
                                        variant="subtle"
                                        onClick={() => {
                                            setActionType(null);
                                            setTaskComment("");
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                    {actionType === 'approve' ? (
                                        <Button
                                            color="green"
                                            leftSection={<IconCheck size={16} />}
                                            onClick={handleApprove}
                                            loading={actionLoading}
                                        >
                                            Confirm Approval
                                        </Button>
                                    ) : (
                                        <Button
                                            color="red"
                                            leftSection={<IconX size={16} />}
                                            onClick={handleReject}
                                            loading={actionLoading}
                                            disabled={!taskComment.trim()}
                                        >
                                            Confirm Rejection
                                        </Button>
                                    )}
                                </>
                            )}
                        </Group>
                    </Stack>
                )}
            </Modal>
        </Stack>
    );
}

// Add missing import
import { Container } from "@mantine/core";
