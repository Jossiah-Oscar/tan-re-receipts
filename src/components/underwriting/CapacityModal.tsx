'use client';

import { useEffect, useState } from 'react';
import {
    Modal,
    TextInput,
    Textarea,
    Select,
    NumberInput,
    Button,
    Stack,
    Loader,
    Center,
    Grid
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import { IconAlertCircle } from '@tabler/icons-react';
import { apiFetch } from '@/config/api';

interface Capacity {
    retroCapacityId: number;
    retroTypeId: number;
    year: number;
    currency: string;
    retention: number;
    lines: number;
    rmsId?: string;
    note?: string;
}

interface RetroType {
    id: number;
    name: string;
}

interface CapacityModalProps {
    opened: boolean;
    onClose: () => void;
    onSaved: () => void;
    capacity: Capacity | null;
}

const CURRENCY_OPTIONS = [
    { value: 'USD', label: 'USD - US Dollar' },
    { value: 'EUR', label: 'EUR - Euro' },
    { value: 'GBP', label: 'GBP - British Pound' },
    { value: 'TZS', label: 'TZS - Tanzanian Shilling' },
    { value: 'KES', label: 'KES - Kenyan Shilling' },
    { value: 'UGX', label: 'UGX - Ugandan Shilling' },
    { value: 'ZAR', label: 'ZAR - South African Rand' },
];

export default function CapacityModal({
    opened,
    onClose,
    onSaved,
    capacity,
}: CapacityModalProps) {
    const [retroTypes, setRetroTypes] = useState<RetroType[]>([]);
    const [loadingOptions, setLoadingOptions] = useState(false);

    const form = useForm({
        initialValues: {
            retroTypeId: '',
            year: new Date().getFullYear(),
            currency: 'USD',
            retention: 0,
            lines: 0,
            rmsId: '',
            note: '',
        },
        validate: {
            retroTypeId: (value) => (!value ? 'Retro type is required' : null),
            year: (value) => {
                if (!value) return 'Year is required';
                if (value < 2000 || value > 2100) return 'Year must be between 2000 and 2100';
                return null;
            },
            currency: (value) => {
                if (!value) return 'Currency is required';
                if (value.length !== 3) return 'Currency must be exactly 3 characters';
                return null;
            },
            retention: (value) => {
                if (value === undefined || value === null) return 'Retention is required';
                if (value < 0) return 'Retention must be non-negative';
                return null;
            },
            lines: (value) => {
                if (value === undefined || value === null) return 'Lines is required';
                if (value < 0) return 'Lines must be non-negative';
                if (!Number.isInteger(value)) return 'Lines must be a whole number';
                return null;
            },
            rmsId: (value) => {
                if (value && value.length > 32) return 'RMS ID cannot exceed 32 characters';
                return null;
            },
        },
    });

    useEffect(() => {
        if (opened) {
            loadRetroTypes();
            if (capacity) {
                form.setValues({
                    retroTypeId: capacity.retroTypeId.toString(),
                    year: capacity.year,
                    currency: capacity.currency,
                    retention: capacity.retention,
                    lines: capacity.lines,
                    rmsId: capacity.rmsId || '',
                    note: capacity.note || '',
                });
            } else {
                form.reset();
            }
        }
    }, [opened, capacity]);

    async function loadRetroTypes() {
        setLoadingOptions(true);
        try {
            const data = await apiFetch<RetroType[]>('/api/underwriting/retro-types');
            setRetroTypes(data);
        } catch (error: any) {
            showNotification({
                title: 'Error',
                message: error.message || 'Failed to load retro types',
                color: 'red',
                icon: <IconAlertCircle />,
            });
        } finally {
            setLoadingOptions(false);
        }
    }

    async function handleSubmit(values: typeof form.values) {
        try {
            const payload = {
                retroTypeId: parseInt(values.retroTypeId),
                year: values.year,
                currency: values.currency.toUpperCase().trim(),
                retention: values.retention,
                lines: values.lines,
                rmsId: values.rmsId.trim() || undefined,
                note: values.note.trim() || undefined,
            };

            if (capacity) {
                await apiFetch(`/api/underwriting/capacities/${capacity.retroCapacityId}`, {
                    method: 'PUT',
                    body: payload,
                });
                showNotification({
                    title: 'Success',
                    message: 'Capacity updated successfully',
                    color: 'green',
                });
            } else {
                await apiFetch('/api/underwriting/capacities', {
                    method: 'POST',
                    body: payload,
                });
                showNotification({
                    title: 'Success',
                    message: 'Capacity created successfully',
                    color: 'green',
                });
            }

            onSaved();
        } catch (error: any) {
            showNotification({
                title: 'Error',
                message: error.message || 'Failed to save capacity',
                color: 'red',
                icon: <IconAlertCircle />,
            });
        }
    }

    if (loadingOptions) {
        return (
            <Modal
                opened={opened}
                onClose={onClose}
                title={capacity ? 'Edit Capacity' : 'Add Capacity'}
                centered
                size="lg"
            >
                <Center h={200}>
                    <Loader size="lg" />
                </Center>
            </Modal>
        );
    }

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={capacity ? 'Edit Capacity' : 'Add Capacity'}
            centered
            size="lg"
        >
            <form onSubmit={form.onSubmit(handleSubmit)}>
                <Stack gap="md">
                    <Select
                        label="Retro Type"
                        placeholder="Select retro type"
                        required
                        data={retroTypes.map((rt) => ({
                            value: rt.id.toString(),
                            label: rt.name,
                        }))}
                        {...form.getInputProps('retroTypeId')}
                        searchable
                    />

                    <Grid>
                        <Grid.Col span={6}>
                            <NumberInput
                                label="Year"
                                placeholder="Enter year"
                                required
                                min={2000}
                                max={2100}
                                {...form.getInputProps('year')}
                            />
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <Select
                                label="Currency"
                                placeholder="Select currency"
                                required
                                data={CURRENCY_OPTIONS}
                                {...form.getInputProps('currency')}
                                searchable
                            />
                        </Grid.Col>
                    </Grid>

                    <Grid>
                        <Grid.Col span={6}>
                            <NumberInput
                                label="Retention"
                                placeholder="Enter retention amount"
                                required
                                min={0}
                                decimalScale={2}
                                thousandSeparator=","
                                {...form.getInputProps('retention')}
                            />
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <NumberInput
                                label="Lines"
                                placeholder="Enter number of lines"
                                required
                                min={0}
                                decimalScale={0}
                                {...form.getInputProps('lines')}
                            />
                        </Grid.Col>
                    </Grid>

                    <TextInput
                        label="RMS ID"
                        placeholder="Enter RMS ID (optional)"
                        maxLength={32}
                        {...form.getInputProps('rmsId')}
                    />

                    <Textarea
                        label="Note"
                        placeholder="Enter optional note"
                        rows={3}
                        {...form.getInputProps('note')}
                    />

                    <Button type="submit" fullWidth>
                        {capacity ? 'Update' : 'Create'}
                    </Button>
                </Stack>
            </form>
        </Modal>
    );
}
