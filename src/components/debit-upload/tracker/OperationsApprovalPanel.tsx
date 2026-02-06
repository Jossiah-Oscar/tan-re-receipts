import { Card, Badge, Group, Text, Button, Stack, Textarea, Divider, ActionIcon, Tooltip } from '@mantine/core';
import { IconCheck, IconX, IconEye } from '@tabler/icons-react';
import { useState } from 'react';
import { modals } from '@mantine/modals';
import { showNotification } from '@mantine/notifications';
import { useAuth } from '@/context/AuthContext';
import type { Case, ChecklistFile } from '@/store/useDocumentTrackerStore';
import useDocumentTrackerStore from '@/store/useDocumentTrackerStore';
import {apiFetch} from "@/config/api";

interface OperationsApprovalPanelProps {
    caseData: Case;
}

export function OperationsApprovalPanel({ caseData }: OperationsApprovalPanelProps) {
    const { roles, username } = useAuth();
    const { approveOperations, revokeOperationsApproval } = useDocumentTrackerStore();
    const [comment, setComment] = useState('');

    const isSeniorUnderwriter = roles.includes('SENIOR_UNDERWRITER');
    const isApproved = caseData.operationsApprovalStatus === 'APPROVED';
    const isPending = caseData.operationsApprovalStatus === 'PENDING';

    // Get all Operations section files for PDF viewing
    const operationsFiles: ChecklistFile[] = [];
    caseData.checklist
        .filter(item => item.section === 'OPERATIONS')
        .forEach(item => {
            operationsFiles.push(...item.files);
        });

    const handleApprove = () => {
        modals.openConfirmModal({
            title: 'Approve Operations Documents',
            children: (
                <Stack>
                    <Text size="sm">
                        Are you sure you want to approve all Operations documents? This will unlock the Finance section for document uploads.
                    </Text>
                    <Textarea
                        label="Comment (Optional)"
                        placeholder="Add any comments about the approval..."
                        value={comment}
                        onChange={(e) => setComment(e.currentTarget.value)}
                        minRows={3}
                    />
                </Stack>
            ),
            labels: { confirm: 'Approve', cancel: 'Cancel' },
            confirmProps: { color: 'green' },
            onConfirm: () => {
                approveOperations(caseData.id, comment || undefined);
                setComment('');
            },
        });
    };

    const handleRevoke = () => {
        modals.openConfirmModal({
            title: 'Revoke Operations Approval',
            children: 'Are you sure you want to revoke approval? This will lock the Finance section and prevent editing/deleting Finance documents.',
            labels: { confirm: 'Revoke', cancel: 'Cancel' },
            confirmProps: { color: 'red' },
            onConfirm: () => {
                revokeOperationsApproval(caseData.id);
            },
        });
    };

    const viewPDF = async (file: ChecklistFile) => {
        try {
            // Fetch the PDF file from backend
            const token = localStorage.getItem('jwt');
            const apiBaseUrl = process.env.NEXT_PUBLIC_API_DOC_URL || 'http://localhost:3003';

            const response = await apiFetch(`/api/document-tracker/files/${file.id}/download`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to load PDF');
            }

            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);

            modals.open({
                title: file.fileName,
                size: 'xl',
                onClose: () => {
                    // Clean up blob URL when modal closes
                    window.URL.revokeObjectURL(blobUrl);
                },
                children: (
                    <div style={{ height: '70vh' }}>
                        <iframe
                            src={blobUrl}
                            style={{ width: '100%', height: '100%', border: 'none' }}
                            title={file.fileName}
                        />
                    </div>
                ),
            });
        } catch (error) {
            console.error('Error loading PDF:', error);
            showNotification({
                title: 'Error',
                message: 'Failed to load PDF file',
                color: 'red',
            });
        }
    };

    const getStatusBadge = () => {
        switch (caseData.operationsApprovalStatus) {
            case 'APPROVED':
                return <Badge color="green" size="lg" variant="light">Approved</Badge>;
            case 'REJECTED':
                return <Badge color="red" size="lg" variant="light">Rejected</Badge>;
            case 'PENDING':
            default:
                return <Badge color="orange" size="lg" variant="light">Pending Approval</Badge>;
        }
    };

    return (
        <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Stack gap="md">
                <Group justify="space-between">
                    <Text size="lg" fw={600}>Operations Approval</Text>
                    {getStatusBadge()}
                </Group>

                {/*<Divider />*/}

                {/* /!*Debug Info - Remove this after testing*!/*/}
                {/*<Stack gap="xs" style={{ backgroundColor: 'rgba(255, 200, 0, 0.1)', padding: '8px', borderRadius: '4px' }}>*/}
                {/*    /!*<Text size="xs" c="dimmed">Debug Info:</Text>*!/*/}
                {/*    /!*<Text size="xs">Your username: {username}</Text>*!/*/}
                {/*    /!*<Text size="xs">Your roles: {roles.join(', ')}</Text>*!/*/}
                {/*    /!*<Text size="xs">Has SENIOR_UNDERWRITER role: {isSeniorUnderwriter ? 'YES' : 'NO'}</Text>*!/*/}
                {/*    /!*<Text size="xs">Approval Status: {caseData.operationsApprovalStatus}</Text>*!/*/}
                {/*    /!*<Text size="xs">Should show Approve button: {isSeniorUnderwriter && isPending ? 'YES' : 'NO'}</Text>*!/*/}
                {/*</Stack>*/}

                {/*<Divider />*/}

                {/* Approval Info */}
                {isApproved && caseData.operationsApprovedBy && (
                    <Stack gap="xs">
                        <Group gap="xs">
                            <Text size="sm" c="dimmed">Approved by:</Text>
                            <Text size="sm" fw={500}>{caseData.operationsApprovedBy}</Text>
                        </Group>
                        {caseData.operationsApprovedAt && (
                            <Group gap="xs">
                                <Text size="sm" c="dimmed">Approved on:</Text>
                                <Text size="sm">{new Date(caseData.operationsApprovedAt).toLocaleString()}</Text>
                            </Group>
                        )}
                        {caseData.operationsApprovalComment && (
                            <Stack gap={4}>
                                <Text size="sm" c="dimmed">Comment:</Text>
                                <Text size="sm" style={{ fontStyle: 'italic' }}>{caseData.operationsApprovalComment}</Text>
                            </Stack>
                        )}
                    </Stack>
                )}

                {/* PDF Document Review - Only show if there are files and user is senior underwriter */}
                {isSeniorUnderwriter && operationsFiles.length > 0 && (
                    <>
                        <Divider />
                        <Stack gap="xs">
                            <Text size="sm" fw={500}>Review Operations Documents ({operationsFiles.length})</Text>
                            <Group gap="xs">
                                {operationsFiles.map((file) => (
                                    <Tooltip key={file.id} label={file.fileName}>
                                        <ActionIcon
                                            variant="light"
                                            color="blue"
                                            size="lg"
                                            onClick={() => viewPDF(file)}
                                        >
                                            <IconEye size={18} />
                                        </ActionIcon>
                                    </Tooltip>
                                ))}
                            </Group>
                        </Stack>
                    </>
                )}

                {/* Action Buttons - Only for senior_underwriter */}
                {isSeniorUnderwriter && (
                    <>
                        <Divider />
                        <Group justify="flex-end">
                            {isApproved && (
                                <Button
                                    leftSection={<IconX size={16} />}
                                    color="red"
                                    variant="light"
                                    onClick={handleRevoke}
                                >
                                    Revoke Approval
                                </Button>
                            )}
                            {isPending && (
                                <Button
                                    leftSection={<IconCheck size={16} />}
                                    color="green"
                                    onClick={handleApprove}
                                >
                                    Approve Operations
                                </Button>
                            )}
                        </Group>
                    </>
                )}

                {/* Info message for non-senior_underwriter users */}
                {!isSeniorUnderwriter && isPending && (
                    <Text size="sm" c="dimmed" ta="center">
                        Waiting for Senior Underwriter approval before Finance can upload documents.
                    </Text>
                )}
            </Stack>
        </Card>
    );
}
