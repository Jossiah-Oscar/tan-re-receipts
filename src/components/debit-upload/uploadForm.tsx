'use client'

import { useState } from 'react';
import { TextInput, Select, FileInput, Button, Group, Stack } from '@mantine/core';
import {API_BASE_URl_DOC} from "@/config/api";
import { BrokerCedantDropdown } from './BrokerCedantDropdown';

export function UploadForm({ onSuccess }: { onSuccess: () => void }) {
    // ← use a code (string|null) instead of free-text name
    const [cedantCode, setCedantCode] = useState<string | null>(null);
    const [documentType, setDocumentType] = useState<string | null>(null);
    const [fileName, setFileName] = useState('');
    const [files, setFiles] = useState<File[]>([]);

    const handleSubmit = async () => {
        if (!cedantCode) {
            alert('Please select a broker/cedant');
            return;
        }

        const formData = new FormData();
        formData.append('cedantCode', cedantCode);          // send the code
        formData.append('documentType', documentType || '');
        formData.append('fileName', fileName);
        files.forEach((file) => formData.append('files', file));

        try {
            const response = await fetch(
                `${API_BASE_URl_DOC}/api/documents/upload`,
                {
                    method: 'POST',
                    body: formData,
                }
            );
            if (response.ok) {
                onSuccess();
            } else {
                alert('Error uploading documents');
            }
        } catch (err) {
            console.error(err);
            alert('Error uploading documents');
        }
    };

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
            }}
        >
            <Stack gap="md">
                <BrokerCedantDropdown
                    value={cedantCode}
                    onChange={setCedantCode}
                />

                <Select
                    label="Type of Document"
                    data={['Debit-Note', 'Claim', 'Credit-Note']}
                    value={documentType}
                    onChange={setDocumentType}
                    required
                />

                <TextInput
                    label="File Name"
                    value={fileName}
                    onChange={(e) => setFileName(e.currentTarget.value)}
                    required
                />

                <FileInput
                    label="Upload Documents"
                    placeholder="Choose files"
                    multiple
                    value={files}
                    onChange={(f) => setFiles(Array.isArray(f) ? f : [])}
                    required
                />

                <Group justify="right" mt="lg">
                    <Button type="submit">Submit</Button>
                </Group>
            </Stack>
        </form>
    );
}