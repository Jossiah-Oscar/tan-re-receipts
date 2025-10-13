"use client";

import {ActionIcon, Badge, Button, Card, Chip, Divider, Group, Loader, Menu, Modal, Paper, ScrollArea, Stack, Table, Tabs, Text, Textarea, TextInput, ThemeIcon, Title} from "@mantine/core";
import {IconAlertCircle, IconArrowDown, IconArrowsSort, IconArrowUp, IconBuilding, IconCalendarEvent, IconClock, IconEye, IconFilter, IconRefresh, IconSearch, IconUser} from "@tabler/icons-react";
import React, {useEffect, useState} from "react";
import {apiFetch} from "@/config/api";
import {useDisclosure} from "@mantine/hooks";
import {useParams} from "next/navigation";

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

const DEFAULT_TASKS: FlowableTask[] = [
    {
        id: "task-001",
        name: "Review Purchase Request",
        assignee: "john.doe",
        createTime: "2024-09-14T10:30:00Z",
        dueDate: "2024-09-16T17:00:00Z",
        priority: "high",
        processInstanceId: "purchase-approval",
        processDefinitionName: "Purchase Approval Process",
        description: "Review and approve purchase request for office equipment",
        variables: { requestAmount: 2500, department: "IT" },
    },
    {
        id: "task-002",
        name: "Approve Leave Request",
        assignee: "jane.smith",
        createTime: "2024-09-13T14:20:00Z",
        dueDate: "2024-09-15T12:00:00Z",
        priority: "medium",
        processInstanceId: "leave-management",
        processDefinitionName: "Leave Management Process",
        description: "Approve employee leave request for vacation",
        variables: { employeeName: "Bob Wilson", leaveType: "Annual Leave" },
        // actions: ["approve", "reject"]
    },
    ]

export default function FlowableTasksCenter() {
    const [loading, setLoading] = useState(false);
    const [tasks, setTasks] = useState<FlowableTask[]>(DEFAULT_TASKS);
    const params = useParams();
    const processID = params?.processID as string;
    const [processName, setProcessName] = useState<string>("");


    useEffect(() => {
        fetchTasks();
        const processName = localStorage.getItem('processName');
        if (processName) setProcessName(processName);
    },[processID])

    const fetchTasks = async () => {
        setLoading(true);
        try {
            const res = await apiFetch<FlowableTask[]>(`/api/approvals/tasks/${processID}`, { cache: "no-store" });
            setTasks(res);
        } catch (error) {
            console.error('Error fetching tasks:', error);
            // Keep defaults on error
        } finally {
            setLoading(false);
        }
    };

    async function approve(comment : string, taskId : string) {
        const userId: string  = "jkibona"
        await apiFetch(`/api/approvals/tasks/${taskId}/approve`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: {
                userId,
                comment
            },
            requiresAuth: true,
        }).then(() => closeModal());
        // setOpen(false); setActionFor(null); setComment(""); await load();
    }

    async function reject(comment : string, taskId : string) {
        const userId: string  = "jkibona"
        await apiFetch(`/api/approvals/tasks/${taskId}/reject`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: {
                userId,
                comment
            },
            requiresAuth: true,
        }).then(() => closeModal());
        // setOpen(false); setActionFor(null); setComment(""); await load();
    }

    // Modal state
    const [selectedTask, setSelectedTask] = useState<FlowableTask | null>(null);
    const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);
    const [taskComment, setTaskComment] = useState("");

    function openTaskDetails(task: FlowableTask) {
        setSelectedTask(task);
        setTaskComment("");
        openModal();
    }

    function formatDate(iso: string) {
        try {
            return new Intl.DateTimeFormat("en-US", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            }).format(new Date(iso));
        } catch {
            return iso;
        }
    }

    return (
        <Stack gap="md" p={{ base: "md", sm: "lg" }}>
            {/* Header */}
            <Stack gap={4}>
                <Group justify="space-between" align="center">
                    <Title order={2}>{processName}</Title>
                    <Group gap="xs">
                        {/*<ActionIcon variant="light" onClick={refreshTasks} loading={loading || processesLoading}>*/}
                        {/*    <IconRefresh size={16} />*/}
                        {/*</ActionIcon>*/}
                        <Badge variant="light" color="blue">
                            {tasks.length} tasks
                        </Badge>
                    </Group>
                </Group>
                <Text c="dimmed" size="sm">
                    Manage tasks across all your process workflows
                </Text>
            </Stack>

            {/* Process Overview */}
            <Card withBorder radius="md" p="md">

            </Card>

            {/* Main Content */}
            <Card withBorder radius="md" shadow="xs">
                {/* Toolbar */}
                <Group justify="space-between" align="center" p="md" gap="sm" wrap="wrap">
                {/*    <TextInput*/}
                {/*        value={query}*/}
                {/*        onChange={(e) => setQuery(e.currentTarget.value)}*/}
                {/*        placeholder="Search tasks, assignees, or processes..."*/}
                {/*        leftSection={<IconSearch size={16} />}*/}
                {/*        w={{ base: "100%", sm: 360 }}*/}
                {/*    />*/}

                    {/*<Group gap="xs" wrap="nowrap">*/}
                    {/*    <Menu shadow="md" width={250}>*/}
                    {/*        <Menu.Target>*/}
                    {/*            <Button*/}
                    {/*                variant="default"*/}
                    {/*                leftSection={<IconFilter size={16} />}*/}
                    {/*                rightSection={activeFiltersCount > 0 ? (*/}
                    {/*                    <Badge size="xs" color="blue" variant="filled">*/}
                    {/*                        {activeFiltersCount}*/}
                    {/*                    </Badge>*/}
                    {/*                ) : null}*/}
                    {/*            >*/}
                    {/*                Filters*/}
                    {/*            </Button>*/}
                    {/*        </Menu.Target>*/}
                    {/*        <Menu.Dropdown>*/}
                    {/*            <Menu.Label>Filter by Priority</Menu.Label>*/}
                    {/*            <Group gap="xs" p="xs">*/}
                    {/*                {['high', 'medium', 'low'].map(priority => (*/}
                    {/*                    <Chip*/}
                    {/*                        key={priority}*/}
                    {/*                        checked={selectedPriorities.includes(priority)}*/}
                    {/*                        onChange={() => {*/}
                    {/*                            setSelectedPriorities(prev =>*/}
                    {/*                                prev.includes(priority)*/}
                    {/*                                    ? prev.filter(p => p !== priority)*/}
                    {/*                                    : [...prev, priority]*/}
                    {/*                            );*/}
                    {/*                        }}*/}
                    {/*                        color={getPriorityColor(priority)}*/}
                    {/*                        size="xs"*/}
                    {/*                    >*/}
                    {/*                        {priority}*/}
                    {/*                    </Chip>*/}
                    {/*                ))}*/}
                    {/*            </Group>*/}
                    {/*            {activeFiltersCount > 0 && (*/}
                    {/*                <>*/}
                    {/*                    <Divider />*/}
                    {/*                    <Menu.Item*/}
                    {/*                        onClick={() => {*/}
                    {/*                            setSelectedProcesses([]);*/}
                    {/*                            setSelectedPriorities([]);*/}
                    {/*                        }}*/}
                    {/*                    >*/}
                    {/*                        Clear all filters*/}
                    {/*                    </Menu.Item>*/}
                    {/*                </>*/}
                    {/*            )}*/}
                    {/*        </Menu.Dropdown>*/}
                    {/*    </Menu>*/}

                    {/*    <Button*/}
                    {/*        variant="default"*/}
                    {/*        leftSection={sortDir === "asc" ? <IconArrowUp size={16} /> : <IconArrowDown size={16} />}*/}
                    {/*        onClick={() => setSortDir(d => d === "asc" ? "desc" : "asc")}*/}
                    {/*    >*/}
                    {/*        {sortDir === "asc" ? "Asc" : "Desc"}*/}
                    {/*    </Button>*/}

                    {/*    <Button*/}
                    {/*        variant="default"*/}
                    {/*        leftSection={<IconArrowsSort size={16} />}*/}
                    {/*        onClick={() => {*/}
                    {/*            const order: SortKey[] = ["dueDate", "priority", "name", "assignee", "created"];*/}
                    {/*            setSortKey(k => order[(order.indexOf(k) + 1) % order.length]);*/}
                    {/*        }}*/}
                    {/*    >*/}
                    {/*        Sort: {sortKey}*/}
                    {/*    </Button>*/}
                    {/*</Group>*/}
                </Group>

                {/* Tasks Table */}
                <ScrollArea>
                    <Table highlightOnHover verticalSpacing="sm">
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>Task Details</Table.Th>
                                <Table.Th>
                                    <Group gap={6}>
                                        <IconUser size={16} />
                                        Assignee
                                    </Group>
                                </Table.Th>
                                <Table.Th>
                                    <Group gap={6}>
                                        <IconCalendarEvent size={16} />
                                        Created Date
                                    </Group>
                                </Table.Th>
                                {/*<Table.Th>Process</Table.Th>*/}
                                <Table.Th>Actions</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {tasks.map((task) => {
                                // const overdue = isOverdue(task.dueDate);
                                // const isActionLoading = actionLoading === task.id;

                                return (
                                    <Table.Tr key={task.id}>
                                        <Table.Td>
                                            <Stack gap={4}>
                                                <Group gap="xs" align="flex-start">
                                                    <div>
                                                        <Text fw={500} size="sm">{task.name}</Text>
                                                        {task.description && (
                                                            <Text size="xs" lineClamp={1}>
                                                                {task.description}
                                                            </Text>
                                                        )}
                                                    </div>
                                                    <Badge
                                                        size="xs"
                                                        color="blue"
                                                        variant="light"
                                                    >
                                                        {task.priority}
                                                    </Badge>
                                                </Group>
                                            </Stack>
                                        </Table.Td>

                                        <Table.Td>
                                            <Group gap="xs">
                                                <IconUser size={14} />
                                                <Text size="sm" c="blue" fw={700}>{task.assignee}</Text>
                                            </Group>
                                        </Table.Td>

                                        <Table.Td>
                                            <Group gap="xs">
                                                <IconClock size={14} />
                                                <Text  size="sm">
                                                    {formatDate(task.createTime)}
                                                </Text>
                                            </Group>
                                        </Table.Td>

                                        <Table.Td>
                                            <Group gap="xs" wrap="nowrap">
                                                <ActionIcon
                                                    variant="light"
                                                    size="sm"
                                                    onClick={() => openTaskDetails(task)}
                                                >
                                                    <IconEye size={14} />
                                                </ActionIcon>

                                                {/*{task.actions.slice(0, 2).map(action => (*/}
                                                {/*    <ActionIcon*/}
                                                {/*        key={action}*/}
                                                {/*        variant="light"*/}
                                                {/*        color={getActionColor(action)}*/}
                                                {/*        size="sm"*/}
                                                {/*        loading={isActionLoading}*/}
                                                {/*        onClick={() => handleTaskAction(task.id, action)}*/}
                                                {/*        disabled={isActionLoading}*/}
                                                {/*    >*/}
                                                {/*        {getActionIcon(action)}*/}
                                                {/*    </ActionIcon>*/}
                                                {/*))}*/}

                                                {/*{task.actions.length > 2 && (*/}
                                                {/*    <Menu shadow="md">*/}
                                                {/*        <Menu.Target>*/}
                                                {/*            <ActionIcon variant="light" size="sm">*/}
                                                {/*                <IconDots size={14} />*/}
                                                {/*            </ActionIcon>*/}
                                                {/*        </Menu.Target>*/}
                                                {/*        <Menu.Dropdown>*/}
                                                {/*            {task.actions.slice(2).map(action => (*/}
                                                {/*                <Menu.Item*/}
                                                {/*                    key={action}*/}
                                                {/*                    leftSection={getActionIcon(action)}*/}
                                                {/*                    onClick={() => handleTaskAction(task.id, action)}*/}
                                                {/*                    disabled={isActionLoading}*/}
                                                {/*                >*/}
                                                {/*                    {action.replace('-', ' ')}*/}
                                                {/*                </Menu.Item>*/}
                                                {/*            ))}*/}
                                                {/*        </Menu.Dropdown>*/}
                                                {/*    </Menu>*/}
                                                {/*)}*/}
                                            </Group>
                                        </Table.Td>
                                    </Table.Tr>
                                );
                            })}

                            {tasks.length === 0 && (
                                <Table.Tr>
                                    <Table.Td colSpan={5}>
                                        <Stack align="center" gap="sm" py="xl">
                                            {loading ? (
                                                <Loader size="sm" />
                                            ) : (
                                                <IconAlertCircle size={32} color="gray" />
                                            )}
                                            <Text c="dimmed">
                                                {loading ? "Loading tasks…" : "No tasks found matching your criteria"}
                                            </Text>
                                        </Stack>
                                    </Table.Td>
                                </Table.Tr>
                            )}
                        </Table.Tbody>
                    </Table>
                </ScrollArea>
            </Card>

            {/* Task Detail Modal */}
            <Modal
                opened={modalOpened}
                onClose={closeModal}
                title="Task Details"
                size="lg"
            >
                {selectedTask && (
                    <Stack gap="md">
                        {/* Task Info */}
                        <Paper p="md" withBorder>
                            <Stack gap="sm">
                                <Group justify="space-between" align="flex-start">
                                    <div>
                                        <Text fw={600} size="lg">{selectedTask.name}</Text>
                                        <Text c="dimmed" size="sm">{selectedTask.description}</Text>
                                    </div>
                                    <Group gap="xs">
                                        <Badge >
                                            {selectedTask.processDefinitionName}
                                        </Badge>
                                        <Badge >
                                            {selectedTask.priority} priority
                                        </Badge>
                                    </Group>
                                </Group>

                                <Group gap="xl">
                                    <div>
                                        <Text size="xs" c="dimmed">Assignee</Text>
                                        <Text size="sm" fw={500}>{selectedTask.assignee}</Text>
                                    </div>
                                    <div>
                                        <Text size="xs" c="dimmed">Due Date</Text>
                                        <Text size="sm" fw={500}>
                                            {formatDate(selectedTask.dueDate)}
                                        </Text>
                                    </div>
                                    <div>
                                        <Text size="xs" c="dimmed">Created</Text>
                                        <Text size="sm" fw={500}>{formatDate(selectedTask.createTime)}</Text>
                                    </div>
                                </Group>

                                {/* Process Variables */}
                                {selectedTask.variables && Object.keys(selectedTask.variables).length > 0 && (
                                    <div>
                                        <Text size="sm" fw={500} mb="xs">Process Information</Text>
                                        <Paper p="sm" bg="gray.1">
                                            <Stack gap="xs">
                                                {Object.entries(selectedTask.variables).map(([key, value]) => (
                                                    <Group key={key} justify="space-between">
                                                        <Text size="xs" fw={500} tt="capitalize">
                                                            {key.replace(/([A-Z])/g, ' $1').trim()}:
                                                        </Text>
                                                        <Text size="xs" c="dimmed">
                                                            {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                                        </Text>
                                                    </Group>
                                                ))}
                                            </Stack>
                                        </Paper>
                                    </div>
                                )}
                            </Stack>
                        </Paper>

                        {/* Comment Field */}
                        <Textarea
                            label="Comments (Optional)"
                            placeholder="Add any comments or notes..."
                            value={taskComment}
                            onChange={(e) => setTaskComment(e.currentTarget.value)}
                            rows={3}
                        />

                        {/* Action Buttons */}

                        <Group justify="flex-end" gap="sm">
                            <Button variant="default" onClick={() => approve(taskComment, selectedTask?.id)}>
                                Approve
                            </Button>
                            <Button variant="default" onClick={() => reject(taskComment, selectedTask?.id)}>
                                Reject
                            </Button>
                            <Button variant="default" onClick={closeModal}>
                                Cancel
                            </Button>
                        </Group>
                    </Stack>
                )}
            </Modal>
        </Stack>
    );
}
