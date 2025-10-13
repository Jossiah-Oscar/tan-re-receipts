"use client";

import { useEffect, useState } from "react";
import { Button, Group, Modal, Stack, Table, Text, Textarea, TextInput, Title } from "@mantine/core";
import {apiFetch} from "@/config/api";

type Task = { id: string; name: string; processInstanceId: string; createTime: string; assignee?: string | null };

export default function TasksPage() {
    const [userId, setUserId] = useState("jkibona");
    const [groups, setGroups] = useState("USER"); // comma-separated
    const [tasks, setTasks] = useState<Task[]>([]);
    const [open, setOpen] = useState(false);
    const [actionFor, setActionFor] = useState<string | null>(null);
    const [comment, setComment] = useState("");

    async function load() {
        const qs = new URLSearchParams({ userId, groups: groups.split(",").map(s => s.trim()).filter(Boolean).join(",") });
        // const json = await apiFetch(`/api/approvals/tasks?${qs.toString()}`);
        const json = await apiFetch(`/api/approvals/tasks`);

        setTasks(json);
    }
    useEffect(() => { load();  }, []);

    async function act(kind: "approve"|"reject") {
        if (!actionFor) return;
        await apiFetch(`/api/approvals/tasks/${actionFor}/${kind}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: { userId, comment },
            requiresAuth: true,
        });
        setOpen(false); setActionFor(null); setComment(""); await load();
    }

    return (
        <Stack p="lg" maw={990} mx="auto">
            <Title order={2}>My Tasks</Title>

            <Group grow>
                <TextInput label="User ID" value={userId} onChange={(e)=>setUserId(e.currentTarget.value)} />
                <TextInput label="Groups (comma-separated)" value={groups} onChange={(e)=>setGroups(e.currentTarget.value)} />
                <Button onClick={load}>Refresh</Button>
            </Group>

            <Table striped highlightOnHover withTableBorder withColumnBorders>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>Task</Table.Th>
                        <Table.Th>PI</Table.Th>
                        <Table.Th>Created</Table.Th>
                        <Table.Th>Assignee</Table.Th>
                        <Table.Th>Action</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {tasks.map(t => (
                        <Table.Tr key={t.id}>
                            <Table.Td>{t.name}</Table.Td>
                            <Table.Td><Text size="sm">{t.processInstanceId}</Text></Table.Td>
                            <Table.Td>{new Date(t.createTime).toLocaleString()}</Table.Td>
                            <Table.Td>{t.assignee ?? "-"}</Table.Td>
                            <Table.Td>
                                <Group gap="xs">
                                    <Button size="xs" onClick={() => { setActionFor(t.id); setOpen(true); }}>Approve</Button>
                                    <Button size="xs" variant="outline" onClick={() => { setActionFor(t.id); setOpen(true); }}>Reject</Button>
                                </Group>
                            </Table.Td>
                        </Table.Tr>
                    ))}
                </Table.Tbody>
            </Table>

            <Modal opened={open} onClose={() => setOpen(false)} title="Add a comment">
                <Stack>
                    <Textarea value={comment} onChange={(e)=>setComment(e.currentTarget.value)} minRows={3} />
                    <Group justify="flex-end">
                        <Button onClick={() => act("approve")}>Confirm Approve</Button>
                        <Button variant="outline" onClick={() => act("reject")}>Confirm Reject</Button>
                    </Group>
                </Stack>
            </Modal>
        </Stack>
    );
}
