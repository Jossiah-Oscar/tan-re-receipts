'use client'

import { useState, useEffect } from 'react';
import {
    Container,
    Title,
    Card,
    Table,
    Group,
    Text,
    ActionIcon,
    Loader,
    Alert,
    Badge,
} from '@mantine/core';
import { IconFileDownload, IconAlertCircle } from '@tabler/icons-react';
import {API_BASE_URl_DOC} from "@/config/api";

interface DocumentDTO {
    id: number;
    cedantName: string;
    documentType: string;
    fileName: string;
    status: 'PENDING' | 'DONE';
    dateCreated: string;
    dateUpdated: string;
    files: Array<{
        id: number;
        fileName: string;
        contentType: string;
        dateUploaded: string;
    }>;
}

export default function DocumentListPage() {
    const [docs, setDocs] = useState<DocumentDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch all documents (metadata + file list)
    useEffect(() => {
        setLoading(true);
        const token = localStorage.getItem('jwt');

        fetch(`${API_BASE_URl_DOC}/api/documents`, {
            headers: { Accept: 'application/octet-stream','Authorization': `Bearer ${token}`, },

        })
            .then((res) => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
            })
            .then((data: DocumentDTO[]) => {
                setDocs(data);
                setError(null);
            })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

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
        <Container size="md" py="xl">
            <Title order={2} mb="lg">
                Uploaded Documents
            </Title>

            {error && (
                <Alert color="red" icon={<IconAlertCircle size={16} />} mb="md">
                    {error}
                </Alert>
            )}

            {loading ? (
                <Loader />
            ) : (
                <Card shadow="sm" padding="lg" radius="md" withBorder>
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
                                <td>
                                    <Badge variant="light">{doc.documentType}</Badge>
                                </td>
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
                    {docs.length === 0 && (
                        <Text  color="dimmed" mt="md">
                            No documents found.
                        </Text>
                    )}
                </Card>
            )}
        </Container>
    );
}