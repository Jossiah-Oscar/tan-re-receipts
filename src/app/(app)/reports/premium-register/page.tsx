"use client";

import { useState } from "react";
import { Button, Group, TextInput, Paper, Title } from "@mantine/core";
import { IconDownload } from "@tabler/icons-react";
import dayjs from "dayjs";
import { DatePickerInput } from "@mantine/dates";
import {API_BASE_URL} from "@/config/api";

export default function ReportDownloadPage() {
    const [fromDate, setFromDate] = useState<Date | null>(null);
    const [toDate, setToDate] = useState<Date | null>(null);
    const [contractNumber, setContractNumber] = useState("");

    const handleDownload = async () => {
        if (!fromDate || !toDate) {
            alert("Please select both from and to dates.");
            return;
        }

        const queryParams = new URLSearchParams({
            from: dayjs(fromDate).format("YYYY-MM-DD"),
            to: dayjs(toDate).format("YYYY-MM-DD"),
        });

        if (contractNumber.trim() !== "") {
            queryParams.append("contractNumber", contractNumber);
        }

        const response = await fetch(`${API_BASE_URL}/api/reports/inward-premium/download?${queryParams.toString()}`, {
            method: "GET",
        });

        if (!response.ok) {
            alert("Failed to download report");
            return;
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "inward-premium-report.xlsx";
        a.click();
        window.URL.revokeObjectURL(url);
    };

    return (
        <Paper p="md" shadow="sm" withBorder mt="md">
            <Title order={3}>Inwards Premium Register</Title>

            <Group mt="md" grow>
                <DatePickerInput
                    label="From Date"
                    placeholder="Pick start date"
                    value={fromDate}
                    onChange={setFromDate}
                />
                <DatePickerInput
                    label="To Date"
                    placeholder="Pick end date"
                    value={toDate}
                    onChange={setToDate}
                />
            </Group>

            <TextInput
                label="Contract Number (optional)"
                placeholder="0002154516"
                mt="md"
                value={contractNumber}
                onChange={(event) => setContractNumber(event.currentTarget.value)}
            />

            <Button
                leftSection={<IconDownload />}
                onClick={handleDownload}
                fullWidth
                mt="xl"
                variant="gradient"
                gradient={{ from: "teal", to: "blue", deg: 60 }}
            >
                Download Excel Report
            </Button>
        </Paper>
    );
}
