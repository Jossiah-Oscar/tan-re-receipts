import {
    Modal, Table, Loader, Alert, Text, ActionIcon, Title, Group,
} from '@mantine/core';
import { IconAlertCircle, IconFileDownload } from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import {API_BASE_URl_DOC, apiFetch} from "@/config/api";

interface EvidenceDTO {
    id: number;
    fileName: string;
    dateUploaded: string;
}

export function EvidenceModal({
                                  documentId,
                                  opened,
                                  onClose,
                              }: {
    documentId: number | null;
    opened: boolean;
    onClose(): void;
}) {
    const [evidences, setEvidences] = useState<EvidenceDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!opened || documentId == null) return;
        setLoading(true);
        setError(null);

        apiFetch(`/api/documents/${documentId}/evidence`, {
            method: "GET",
        }).then((data: EvidenceDTO[]) => setEvidences(data))
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));

        // fetch(`/api/documents/${documentId}/files`) // or your files endpoint
        //     .then((res) => {
        //         if (!res.ok) throw new Error(`HTTP ${res.status}`);
        //         return res.json();
        //     })
        //     .then((data: EvidenceDTO[]) => setEvidences(data))
        //     .catch((err) => setError(err.message))
        //     .finally(() => setLoading(false));
    }, [opened, documentId]);

    async function downloadEvidence(evidenceId: number, fileName: string) {
        if (!documentId) return;
        const url = `${API_BASE_URl_DOC}/api/documents/${documentId}/evidence/${evidenceId}/download`;
        const token = localStorage.getItem('jwt');


        try {
            const res = await fetch(url, {
                method: 'GET',
                headers: { Accept: 'application/octet-stream', 'Authorization': `Bearer ${token}`},
            });

            console.log('download response:', res);
            if (!res.ok) {
                throw new Error(`Download failed: ${res.status} ${res.statusText}`);
            }

            const blob = await res.blob();
            const downloadUrl = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(downloadUrl);
        } catch (err: any) {
            console.error('Error downloading evidence:', err);
        }
    }

    return (
        <Modal opened={opened} onClose={onClose} title="Evidence" size="lg" centered>
            {loading && <Loader />}
            {error && (
                <Alert color="red" icon={<IconAlertCircle size={16} />}>
                    {error}
                </Alert>
            )}
            {!loading && !error && evidences.length === 0 && (
                <Text mt="md">No evidence uploaded yet.</Text>
            )}
            {!loading && !error && evidences.length > 0 && (
                <Table striped highlightOnHover verticalSpacing="sm" style={{ width: '100%' }}>
                    <thead>
                    <tr>
                        <th>File Name</th>
                        <th>Uploaded At</th>
                        <th style={{ whiteSpace: 'nowrap' }}>Action</th>
                    </tr>
                    </thead>
                    <tbody>
                    {evidences.map((ev) => (
                        <tr key={ev.id}>
                            <td>{ev.fileName}</td>
                            <td>{new Date(ev.dateUploaded).toLocaleString()}</td>
                            <td style={{ whiteSpace: 'nowrap' }}>
                                <Group justify="xs" >
                                    <ActionIcon
                                        color="blue"
                                        onClick={() => downloadEvidence(ev.id, ev.fileName)}
                                        title="Download evidence"
                                    >
                                        <IconFileDownload size={16} />
                                    </ActionIcon>
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