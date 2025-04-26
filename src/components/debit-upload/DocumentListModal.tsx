import { Modal, Table, Loader, Alert, Text, Group, Badge, ActionIcon } from '@mantine/core';
import { IconFileDownload, IconAlertCircle } from '@tabler/icons-react';
import { useState, useEffect } from 'react';

interface DocumentFileDTO {
    id: number;
    fileName: string;
    dateUploaded: string;
}

interface DocumentDTO {
    id: number;
    cedantName: string;
    documentType: string;
    fileName: string;
    status: 'PENDING' | 'DONE';
    dateCreated: string;
    dateUpdated: string;
    files: DocumentFileDTO[];
}

export function DocumentListModal({
                                      opened,
                                      onClose,
                                  }: {
    opened: boolean;
    onClose(): void;
}) {
    const [docs, setDocs] = useState<DocumentDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // fetch when modal opens
    useEffect(() => {
        if (!opened) return;
        setLoading(true);
        setError(null);
        fetch('/api/documents')
            .then((res) => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
            })
            .then((data: DocumentDTO[]) => setDocs(data))
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, [opened]);

    const downloadFile = (fileId: number, fileName: string) => {
        fetch(`/api/documents/files/${fileId}/download`, {
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
        <Modal opened={opened} onClose={onClose} title="All Documents" size="lg" centered>
            {loading && <Loader />}
            {error && (
                <Alert color="red" icon={<IconAlertCircle size={16} />}>
                    {error}
                </Alert>
            )}
            {!loading && !error && docs.length === 0 && (
                <Text mt="md">No documents found.</Text>
            )}
            {!loading && !error && docs.length > 0 && (
                <Table striped highlightOnHover verticalSpacing="sm">
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>Cedant</th>
                        <th>Type</th>
                        <th>Group Name</th>
                        <th>Status</th>
                        <th>Created</th>
                        <th>Updated</th>
                        <th>Files</th>
                    </tr>
                    </thead>
                    <tbody>
                    {docs.map((doc) => (
                        <tr key={doc.id}>
                            <td>{doc.id}</td>
                            <td>{doc.cedantName}</td>
                            <td><Badge variant="light">{doc.documentType}</Badge></td>
                            <td>{doc.fileName}</td>
                            <td>{doc.status}</td>
                            <td>{new Date(doc.dateCreated).toLocaleDateString()}</td>
                            <td>{new Date(doc.dateUpdated).toLocaleDateString()}</td>
                            <td>
                                <Group>
                                    {doc.files.map((f) => (
                                        <ActionIcon
                                            key={f.id}
                                            onClick={() => downloadFile(f.id, f.fileName)}
                                            title={`Download ${f.fileName}`}
                                        >
                                            <IconFileDownload size={18} />
                                        </ActionIcon>
                                    ))}
                                </Group>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </Table>
            )}
        </Modal>
    );
}