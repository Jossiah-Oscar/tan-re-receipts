'use client';

import { useState } from 'react';
import {
    Paper,
    Text,
    Group,
    Stack,
    ActionIcon,
    Tooltip,
    Badge,
    Alert,
    Button
} from '@mantine/core';
import { Dropzone, FileWithPath, MIME_TYPES } from '@mantine/dropzone';
import { IconUpload, IconX, IconFile, IconAlertCircle, IconPaperclip } from '@tabler/icons-react';

interface OfferFileUploadProps {
    files: File[];
    onChange: (files: File[]) => void;
    maxFiles?: number;
}

const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

export default function OfferFileUpload({ files, onChange, maxFiles = 10 }: OfferFileUploadProps) {
    const [error, setError] = useState<string | null>(null);

    const handleDrop = (newFiles: FileWithPath[]) => {
        setError(null);

        if (files.length + newFiles.length > maxFiles) {
            setError(`Maximum ${maxFiles} files allowed. Currently have ${files.length} file(s).`);
            return;
        }

        onChange([...files, ...newFiles]);
    };

    const handleRemove = (index: number) => {
        const newFiles = files.filter((_, i) => i !== index);
        onChange(newFiles);
        setError(null);
    };

    const handleReject = () => {
        setError('Some files were rejected. Please check file types and sizes.');
    };

    return (
        <Stack gap="md">
            <Paper withBorder p="md">
                <Stack gap="xs">
                    <Group gap="xs">
                        <IconPaperclip size={18} />
                        <Text fw={500}>Attachments (Optional)</Text>
                        <Badge size="sm" variant="light">
                            {files.length}/{maxFiles}
                        </Badge>
                    </Group>

                    {error && (
                        <Alert color="red" icon={<IconAlertCircle />} onClose={() => setError(null)} withCloseButton>
                            {error}
                        </Alert>
                    )}

                    {files.length < maxFiles && (
                        <Dropzone
                            onDrop={handleDrop}
                            onReject={handleReject}
                            maxFiles={maxFiles - files.length}
                            maxSize={10 * 1024 * 1024} // 10MB per file
                        >
                            <Group justify="center" gap="md" style={{ minHeight: 100, pointerEvents: 'none' }}>
                                <Dropzone.Accept>
                                    <IconUpload size={40} stroke={1.5} />
                                </Dropzone.Accept>
                                <Dropzone.Reject>
                                    <IconX size={40} stroke={1.5} />
                                </Dropzone.Reject>
                                <Dropzone.Idle>
                                    <IconFile size={40} stroke={1.5} />
                                </Dropzone.Idle>

                                <Stack gap={0}>
                                    <Text size="lg" inline>
                                        Drag files here or click to select
                                    </Text>
                                    <Text size="sm" c="dimmed" inline mt={7}>
                                        Attach up to {maxFiles} files, each file should not exceed 10MB
                                    </Text>
                                </Stack>
                            </Group>
                        </Dropzone>
                    )}

                    {files.length > 0 && (
                        <Stack gap="xs" mt="md">
                            <Text size="sm" fw={500}>Selected Files:</Text>
                            {files.map((file, index) => (
                                <Paper key={index} withBorder p="xs">
                                    <Group justify="space-between">
                                        <Group gap="xs">
                                            <IconFile size={18} />
                                            <div>
                                                <Text size="sm" fw={500}>
                                                    {file.name}
                                                </Text>
                                                <Text size="xs" c="dimmed">
                                                    {formatFileSize(file.size)}
                                                </Text>
                                            </div>
                                        </Group>
                                        <Tooltip label="Remove file">
                                            <ActionIcon
                                                variant="subtle"
                                                color="red"
                                                onClick={() => handleRemove(index)}
                                            >
                                                <IconX size={16} />
                                            </ActionIcon>
                                        </Tooltip>
                                    </Group>
                                </Paper>
                            ))}
                        </Stack>
                    )}
                </Stack>
            </Paper>
        </Stack>
    );
}
