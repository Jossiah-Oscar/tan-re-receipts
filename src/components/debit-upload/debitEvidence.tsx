'use client'

import { useState } from 'react';
import { FileInput, Button, Group, Stack } from '@mantine/core';
import {API_BASE_URL, API_BASE_URl_DOC} from "@/config/api";

export function EvidenceForm({ documentId, onSuccess }: { documentId: number; onSuccess: () => void }) {
    const [file, setFile] = useState<File | null>(null);

    const handleSubmit = async () => {
        if (!file) return;
        const formData = new FormData();
        formData.append('evidence', file);
        try {
            const response = await fetch(`${API_BASE_URl_DOC}/api/documents/${documentId}/evidence`, {
                method: 'POST',
                body: formData,
            });
            if (response.ok) onSuccess();
            else alert('Error uploading evidence');
        } catch (err) {
            console.error(err);
            alert('Error uploading evidence');
        }
    };

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
            }}
        >
            <Stack>
                <FileInput
                    label="Upload Evidence"
                    placeholder="Select image"
                    accept="image/*"
                    value={file}
                    onChange={setFile}
                    required
                />
                <Group mt="md">
                    <Button type="submit">Submit</Button>
                </Group>
            </Stack>
        </form>
    );
}