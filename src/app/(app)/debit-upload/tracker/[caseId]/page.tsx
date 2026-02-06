'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Container, Stack, Title, Button, Group, Card, Badge, Text, Loader } from '@mantine/core';
import { IconArrowLeft, IconEdit } from '@tabler/icons-react';
import useDocumentTrackerStore from '@/store/useDocumentTrackerStore';
import { ChecklistView } from '@/components/debit-upload/tracker/ChecklistView';
import { ProgressIndicator } from '@/components/debit-upload/tracker/ProgressIndicator';
import { CaseFormModal, type CaseFormData } from '@/components/debit-upload/tracker/CaseFormModal';
import { OperationsApprovalPanel } from '@/components/debit-upload/tracker/OperationsApprovalPanel';

export default function CaseDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [editModalOpened, setEditModalOpened] = useState(false);

    const caseId = typeof params.caseId === 'string' ? parseFloat(params.caseId) : null;

    const {
        currentCase,
        fetchCaseDetail,
        updateCase,
        uploadFiles,
        deleteFile,
        downloadFile,
    } = useDocumentTrackerStore();

    useEffect(() => {
        // Check authentication
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('jwt');
            if (!token) {
                router.push('/login');
                return;
            }
        }

        // Load case detail
        if (caseId) {
            fetchCaseDetail(caseId);
        }
    }, [caseId, fetchCaseDetail, router]);

    const handleBack = () => {
        router.push('/debit-upload/tracker');
    };

    const handleEditCase = () => {
        setEditModalOpened(true);
    };

    const handleFormSubmit = (data: CaseFormData) => {
        if (currentCase) {
            updateCase(currentCase.id, data);
        }
        setEditModalOpened(false);
    };

    if (!caseId || !currentCase) {
        return (
            <Container size="xl" py="xl">
                <Group justify="center" py="xl">
                    <Loader size="lg" />
                </Group>
            </Container>
        );
    }

    return (
        <Container size="xl" py="xl">
            <Stack gap="lg">
                {/* Back Button */}
                <Button
                    variant="subtle"
                    leftSection={<IconArrowLeft size={16} />}
                    onClick={handleBack}
                    style={{ alignSelf: 'flex-start' }}
                >
                    Back to Cases
                </Button>

                {/* Header */}
                <Card shadow="sm" p="lg" radius="md" withBorder>
                    <Group justify="space-between" align="flex-start" mb="md">
                        <div style={{ flex: 1 }}>
                            <Group align="center" gap="sm" mb="xs">
                                <Title order={2}>{currentCase.caseName}</Title>
                                <Badge
                                    size="lg"
                                    color={currentCase.status === 'READY' ? 'green' : 'orange'}
                                    variant="light"
                                >
                                    {currentCase.status}
                                </Badge>
                            </Group>

                            <Stack gap="xs">
                                {currentCase.cedant && (
                                    <Text size="sm" c="dimmed">
                                        <strong>Cedant:</strong> {currentCase.cedant}
                                    </Text>
                                )}
                                {currentCase.reinsurer && (
                                    <Text size="sm" c="dimmed">
                                        <strong>Reinsurer:</strong> {currentCase.reinsurer}
                                    </Text>
                                )}
                                {currentCase.lineOfBusiness && (
                                    <Text size="sm" c="dimmed">
                                        <strong>Line of Business:</strong> {currentCase.lineOfBusiness}
                                    </Text>
                                )}
                                <Text size="sm" c="dimmed">
                                    <strong>Created by:</strong> {currentCase.createdBy} on{' '}
                                    {new Date(currentCase.createdAt).toLocaleDateString()}
                                </Text>
                            </Stack>
                        </div>

                        <Button
                            variant="light"
                            leftSection={<IconEdit size={16} />}
                            onClick={handleEditCase}
                        >
                            Edit
                        </Button>
                    </Group>

                    {/* Progress Indicator */}
                    <ProgressIndicator
                        collected={currentCase.progress.collected}
                        total={currentCase.progress.total}
                    />
                </Card>

                {/* Operations Approval Panel */}
                {/*<OperationsApprovalPanel caseData={currentCase} />*/}



                {/* Checklist */}
                <Card shadow="sm" p="lg" radius="md" withBorder>
                    <Title order={3} mb="md">
                        Document Checklist
                    </Title>
                    <ChecklistView
                        checklist={currentCase.checklist}
                        caseId={currentCase.id}
                        operationsApprovalStatus={currentCase.operationsApprovalStatus}
                        onUploadFiles={uploadFiles}
                        onDeleteFile={deleteFile}
                        onDownloadFile={downloadFile}
                    />
                </Card>
            </Stack>

            {/* Edit Modal */}
            <CaseFormModal
                opened={editModalOpened}
                onClose={() => setEditModalOpened(false)}
                onSubmit={handleFormSubmit}
                editCase={currentCase}
            />
        </Container>
    );
}
