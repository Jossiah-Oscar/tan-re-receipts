'use client';

import { useState } from 'react';
import {
    Paper,
    Text,
    Group,
    Stack,
    ActionIcon,
    Tooltip,
    Button,
    FileButton,
    Loader,
    Center
} from '@mantine/core';
import {
    IconDownload,
    IconTrash,
    IconFile,
    IconPaperclip,
    IconPlus,
    IconAlertCircle
} from '@tabler/icons-react';
import { showNotification } from '@mantine/notifications';
import { modals } from '@mantine/modals';
import { apiFetch } from '@/config/api';

interface Attachment {
    id: number;
    fileName: string;
    contentType: string;
    fileSize: number;
    uploadedBy: string;
    uploadedAt: string;
}

interface OfferAttachmentsListProps {
    offerId: number;
    attachments: Attachment[];
    onRefresh: () => void;
    allowUpload?: boolean;
}

const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

export default function OfferAttachmentsList({
    offerId,
    attachments,
    onRefresh,
    allowUpload = true
}: OfferAttachmentsListProps) {
    const [uploading, setUploading] = useState(false);

    async function handleDownload(attachmentId: number, fileName: string) {
        try {
            const response = await fetch(
                `/api/underwriting/facultative/attachments/${attachmentId}/download`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                }
            );

            if (!response.ok) throw new Error('Download failed');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            showNotification({
                title: 'Success',
                message: 'File downloaded successfully',
                color: 'green',
            });
        } catch (error: any) {
            showNotification({
                title: 'Error',
                message: error.message || 'Failed to download file',
                color: 'red',
                icon: <IconAlertCircle />,
            });
        }
    }

    function handleDelete(attachment: Attachment) {
        modals.openConfirmModal({
            title: 'Delete Attachment',
            centered: true,
            children: (
                <Text size="sm">
                    Are you sure you want to delete <strong>{attachment.fileName}</strong>?
                    This action cannot be undone.
                </Text>
            ),
            labels: { confirm: 'Delete', cancel: 'Cancel' },
            confirmProps: { color: 'red' },
            onConfirm: async () => {
                try {
                    await apiFetch(`/api/underwriting/facultative/attachments/${attachment.id}`, {
                        method: 'DELETE',
                    });
                    showNotification({
                        title: 'Success',
                        message: 'Attachment deleted successfully',
                        color: 'green',
                    });
                    onRefresh();
                } catch (error: any) {
                    showNotification({
                        title: 'Error',
                        message: error.message || 'Failed to delete attachment',
                        color: 'red',
                        icon: <IconAlertCircle />,
                    });
                }
            },
        });
    }

    async function handleUploadAdditional(file: File | null) {
        if (!file) return;

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch(
                `/api/underwriting/facultative/offer/${offerId}/attachments`,
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                    body: formData,
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Upload failed');
            }

            showNotification({
                title: 'Success',
                message: 'File uploaded successfully',
                color: 'green',
            });
            onRefresh();
        } catch (error: any) {
            showNotification({
                title: 'Error',
                message: error.message || 'Failed to upload file',
                color: 'red',
                icon: <IconAlertCircle />,
            });
        } finally {
            setUploading(false);
        }
    }

    return (
        <Paper withBorder p="md">
            <Stack gap="md">
                <Group justify="space-between">
                    <Group gap="xs">
                        <IconPaperclip size={18} />
                        <Text fw={500}>Attachments</Text>
                        {attachments.length > 0 && (
                            <Text size="sm" c="dimmed">
                                ({attachments.length})
                            </Text>
                        )}
                    </Group>
                    {allowUpload && (
                        <FileButton onChange={handleUploadAdditional} accept="*/*">
                            {(props) => (
                                <Button
                                    {...props}
                                    size="xs"
                                    leftSection={<IconPlus size={14} />}
                                    loading={uploading}
                                >
                                    Upload File
                                </Button>
                            )}
                        </FileButton>
                    )}
                </Group>

                {attachments.length === 0 ? (
                    <Center py="xl">
                        <Stack align="center" gap="xs">
                            <IconFile size={48} stroke={1.5} color="gray" />
                            <Text c="dimmed" size="sm">
                                No attachments yet
                            </Text>
                        </Stack>
                    </Center>
                ) : (
                    <Stack gap="xs">
                        {attachments.map((attachment) => (
                            <Paper key={attachment.id} withBorder p="sm">
                                <Group justify="space-between">
                                    <Group gap="sm">
                                        <IconFile size={20} />
                                        <div>
                                            <Text size="sm" fw={500}>
                                                {attachment.fileName}
                                            </Text>
                                            <Text size="xs" c="dimmed">
                                                {formatFileSize(attachment.fileSize)} •{' '}
                                                Uploaded by {attachment.uploadedBy} •{' '}
                                                {formatDate(attachment.uploadedAt)}
                                            </Text>
                                        </div>
                                    </Group>
                                    <Group gap="xs">
                                        <Tooltip label="Download">
                                            <ActionIcon
                                                variant="subtle"
                                                color="blue"
                                                onClick={() =>
                                                    handleDownload(attachment.id, attachment.fileName)
                                                }
                                            >
                                                <IconDownload size={16} />
                                            </ActionIcon>
                                        </Tooltip>
                                        {allowUpload && (
                                            <Tooltip label="Delete">
                                                <ActionIcon
                                                    variant="subtle"
                                                    color="red"
                                                    onClick={() => handleDelete(attachment)}
                                                >
                                                    <IconTrash size={16} />
                                                </ActionIcon>
                                            </Tooltip>
                                        )}
                                    </Group>
                                </Group>
                            </Paper>
                        ))}
                    </Stack>
                )}
            </Stack>
        </Paper>
    );
}
