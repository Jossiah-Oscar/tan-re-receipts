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
import LineOfBusinessModal from './LineOfBusinessModal';

interface LineOfBusiness {
    id: number;
    name: string;
    createdAt: string;
    updatedAt: string;
}

export default function LineOfBusinessTable() {
    const [lineOfBusinesses, setLineOfBusinesses] = useState<LineOfBusiness[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [modalOpened, setModalOpened] = useState(false);
    const [editingLOB, setEditingLOB] = useState<LineOfBusiness | null>(null);

    useEffect(() => {
        loadLineOfBusinesses();
    }, []);

    async function loadLineOfBusinesses() {
        setLoading(true);
        try {
            const data = await apiFetch<LineOfBusiness[]>('/api/underwriting/line-of-business');
            setLineOfBusinesses(data);
        } catch (error: any) {
            showNotification({
                title: 'Error',
                message: error.message || 'Failed to load lines of business',
                color: 'red',
                icon: <IconAlertCircle />,
            });
        } finally {
            setLoading(false);
        }
    }

    const filteredLOBs = useMemo(() => {
        if (!searchQuery) return lineOfBusinesses;
        const query = searchQuery.toLowerCase();
        return lineOfBusinesses.filter((lob) =>
            lob.name.toLowerCase().includes(query)
        );
    }, [lineOfBusinesses, searchQuery]);

    function handleAdd() {
        setEditingLOB(null);
        setModalOpened(true);
    }

    function handleEdit(lob: LineOfBusiness) {
        setEditingLOB(lob);
        setModalOpened(true);
    }

    function handleDelete(lob: LineOfBusiness) {
        modals.openConfirmModal({
            title: 'Delete Line of Business',
            centered: true,
            children: (
                <Text size="sm">
                    Are you sure you want to delete <strong>{lob.name}</strong>?
                    This action cannot be undone and may affect related retro types.
                </Text>
            ),
            labels: { confirm: 'Delete', cancel: 'Cancel' },
            confirmProps: { color: 'red' },
            onConfirm: async () => {
                try {
                    await apiFetch(`/api/underwriting/line-of-business/${lob.id}`, {
                        method: 'DELETE',
                    });
                    showNotification({
                        title: 'Success',
                        message: 'Line of business deleted successfully',
                        color: 'green',
                    });
                    loadLineOfBusinesses();
                } catch (error: any) {
                    showNotification({
                        title: 'Error',
                        message: error.message || 'Failed to delete line of business',
                        color: 'red',
                        icon: <IconAlertCircle />,
                    });
                }
            },
        });
    }

    function handleModalClose() {
        setModalOpened(false);
        setEditingLOB(null);
    }

    function handleSaved() {
        loadLineOfBusinesses();
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
                            placeholder="Search lines of business..."
                            leftSection={<IconSearch size={16} />}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.currentTarget.value)}
                            style={{ flex: 1, maxWidth: 400 }}
                        />
                        <Button leftSection={<IconPlus size={16} />} onClick={handleAdd}>
                            Add Line of Business
                        </Button>
                    </Group>

                    {filteredLOBs.length === 0 ? (
                        <Center h={200}>
                            <Stack align="center" gap="xs">
                                <IconAlertCircle size={48} stroke={1.5} color="gray" />
                                <Text c="dimmed">
                                    {searchQuery
                                        ? 'No lines of business match your search'
                                        : 'No lines of business found. Click "Add Line of Business" to create one.'}
                                </Text>
                            </Stack>
                        </Center>
                    ) : (
                        <Table striped highlightOnHover>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>Name</Table.Th>
                                    <Table.Th style={{ width: rem(100) }}>Actions</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {filteredLOBs.map((lob) => (
                                    <Table.Tr key={lob.id}>
                                        <Table.Td>
                                            <Text fw={500}>{lob.name}</Text>
                                        </Table.Td>
                                        <Table.Td>
                                            <Group gap="xs">
                                                <Tooltip label="Edit">
                                                    <ActionIcon
                                                        variant="subtle"
                                                        color="blue"
                                                        onClick={() => handleEdit(lob)}
                                                    >
                                                        <IconEdit size={16} />
                                                    </ActionIcon>
                                                </Tooltip>
                                                <Tooltip label="Delete">
                                                    <ActionIcon
                                                        variant="subtle"
                                                        color="red"
                                                        onClick={() => handleDelete(lob)}
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

            <LineOfBusinessModal
                opened={modalOpened}
                onClose={handleModalClose}
                onSaved={handleSaved}
                lineOfBusiness={editingLOB}
            />
        </>
    );
}
