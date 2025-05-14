'use client'

// pages/document-upload.tsx
import { useState, useEffect } from 'react';
import {
    Container,
    Stack,
    Title,
    Card,
    Group,
    Text,
    Alert,
    Loader,
    Badge,
    Button,
    Tabs,
    Table,
    ActionIcon,
    Modal, FileInput,
} from '@mantine/core';
import {IconPlus, IconAlertCircle, IconEye, IconFileDownload, IconPhoto, IconTrash} from '@tabler/icons-react';
import {DocumentSearch} from "@/components/debit-upload/debitSearch";
import {UploadForm} from "@/components/debit-upload/uploadForm";
import {DocumentDetailsModal} from "@/components/debit-upload/DocumentDetailsModal";
import {API_BASE_URl_DOC, ApiError} from "@/config/api";
import {showNotification} from "@mantine/notifications";


interface DocumentDTO {
    id: number;
    cedantName: string;
    documentType: string;
    fileName: string;
    status: 'PENDING' | 'DONE';
    dateCreated: string;
    dateUpdated: string;
    files: { id: number; fileName: string }[];
}

export default function DocumentUploadPage() {
    const [documents, setDocuments] = useState<DocumentDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [uploadOpened, setUploadOpened] = useState(false);
    const [detailsOpened, setDetailsOpened] = useState(false);
    const [selectedDocId, setSelectedDocId] = useState<number | null>(null);

    const [evidenceOpened, setEvidenceOpened] = useState(false);
    const [evidenceDocId, setEvidenceDocId] = useState<number | null>(null);
    const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);




    const  viewFiles = (docId: number) => {
        setSelectedDocId(docId);
        setDetailsOpened(true);
    };

    const downloadFirstFile = (files: { id: number; fileName: string }[]) => {
        if (!files.length) return;
        const { id, fileName } = files[0];
        const token = localStorage.getItem('jwt');

        fetch(`${API_BASE_URl_DOC}/api/documents/files/${id}/download`, {
            headers: { Accept: 'application/octet-stream','Authorization': `Bearer ${token}`, },
        })
            .then((r) => r.blob())
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
            .catch(console.error);
    };

    // Filter helpers
    const pendingDocs = documents.filter((d) => d.status === 'PENDING');
    const doneDocs    = documents.filter((d) => d.status === 'DONE');

    // **Handlers for evidence modal**
    function openEvidenceModal(docId: number) {
        setEvidenceDocId(docId);
        setEvidenceFile(null);
        setEvidenceOpened(true);
    }
    function closeEvidenceModal() {
        setEvidenceOpened(false);
        setEvidenceDocId(null);
        setEvidenceFile(null);
    }

    async function submitEvidence() {
        if (!evidenceDocId || !evidenceFile) return;
        const form = new FormData();
        form.append('evidence', evidenceFile);
        const token = localStorage.getItem('jwt');

        await fetch(`${API_BASE_URl_DOC}/api/documents/${evidenceDocId}/evidence`, {
            method: 'POST',
            body: form,
            headers: { Accept: 'application/octet-stream','Authorization': `Bearer ${token}`, },

        });
        closeEvidenceModal();
        fetchDocuments();
    }

    const fetchDocuments = async (criteria?: { cedantName: string; documentType: string }) => {
        setLoading(true);
        try {
            let url = `${API_BASE_URl_DOC}/api/documents`;
            const token = localStorage.getItem('jwt');


            if (criteria) {
                const params = new URLSearchParams();
                if (criteria.cedantName)     params.append('cedantName', criteria.cedantName);
                if (criteria.documentType)    params.append('documentType', criteria.documentType);
                url += `?${params.toString()}`;
            }
            const res = await fetch(url,{headers: {'Authorization': `Bearer ${token}`, }});

            if (res.status === 401) {
                localStorage.removeItem("jwt");
                window.location.href = "/login";
                return;
            }

            if (!res.ok) {
                throw new Error(`HTTP ${res.status} - ${res.statusText}`);
            }

            const docs: DocumentDTO[] = await res.json();

            setDocuments(docs);
            setError(null);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (docId: number) => {
        if (!window.confirm('Are you sure you want to delete this document and all its files?')) {
            return;
        }

        setDeletingId(docId);

        try {
            const token = localStorage.getItem('jwt');
            if (!token) {
                showNotification({ message: 'Authentication required. Please log in.', color: 'red' });
                window.location.href = "/login";
                return;
            }

            const res = await fetch(`${API_BASE_URl_DOC}/api/documents/${docId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (res.status === 401 || res.status === 403) {
                localStorage.removeItem("jwt");
                showNotification({ message: 'Session expired. Please log in again.', color: 'red' });
                window.location.href = "/login";
                return;
            }

            if (!res.ok) {
                throw new Error(`HTTP ${res.status} - ${res.statusText}`);
            }

            showNotification({ message: 'Document deleted', color: 'green' });
            await fetchDocuments(); // refresh list
        } catch (err: any) {
            showNotification({ message: `Delete failed: ${err.message}`, color: 'red' });
        } finally {
            setDeletingId(null);
        }
    };


    // initial load
    useEffect(() => {
        fetchDocuments();
    }, []);

    return (
        <Container size="xl" py="xl">
            <Stack>
                <Title order={2}>Document Management</Title>

                <DocumentSearch onSearch={(criteria) =>fetchDocuments(criteria)} onSearchStart={() => setLoading(true)} />

                <Group justify="flex-end" mt="md">
                    <Button leftSection={<IconPlus size={16} />} onClick={() => setUploadOpened(true)}>
                        Upload Document
                    </Button>
                </Group>

                {error && (
                    <Alert color="red" icon={<IconAlertCircle size={16} />}>
                        {error}
                    </Alert>
                )}

                {loading ? (
                    <Loader />
                ) : (
                    <Card shadow="sm" padding="sm" radius="md" withBorder>
                        <Tabs defaultValue="PENDING" variant="outline">
                            <Tabs.List>
                                <Tabs.Tab value="PENDING">Pending ({pendingDocs.length})</Tabs.Tab>
                                <Tabs.Tab value="DONE">Done ({doneDocs.length})</Tabs.Tab>
                            </Tabs.List>

                            {/* Pending Tab */}
                            <Tabs.Panel value="PENDING" pt="md">
                                {pendingDocs.length === 0 ? (
                                    <Text color="dimmed">No pending documents.</Text>
                                ) : (
                                    <Table striped highlightOnHover verticalSpacing="sm">
                                        <Table.Thead>
                                        <Table.Tr>
                                            <Table.Th>ID</Table.Th>
                                            <Table.Th>Cedant</Table.Th>
                                            <Table.Th>Type</Table.Th>
                                            <Table.Th>Group Name</Table.Th>
                                            <Table.Th>Created</Table.Th>
                                            <Table.Th>Updated</Table.Th>
                                            <Table.Th>Actions</Table.Th>
                                        </Table.Tr>
                                        </Table.Thead>
                                        <Table.Tbody>
                                        {pendingDocs.map((doc) => (
                                            <Table.Tr key={doc.id}>
                                                <Table.Td>{doc.id}</Table.Td>
                                                <Table.Td>{doc.cedantName}</Table.Td>
                                                <Table.Td><Badge variant="light">{doc.documentType}</Badge></Table.Td>
                                                <Table.Td>{doc.fileName}</Table.Td>
                                                <Table.Td>{new Date(doc.dateCreated).toLocaleDateString()}</Table.Td>
                                                <Table.Td>{new Date(doc.dateUpdated).toLocaleDateString()}</Table.Td>
                                                <Table.Td>
                                                    <Group >
                                                        <ActionIcon color="blue" onClick={() => viewFiles(doc.id)} title="View Files">
                                                            <IconEye size={16} />
                                                        </ActionIcon>

                                                        <ActionIcon
                                                            color="green"
                                                            onClick={() => openEvidenceModal(doc.id)}
                                                            title="Add Evidence"
                                                        >
                                                            <IconPhoto size={16} />
                                                        </ActionIcon>
                                                        <ActionIcon
                                                            color="red"
                                                            onClick={() => handleDelete(doc.id)}
                                                            loading={deletingId === doc.id}
                                                            disabled={deletingId === doc.id}
                                                            title="Delete"
                                                        >
                                                            <IconTrash size={16} />
                                                        </ActionIcon>
                                                    </Group>
                                                </Table.Td>
                                            </Table.Tr>
                                        ))}
                                        </Table.Tbody>
                                    </Table>
                                )}
                            </Tabs.Panel>

                            {/* Done Tab */}
                            <Tabs.Panel value="DONE" pt="md">
                                {doneDocs.length === 0 ? (
                                    <Text color="dimmed">No completed documents.</Text>
                                ) : (
                                    <Table striped highlightOnHover verticalSpacing="sm">
                                        <Table.Thead>
                                        <Table.Tr>
                                            <Table.Th>ID</Table.Th>
                                            <Table.Th>Cedant</Table.Th>
                                            <Table.Th>Type</Table.Th>
                                            <Table.Th>Group Name</Table.Th>
                                            <Table.Th>Created</Table.Th>
                                            <Table.Th>Updated</Table.Th>
                                            <Table.Th>Actions</Table.Th>
                                        </Table.Tr>
                                        </Table.Thead>
                                        <Table.Tbody>
                                        {doneDocs.map((doc) => (
                                            <Table.Tr key={doc.id}>
                                                <Table.Td>{doc.id}</Table.Td>
                                                <Table.Td>{doc.cedantName}</Table.Td>
                                                <Table.Td><Badge variant="light">{doc.documentType}</Badge></Table.Td>
                                                <Table.Td>{doc.fileName}</Table.Td>
                                                <Table.Td>{new Date(doc.dateCreated).toLocaleDateString()}</Table.Td>
                                                <Table.Td>{new Date(doc.dateUpdated).toLocaleDateString()}</Table.Td>
                                                <Table.Td>
                                                    <Group >
                                                        <ActionIcon color="blue" onClick={() => viewFiles(doc.id)} title="View Files">
                                                            <IconEye size={16} />
                                                        </ActionIcon>
                                                        <ActionIcon color="blue" onClick={() => downloadFirstFile(doc.files)} title="Download Latest">
                                                            <IconFileDownload size={16} />
                                                        </ActionIcon>
                                                    </Group>
                                                </Table.Td>
                                            </Table.Tr>
                                        ))}
                                        </Table.Tbody>
                                    </Table>
                                )}
                            </Tabs.Panel>
                        </Tabs>
                    </Card>
                )}
            </Stack>

            {/* Upload Modal */}
            <Modal
                opened={uploadOpened}
                onClose={() => setUploadOpened(false)}
                title="Upload Document"
                centered
                size="lg"
            >
                <UploadForm
                    onSuccess={() => {
                        setUploadOpened(false);
                        fetchDocuments();
                    }}
                />
            </Modal>

            {/* Details Modal for specific document */}
            <DocumentDetailsModal
                documentId={selectedDocId}
                opened={detailsOpened}
                onClose={() => setDetailsOpened(false)}
            />

            <Modal
                opened={evidenceOpened}
                onClose={closeEvidenceModal}
                title="Add Evidence"
                size="sm"
                centered
            >
                <FileInput
                    label="Choose evidence image"
                    placeholder="Select a file"
                    accept="image/*"
                    value={evidenceFile}
                    onChange={setEvidenceFile}
                    required
                />
                <Button fullWidth mt="md" onClick={submitEvidence} disabled={!evidenceFile}>
                    Submit Evidence
                </Button>
            </Modal>
        </Container>
    );
}
