"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
    Container,
    Title,
    Tabs,
    TextInput,
    Button,
    Table,
    Loader,
    Text, FileInput, Group, Stack,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { apiFetch } from "@/config/api";
import {BrokerCedantDropdown} from "@/components/debit-upload/BrokerCedantDropdown";

//
// -- DTO Interfaces
//
interface DocumentDTO {
    id: number;
    cedantName: string;
    documentType: string;
    fileName: string;
    status: string;
    createdBy: string;
    createdAt: string;
}

interface FileDTO {
    id: number;
    fileName: string;
    contentType: string;
}

interface TransactionDTO {
    id: number;
    oldStatus: string;
    newStatus: string;
    comment: string;
    changedBy: string;
    changedAt: string;
}

export default function EditDocumentPage() {
    const { id } = useParams();
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [error, setError]       = useState<string | null>(null);

    // Data
    const [doc, setDoc]           = useState<DocumentDTO | null>(null);
    const [files, setFiles]       = useState<FileDTO[]>([]);
    const [txs, setTxs]           = useState<TransactionDTO[]>([]);

    // Form state
    const [cedantName, setCedantName]     = useState("");
    const [documentType, setDocumentType] = useState("");
    const [fileName, setFileName]         = useState("");
    const [saving, setSaving]             = useState(false);
    const [cedantCode, setCedantCode] = useState<string | null>(null);

    const [newFiles, setNewFiles] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);


    useEffect(() => {
        loadAll();
    }, [id]);

    async function loadAll() {
        setLoading(true);
        setError(null);
        try {
            const [d, f, t] = await Promise.all([
                apiFetch<DocumentDTO>(`/api/documents/${id}`),
                apiFetch<FileDTO[]>(`/api/documents/${id}/files`),
                apiFetch<TransactionDTO[]>(`/api/documents/${id}/transactions`),
            ]);
            setDoc(d);
            setFiles(f);
            setTxs(t);

            // prefill form
            setCedantName(d.cedantName);
            setDocumentType(d.documentType);
            setFileName(d.fileName);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    async function handleUpload() {
        if (newFiles.length === 0) return;
        setUploading(true);
        try {
            const form = new FormData();
            newFiles.forEach((f) => form.append("files", f));
            await apiFetch(`/api/documents/${id}/files`, {
                method: "POST",
                body: form,          // FormData triggers file upload path
                requiresAuth: true,  // default true
            });
            showNotification({ message: "Files uploaded", color: "green" });
            setNewFiles([]);
            loadAll(); // re-fetch files list
        } catch (e: any) {
            showNotification({ message: e.message, color: "red" });
        } finally {
            setUploading(false);
        }
    }

    async function handleSave() {
        if (!doc) return;
        setSaving(true);
        try {
            const updated = await apiFetch<DocumentDTO>(`/api/documents/${id}`, {
                method: "PUT",
                body: { cedantCode, documentType, fileName },
            });
            showNotification({ message: "Document updated", color: "green" });
            setDoc(updated);
        } catch (err: any) {
            showNotification({ message: err.message, color: "red" });
        } finally {
            setSaving(false);
        }
    }

    if (loading) return <Loader />;
    if (error)   return <Text color="red">{error}</Text>;
    if (!doc)   return <Text color="red">Document not found.</Text>;

    const canEdit = doc.status === "PENDING";

    return (
        <Container my="xl">
            <Title order={2}>Edit Document #{doc.id}</Title>

            <Tabs defaultValue="details" mt="md">
                <Tabs.List>
                    <Tabs.Tab value="details">Details</Tabs.Tab>
                    <Tabs.Tab value="files">Files</Tabs.Tab>
                    <Tabs.Tab value="comments">History</Tabs.Tab>
                </Tabs.List>

                {/* 1. Document Details */}
                <Tabs.Panel value="details" pt="md">
                    <BrokerCedantDropdown
                        value={cedantName}
                        onChange={setCedantCode}
                    />
                    <TextInput
                        label="Document Type"
                        mt="sm"
                        value={documentType}
                        onChange={(e) => setDocumentType(e.currentTarget.value)}
                        disabled={!canEdit}
                    />
                    <TextInput
                        label="File Name"
                        mt="sm"
                        value={fileName}
                        onChange={(e) => setFileName(e.currentTarget.value)}
                        disabled={!canEdit}
                    />

                    <Button
                        mt="md"
                        onClick={handleSave}
                        loading={saving}
                        disabled={!canEdit}
                    >
                        Save Changes
                    </Button>
                    {!canEdit && (
                        <Text color="dimmed" size="sm" mt="xs">
                            (Cannot edit unless status is Pending)
                        </Text>
                    )}
                </Tabs.Panel>

                {/* 2. List of Files */}
                <Tabs.Panel value="files" pt="md">
                    {files.length === 0 ? (
                        <Text>No files attached.</Text>
                    ) : (
                        <Stack >
                            <Group justify="flex-end">
                                <FileInput
                                    multiple
                                    placeholder="Select files"
                                    value={newFiles}
                                    onChange={setNewFiles}
                                />
                                <Button onClick={handleUpload} loading={uploading} disabled={newFiles.length===0}>
                                    Upload
                                </Button>
                            </Group>
                        <Table highlightOnHover>
                            <Table.Thead>
                            <Table.Tr>
                                <Table.Th>File Name</Table.Th>
                                <Table.Th>Content Type</Table.Th>
                                <Table.Th>Actions</Table.Th>
                            </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                            {files.map((f) => (
                                <Table.Tr key={f.id}>
                                    <Table.Td>{f.fileName}</Table.Td>
                                    <Table.Td>{f.contentType}</Table.Td>
                                    <Table.Td>
                                        <Group>
                                            <Button
                                                size="xs"
                                                component="a"
                                                href={`/api/documents/${id}/files/${f.id}`}
                                                target="_blank"
                                            >
                                                Download
                                            </Button>

                                        </Group>
                                    </Table.Td>
                                </Table.Tr>
                            ))}
                            </Table.Tbody>
                        </Table>
                        </Stack>
                    )}
                </Tabs.Panel>

                {/* 3. Comments / Transactions */}
                <Tabs.Panel value="comments" pt="md">
                    {txs.length === 0 ? (
                        <Text>No history yet.</Text>
                    ) : (
                        <Table highlightOnHover>
                            <Table.Thead>
                            <Table.Tr>
                                <Table.Th>When</Table.Th>
                                <Table.Th>By</Table.Th>
                                <Table.Th>From → To</Table.Th>
                                <Table.Th>Comment</Table.Th>
                            </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                            {txs.map((t) => (
                                <Table.Tr key={t.id}>
                                    <Table.Td>{new Date(t.changedAt).toLocaleString()}</Table.Td>
                                    <Table.Td>{t.changedBy}</Table.Td>
                                    <Table.Td>
                                        {t.oldStatus} → {t.newStatus}
                                    </Table.Td>
                                    <Table.Td>{t.comment}</Table.Td>
                                </Table.Tr>
                            ))}
                            </Table.Tbody>
                        </Table>
                    )}
                </Tabs.Panel>
            </Tabs>
        </Container>
    );
}
