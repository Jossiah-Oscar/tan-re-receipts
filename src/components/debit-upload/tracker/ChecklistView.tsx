import { Table, FileInput, Button, ActionIcon, Group, Text, Stack, Title, Divider, Alert } from '@mantine/core';
import { IconPaperclip, IconDownload, IconX, IconCheck, IconCircle, IconLock } from '@tabler/icons-react';
import { modals } from '@mantine/modals';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import type { ChecklistItem } from '@/store/useDocumentTrackerStore';

interface ChecklistViewProps {
    checklist: ChecklistItem[];
    caseId: number;
    operationsApprovalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
    onUploadFiles: (caseId: number, itemId: number, files: File[]) => Promise<boolean>;
    onDeleteFile: (caseId: number, fileId: number, itemId: number) => void;
    onDownloadFile: (caseId: number, fileId: number) => void;
}

export function ChecklistView({
    checklist,
    caseId,
    operationsApprovalStatus,
    onUploadFiles,
    onDeleteFile,
    onDownloadFile,
}: ChecklistViewProps) {
    const { username } = useAuth();
    const [uploadingItems, setUploadingItems] = useState<Set<number>>(new Set());

    const isFinanceLocked = operationsApprovalStatus !== 'APPROVED';

    const handleFileSelect = async (itemId: number, files: File[] | null) => {
        if (!files || files.length === 0) return;

        setUploadingItems((prev) => new Set(prev).add(itemId));
        const success = await onUploadFiles(caseId, itemId, files);
        setUploadingItems((prev) => {
            const next = new Set(prev);
            next.delete(itemId);
            return next;
        });
    };

    const handleDeleteFile = (itemId: number, fileId: number, fileName: string) => {
        modals.openConfirmModal({
            title: 'Delete File',
            children: `Are you sure you want to delete "${fileName}"?`,
            labels: { confirm: 'Delete', cancel: 'Cancel' },
            confirmProps: { color: 'red' },
            onConfirm: () => onDeleteFile(caseId, fileId, itemId),
        });
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    // Group checklist items by section
    const operationsDocs = checklist.filter(item => item.section === 'OPERATIONS');
    const financeDocs = checklist.filter(item => item.section === 'FINANCE');

    const renderChecklistTable = (items: ChecklistItem[], section: 'OPERATIONS' | 'FINANCE') => {
        const isSectionLocked = section === 'FINANCE' && isFinanceLocked;

        return (
            <Table striped highlightOnHover withTableBorder withColumnBorders>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th style={{ width: '5%' }}>#</Table.Th>
                        <Table.Th style={{ width: '30%' }}>Document Name</Table.Th>
                        <Table.Th style={{ width: '10%' }}>Status</Table.Th>
                        <Table.Th style={{ width: '35%' }}>Files</Table.Th>
                        <Table.Th style={{ width: '20%' }}>Actions</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {items.map((item) => {
                        // Check if user can delete files (only for their own uploads in Operations)
                        const canDeleteFile = (file: { uploadedBy?: string }) => {
                            if (section === 'FINANCE') {
                                return !isFinanceLocked;
                            }
                            // For Operations, only uploader can delete
                            return file.uploadedBy === username;
                        };

                        return (
                            <Table.Tr
                                key={item.id}
                                style={{
                                    backgroundColor: item.isCompleted
                                        ? 'rgba(16, 185, 129, 0.03)'
                                        : undefined,
                                }}
                            >
                                <Table.Td>
                                    <Text size="sm" c="dimmed">
                                        {item.position}
                                    </Text>
                                </Table.Td>
                                <Table.Td>
                                    <Text size="sm" fw={item.isRequired ? 500 : 400}>
                                        {item.documentName}
                                        {item.isRequired && (
                                            <Text component="span" c="red" inherit>
                                                {' '}
                                                *
                                            </Text>
                                        )}
                                    </Text>
                                </Table.Td>
                                <Table.Td>
                                    {item.isCompleted ? (
                                        <IconCheck size={20} color="var(--mantine-color-green-6)" />
                                    ) : (
                                        <IconCircle size={20} color="var(--mantine-color-gray-5)" />
                                    )}
                                </Table.Td>
                                <Table.Td>
                                    {item.files.length > 0 ? (
                                        <Stack gap="xs">
                                            {item.files.map((file) => (
                                                <Group key={file.id} justify="space-between" gap="xs">
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <Text
                                                            size="xs"
                                                            style={{
                                                                whiteSpace: 'nowrap',
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis',
                                                            }}
                                                            title={file.fileName}
                                                        >
                                                            {file.fileName}
                                                        </Text>
                                                        <Text size="xs" c="dimmed">
                                                            {formatFileSize(file.fileSize)} • Uploaded by {file.uploadedBy}
                                                        </Text>
                                                    </div>
                                                    <Group gap={4}>
                                                        <ActionIcon
                                                            size="sm"
                                                            variant="subtle"
                                                            color="blue"
                                                            onClick={() => onDownloadFile(caseId, file.id)}
                                                            title="Download"
                                                        >
                                                            <IconDownload size={14} />
                                                        </ActionIcon>
                                                        {canDeleteFile(file) ? (
                                                            <ActionIcon
                                                                size="sm"
                                                                variant="subtle"
                                                                color="red"
                                                                onClick={() =>
                                                                    handleDeleteFile(item.id, file.id, file.fileName)
                                                                }
                                                                title="Delete"
                                                            >
                                                                <IconX size={14} />
                                                            </ActionIcon>
                                                        ) : (
                                                            <ActionIcon
                                                                size="sm"
                                                                variant="subtle"
                                                                color="gray"
                                                                disabled
                                                                title={section === 'FINANCE' ? 'Locked - Operations approval required' : 'You can only delete files you uploaded'}
                                                            >
                                                                <IconLock size={14} />
                                                            </ActionIcon>
                                                        )}
                                                    </Group>
                                                </Group>
                                            ))}
                                        </Stack>
                                    ) : (
                                        <Text size="xs" c="dimmed">
                                            No files uploaded
                                        </Text>
                                    )}
                                </Table.Td>
                                <Table.Td>
                                    <FileInput
                                        placeholder={isSectionLocked ? "Locked" : "Choose PDF files"}
                                        multiple
                                        leftSection={isSectionLocked ? <IconLock size={16} /> : <IconPaperclip size={16} />}
                                        onChange={(files) => handleFileSelect(item.id, files)}
                                        disabled={uploadingItems.has(item.id) || isSectionLocked}
                                        size="xs"
                                        accept="application/pdf"
                                    />
                                </Table.Td>
                            </Table.Tr>
                        );
                    })}
                </Table.Tbody>
            </Table>
        );
    };

    return (
        <Stack gap="xl">
            {/* Operations Section */}
            <div>
                <Group justify="space-between" mb="md">
                    <Title order={4}>Operations Documents</Title>
                    <Text size="sm" c="dimmed">
                        {operationsDocs.filter(d => d.isCompleted).length}/{operationsDocs.length} completed
                    </Text>
                </Group>
                {renderChecklistTable(operationsDocs, 'OPERATIONS')}
            </div>

            <Divider />

            {/* Finance Section */}
            <div>
                <Group justify="space-between" mb="md">
                    <Title order={4}>Finance Documents</Title>
                    <Text size="sm" c="dimmed">
                        {financeDocs.filter(d => d.isCompleted).length}/{financeDocs.length} completed
                    </Text>
                </Group>
                {isFinanceLocked && (
                    <Alert icon={<IconLock size={16} />} color="orange" mb="md">
                        Finance section is locked. Operations documents must be approved by a Senior Underwriter before Finance can upload documents.
                    </Alert>
                )}
                {renderChecklistTable(financeDocs, 'FINANCE')}
            </div>
        </Stack>
    );
}
