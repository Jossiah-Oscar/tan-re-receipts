"use client";

import { useEffect, useState } from "react";
import { Button, Modal, MultiSelect, TextInput, Stack, Group, Badge, Text, Loader } from "@mantine/core";
import { IconUser, IconShield } from "@tabler/icons-react";
import { apiFetch } from "@/config/api";
import { showNotification } from "@mantine/notifications";

interface Props {
    opened: boolean;
    existingUser: { username: string; roles: string[] } | null;
    onClose(): void;
    onSaved(): void;
}

export default function UserModal({ opened, onClose, existingUser, onSaved }: Props) {
    const [username, setUsername] = useState("");
    const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
    const [allRoles, setAllRoles] = useState<string[]>([]);
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);

    // Reset form when modal opens/closes or user changes
    useEffect(() => {
        if (opened) {
            setUsername(existingUser?.username || "");
            setSelectedRoles(existingUser?.roles || []);
            loadRoles();
        }
    }, [opened, existingUser]);

    async function loadRoles() {
        setLoading(true);
        try {
            const data = await apiFetch<string[]>("/admin/roles");
            setAllRoles(data);
        } catch (e: any) {
            showNotification({
                title: "Error",
                message: e.message,
                color: "red"
            });
        } finally {
            setLoading(false);
        }
    }

    async function handleSave() {
        if (!existingUser && !username.trim()) {
            showNotification({
                title: "Validation Error",
                message: "Username is required",
                color: "red"
            });
            return;
        }

        setSaving(true);
        try {
            if (existingUser) {
                const editPath = `/admin/users/${encodeURIComponent(existingUser.username)}/roles`;
                await apiFetch(editPath, {
                    method: "PUT",
                    body: { roles: selectedRoles },
                });
                showNotification({
                    title: "Success",
                    message: `Roles updated for ${existingUser.username}`,
                    color: "green"
                });
            } else {
                // new user
                await apiFetch("/admin/users", {
                    method: "POST",
                    body: { username: username.trim(), roles: selectedRoles },
                });
                showNotification({
                    title: "Success",
                    message: `User ${username} created successfully`,
                    color: "green"
                });
            }
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
                    <IconUser size={20} />
                    <Text fw={600}>{existingUser ? "Edit User Roles" : "Create New User"}</Text>
                </Group>
            }
            size="md"
        >
            {loading ? (
                <Stack align="center" py="xl">
                    <Loader size="md" />
                    <Text size="sm" c="dimmed">Loading roles...</Text>
                </Stack>
            ) : (
                <Stack gap="md">
                    {existingUser && (
                        <Group gap="xs" p="sm" style={{ backgroundColor: "var(--mantine-color-blue-0)", borderRadius: "8px" }}>
                            <Badge variant="light" size="lg" leftSection={<IconUser size={14} />}>
                                {existingUser.username}
                            </Badge>
                        </Group>
                    )}

                    {!existingUser && (
                        <TextInput
                            label="Username"
                            placeholder="Enter username"
                            value={username}
                            onChange={(e) => setUsername(e.currentTarget.value)}
                            leftSection={<IconUser size={16} />}
                            required
                        />
                    )}

                    <MultiSelect
                        label="Roles"
                        description={existingUser ? "Modify user permissions by selecting roles" : "Select roles for the new user"}
                        placeholder={allRoles.length === 0 ? "No roles available" : "Select roles..."}
                        data={allRoles}
                        value={selectedRoles}
                        onChange={setSelectedRoles}
                        leftSection={<IconShield size={16} />}
                        searchable
                        clearable
                    />

                    <Group justify="flex-end" mt="md">
                        <Button variant="subtle" onClick={onClose} disabled={saving}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave} loading={saving}>
                            {existingUser ? "Update Roles" : "Create User"}
                        </Button>
                    </Group>
                </Stack>
            )}
        </Modal>
    );
}
