// app/audit/approved-tasks/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Button, Group, Stack, Table, TextInput, Title, LoadingOverlay, NumberInput } from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import {apiFetch} from "@/config/api";

type ApprovedTask = {
    taskId: string;
    taskName: string;
    processInstanceId: string;
    businessKey: string | null;
    processDefinitionKey: string;
    approvedBy: string | null;
    approvedAt: string | null;           // ISO string from backend
    variables: Record<string, any> | null;
};

export default function ApprovedTasksPage() {
    const [loading, setLoading] = useState(false);
    const [items, setItems] = useState<ApprovedTask[]>([]);
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(20);

    // Filters
    const [processKey, setProcessKey] = useState<string>("");
    const [approvedBy, setApprovedBy] = useState<string>("");
    const [from, setFrom] = useState<Date | null>(null);
    const [to, setTo] = useState<Date | null>(null);

    async function load() {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.set("page", String(page));
            params.set("size", String(size));
            if (processKey) params.set("processKey", processKey);
            if (approvedBy) params.set("approvedBy", approvedBy);
            if (from) params.set("from", from.toISOString());
            if (to) params.set("to", to.toISOString());

            const json = await apiFetch(`/api/approvals/approved-tasks?` + params.toString(), {
                credentials: "include"
            });
            // const json = await res.json();
            setItems(json.items ?? []);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { load(); /* eslint-disable-next-line */ }, [page, size]);

    function exportCsv() {
        const header = ["Task ID","Task Name","Process","Business Key","Approved By","Approved At"];
        const rows = items.map(it => [
            it.taskId,
            it.taskName,
            it.processDefinitionKey,
            it.businessKey ?? "",
            it.approvedBy ?? "",
            it.approvedAt ? new Date(it.approvedAt).toLocaleString() : ""
        ]);
        const csv = [header, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(",")).join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = `approved_tasks_${Date.now()}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }

    return (
        <Stack p="lg" maw={1100} mx="auto" pos="relative">
            <LoadingOverlay visible={loading} />
            <Title order={2}>Approved Tasks (Audit)</Title>

            <Group grow>
                <TextInput label="Process Key" placeholder="e.g. TRAVEL_APPROVAL" value={processKey} onChange={e=>setProcessKey(e.currentTarget.value)} />
                <TextInput label="Approved By (username)" value={approvedBy} onChange={e=>setApprovedBy(e.currentTarget.value)} />
            </Group>
            <Group grow>
                <DateTimePicker label="From" value={from} onChange={setFrom} />
                <DateTimePicker label="To" value={to} onChange={setTo} />
            </Group>
            <Group grow>
                <NumberInput label="Page" min={0} value={page} onChange={(v)=>setPage(Number(v ?? 0))} />
                <NumberInput label="Page Size" min={1} max={200} value={size} onChange={(v)=>setSize(Number(v ?? 20))} />
                <Group justify="flex-end">
                    <Button onClick={load}>Filter</Button>
                    <Button variant="outline" onClick={exportCsv}>Export CSV</Button>
                </Group>
            </Group>

            <Table striped highlightOnHover withTableBorder withColumnBorders>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>Approved At</Table.Th>
                        <Table.Th>Task</Table.Th>
                        <Table.Th>Process</Table.Th>
                        <Table.Th>Business Key</Table.Th>
                        <Table.Th>Approved By</Table.Th>
                        <Table.Th>PI</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {items.map(it => (
                        <Table.Tr key={it.taskId}>
                            <Table.Td>{it.approvedAt ? new Date(it.approvedAt).toLocaleString() : "-"}</Table.Td>
                            <Table.Td>{it.taskName}</Table.Td>
                            <Table.Td>{it.processDefinitionKey}</Table.Td>
                            <Table.Td>{it.businessKey ?? "-"}</Table.Td>
                            <Table.Td>{it.approvedBy ?? "-"}</Table.Td>
                            <Table.Td>{it.processInstanceId}</Table.Td>
                        </Table.Tr>
                    ))}
                </Table.Tbody>
            </Table>
        </Stack>
    );
}
