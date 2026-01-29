'use client';

import { useState, useEffect, useMemo } from 'react';
import {
    Table,
    Button,
    TextInput,
    Paper,
    Group,
    ActionIcon,
    Tooltip,
    Text,
    Stack,
    Loader,
    Center,
    Badge,
    Select,
    rem,
    NumberFormatter
} from '@mantine/core';
import { IconPlus, IconSearch, IconEdit, IconTrash, IconAlertCircle, IconFilter } from '@tabler/icons-react';
import { showNotification } from '@mantine/notifications';
import { modals } from '@mantine/modals';
import { apiFetch } from '@/config/api';
import PolicyCessionCapacityModal from './PolicyCessionCapacityModal';

interface PolicyCessionCapacity {
    id: number;
    retroTypeId: number;
    retroTypeName?: string;
    year: number;
    currency: string;
    retention: number;
    firstSurplusLines: number;
    secondSurplusLines: number;
    autoFacRetroLimit: number;
    createdAt?: string;
    updatedAt?: string;
}

export default function PolicyCessionCapacitiesTable() {
    const [capacities, setCapacities] = useState<PolicyCessionCapacity[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [yearFilter, setYearFilter] = useState<string | null>(null);
    const [modalOpened, setModalOpened] = useState(false);
    const [editingCapacity, setEditingCapacity] = useState<PolicyCessionCapacity | null>(null);

    useEffect(() => {
        loadCapacities();
    }, []);

    async function loadCapacities() {
        setLoading(true);
        try {
            const data = await apiFetch<PolicyCessionCapacity[]>('/api/underwriting/policy-cession-capacity');
            setCapacities(data);
        } catch (error: any) {
            showNotification({
                title: 'Error',
                message: error.message || 'Failed to load policy cession capacities',
                color: 'red',
                icon: <IconAlertCircle />,
            });
        } finally {
            setLoading(false);
        }
    }

    const uniqueYears = useMemo(() => {
        const years = Array.from(new Set(capacities.map((c) => c.year))).sort((a, b) => b - a);
        return years.map((year) => ({ value: year.toString(), label: year.toString() }));
    }, [capacities]);

    const filteredCapacities = useMemo(() => {
        let filtered = capacities;

        if (yearFilter) {
            filtered = filtered.filter((c) => c.year.toString() === yearFilter);
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (c) =>
                    (c.retroTypeName && c.retroTypeName.toLowerCase().includes(query)) ||
                    c.currency.toLowerCase().includes(query)
            );
        }

        return filtered;
    }, [capacities, searchQuery, yearFilter]);

    function handleAdd() {
        setEditingCapacity(null);
        setModalOpened(true);
    }

    function handleEdit(capacity: PolicyCessionCapacity) {
        setEditingCapacity(capacity);
        setModalOpened(true);
    }

    function handleDelete(capacity: PolicyCessionCapacity) {
        modals.openConfirmModal({
            title: 'Delete Policy Cession Capacity',
            centered: true,
            children: (
                <Text size="sm">
                    Are you sure you want to delete capacity for{' '}
                    <strong>
                        {capacity.retroTypeName || `Retro Type ${capacity.retroTypeId}`} ({capacity.year} - {capacity.currency})
                    </strong>
                    ? This action cannot be undone.
                </Text>
            ),
            labels: { confirm: 'Delete', cancel: 'Cancel' },
            confirmProps: { color: 'red' },
            onConfirm: async () => {
                try {
                    await apiFetch(`/api/underwriting/policy-cession-capacity/${capacity.id}`, {
                        method: 'DELETE',
                    });
                    showNotification({
                        title: 'Success',
                        message: 'Policy cession capacity deleted successfully',
                        color: 'green',
                    });
                    loadCapacities();
                } catch (error: any) {
                    showNotification({
                        title: 'Error',
                        message: error.message || 'Failed to delete capacity',
                        color: 'red',
                        icon: <IconAlertCircle />,
                    });
                }
            },
        });
    }

    function handleModalClose() {
        setModalOpened(false);
        setEditingCapacity(null);
    }

    function handleSaved() {
        loadCapacities();
        handleModalClose();
    }

    if (loading) {
        return (
            <Center h={200}>
                <Loader size="lg" />
            </Center>
        );
    }

    return (
        <>
            <Paper shadow="xs" p="md">
                <Stack gap="md">
                    <Group justify="space-between">
                        <Group gap="sm" style={{ flex: 1 }}>
                            <TextInput
                                placeholder="Search capacities..."
                                leftSection={<IconSearch size={16} />}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.currentTarget.value)}
                                style={{ flex: 1, maxWidth: 300 }}
                            />
                            <Select
                                placeholder="Filter by year"
                                leftSection={<IconFilter size={16} />}
                                data={uniqueYears}
                                value={yearFilter}
                                onChange={setYearFilter}
                                clearable
                                style={{ width: 150 }}
                            />
                        </Group>
                        <Button leftSection={<IconPlus size={16} />} onClick={handleAdd}>
                            Add Capacity
                        </Button>
                    </Group>

                    {filteredCapacities.length === 0 ? (
                        <Center h={200}>
                            <Stack align="center" gap="xs">
                                <IconAlertCircle size={48} stroke={1.5} color="gray" />
                                <Text c="dimmed">
                                    {searchQuery || yearFilter
                                        ? 'No capacities match your filters'
                                        : 'No capacities found. Click "Add Capacity" to create one.'}
                                </Text>
                            </Stack>
                        </Center>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <Table striped highlightOnHover>
                                <Table.Thead>
                                    <Table.Tr>
                                        <Table.Th>Retro Type</Table.Th>
                                        <Table.Th>Year</Table.Th>
                                        <Table.Th>Currency</Table.Th>
                                        <Table.Th>Retention</Table.Th>
                                        <Table.Th>1st Surplus Lines</Table.Th>
                                        <Table.Th>2nd Surplus Lines</Table.Th>
                                        <Table.Th>Auto Fac Retro Limit</Table.Th>
                                        <Table.Th style={{ width: rem(100) }}>Actions</Table.Th>
                                    </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>
                                    {filteredCapacities.map((capacity) => (
                                        <Table.Tr key={capacity.id}>
                                            <Table.Td>
                                                <Text fw={500}>
                                                    {capacity.retroTypeName || `Retro Type ${capacity.retroTypeId}`}
                                                </Text>
                                            </Table.Td>
                                            <Table.Td>
                                                <Badge color="grape" variant="light">
                                                    {capacity.year}
                                                </Badge>
                                            </Table.Td>
                                            <Table.Td>
                                                <Badge color="orange" variant="light">
                                                    {capacity.currency}
                                                </Badge>
                                            </Table.Td>
                                            <Table.Td>
                                                <NumberFormatter
                                                    value={capacity.retention}
                                                    thousandSeparator
                                                    decimalScale={2}
                                                />
                                            </Table.Td>
                                            <Table.Td>
                                                <Badge color="cyan" variant="light">
                                                    {capacity.firstSurplusLines}
                                                </Badge>
                                            </Table.Td>
                                            <Table.Td>
                                                <Badge color="teal" variant="light">
                                                    {capacity.secondSurplusLines}
                                                </Badge>
                                            </Table.Td>
                                            <Table.Td>
                                                <NumberFormatter
                                                    value={capacity.autoFacRetroLimit}
                                                    thousandSeparator
                                                    decimalScale={2}
                                                />
                                            </Table.Td>
                                            <Table.Td>
                                                <Group gap="xs">
                                                    <Tooltip label="Edit">
                                                        <ActionIcon
                                                            variant="subtle"
                                                            color="blue"
                                                            onClick={() => handleEdit(capacity)}
                                                        >
                                                            <IconEdit size={16} />
                                                        </ActionIcon>
                                                    </Tooltip>
                                                    <Tooltip label="Delete">
                                                        <ActionIcon
                                                            variant="subtle"
                                                            color="red"
                                                            onClick={() => handleDelete(capacity)}
                                                        >
                                                            <IconTrash size={16} />
                                                        </ActionIcon>
                                                    </Tooltip>
                                                </Group>
                                            </Table.Td>
                                        </Table.Tr>
                                    ))}
                                </Table.Tbody>
                            </Table>
                        </div>
                    )}
                </Stack>
            </Paper>

            <PolicyCessionCapacityModal
                opened={modalOpened}
                onClose={handleModalClose}
                onSaved={handleSaved}
                capacity={editingCapacity}
            />
        </>
    );
}
