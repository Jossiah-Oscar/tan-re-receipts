"use client";

import { Container, Title, Tabs, Paper, Group, Badge, Text } from "@mantine/core";
import { IconUsers, IconShield } from "@tabler/icons-react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import UsersTab from "@/components/admin/UserTab";
import RolesTab from "@/components/admin/RolesTab";

export default function AdminPage() {
    useAdminAuth();

    return (
        <Container size="xl" my="xl">
            <Paper shadow="sm" p="lg" radius="md" mb="xl">
                <Group justify="space-between" mb="xs">
                    <div>
                        <Title order={1}>Admin Dashboard</Title>
                        <Text size="sm" c="dimmed" mt={4}>
                            Manage users, roles, and system permissions
                        </Text>
                    </div>
                    <Badge size="lg" variant="light" color="blue">
                        System Administration
                    </Badge>
                </Group>
            </Paper>

            <Tabs defaultValue="users" variant="pills">
                <Tabs.List mb="lg">
                    <Tabs.Tab
                        value="users"
                        leftSection={<IconUsers size={16} />}
                    >
                        Users
                    </Tabs.Tab>
                    <Tabs.Tab
                        value="roles"
                        leftSection={<IconShield size={16} />}
                    >
                        Roles & Permissions
                    </Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="users">
                    <UsersTab />
                </Tabs.Panel>

                <Tabs.Panel value="roles">
                    <RolesTab />
                </Tabs.Panel>
            </Tabs>
        </Container>
    );
}
