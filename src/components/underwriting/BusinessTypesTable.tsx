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
    rem
} from '@mantine/core';
import { IconPlus, IconSearch, IconEdit, IconTrash, IconAlertCircle } from '@tabler/icons-react';
import { showNotification } from '@mantine/notifications';
import { modals } from '@mantine/modals';
import { apiFetch } from '@/config/api';
import BusinessTypeModal from './BusinessTypeModal';

interface BusinessType {
    id: number;
    name: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
}

export default function BusinessTypesTable() {
    const [businessTypes, setBusinessTypes] = useState<BusinessType[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [modalOpened, setModalOpened] = useState(false);
    const [editingBusinessType, setEditingBusinessType] = useState<BusinessType | null>(null);

    useEffect(() => {
        loadBusinessTypes();
    }, []);

    async function loadBusinessTypes() {
        setLoading(true);
        try {
            const data = await apiFetch<BusinessType[]>('/api/underwriting/business-types');
            setBusinessTypes(data);
        } catch (error: any) {
            showNotification({
                title: 'Error',
                message: error.message || 'Failed to load business types',
                color: 'red',
                icon: <IconAlertCircle />,
            });
        } finally {
            setLoading(false);
        }
    }

    const filteredBusinessTypes = useMemo(() => {
        if (!searchQuery) return businessTypes;
        const query = searchQuery.toLowerCase();
        return businessTypes.filter(
            (bt) =>
                bt.name.toLowerCase().includes(query) ||
                (bt.description && bt.description.toLowerCase().includes(query))
        );
    }, [businessTypes, searchQuery]);

    function handleAdd() {
        setEditingBusinessType(null);
        setModalOpened(true);
    }

    function handleEdit(businessType: BusinessType) {
        setEditingBusinessType(businessType);
        setModalOpened(true);
    }

    function handleDelete(businessType: BusinessType) {
        modals.openConfirmModal({
            title: 'Delete Business Type',
            centered: true,
            children: (
                <Text size="sm">
                    Are you sure you want to delete <strong>{businessType.name}</strong>?
                    This action cannot be undone and may affect related retro types.
                </Text>
            ),
            labels: { confirm: 'Delete', cancel: 'Cancel' },
            confirmProps: { color: 'red' },
            onConfirm: async () => {
                try {
                    await apiFetch(`/api/underwriting/business-types/${businessType.id}`, {
                        method: 'DELETE',
                    });
                    showNotification({
                        title: 'Success',
                        message: 'Business type deleted successfully',
                        color: 'green',
                    });
                    loadBusinessTypes();
                } catch (error: any) {
                    showNotification({
                        title: 'Error',
                        message: error.message || 'Failed to delete business type',
                        color: 'red',
                        icon: <IconAlertCircle />,
                    });
                }
            },
        });
    }

    function handleModalClose() {
        setModalOpened(false);
        setEditingBusinessType(null);
    }

    function handleSaved() {
        loadBusinessTypes();
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
                            placeholder="Search business types..."
                            leftSection={<IconSearch size={16} />}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.currentTarget.value)}
                            style={{ flex: 1, maxWidth: 400 }}
                        />
                        <Button leftSection={<IconPlus size={16} />} onClick={handleAdd}>
                            Add Business Type
                        </Button>
                    </Group>

                    {filteredBusinessTypes.length === 0 ? (
                        <Center h={200}>
                            <Stack align="center" gap="xs">
                                <IconAlertCircle size={48} stroke={1.5} color="gray" />
                                <Text c="dimmed">
                                    {searchQuery
                                        ? 'No business types match your search'
                                        : 'No business types found. Click "Add Business Type" to create one.'}
                                </Text>
                            </Stack>
                        </Center>
                    ) : (
                        <Table striped highlightOnHover>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>Name</Table.Th>
                                    <Table.Th>Description</Table.Th>
                                    <Table.Th style={{ width: rem(100) }}>Actions</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {filteredBusinessTypes.map((bt) => (
                                    <Table.Tr key={bt.id}>
                                        <Table.Td>
                                            <Text fw={500}>{bt.name}</Text>
                                        </Table.Td>
                                        <Table.Td>
                                            <Text size="sm" c="dimmed">
                                                {bt.description || '-'}
                                            </Text>
                                        </Table.Td>
                                        <Table.Td>
                                            <Group gap="xs">
                                                <Tooltip label="Edit">
                                                    <ActionIcon
                                                        variant="subtle"
                                                        color="blue"
                                                        onClick={() => handleEdit(bt)}
                                                    >
                                                        <IconEdit size={16} />
                                                    </ActionIcon>
                                                </Tooltip>
                                                <Tooltip label="Delete">
                                                    <ActionIcon
                                                        variant="subtle"
                                                        color="red"
                                                        onClick={() => handleDelete(bt)}
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

            <BusinessTypeModal
                opened={modalOpened}
                onClose={handleModalClose}
                onSaved={handleSaved}
                businessType={editingBusinessType}
            />
        </>
    );
}
