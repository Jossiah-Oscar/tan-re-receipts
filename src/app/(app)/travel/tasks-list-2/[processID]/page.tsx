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
    SimpleGrid, ScrollArea,
    Box,
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
import { OfferAnalysisDetail } from '@/components/workflow/details/OfferAnalysisDetail';
import { TravelApprovalDetail } from '@/components/workflow/details/TravelApprovalDetail';
import { DebitUploadDetail } from '@/components/workflow/details/DebitUploadDetail';
import { GenericProcessDetail } from '@/components/workflow/details/GenericProcessDetail';

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
    comments: FlowableComments [];
};


type FlowableComments = {
    approverUsername:string;
    timestamp:string;
    commentText:string;
    "taskName": string;
    "taskId": string
}

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
        type?: 'facultative' | 'policy-cession';
        tanreSharePercent: number;
        tanreExposure: number;
        tanrePremium: number;
        acceptedSharePercent: number;
        acceptedExposure: number;
        acceptedPremium: number;
        retentionSharePercent: number;
        retentionExposure: number;
        retentionPremium: number;
        // Facultative fields
        surplusSharePercent?: number;
        surplusExposure?: number;
        surplusPremium?: number;
        facRetroPercent?: number;
        facRetroExposure?: number;
        facRetroPremium?: number;
        // Policy Cession fields (note: API uses 'Percent' not 'SharePercent')
        firstSurplusPercent?: number;
        firstSurplusExposure?: number;
        firstSurplusPremium?: number;
        secondSurplusPercent?: number;
        secondSurplusExposure?: number;
        secondSurplusPremium?: number;
        autoFacRetroPercent?: number;
        autoFacRetroExposure?: number;
        autoFacRetroPremium?: number;
        totalExposure: number;
        totalPremium: number;
    };
};

type DebitUploadCaseData = {
    id: number;
    caseName: string;
    cedant: string;
    reinsurer: string;
    lineOfBusiness: string;
    status: 'PENDING' | 'READY';
    checklist: Array<{
        id: number;
        documentName: string;
        section: 'OPERATIONS' | 'FINANCE';
        files: Array<{
            id: number;
            fileName: string;
            originalFileName: string;
            contentType: string;
            fileSize: number;
            uploadedBy: string;
            uploadedAt: string;
        }>;
    }>;
    operationsApprovalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
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
    const [taskCommentHistory, setTaskCommentHistory] = useState<FlowableComments[]>([]);
    const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);

    // Offer analysis data
    const [offerAnalysisData, setOfferAnalysisData] = useState<OfferAnalysisData | null>(null);
    const [offerDataLoading, setOfferDataLoading] = useState(false);

    // Debit upload case data
    const [debitUploadCaseData, setDebitUploadCaseData] = useState<DebitUploadCaseData | null>(null);

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
            setTaskCommentHistory([]);
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
            setTaskCommentHistory([]);
            await fetchTasks(); // Refresh task list
        } catch (error) {
            console.error('Error rejecting task:', error);
        } finally {
            setActionLoading(false);
        }
    }

    async function fetchOfferAnalysisData(offerId: number, offerType?: string) {
        setOfferDataLoading(true);
        try {
            // Determine the endpoint based on offer type
            // Normalize the offerType to uppercase for comparison
            const normalizedType = offerType?.toUpperCase();
            let endpoint = '';
            let data: OfferAnalysisData | null = null;

            if (normalizedType === 'POLICY_CESSION') {
                // Fetch from policy cession endpoint
                endpoint = `/api/underwriting/policy-cession/offer/${offerId}`;
                data = await apiFetch<OfferAnalysisData>(endpoint, { cache: "no-store" });
                console.log("This is a policy cession");
                console.log("Policy Cession API Response:", JSON.stringify(data, null, 2));
                // Set the type field so UI can render correctly
                if (data && data.analysis) {
                    data.analysis.type = 'policy-cession';
                }
            } else if (normalizedType === 'FACULTATIVE') {
                // Fetch from facultative endpoint
                endpoint = `/api/underwriting/facultative/offer/${offerId}`;
                data = await apiFetch<OfferAnalysisData>(endpoint, { cache: "no-store" });
                // Set the type field so UI can render correctly
                if (data && data.analysis) {
                    data.analysis.type = 'facultative';
                }
            } else {
                // No type specified - try facultative first, then policy cession
                try {
                    endpoint = `/api/underwriting/facultative/offer/${offerId}`;
                    data = await apiFetch<OfferAnalysisData>(endpoint, { cache: "no-store" });
                    if (data && data.analysis) {
                        data.analysis.type = 'facultative';
                    }
                } catch (facultativeError) {
                    // If facultative fails, try policy cession
                    try {
                        endpoint = `/api/underwriting/policy-cession/offer/${offerId}`;
                        data = await apiFetch<OfferAnalysisData>(endpoint, { cache: "no-store" });
                        if (data && data.analysis) {
                            data.analysis.type = 'policy-cession';
                        }
                    } catch (policyCessionError) {
                        throw facultativeError; // Throw original error if both fail
                    }
                }
            }

            console.log('Fetched offer data:', data); // Debug log
            setOfferAnalysisData(data);
        } catch (error) {
            console.error('Error fetching offer analysis data:', error);
            setOfferAnalysisData(null);
        } finally {
            setOfferDataLoading(false);
        }
    }

    async function fetchTaskComments(offerId: number, offerType?: string) {
        setOfferDataLoading(true);
        try {
            // Determine the endpoint based on offer type
            // Normalize the offerType to uppercase for comparison
            const normalizedType = offerType?.toUpperCase();
            let endpoint = '';
            let data: FlowableComments[] | null = null;

            if (normalizedType === 'POLICY_CESSION') {
                endpoint = `/api/underwriting/policy-cession/offer/${offerId}/approval-history`;
                data = await apiFetch<FlowableComments[]>(endpoint, { cache: "no-store" });
            } else if (normalizedType === 'FACULTATIVE') {
                endpoint = `/api/underwriting/facultative/offer/${offerId}/approval-history`;
                data = await apiFetch<FlowableComments[]>(endpoint, { cache: "no-store" });
            } else {
                // No type specified - try facultative first, then policy cession
                try {
                    endpoint = `/api/underwriting/facultative/offer/${offerId}/approval-history`;
                    data = await apiFetch<FlowableComments[]>(endpoint, { cache: "no-store" });
                } catch (facultativeError) {
                    try {
                        endpoint = `/api/underwriting/policy-cession/offer/${offerId}/approval-history`;
                        data = await apiFetch<FlowableComments[]>(endpoint, { cache: "no-store" });
                    } catch (policyCessionError) {
                        throw facultativeError;
                    }
                }
            }

            setTaskCommentHistory(data || []);
        } catch (error) {
            console.error('Error fetching offer comments:', error);
            setTaskCommentHistory([]);
        } finally {
            setOfferDataLoading(false);
        }
    }

    async function fetchDebitUploadData(caseId: number) {
        setOfferDataLoading(true);
        try {
            const response = await apiFetch<DebitUploadCaseData>(
                `/api/document-tracker/cases/${caseId}`,
                {
                    requiresAuth: true,
                    cache: "no-store"
                }
            );
            setDebitUploadCaseData(response);
        } catch (error) {
            console.error('Error fetching debit upload case data:', error);
            setDebitUploadCaseData(null);
        } finally {
            setOfferDataLoading(false);
        }
    }

    function openTaskDetails(task: FlowableTask) {
        setSelectedTask(task);
        setTaskComment("");
        setActionType(null);
        setOfferAnalysisData(null);
        setDebitUploadCaseData(null);

        // Switch statement for process-specific data fetching
        switch (processID) {
            case 'OFFER_ANALYSIS_APPROVAL':
                if (task.variables?.offerId) {
                    const offerType = task.variables?.offerType || task.variables?.type || task.variables?.analysisType;
                    fetchOfferAnalysisData(task.variables.offerId, offerType);
                    fetchTaskComments(task.variables.offerId, offerType);
                }
                break;

            case 'TRAVEL_APPROVAL':
                // TODO: Fetch travel-specific data when implemented
                // if (task.variables?.travelId) {
                //   fetchTravelData(task.variables.travelId);
                // }
                break;

            case 'DOCUMENT_TRACKER_APPROVAL':
                if (task.variables?.caseId) {
                    fetchDebitUploadData(task.variables.caseId);
                }
                break;

            default:
                // No specific data to fetch for unknown processes
                break;
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

    function getModalTitle(): string {
        switch (processID) {
            case 'OFFER_ANALYSIS_APPROVAL':
                return 'Offer Analysis Approval';
            case 'TRAVEL_APPROVAL':
                return 'Travel Request Approval';
            case 'DOCUMENT_TRACKER_APPROVAL':
                return 'Document Tracker Approval';
            default:
                return 'Task Details';
        }
    }

    function getModalSize(): 'sm' | 'md' | 'lg' | 'xl' {
        switch (processID) {
            case 'OFFER_ANALYSIS_APPROVAL':
                return 'xl';
            case 'TRAVEL_APPROVAL':
            case 'DOCUMENT_TRACKER_APPROVAL':
                return 'lg';
            default:
                return 'lg';
        }
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
                    setDebitUploadCaseData(null);
                    setTaskCommentHistory([]);
                }}
                title={
                    <Group gap="xs">
                        <ThemeIcon variant="light" size="lg">
                            <IconInfoCircle size={20} />
                        </ThemeIcon>
                        <Text fw={600} size="lg">
                            {getModalTitle()}
                        </Text>
                    </Group>
                }
                size={getModalSize()}
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
                                    {/*<div>*/}
                                    {/*    <Text size="xs" c="dimmed" tt="uppercase" fw={600}>Assignee</Text>*/}
                                    {/*    <Group gap="xs" mt={4}>*/}
                                    {/*        <IconUser size={16} />*/}
                                    {/*        <Text size="sm" fw={500}>{selectedTask.assignee || 'Unassigned'}</Text>*/}
                                    {/*    </Group>*/}
                                    {/*</div>*/}
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
                                            {/*<Text size="sm" fw={600} mb="xs">Notes</Text>Text*/}
                                            {/*<Stack gap="xs">*/}
                                            {/*    {Object.entries(selectedTask.variables).map(([key, value]) => (*/}
                                            {/*        <Group key={key} justify="space-between" gap="md">*/}
                                            {/*            <Text size="sm" c="dimmed" tt="capitalize">*/}
                                            {/*                {key.replace(/([A-Z])/g, ' $1').trim()}:*/}
                                            {/*            </Text>*/}
                                            {/*            <Text size="sm" fw={500}>*/}
                                            {/*                {typeof value === 'object' ? JSON.stringify(value) : String(value)}*/}
                                            {/*            </Text>*/}
                                            {/*        </Group>*/}
                                            {/*    ))}*/}
                                            {/*</Stack>*/}


                                        </div>
                                    </>
                                )}
                            </Stack>
                        </Paper>

                        {/* Process-specific Details */}
                        {(() => {
                            switch (processID) {
                                case 'OFFER_ANALYSIS_APPROVAL':
                                    return (
                                        <OfferAnalysisDetail
                                            data={offerAnalysisData}
                                            task={selectedTask}
                                            loading={offerDataLoading}
                                        />
                                    );

                                case 'TRAVEL_APPROVAL':
                                    return (
                                        <TravelApprovalDetail
                                            data={offerAnalysisData}
                                            task={selectedTask}
                                            loading={offerDataLoading}
                                        />
                                    );

                                case 'DOCUMENT_TRACKER_APPROVAL':
                                    return (
                                        <DebitUploadDetail
                                            data={debitUploadCaseData}
                                            task={selectedTask}
                                            loading={offerDataLoading}
                                        />
                                    );

                                default:
                                    return (
                                        <GenericProcessDetail
                                            data={offerAnalysisData}
                                            task={selectedTask}
                                            loading={offerDataLoading}
                                        />
                                    );
                            }
                        })()}


                        {/* Comment History Section */}
                        {taskCommentHistory && taskCommentHistory.length > 0 && (
                            <Paper p="md" withBorder radius="md" bg="gray.0">
                                <Stack gap="sm">
                                    <Group gap="xs">
                                        <ThemeIcon variant="light" color="blue">
                                            <IconInfoCircle size={18} />
                                        </ThemeIcon>
                                        <Text fw={600} size="md">Approval History ({taskCommentHistory.length})</Text>
                                    </Group>
                                    <Divider />
                                    <ScrollArea h={200}>
                                        <Stack gap="xs">
                                            {taskCommentHistory.map((comment, idx) => (
                                                <Paper key={idx} p="sm" withBorder bg="white" shadow="xs">
                                                    <Stack gap="xs">
                                                        <Group justify="space-between">
                                                            <Group gap="xs">
                                                                <ThemeIcon size="sm" variant="light" color="blue">
                                                                    <IconUser size={14} />
                                                                </ThemeIcon>
                                                                <Text fw={600} size="sm">{comment.approverUsername}</Text>
                                                                {comment.taskName && (
                                                                    <Badge size="sm" variant="dot">
                                                                        {comment.taskName}
                                                                    </Badge>
                                                                )}
                                                            </Group>
                                                            <Group gap="xs">
                                                                <IconClock size={14} />
                                                                <Text size="xs" c="dimmed">
                                                                    {formatDate(comment.timestamp)}
                                                                </Text>
                                                            </Group>
                                                        </Group>
                                                        <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>
                                                            {comment.commentText}
                                                        </Text>
                                                    </Stack>
                                                </Paper>
                                            ))}
                                        </Stack>
                                    </ScrollArea>
                                </Stack>
                            </Paper>
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
