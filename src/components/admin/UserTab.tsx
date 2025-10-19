"use client";

import { useState, useEffect, useMemo } from "react";
import {
    Table,
    Button,
    Loader,
    Text,
    ActionIcon,
    Group,
    Paper,
    TextInput,
    Badge,
    Stack,
    Avatar,
    Tooltip,
    Center,
    Title
} from "@mantine/core";
import { IconEdit, IconSearch, IconUserPlus, IconShield } from "@tabler/icons-react";
import { showNotification } from "@mantine/notifications";
import { apiFetch } from "@/config/api";
import UserModal from "@/components/admin/UserModal";

interface UserDTO {
    username: string;
    roles: string[];
}

export default function UsersTab() {
    const [users, setUsers] = useState<UserDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editUser, setEditUser] = useState<UserDTO | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        loadUsers();
    }, []);

    async function loadUsers() {
        setLoading(true);
        try {
            const data = await apiFetch<UserDTO[]>("/admin/users");
            setUsers(data);
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

    const filteredUsers = useMemo(() => {
        if (!searchQuery) return users;
        return users.filter(
            (u) =>
                u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                u.roles.some((r) => r.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }, [users, searchQuery]);

    const getRoleBadgeColor = (role: string) => {
        const roleColors: Record<string, string> = {
            ADMIN: "red",
            MANAGER: "blue",
            USER: "green",
            VIEWER: "gray",
        };
        return roleColors[role.toUpperCase()] || "cyan";
    };

    if (loading) {
        return (
            <Center h={200}>
                <Loader size="lg" />
            </Center>
        );
    }

    return (
        <Stack gap="md">
            <Paper shadow="xs" p="md" radius="md">
                <Group justify="space-between" mb="md">
                    <div>
                        <Title order={3}>User Management</Title>
                        <Text size="sm" c="dimmed">
                            {users.length} user{users.length !== 1 ? "s" : ""} total
                        </Text>
                    </div>
                    {/* Uncomment when add user functionality is ready */}
                    {/*<Button*/}
                    {/*    leftSection={<IconUserPlus size={18} />}*/}
                    {/*    onClick={() => {*/}
                    {/*        setEditUser(null);*/}
                    {/*        setModalOpen(true);*/}
                    {/*    }}*/}
                    {/*>*/}
                    {/*    Add User*/}
                    {/*</Button>*/}
                </Group>

                <TextInput
                    placeholder="Search by username or role..."
                    leftSection={<IconSearch size={16} />}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.currentTarget.value)}
                    mb="md"
                />

                {filteredUsers.length === 0 ? (
                    <Paper p="xl" withBorder>
                        <Center>
                            <Stack align="center" gap="xs">
                                <IconShield size={48} stroke={1.5} opacity={0.3} />
                                <Text c="dimmed">
                                    {searchQuery
                                        ? "No users found matching your search"
                                        : "No users found"}
                                </Text>
                            </Stack>
                        </Center>
                    </Paper>
                ) : (
                    <Table.ScrollContainer minWidth={500}>
                        <Table highlightOnHover verticalSpacing="sm">
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>User</Table.Th>
                                    <Table.Th>Roles</Table.Th>
                                    <Table.Th w={100}>Actions</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {filteredUsers.map((user) => (
                                    <Table.Tr key={user.username}>
                                        <Table.Td>
                                            <Group gap="sm">
                                                <Avatar
                                                    size="sm"
                                                    radius="xl"
                                                    color="blue"
                                                >
                                                    {user.username.substring(0, 2).toUpperCase()}
                                                </Avatar>
                                                <div>
                                                    <Text size="sm" fw={500}>
                                                        {user.username}
                                                    </Text>
                                                </div>
                                            </Group>
                                        </Table.Td>
                                        <Table.Td>
                                            <Group gap={6}>
                                                {user.roles.length === 0 ? (
                                                    <Badge variant="outline" color="gray" size="sm">
                                                        No roles
                                                    </Badge>
                                                ) : (
                                                    user.roles.map((role) => (
                                                        <Badge
                                                            key={role}
                                                            variant="light"
                                                            color={getRoleBadgeColor(role)}
                                                            size="sm"
                                                        >
                                                            {role}
                                                        </Badge>
                                                    ))
                                                )}
                                            </Group>
                                        </Table.Td>
                                        <Table.Td>
                                            <Group gap={4}>
                                                <Tooltip label="Edit roles">
                                                    <ActionIcon
                                                        variant="light"
                                                        color="blue"
                                                        onClick={() => {
                                                            setEditUser(user);
                                                            setModalOpen(true);
                                                        }}
                                                    >
                                                        <IconEdit size={16} />
                                                    </ActionIcon>
                                                </Tooltip>
                                                {/* Uncomment when delete functionality is ready */}
                                                {/*<Tooltip label="Delete user">*/}
                                                {/*    <ActionIcon*/}
                                                {/*        variant="light"*/}
                                                {/*        color="red"*/}
                                                {/*        onClick={async () => {*/}
                                                {/*            if (!confirm(`Delete user ${user.username}?`))*/}
                                                {/*                return;*/}
                                                {/*            try {*/}
                                                {/*                await apiFetch(*/}
                                                {/*                    `/admin/users/${user.username}`,*/}
                                                {/*                    { method: "DELETE" }*/}
                                                {/*                );*/}
                                                {/*                showNotification({*/}
                                                {/*                    title: "Success",*/}
                                                {/*                    message: "User deleted successfully",*/}
                                                {/*                    color: "green"*/}
                                                {/*                });*/}
                                                {/*                loadUsers();*/}
                                                {/*            } catch (e: any) {*/}
                                                {/*                showNotification({*/}
                                                {/*                    title: "Error",*/}
                                                {/*                    message: e.message,*/}
                                                {/*                    color: "red"*/}
                                                {/*                });*/}
                                                {/*            }*/}
                                                {/*        }}*/}
                                                {/*    >*/}
                                                {/*        <IconTrash size={16} />*/}
                                                {/*    </ActionIcon>*/}
                                                {/*</Tooltip>*/}
                                            </Group>
                                        </Table.Td>
                                    </Table.Tr>
                                ))}
                            </Table.Tbody>
                        </Table>
                    </Table.ScrollContainer>
                )}
            </Paper>

            <UserModal
                opened={modalOpen}
                onClose={() => setModalOpen(false)}
                existingUser={editUser}
                onSaved={() => {
                    setModalOpen(false);
                    loadUsers();
                }}
            />
        </Stack>
    );
}
