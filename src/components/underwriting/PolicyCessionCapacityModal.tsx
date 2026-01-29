'use client';

import { useEffect, useState } from 'react';
import {
    Modal,
    Select,
    NumberInput,
    Button,
    Stack,
    Loader,
    Center,
    Grid,
    Group
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import { IconAlertCircle } from '@tabler/icons-react';
import { apiFetch } from '@/config/api';

interface PolicyCessionCapacity {
    id: number;
    retroTypeId: number;
    year: number;
    currency: string;
    retention: number;
    firstSurplusLines: number;
    secondSurplusLines: number;
    autoFacRetroLimit: number;
}

interface RetroType {
    id: number;
    name: string;
    businessTypeId: number;
}

interface BusinessType {
    id: number;
    name: string;
}

interface PolicyCessionCapacityModalProps {
    opened: boolean;
    onClose: () => void;
    onSaved: () => void;
    capacity: PolicyCessionCapacity | null;
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

export default function PolicyCessionCapacityModal({
    opened,
    onClose,
    onSaved,
    capacity,
}: PolicyCessionCapacityModalProps) {
    const [retroTypes, setRetroTypes] = useState<RetroType[]>([]);
    const [loadingOptions, setLoadingOptions] = useState(false);

    const form = useForm({
        initialValues: {
            retroTypeId: '',
            year: new Date().getFullYear(),
            currency: 'TZS',
            retention: 0,
            firstSurplusLines: 0,
            secondSurplusLines: 0,
            autoFacRetroLimit: 0,
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
            firstSurplusLines: (value) => {
                if (value === undefined || value === null) return '1st Surplus Lines is required';
                if (value < 0) return '1st Surplus Lines must be non-negative';
                if (!Number.isInteger(value)) return '1st Surplus Lines must be a whole number';
                return null;
            },
            secondSurplusLines: (value) => {
                if (value === undefined || value === null) return '2nd Surplus Lines is required';
                if (value < 0) return '2nd Surplus Lines must be non-negative';
                if (!Number.isInteger(value)) return '2nd Surplus Lines must be a whole number';
                return null;
            },
            autoFacRetroLimit: (value) => {
                if (value === undefined || value === null) return 'Auto Fac Retro Limit is required';
                if (value < 0) return 'Auto Fac Retro Limit must be non-negative';
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
                    firstSurplusLines: capacity.firstSurplusLines,
                    secondSurplusLines: capacity.secondSurplusLines,
                    autoFacRetroLimit: capacity.autoFacRetroLimit,
                });
            } else {
                form.reset();
            }
        }
    }, [opened, capacity]);

    async function loadRetroTypes() {
        setLoadingOptions(true);
        try {
            const [allRetroTypes, businessTypes] = await Promise.all([
                apiFetch<RetroType[]>('/api/underwriting/retro-types'),
                apiFetch<BusinessType[]>('/api/underwriting/business-types'),
            ]);

            // Find the Policy Cession business type
            const policyCessionBusinessType = businessTypes.find(
                (bt) => bt.name.toLowerCase() === 'policy cession'
            );

            if (!policyCessionBusinessType) {
                throw new Error('Policy Cession business type not found');
            }

            // Filter retro types to only show Policy Cession ones
            const filteredRetroTypes = allRetroTypes.filter(
                (rt) => rt.businessTypeId === policyCessionBusinessType.id
            );

            setRetroTypes(filteredRetroTypes);
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
                firstSurplusLines: values.firstSurplusLines,
                secondSurplusLines: values.secondSurplusLines,
                autoFacRetroLimit: values.autoFacRetroLimit,
            };

            if (capacity) {
                await apiFetch(`/api/underwriting/policy-cession-capacity/${capacity.id}`, {
                    method: 'PUT',
                    body: payload,
                });
                showNotification({
                    title: 'Success',
                    message: 'Policy cession capacity updated successfully',
                    color: 'green',
                });
            } else {
                await apiFetch('/api/underwriting/policy-cession-capacity', {
                    method: 'POST',
                    body: payload,
                });
                showNotification({
                    title: 'Success',
                    message: 'Policy cession capacity created successfully',
                    color: 'green',
                });
            }

            onSaved();
        } catch (error: any) {
            showNotification({
                title: 'Error',
                message: error.message || 'Failed to save policy cession capacity',
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
                title={capacity ? 'Edit Policy Cession Capacity' : 'Add Policy Cession Capacity'}
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
            title={capacity ? 'Edit Policy Cession Capacity' : 'Add Policy Cession Capacity'}
            centered
            size="lg"
        >
            <form onSubmit={form.onSubmit(handleSubmit)}>
                <Stack gap="md">
                    <Grid gutter="md">
                        <Grid.Col span={6}>
                            <Select
                                label="Retro Type"
                                placeholder="Select retro type"
                                data={retroTypes.map((rt) => ({
                                    value: rt.id.toString(),
                                    label: rt.name,
                                }))}
                                {...form.getInputProps('retroTypeId')}
                                required
                                withAsterisk
                                searchable
                            />
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <NumberInput
                                label="Year"
                                placeholder="e.g., 2025"
                                min={2000}
                                max={2100}
                                {...form.getInputProps('year')}
                                required
                                withAsterisk
                            />
                        </Grid.Col>
                    </Grid>

                    <Select
                        label="Currency"
                        placeholder="Select currency"
                        data={CURRENCY_OPTIONS}
                        {...form.getInputProps('currency')}
                        required
                        withAsterisk
                        searchable
                    />

                    <NumberInput
                        label="Retention"
                        placeholder="e.g., 50000000"
                        min={0}
                        decimalScale={2}
                        thousandSeparator=","
                        {...form.getInputProps('retention')}
                        required
                        withAsterisk
                        description="Retention amount"
                    />

                    <Grid gutter="md">
                        <Grid.Col span={6}>
                            <NumberInput
                                label="1st Surplus Lines"
                                placeholder="e.g., 5"
                                min={0}
                                {...form.getInputProps('firstSurplusLines')}
                                required
                                withAsterisk
                                description="Number of lines for first surplus"
                            />
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <NumberInput
                                label="2nd Surplus Lines"
                                placeholder="e.g., 2"
                                min={0}
                                {...form.getInputProps('secondSurplusLines')}
                                required
                                withAsterisk
                                description="Number of lines for second surplus"
                            />
                        </Grid.Col>
                    </Grid>

                    <NumberInput
                        label="Auto Fac Retro Limit"
                        placeholder="e.g., 50000000"
                        min={0}
                        decimalScale={2}
                        thousandSeparator=","
                        {...form.getInputProps('autoFacRetroLimit')}
                        required
                        withAsterisk
                        description="Automatic facultative retro limit amount"
                    />

                    <Group justify="flex-end" gap="xs" mt="md">
                        <Button variant="light" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit">
                            {capacity ? 'Update' : 'Create'} Capacity
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    );
}
