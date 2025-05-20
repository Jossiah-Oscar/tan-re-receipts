"use client";

import {useEffect, useState} from "react";
import {Button, Modal, MultiSelect, TextInput} from "@mantine/core";
import {apiFetch} from "@/config/api";
import {showNotification} from "@mantine/notifications";

interface Props {
    opened: boolean;
    existingUser: { username: string; roles: string[] } | null;

    onClose(): void;

    onSaved(): void;
}

export default function UserModal({opened, onClose, existingUser, onSaved}: Props) {
    const [username, setUsername] = useState(existingUser?.username || "");
    const [roles, setRoles] = useState<string[]>(existingUser?.roles || []);
    const [allRoles, setAllRoles] = useState<string[]>([]);
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);


    // load role options
    useEffect(() => {
        loadRoles()
    }, []);

    async function loadRoles() {
        setLoading(true);
        try {
            const data = await apiFetch<string[]>("/admin/roles");
            setRoles(data);
            setAllRoles(data)
        } catch (e: any) {
            showNotification({message: e.message, color: "red"});
        } finally {
            setLoading(false);
        }
    }

    async function handleSave() {
        setSaving(true);
        try {
            if (existingUser) {
                const editPath = `/admin/users/${encodeURIComponent(
                    existingUser.username
                )}/roles`;

                await apiFetch(editPath, {
                    method: "PUT",
                    body: { roles },
                });
            } else {
                // new user
                await apiFetch("/admin/users", {
                    method: "POST",
                    body: { username, roles },
                });
            }
            onSaved();
        } catch (e: any) {
            showNotification({ message: e.message, color: "red" });
        } finally {
            setSaving(false);
        }
    }


    return (
        <Modal opened={opened} onClose={onClose} title={existingUser ? "Edit User" : "New User"}>
            <TextInput
                label="Username"
                value={username}
                onChange={e => setUsername(encodeURIComponent(
                    existingUser!.username
                    ))}
                disabled={!!existingUser}
            />
            <MultiSelect
                label="Roles"
                data={allRoles}
                value={roles}
                onChange={setRoles}
                // sx={{ marginTop: 16 }}
            />
            <Button fullWidth mt="md" onClick={handleSave} loading={saving}>
                Save
            </Button>
        </Modal>
    );
}
