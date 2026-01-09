"use client";

import { useState, useEffect } from "react";
import {
    Table,
    Button,
    Loader,
    Text,
    ActionIcon,
    Group,
    Paper,
    Badge,
    Stack,
    Tooltip,
    Center,
    Title,
    Alert,
    ScrollArea
} from "@mantine/core";
import { IconEdit, IconTrash, IconTarget, IconAlertCircle } from "@tabler/icons-react";
import { showNotification } from "@mantine/notifications";
import { apiFetch } from "@/config/api";
import TargetModal from "@/components/admin/TargetModal";
import { YearlyTarget } from "@/types/target";

export default function TargetsTab() {
    const [targets, setTargets] = useState<YearlyTarget[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<YearlyTarget | null>(null);

    const currentYear = new Date().getFullYear();
    const currentYearHasTarget = targets.some(t => t.year === currentYear);

    useEffect(() => {
        loadTargets();
    }, []);

    async function loadTargets() {
        setLoading(true);
        try {
            const data = await apiFetch<YearlyTarget[]>("/targets");
            setTargets(data.sort((a, b) => b.year - a.year));
        } catch (e: any) {
            showNotification({
                title: "Error",
                message: e.message || "Failed to load targets",
                color: "red"
            });
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete(year: number) {
        if (targets.length === 1) {
            showNotification({
                title: "Cannot Delete",
                message: "Cannot delete the last target. At least one target must exist.",
                color: "orange"
            });
            return;
        }

        const confirmed = window.confirm(
            `Delete target for year ${year}?\n\nThis action cannot be undone.`
        );

        if (confirmed) {
            try {
                await apiFetch(`/targets/${year}`, { method: "DELETE" });
                showNotification({
                    title: "Success",
                    message: `Target for ${year} deleted`,
                    color: "green"
                });
                loadTargets();
            } catch (e: any) {
                showNotification({
                    title: "Error",
                    message: e.message || "Failed to delete target",
                    color: "red"
                });
            }
        }
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-TZ", {
            style: "currency",
            currency: "TZS",
            notation: "compact",
            maximumFractionDigits: 2
        }).format(amount);
    };

    if (loading) {
        return (
            <Center h={200}>
                <Loader size="lg" />
            </Center>
        );
    }

    return (
        <Stack gap="md">
            <Paper shadow="xs" p="md" radius="md">
                <Group justify="space-between" mb="md">
                    <div>
                        <Title order={3}>Yearly Targets Management</Title>
                        <Text size="sm" c="dimmed">
                            {targets.length} target{targets.length !== 1 ? "s" : ""} configured
                        </Text>
                    </div>
                    {!currentYearHasTarget && (
                        <Button
                            leftSection={<IconTarget size={18} />}
                            onClick={() => {
                                setEditTarget(null);
                                setModalOpen(true);
                            }}
                        >
                            Add New Target
                        </Button>
                    )}
                </Group>

                {!currentYearHasTarget && (
                    <Alert
                        icon={<IconAlertCircle size={16} />}
                        color="orange"
                        variant="light"
                        mb="md"
                    >
                        <Text size="sm">
                            No target configured for {currentYear}. Dashboard will use fallback from previous year.
                        </Text>
                    </Alert>
                )}

                {targets.length === 0 ? (
                    <Center h={200}>
                        <Stack align="center" gap="sm">
                            <IconTarget size={48} stroke={1.5} color="#aaa" />
                            <Text c="dimmed">No targets configured</Text>
                            <Button
                                variant="light"
                                leftSection={<IconTarget size={18} />}
                                onClick={() => {
                                    setEditTarget(null);
                                    setModalOpen(true);
                                }}
                            >
                                Create First Target
                            </Button>
                        </Stack>
                    </Center>
                ) : (
                    <ScrollArea>
                        <Table striped highlightOnHover>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>Year</Table.Th>
                                    <Table.Th>Target Amount</Table.Th>
                                    <Table.Th>Monthly Target</Table.Th>
                                    <Table.Th>Last Updated</Table.Th>
                                    <Table.Th>Updated By</Table.Th>
                                    <Table.Th>Actions</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {targets.map((target) => {
                                    const isCurrentYear = target.year === currentYear;
                                    return (
                                        <Table.Tr
                                            key={target.id}
                                            style={{
                                                backgroundColor: isCurrentYear ? "rgba(59, 130, 246, 0.05)" : undefined
                                            }}
                                        >
                                            <Table.Td>
                                                <Group gap="xs">
                                                    <Text fw={isCurrentYear ? 600 : 400}>
                                                        {target.year}
                                                    </Text>
                                                    {isCurrentYear && (
                                                        <Badge size="xs" color="blue" variant="light">
                                                            Current
                                                        </Badge>
                                                    )}
                                                </Group>
                                            </Table.Td>
                                            <Table.Td>
                                                <Text fw={500}>{formatCurrency(target.targetAmount)}</Text>
                                            </Table.Td>
                                            <Table.Td>
                                                <Text c="dimmed">
                                                    {formatCurrency(target.targetAmount / 12)}
                                                </Text>
                                            </Table.Td>
                                            <Table.Td>
                                                <Text size="sm">
                                                    {new Date(target.updatedAt).toLocaleDateString()}
                                                </Text>
                                            </Table.Td>
                                            <Table.Td>
                                                <Text size="sm" c="dimmed">
                                                    {target.updatedBy || target.createdBy || "-"}
                                                </Text>
                                            </Table.Td>
                                            <Table.Td>
                                                <Group gap="xs">
                                                    <Tooltip label="Edit target">
                                                        <ActionIcon
                                                            variant="subtle"
                                                            color="blue"
                                                            onClick={() => {
                                                                setEditTarget(target);
                                                                setModalOpen(true);
                                                            }}
                                                        >
                                                            <IconEdit size={18} />
                                                        </ActionIcon>
                                                    </Tooltip>
                                                    <Tooltip label={targets.length === 1 ? "Cannot delete last target" : "Delete target"}>
                                                        <ActionIcon
                                                            variant="subtle"
                                                            color="red"
                                                            onClick={() => handleDelete(target.year)}
                                                            disabled={targets.length === 1}
                                                        >
                                                            <IconTrash size={18} />
                                                        </ActionIcon>
                                                    </Tooltip>
                                                </Group>
                                            </Table.Td>
                                        </Table.Tr>
                                    );
                                })}
                            </Table.Tbody>
                        </Table>
                    </ScrollArea>
                )}
            </Paper>

            <TargetModal
                opened={modalOpen}
                onClose={() => {
                    setModalOpen(false);
                    setEditTarget(null);
                }}
                onSaved={() => {
                    setModalOpen(false);
                    setEditTarget(null);
                    loadTargets();
                }}
                editTarget={editTarget}
            />
        </Stack>
    );
}
