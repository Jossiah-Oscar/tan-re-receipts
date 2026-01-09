'use client';

import { useEffect, useState } from 'react';
import { Modal, TextInput, Textarea, Select, Button, Stack, Loader, Center } from '@mantine/core';
import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import { IconAlertCircle } from '@tabler/icons-react';
import { apiFetch } from '@/config/api';

interface RetroType {
    id: number;
    name: string;
    description?: string;
    lobId: number;
    businessTypeId: number;
}

interface BusinessType {
    id: number;
    name: string;
}

interface LineOfBusiness {
    id: number;
    name: string;
}

interface RetroTypeModalProps {
    opened: boolean;
    onClose: () => void;
    onSaved: () => void;
    retroType: RetroType | null;
}

export default function RetroTypeModal({
    opened,
    onClose,
    onSaved,
    retroType,
}: RetroTypeModalProps) {
    const [businessTypes, setBusinessTypes] = useState<BusinessType[]>([]);
    const [lobs, setLOBs] = useState<LineOfBusiness[]>([]);
    const [loadingOptions, setLoadingOptions] = useState(false);

    const form = useForm({
        initialValues: {
            name: '',
            description: '',
            lobId: '',
            businessTypeId: '',
        },
        validate: {
            name: (value) => (!value.trim() ? 'Name is required' : null),
            lobId: (value) => (!value ? 'Line of business is required' : null),
            businessTypeId: (value) => (!value ? 'Business type is required' : null),
        },
    });

    useEffect(() => {
        if (opened) {
            loadDropdownOptions();
            if (retroType) {
                form.setValues({
                    name: retroType.name,
                    description: retroType.description || '',
                    lobId: retroType.lobId.toString(),
                    businessTypeId: retroType.businessTypeId.toString(),
                });
            } else {
                form.reset();
            }
        }
    }, [opened, retroType]);

    async function loadDropdownOptions() {
        setLoadingOptions(true);
        try {
            const [businessTypesData, lobsData] = await Promise.all([
                apiFetch<BusinessType[]>('/api/underwriting/business-types'),
                apiFetch<LineOfBusiness[]>('/api/underwriting/line-of-business'),
            ]);
            setBusinessTypes(businessTypesData);
            setLOBs(lobsData);
        } catch (error: any) {
            showNotification({
                title: 'Error',
                message: error.message || 'Failed to load dropdown options',
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
                name: values.name.trim(),
                description: values.description.trim() || undefined,
                lobId: parseInt(values.lobId),
                businessTypeId: parseInt(values.businessTypeId),
            };

            if (retroType) {
                await apiFetch(`/api/underwriting/retro-types/${retroType.id}`, {
                    method: 'PUT',
                    body: JSON.stringify(payload),
                });
                showNotification({
                    title: 'Success',
                    message: 'Retro type updated successfully',
                    color: 'green',
                });
            } else {
                await apiFetch('/api/underwriting/retro-types', {
                    method: 'POST',
                    body: JSON.stringify(payload),
                });
                showNotification({
                    title: 'Success',
                    message: 'Retro type created successfully',
                    color: 'green',
                });
            }

            onSaved();
        } catch (error: any) {
            showNotification({
                title: 'Error',
                message: error.message || 'Failed to save retro type',
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
                title={retroType ? 'Edit Retro Type' : 'Add Retro Type'}
                centered
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
            title={retroType ? 'Edit Retro Type' : 'Add Retro Type'}
            centered
            size="md"
        >
            <form onSubmit={form.onSubmit(handleSubmit)}>
                <Stack gap="md">
                    <TextInput
                        label="Name"
                        placeholder="Enter retro type name"
                        required
                        {...form.getInputProps('name')}
                    />

                    <Textarea
                        label="Description"
                        placeholder="Enter optional description"
                        rows={3}
                        {...form.getInputProps('description')}
                    />

                    <Select
                        label="Line of Business"
                        placeholder="Select line of business"
                        required
                        data={lobs.map((lob) => ({
                            value: lob.id.toString(),
                            label: lob.name,
                        }))}
                        {...form.getInputProps('lobId')}
                        searchable
                    />

                    <Select
                        label="Business Type"
                        placeholder="Select business type"
                        required
                        data={businessTypes.map((bt) => ({
                            value: bt.id.toString(),
                            label: bt.name,
                        }))}
                        {...form.getInputProps('businessTypeId')}
                        searchable
                    />

                    <Button type="submit" fullWidth>
                        {retroType ? 'Update' : 'Create'}
                    </Button>
                </Stack>
            </form>
        </Modal>
    );
}
