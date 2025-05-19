"use client";

import { useState, useEffect } from "react";
import {Table, Button, Loader, Text, ActionIcon, Group} from "@mantine/core";
import { IconTrash, IconPlus } from "@tabler/icons-react";
import { showNotification } from "@mantine/notifications";
import {apiFetch} from "@/config/api";
import RoleModal from "@/components/admin/RoleModal";

interface RoleDTO { name: string; }

export default function RolesTab() {
    const [roles, setRoles]     = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);

    useEffect(() => { loadRoles(); }, []);

    async function loadRoles() {
        setLoading(true);
        try {
            // <-- fetch as string[]
            const data = await apiFetch<string[]>("/admin/roles");
            setRoles(data);
        } catch (e: any) {
            showNotification({ message: e.message, color: "red" });
        } finally {
            setLoading(false);
        }
    }

    return loading ? (
        <Loader />
    ) : roles.length === 0 ? (
        <Text>No roles defined.</Text>
    ) : (
        <>
            <Button
                leftSection={<IconPlus size={16} />}
                onClick={() => setModalOpen(true)}
                mb="sm"
            >
                Add Role
            </Button>

            <Table highlightOnHover>
                <Table.Thead>
                <Table.Tr>
                    <Table.Th>Role Name</Table.Th>
                    <Table.Th>Actions</Table.Th>
                </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                {roles.map((role) => (
                    // <-- use the role string as key
                    <Table.Tr key={role}>
                        <Table.Td>{role}</Table.Td>
                        <Table.Td>
                            <Group>
                            <ActionIcon
                                color="red"
                                onClick={async () => {
                                    if (!confirm(`Delete role ${role}?`)) return;
                                    try {
                                        await apiFetch(`/admin/roles/${role}`, { method: "DELETE" });
                                        showNotification({ message: "Deleted.", color: "green" });
                                        loadRoles();
                                    } catch (e: any) {
                                        showNotification({ message: e.message, color: "red" });
                                    }
                                }}
                            >
                                <IconTrash size={16} />
                            </ActionIcon>
                            </Group>
                        </Table.Td>
                    </Table.Tr>
                ))}
                </Table.Tbody>
            </Table>

            <RoleModal
                opened={modalOpen}
                onClose={() => setModalOpen(false)}
                onSaved={() => { setModalOpen(false); loadRoles(); }}
            />
        </>
    );
}
