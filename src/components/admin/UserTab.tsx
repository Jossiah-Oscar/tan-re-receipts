"use client";

import { useState, useEffect } from "react";
import {Table, Button, Loader, Text, ActionIcon, Group} from "@mantine/core";
import { IconEdit, IconTrash, IconPlus } from "@tabler/icons-react";
import { showNotification } from "@mantine/notifications";
import {apiFetch} from "@/config/api";
import UserModal from "@/components/admin/UserModal";

interface UserDTO { username: string; roles: string[]; }

export default function UsersTab() {
    const [users, setUsers]       = useState<UserDTO[]>([]);
    const [loading, setLoading]   = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editUser, setEditUser]   = useState<UserDTO | null>(null);

    useEffect(() => { loadUsers(); }, []);

    async function loadUsers() {
        setLoading(true);
        try {
            const data = await apiFetch<UserDTO[]>("/admin/users");
            setUsers(data);
        } catch (e: any) {
            showNotification({ message: e.message, color: "red" });
        } finally {
            setLoading(false);
        }
    }

    return loading ? (
        <Loader />
    ) : users.length === 0 ? (
        <Text>No users found.</Text>
    ) : (
        <>
            {/*<Button*/}
            {/*    leftSection={<IconPlus size={16} />}*/}
            {/*    onClick={() => { setEditUser(null); setModalOpen(true); }}*/}
            {/*    mb="sm"*/}
            {/*>*/}
            {/*    Add User*/}
            {/*</Button>*/}

            <Table highlightOnHover>
                <Table.Thead>
                <Table.Tr>
                    <Table.Th>Username</Table.Th>
                    <Table.Th>Roles</Table.Th>
                    <Table.Th>Actions</Table.Th>
                </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                {users.map((u) => (
                    <Table.Tr key={u.username}>
                        <Table.Td>{u.username}</Table.Td>
                        <Table.Td>{u.roles.join(", ")}</Table.Td>
                        <Table.Td>
                        <Group>
                            <ActionIcon onClick={() => { setEditUser(u); setModalOpen(true); }}>
                                <IconEdit size={16} />
                            </ActionIcon>
                            {/*<ActionIcon*/}
                            {/*    color="red"*/}
                            {/*    onClick={async () => {*/}
                            {/*        if (!confirm(`Delete user ${u.username}?`)) return;*/}
                            {/*        try {*/}
                            {/*            await apiFetch(`/admin/users/${u.username}`, { method: "DELETE" });*/}
                            {/*            showNotification({ message: "Deleted.", color: "green" });*/}
                            {/*            loadUsers();*/}
                            {/*        } catch (e: any) {*/}
                            {/*            showNotification({ message: e.message, color: "red" });*/}
                            {/*        }*/}
                            {/*    }}*/}
                            {/*>*/}
                            {/*    <IconTrash size={16} />*/}
                            {/*</ActionIcon>*/}
                    </Group>
                        </Table.Td>
                    </Table.Tr>
                ))}
                </Table.Tbody>
            </Table>

            <UserModal
                opened={modalOpen}
                onClose={() => setModalOpen(false)}
                existingUser={editUser}
                onSaved={() => { setModalOpen(false); loadUsers(); }}
            />
        </>
    );
}
