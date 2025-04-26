'use client'

import { useState } from 'react';
import {
    Card,
    TextInput,
    Grid,
    Group,
    Button,
    Select,
} from '@mantine/core';
import { IconSearch, IconFilter, IconCalendar } from '@tabler/icons-react';
import { Receipt } from '@/types/receipts';
import {DateInput, DatePicker, DatePickerInput, DateTimePicker} from "@mantine/dates";
import {API_BASE_URL} from "@/config/api";

interface ReceiptSearchProps {
    onSearch: (results: Receipt[]) => void;
    onSearchStart: () => void;
}

export default function ReceiptSearch({ onSearch, onSearchStart }: ReceiptSearchProps) {
    const [receiptNumber, setReceiptNumber] = useState('');
    const [clientName, setClientName] = useState('');
    const [dateFrom, setDateFrom] = useState<Date | null>(null);
    const [dateTo, setDateTo] = useState<Date | null>(null);
    const [instrumentType, setInstrumentType] = useState<string | null>(null);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        onSearchStart(); // Signal that search has started (for loading state)

        try {
            // Build query parameters
            const params = new URLSearchParams();
            if (receiptNumber) params.append('receiptNumber', receiptNumber);
            if (clientName) params.append('clientName', clientName);
            if (dateFrom instanceof Date) params.append('dateFrom', dateFrom.toISOString().split('T')[0]);
            if (dateTo instanceof Date) params.append('dateTo', dateTo.toISOString().split('T')[0]);
            if (instrumentType) params.append('instrumentType', instrumentType);

            // Make API call
            const response = await fetch(`${API_BASE_URL}/api/receipts/search?${params.toString()}`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            onSearch(data);
        } catch (error) {
            console.error('Error searching receipts:', error);
            onSearch([]); // Return empty results on error
        }
    };

    const handleClear = () => {
        setReceiptNumber('');
        setClientName('');
        setDateFrom(null);
        setDateTo(null);
        setInstrumentType(null);
    };

    return (
        <Card shadow="sm" p="md" radius="md" withBorder mb="lg">
            <form onSubmit={handleSearch}>
                <Grid>
                    <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                        <TextInput
                            label="Receipt Number"
                            placeholder="Search by receipt number"
                            value={receiptNumber}
                            onChange={(e) => setReceiptNumber(e.target.value)}
                            leftSection={<IconSearch size={16} />}
                        />
                    </Grid.Col>

                    <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                        <TextInput
                            label="Client Name"
                            placeholder="Search by client name"
                            value={clientName}
                            onChange={(e) => setClientName(e.target.value)}
                            // icon={<IconSearch size={16} />}
                            leftSection={<IconSearch size={16} />}
                        />
                    </Grid.Col>

                    <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                        <Select
                            label="Instrument Type"
                            placeholder="Select type"
                            value={instrumentType}
                            onChange={setInstrumentType}
                            clearable
                            data={[
                                { value: 'B', label: 'Bank Transfer' },
                                { value: 'C', label: 'Cheque' },
                                { value: 'D', label: 'Demand Draft' },
                                { value: 'E', label: 'Electronic Transfer' },
                                { value: 'O', label: 'Other' }
                            ]}
                        />
                    </Grid.Col>
                </Grid>

                <Grid mt="md">
                    <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                        {/*<DatePickerInput*/}
                        {/*    label="From Date"*/}
                        {/*    placeholder="Start date"*/}
                        {/*    value={dateFrom}*/}
                        {/*    onChange={setDateFrom}*/}
                        {/*    leftSection={<IconCalendar size={16} />}*/}
                        {/*    // icon={<IconCalendar size={16} />}*/}
                        {/*    clearable*/}
                        {/*/>*/}



                        <DateInput
                            valueFormat="DD MMM YYYY"
                            value={dateFrom}
                            onChange={setDateFrom}
                            label="From Date"
                            placeholder="Start date"
                            leftSection={<IconCalendar size={16} />}
                            clearable
                        />
                    </Grid.Col>

                    <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                        <DateInput
                            valueFormat="DD MMM YYYY"
                            value={dateTo}
                            onChange={setDateTo}
                            label="To Date"
                            placeholder="End date"
                            leftSection={<IconCalendar size={16} />}
                            clearable
                        />
                    </Grid.Col>
                </Grid>

                <Group justify="flex-end" mt="md">
                    <Button variant="outline" onClick={handleClear} type="button">
                        Clear
                    </Button>
                    <Button type="submit">
                        Search
                    </Button>
                </Group>
            </form>
        </Card>
    );
}