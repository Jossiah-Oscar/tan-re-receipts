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
    rem
} from '@mantine/core';
import { IconPlus, IconSearch, IconEdit, IconTrash, IconAlertCircle } from '@tabler/icons-react';
import { showNotification } from '@mantine/notifications';
import { modals } from '@mantine/modals';
import { apiFetch } from '@/config/api';
import RetroTypeModal from './RetroTypeModal';

interface RetroType {
    id: number;
    name: string;
    description?: string;
    lobId: number;
    lineOfBusiness: {
        name: string;
    };
    businessTypeId: number;
    businessType: {
        name: string;
    };
    createdAt: string;
    updatedAt: string;
}

export default function RetroTypesTable() {
    const [retroTypes, setRetroTypes] = useState<RetroType[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [modalOpened, setModalOpened] = useState(false);
    const [editingRetroType, setEditingRetroType] = useState<RetroType | null>(null);

    useEffect(() => {
        loadRetroTypes();
    }, []);

    async function loadRetroTypes() {
        setLoading(true);
        try {
            const data = await apiFetch<RetroType[]>('/api/underwriting/retro-types');
            setRetroTypes(data);
        } catch (error: any) {
            showNotification({
                title: 'Error',
                message: error.message || 'Failed to load retro types',
                color: 'red',
                icon: <IconAlertCircle />,
            });
        } finally {
            setLoading(false);
        }
    }

    const filteredRetroTypes = useMemo(() => {
        if (!searchQuery) return retroTypes;
        const query = searchQuery.toLowerCase();
        return retroTypes.filter(
            (rt) =>
                rt.name.toLowerCase().includes(query) ||
                (rt.description && rt.description.toLowerCase().includes(query)) ||
                rt.lineOfBusiness.name.toLowerCase().includes(query) ||
                rt.businessType.name.toLowerCase().includes(query)
        );
    }, [retroTypes, searchQuery]);

    function handleAdd() {
        setEditingRetroType(null);
        setModalOpened(true);
    }

    function handleEdit(retroType: RetroType) {
        setEditingRetroType(retroType);
        setModalOpened(true);
    }

    function handleDelete(retroType: RetroType) {
        modals.openConfirmModal({
            title: 'Delete Retro Type',
            centered: true,
            children: (
                <Text size="sm">
                    Are you sure you want to delete <strong>{retroType.name}</strong>?
                    This action cannot be undone and may affect related capacities.
                </Text>
            ),
            labels: { confirm: 'Delete', cancel: 'Cancel' },
            confirmProps: { color: 'red' },
            onConfirm: async () => {
                try {
                    await apiFetch(`/api/underwriting/retro-types/${retroType.id}`, {
                        method: 'DELETE',
                    });
                    showNotification({
                        title: 'Success',
                        message: 'Retro type deleted successfully',
                        color: 'green',
                    });
                    loadRetroTypes();
                } catch (error: any) {
                    showNotification({
                        title: 'Error',
                        message: error.message || 'Failed to delete retro type',
                        color: 'red',
                        icon: <IconAlertCircle />,
                    });
                }
            },
        });
    }

    function handleModalClose() {
        setModalOpened(false);
        setEditingRetroType(null);
    }

    function handleSaved() {
        loadRetroTypes();
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
                        <TextInput
                            placeholder="Search retro types..."
                            leftSection={<IconSearch size={16} />}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.currentTarget.value)}
                            style={{ flex: 1, maxWidth: 400 }}
                        />
                        <Button leftSection={<IconPlus size={16} />} onClick={handleAdd}>
                            Add Retro Type
                        </Button>
                    </Group>

                    {filteredRetroTypes.length === 0 ? (
                        <Center h={200}>
                            <Stack align="center" gap="xs">
                                <IconAlertCircle size={48} stroke={1.5} color="gray" />
                                <Text c="dimmed">
                                    {searchQuery
                                        ? 'No retro types match your search'
                                        : 'No retro types found. Click "Add Retro Type" to create one.'}
                                </Text>
                            </Stack>
                        </Center>
                    ) : (
                        <Table striped highlightOnHover>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>Name</Table.Th>
                                    <Table.Th>Description</Table.Th>
                                    <Table.Th>Line of Business</Table.Th>
                                    <Table.Th>Business Type</Table.Th>
                                    <Table.Th style={{ width: rem(100) }}>Actions</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {filteredRetroTypes.map((rt) => (
                                    <Table.Tr key={rt.id}>
                                        <Table.Td>
                                            <Text fw={500}>{rt.name}</Text>
                                        </Table.Td>
                                        <Table.Td>
                                            <Text size="sm" c="dimmed">
                                                {rt.description || '-'}
                                            </Text>
                                        </Table.Td>
                                        <Table.Td>
                                            <Badge color="blue" variant="light">
                                                {rt.lineOfBusiness.name}
                                            </Badge>
                                        </Table.Td>
                                        <Table.Td>
                                            <Badge color="teal" variant="light">
                                                {rt.businessType.name}
                                            </Badge>
                                        </Table.Td>
                                        <Table.Td>
                                            <Group gap="xs">
                                                <Tooltip label="Edit">
                                                    <ActionIcon
                                                        variant="subtle"
                                                        color="blue"
                                                        onClick={() => handleEdit(rt)}
                                                    >
                                                        <IconEdit size={16} />
                                                    </ActionIcon>
                                                </Tooltip>
                                                <Tooltip label="Delete">
                                                    <ActionIcon
                                                        variant="subtle"
                                                        color="red"
                                                        onClick={() => handleDelete(rt)}
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
                    )}
                </Stack>
            </Paper>

            <RetroTypeModal
                opened={modalOpened}
                onClose={handleModalClose}
                onSaved={handleSaved}
                retroType={editingRetroType}
            />
        </>
    );
}
