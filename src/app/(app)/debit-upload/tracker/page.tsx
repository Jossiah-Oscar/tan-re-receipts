'use client';

import { useEffect, useState } from 'react';
import { Container, Stack, Title, Button, Group, Card } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import useDocumentTrackerStore, { type Case } from '@/store/useDocumentTrackerStore';
import { CaseTable } from '@/components/debit-upload/tracker/CaseTable';
import { CaseFormModal, type CaseFormData } from '@/components/debit-upload/tracker/CaseFormModal';

export default function DocumentTrackerPage() {
    const router = useRouter();
    const { username } = useAuth();
    const [modalOpened, setModalOpened] = useState(false);
    const [editingCase, setEditingCase] = useState<Case | null>(null);

    const { cases, loading, fetchCases, createCase, updateCase, deleteCase } = useDocumentTrackerStore();

    useEffect(() => {
        // Check authentication
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('jwt');
            if (!token) {
                router.push('/login');
                return;
            }
        }

        // Load cases from API
        fetchCases();
    }, [fetchCases, router]);

    const handleCreateCase = () => {
        setEditingCase(null);
        setModalOpened(true);
    };

    const handleEditCase = (caseItem: Case) => {
        setEditingCase(caseItem);
        setModalOpened(true);
    };

    const handleFormSubmit = (data: CaseFormData) => {
        if (editingCase) {
            updateCase(editingCase.id, data);
        } else {
            createCase(data);
        }
        setModalOpened(false);
        setEditingCase(null);
    };

    const handleDeleteCase = (caseId: number) => {
        deleteCase(caseId);
    };

    const readyCases = cases.filter((c) => c.status === 'READY');
    const pendingCases = cases.filter((c) => c.status === 'PENDING');

    return (
        <Container size="xl" py="xl">
            <Stack gap="lg">
                {/* Header */}
                <Group justify="space-between" align="center">
                    <div>
                        <Title order={2}>Document Tracker</Title>
                        <p style={{ color: 'var(--mantine-color-dimmed)', marginTop: '0.25rem' }}>
                            Track and manage document checklists for cases
                        </p>
                    </div>
                    <Button leftSection={<IconPlus size={16} />} onClick={handleCreateCase}>
                        New Case
                    </Button>
                </Group>

                {/* Summary Cards */}
                <Group justify="center" grow>
                    <Card shadow="sm" p="md" radius="md" withBorder>
                        <Group>
                            <div>
                                <div style={{ fontSize: '0.875rem', color: 'var(--mantine-color-dimmed)' }}>
                                    Total Cases
                                </div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>{cases.length}</div>
                            </div>
                        </Group>
                    </Card>
                    <Card shadow="sm" p="md" radius="md" withBorder>
                        <Group>
                            <div>
                                <div style={{ fontSize: '0.875rem', color: 'var(--mantine-color-dimmed)' }}>
                                    Ready
                                </div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--mantine-color-green-6)' }}>
                                    {readyCases.length}
                                </div>
                            </div>
                        </Group>
                    </Card>
                    <Card shadow="sm" p="md" radius="md" withBorder>
                        <Group>
                            <div>
                                <div style={{ fontSize: '0.875rem', color: 'var(--mantine-color-dimmed)' }}>
                                    Pending
                                </div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--mantine-color-orange-6)' }}>
                                    {pendingCases.length}
                                </div>
                            </div>
                        </Group>
                    </Card>
                </Group>

                {/* Cases Table */}
                <Card shadow="sm" p="lg" radius="md" withBorder>
                    <CaseTable cases={cases} onEdit={handleEditCase} onDelete={handleDeleteCase} />
                </Card>
            </Stack>

            {/* Create/Edit Modal */}
            <CaseFormModal
                opened={modalOpened}
                onClose={() => {
                    setModalOpened(false);
                    setEditingCase(null);
                }}
                onSubmit={handleFormSubmit}
                editCase={editingCase}
            />
        </Container>
    );
}
