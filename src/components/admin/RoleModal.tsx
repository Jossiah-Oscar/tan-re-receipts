"use client";

import { useState } from "react";
import { Modal, TextInput, Button } from "@mantine/core";
import {apiFetch} from "@/config/api";

interface RoleModalProps {
    opened: boolean;
    onClose: () => void;
    onSaved: () => void;
}

export default function RoleModal({ opened, onClose, onSaved }: RoleModalProps) {
    const [name, setName] = useState("");
    const [saving, setSaving] = useState(false);

    async function handleSave() {
        setSaving(true);
        try {
            await apiFetch("/admin/roles", {
                method: "POST",
                body: { name },
            });
            onSaved();
        } finally {
            setSaving(false);
        }
    }

    return (
        <Modal opened={opened} onClose={onClose} title="New Role">
            <TextInput label="Role Name" value={name} onChange={e => setName(e.currentTarget.value)} />
            <Button fullWidth mt="md" onClick={handleSave} loading={saving}>
                Save
            </Button>
        </Modal>
    );
}
