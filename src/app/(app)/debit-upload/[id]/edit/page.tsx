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
    Text,
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
                        <Table highlightOnHover>
                            <thead>
                            <tr>
                                <th>File Name</th>
                                <th>Content Type</th>
                                <th>Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {files.map((f) => (
                                <tr key={f.id}>
                                    <td>{f.fileName}</td>
                                    <td>{f.contentType}</td>
                                    <td>
                                        <Button
                                            size="xs"
                                            component="a"
                                            href={`/api/documents/${id}/files/${f.id}`}
                                            target="_blank"
                                        >
                                            Download
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </Table>
                    )}
                </Tabs.Panel>

                {/* 3. Comments / Transactions */}
                <Tabs.Panel value="comments" pt="md">
                    {txs.length === 0 ? (
                        <Text>No history yet.</Text>
                    ) : (
                        <Table highlightOnHover>
                            <thead>
                            <tr>
                                <th>When</th>
                                <th>By</th>
                                <th>From → To</th>
                                <th>Comment</th>
                            </tr>
                            </thead>
                            <tbody>
                            {txs.map((t) => (
                                <tr key={t.id}>
                                    <td>{new Date(t.changedAt).toLocaleString()}</td>
                                    <td>{t.changedBy}</td>
                                    <td>
                                        {t.oldStatus} → {t.newStatus}
                                    </td>
                                    <td>{t.comment}</td>
                                </tr>
                            ))}
                            </tbody>
                        </Table>
                    )}
                </Tabs.Panel>
            </Tabs>
        </Container>
    );
}
