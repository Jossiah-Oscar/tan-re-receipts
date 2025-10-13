"use client";

import { useState } from "react";
import { Button, Group, NumberInput, Select, Stack, TextInput, Textarea, Title, Alert } from "@mantine/core";
import {apiFetch} from "@/config/api";

export default function TravelNewPage() {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    const [businessKey, setBusinessKey] = useState(`TA-${Date.now()}`);
    const [initiator, setInitiator] = useState("jkibona"); // demo user id
    const [employeeName, setEmployeeName] = useState("Jossiah Kibona");
    const [amount, setAmount] = useState<number | string>(1000000);
    const [region, setRegion] = useState<string | null>("Domestic");
    const [purpose, setPurpose] = useState("Workshop attendance");

    // async function submit() {
    //     setLoading(true); setMessage(null);
    //     try {
    //         const json = await apiFetch(`/api/approvals/travel/start`, {
    //             method: "POST",
    //             headers: { "Content-Type": "application/json" },
    //             body: {
    //                 businessKey, initiator, employeeName, amount: Number(amount), region, purpose
    //             },
    //             requiresAuth: true,
    //         });
    //         // const json = await res.json();
    //         setMessage(`Started process: ${json.processInstanceId} for ${json.businessKey}`);
    //     } catch (e: any) {
    //         setMessage(`Error: ${e?.message ?? "failed"}`);
    //     } finally { setLoading(false); }
    // }

    async function submit() {
        setLoading(true); setMessage(null);
        try {
            const json = await apiFetch(`/api/approvals/travel/start`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: {
                    businessKey, initiator, employeeName, amount: Number(amount), region, purpose
                },
                requiresAuth: true,
            });
            // const json = await res.json();
            setMessage(`Started process: ${json.processInstanceId} for ${json.businessKey}`);
        } catch (e: any) {
            setMessage(`Error: ${e?.message ?? "failed"}`);
        } finally { setLoading(false); }
    }

    return (
        <Stack maw={560} mx="auto" p="lg">
            <Title order={2}>New Travel Request</Title>

            {message && <Alert>{message}</Alert>}

            <TextInput label="Business Key" value={businessKey} onChange={(e) => setBusinessKey(e.currentTarget.value)} />
            <TextInput label="Initiator (userId)" value={initiator} onChange={(e) => setInitiator(e.currentTarget.value)} />
            <TextInput label="Employee Name" value={employeeName} onChange={(e) => setEmployeeName(e.currentTarget.value)} />
            <NumberInput label="Amount" value={amount} onChange={setAmount} thousandSeparator />
            <Select label="Region" data={["Domestic","International"]} value={region} onChange={setRegion} />
            <Textarea label="Purpose" value={purpose} onChange={(e) => setPurpose(e.currentTarget.value)} minRows={3} />

            <Group justify="flex-end">
                <Button loading={loading} onClick={submit}>Submit</Button>
            </Group>
        </Stack>
    );
}
