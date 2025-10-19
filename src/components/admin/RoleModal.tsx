"use client";

import { useState, useEffect } from "react";
import { Modal, TextInput, Button, Stack, Group, Text } from "@mantine/core";
import { IconShieldPlus } from "@tabler/icons-react";
import { apiFetch } from "@/config/api";
import { showNotification } from "@mantine/notifications";

interface RoleModalProps {
    opened: boolean;
    onClose: () => void;
    onSaved: () => void;
}

export default function RoleModal({ opened, onClose, onSaved }: RoleModalProps) {
    const [name, setName] = useState("");
    const [saving, setSaving] = useState(false);

    // Reset form when modal opens
    useEffect(() => {
        if (opened) {
            setName("");
        }
    }, [opened]);

    async function handleSave() {
        if (!name.trim()) {
            showNotification({
                title: "Validation Error",
                message: "Role name is required",
                color: "red"
            });
            return;
        }

        setSaving(true);
        try {
            await apiFetch("/admin/roles", {
                method: "POST",
                body: { name: name.trim() },
            });
            showNotification({
                title: "Success",
                message: `Role "${name}" created successfully`,
                color: "green"
            });
            onSaved();
        } catch (e: any) {
            showNotification({
                title: "Error",
                message: e.message,
                color: "red"
            });
        } finally {
            setSaving(false);
        }
    }

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={
                <Group gap="xs">
                    <IconShieldPlus size={20} />
                    <Text fw={600}>Create New Role</Text>
                </Group>
            }
            size="md"
        >
            <Stack gap="md">
                <TextInput
                    label="Role Name"
                    placeholder="e.g., MANAGER, VIEWER, ANALYST"
                    description="Use uppercase letters for consistency (e.g., ADMIN, USER)"
                    value={name}
                    onChange={(e) => setName(e.currentTarget.value.toUpperCase())}
                    leftSection={<IconShieldPlus size={16} />}
                    required
                    autoFocus
                />

                <Group justify="flex-end" mt="md">
                    <Button variant="subtle" onClick={onClose} disabled={saving}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} loading={saving}>
                        Create Role
                    </Button>
                </Group>
            </Stack>
        </Modal>
    );
}
