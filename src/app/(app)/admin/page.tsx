"use client";

import { useState, useEffect } from "react";
import { Container, Title, Tabs, Loader, Text, Button } from "@mantine/core";
import {useAdminAuth} from "@/hooks/useAdminAuth";
import UsersTab from "@/components/admin/UserTab";
import RolesTab from "@/components/admin/RolesTab";

export default function AdminPage() {
    useAdminAuth();

    return (
        <Container my="xl">
            <Title order={2}>Admin Dashboard</Title>

            <Tabs defaultValue="users" mt="md">
                <Tabs.List>
                    <Tabs.Tab value="users">Users</Tabs.Tab>
                    <Tabs.Tab value="roles">Roles</Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="users" pt="md">
                    <UsersTab />
                </Tabs.Panel>

                <Tabs.Panel value="roles" pt="md">
                    <RolesTab />
                </Tabs.Panel>
            </Tabs>
        </Container>
    );
}
