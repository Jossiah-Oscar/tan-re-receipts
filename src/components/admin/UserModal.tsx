"use client";

import { useState, useEffect } from "react";
import { Modal, TextInput, MultiSelect, Button } from "@mantine/core";
import {apiFetch} from "@/config/api";
import {showNotification} from "@mantine/notifications";

interface Props {
    opened: boolean;
    onClose(): void;
    existingUser: { username: string; roles: string[] } | null;
    onSaved(): void;
}

export default function UserModal({ opened, onClose, existingUser, onSaved }: Props) {
    const [username, setUsername] = useState(existingUser?.username || "");
    const [roles, setRoles]       = useState<string[]>(existingUser?.roles || []);
    const [allRoles, setAllRoles] = useState<string[]>([]);
    const [saving, setSaving]     = useState(false);
    const [loading, setLoading] = useState(true);


    // load role options
    useEffect(() => {
        async function loadRoles() {
            setLoading(true);
            try {
                const data = await apiFetch<string[]>("/admin/roles");
                setRoles(data);    // data is already a string[], no .name
            } catch (e: any) {
                showNotification({ message: e.message, color: "red" });
            } finally {
                setLoading(false);
            }
        }    }, []);

    async function handleSave() {
        setSaving(true);
        try {
            if (existingUser) {
                // replace roles
                await apiFetch(`/admin/users/${username}/roles`, {
                    method: "PUT",
                    body: { roles },
                });
            } else {
                // create new user
                await apiFetch("/admin/users", {
                    method: "POST",
                    body: { username, roles },
                });
            }
            onSaved();
        } catch (e: any) {
            // show error
        } finally {
            setSaving(false);
        }
    }

    return (
        <Modal opened={opened} onClose={onClose} title={existingUser ? "Edit User" : "New User"}>
            <TextInput
                label="Username"
                value={username}
                onChange={e => setUsername(e.currentTarget.value)}
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
