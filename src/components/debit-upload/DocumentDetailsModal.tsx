// components/DocumentDetailsModal.tsx
import { Modal, Table, Loader, Alert, Text, ActionIcon, Title, Group } from '@mantine/core';
import { IconAlertCircle, IconFileDownload } from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import {API_BASE_URl_DOC} from "@/config/api";

interface DocumentFileDTO {
    id: number;
    fileName: string;
    dateUploaded: string;
}

export function DocumentDetailsModal({
                                         documentId,
                                         opened,
                                         onClose,
                                     }: {
    documentId: number | null;
    opened: boolean;
    onClose(): void;
}) {
    const [files, setFiles] = useState<DocumentFileDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!opened || documentId == null) return;
        setLoading(true);
        setError(null);

        // fetch just the files for this document
        fetch(`${API_BASE_URl_DOC}/api/documents/${documentId}/files`)
            .then((res) => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
            })
            .then((dto: DocumentFileDTO[]) => setFiles(dto))
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, [opened, documentId]);

    const downloadFile = (fileId: number, fileName: string) => {
        fetch(`${API_BASE_URl_DOC}/api/documents/files/${fileId}/download`, {
            headers: { Accept: 'application/octet-stream' },
        })
            .then((res) => {
                if (!res.ok) throw new Error(`Download failed: ${res.status}`);
                return res.blob();
            })
            .then((blob) => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = fileName;
                document.body.append(a);
                a.click();
                a.remove();
                URL.revokeObjectURL(url);
            })
            .catch((err) => console.error(err));
    };

    return (
        <Modal opened={opened} onClose={onClose} title={`Files for Document #${documentId}`} size="lg" centered>
            {loading && <Loader />}
            {error && (
                <Alert color="red" icon={<IconAlertCircle size={16} />}>
                    {error}
                </Alert>
            )}
            {!loading && !error && files.length === 0 && (
                <Text mt="md">
                    No files uploaded yet.
                </Text>
            )}
            {!loading && !error && files.length > 0 && (
                <Table striped highlightOnHover verticalSpacing="sm">
                    <Table.Thead>
                    <Table.Tr>
                        <Table.Th>File Name</Table.Th>
                        <Table.Th>Uploaded At</Table.Th>
                        <Table.Th>Action</Table.Th>
                    </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                    {files.map((f) => (
                        <Table.Tr key={f.id}>
                            <Table.Td>{f.fileName}</Table.Td>
                            <Table.Td>{new Date(f.dateUploaded).toLocaleString()}</Table.Td>
                            <Table.Td>
                                <ActionIcon onClick={() => downloadFile(f.id, f.fileName)} title="Download">
                                    <IconFileDownload size={16} />
                                </ActionIcon>
                            </Table.Td>
                        </Table.Tr>
                    ))}
                    </Table.Tbody>
                </Table>
            )}
        </Modal>
    );
}
