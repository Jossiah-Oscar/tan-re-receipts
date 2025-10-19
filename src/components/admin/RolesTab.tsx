"use client";

import { useState, useEffect } from "react";
import {
    Table,
    Button,
    Loader,
    Text,
    ActionIcon,
    Group,
    Paper,
    Stack,
    Badge,
    Tooltip,
    Center,
    Title,
    SimpleGrid,
    Card
} from "@mantine/core";
import { IconTrash, IconShieldPlus, IconShield, IconAlertCircle } from "@tabler/icons-react";
import { showNotification } from "@mantine/notifications";
import { apiFetch } from "@/config/api";
import { modals } from "@mantine/modals";
import RoleModal from "@/components/admin/RoleModal";

export default function RolesTab() {
    const [roles, setRoles] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);

    useEffect(() => {
        loadRoles();
    }, []);

    async function loadRoles() {
        setLoading(true);
        try {
            const data = await apiFetch<string[]>("/admin/roles");
            setRoles(data);
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

    const handleDeleteRole = (role: string) => {
        modals.openConfirmModal({
            title: "Delete Role",
            centered: true,
            children: (
                <Stack gap="sm">
                    <Group gap="xs">
                        <IconAlertCircle size={20} color="var(--mantine-color-red-6)" />
                        <Text size="sm">
                            Are you sure you want to delete the role <strong>{role}</strong>?
                        </Text>
                    </Group>
                    <Text size="sm" c="dimmed">
                        This action cannot be undone. Users with this role will lose their permissions.
                    </Text>
                </Stack>
            ),
            labels: { confirm: "Delete Role", cancel: "Cancel" },
            confirmProps: { color: "red" },
            onConfirm: async () => {
                try {
                    await apiFetch(`/admin/roles/${role}`, { method: "DELETE" });
                    showNotification({
                        title: "Success",
                        message: `Role "${role}" deleted successfully`,
                        color: "green"
                    });
                    loadRoles();
                } catch (e: any) {
                    showNotification({
                        title: "Error",
                        message: e.message,
                        color: "red"
                    });
                }
            },
        });
    };

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
                        <Title order={3}>Role Management</Title>
                        <Text size="sm" c="dimmed">
                            {roles.length} role{roles.length !== 1 ? "s" : ""} defined
                        </Text>
                    </div>
                    <Button
                        leftSection={<IconShieldPlus size={18} />}
                        onClick={() => setModalOpen(true)}
                    >
                        Add Role
                    </Button>
                </Group>

                {roles.length === 0 ? (
                    <Paper p="xl" withBorder>
                        <Center>
                            <Stack align="center" gap="xs">
                                <IconShield size={48} stroke={1.5} opacity={0.3} />
                                <Text c="dimmed">No roles defined</Text>
                                <Button
                                    variant="light"
                                    size="sm"
                                    leftSection={<IconShieldPlus size={16} />}
                                    onClick={() => setModalOpen(true)}
                                >
                                    Create your first role
                                </Button>
                            </Stack>
                        </Center>
                    </Paper>
                ) : (
                    <>
                        {/* Card Grid View for better visual */}
                        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md" mb="lg">
                            {roles.map((role) => (
                                <Card key={role} shadow="sm" padding="lg" radius="md" withBorder>
                                    <Group justify="space-between" mb="xs">
                                        <Badge
                                            variant="light"
                                            color={getRoleBadgeColor(role)}
                                            size="lg"
                                            leftSection={<IconShield size={14} />}
                                        >
                                            {role}
                                        </Badge>
                                        <Tooltip label="Delete role">
                                            <ActionIcon
                                                variant="subtle"
                                                color="red"
                                                onClick={() => handleDeleteRole(role)}
                                            >
                                                <IconTrash size={16} />
                                            </ActionIcon>
                                        </Tooltip>
                                    </Group>
                                    <Text size="sm" c="dimmed">
                                        System role
                                    </Text>
                                </Card>
                            ))}
                        </SimpleGrid>

                        {/* Table View for reference */}
                        <details>
                            <summary style={{ cursor: "pointer", marginBottom: "1rem" }}>
                                <Text size="sm" c="dimmed" component="span">
                                    Show table view
                                </Text>
                            </summary>
                            <Table.ScrollContainer minWidth={400}>
                                <Table highlightOnHover verticalSpacing="sm">
                                    <Table.Thead>
                                        <Table.Tr>
                                            <Table.Th>Role Name</Table.Th>
                                            <Table.Th w={100}>Actions</Table.Th>
                                        </Table.Tr>
                                    </Table.Thead>
                                    <Table.Tbody>
                                        {roles.map((role) => (
                                            <Table.Tr key={role}>
                                                <Table.Td>
                                                    <Badge
                                                        variant="light"
                                                        color={getRoleBadgeColor(role)}
                                                        leftSection={<IconShield size={14} />}
                                                    >
                                                        {role}
                                                    </Badge>
                                                </Table.Td>
                                                <Table.Td>
                                                    <Tooltip label="Delete role">
                                                        <ActionIcon
                                                            variant="light"
                                                            color="red"
                                                            onClick={() => handleDeleteRole(role)}
                                                        >
                                                            <IconTrash size={16} />
                                                        </ActionIcon>
                                                    </Tooltip>
                                                </Table.Td>
                                            </Table.Tr>
                                        ))}
                                    </Table.Tbody>
                                </Table>
                            </Table.ScrollContainer>
                        </details>
                    </>
                )}
            </Paper>

            <RoleModal
                opened={modalOpen}
                onClose={() => setModalOpen(false)}
                onSaved={() => {
                    setModalOpen(false);
                    loadRoles();
                }}
            />
        </Stack>
    );
}
