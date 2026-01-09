'use client';

import { useEffect } from 'react';
import { Modal, TextInput, Textarea, Button, Stack } from '@mantine/core';
import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import { IconAlertCircle } from '@tabler/icons-react';
import { apiFetch } from '@/config/api';

interface BusinessType {
    id: number;
    name: string;
    description?: string;
}

interface BusinessTypeModalProps {
    opened: boolean;
    onClose: () => void;
    onSaved: () => void;
    businessType: BusinessType | null;
}

export default function BusinessTypeModal({
    opened,
    onClose,
    onSaved,
    businessType,
}: BusinessTypeModalProps) {
    const form = useForm({
        initialValues: {
            name: '',
            description: '',
        },
        validate: {
            name: (value) => (!value.trim() ? 'Name is required' : null),
        },
    });

    useEffect(() => {
        if (opened) {
            if (businessType) {
                form.setValues({
                    name: businessType.name,
                    description: businessType.description || '',
                });
            } else {
                form.reset();
            }
        }
    }, [opened, businessType]);

    async function handleSubmit(values: typeof form.values) {
        try {
            const payload = {
                name: values.name.trim(),
                description: values.description.trim() || undefined,
            };

            if (businessType) {
                await apiFetch(`/api/underwriting/business-types/${businessType.id}`, {
                    method: 'PUT',
                    body: payload,
                });
                showNotification({
                    title: 'Success',
                    message: 'Business type updated successfully',
                    color: 'green',
                });
            } else {
                await apiFetch('/api/underwriting/business-types', {
                    method: 'POST',
                    body: payload,
                });
                showNotification({
                    title: 'Success',
                    message: 'Business type created successfully',
                    color: 'green',
                });
            }

            onSaved();
        } catch (error: any) {
            showNotification({
                title: 'Error',
                message: error.message || 'Failed to save business type',
                color: 'red',
                icon: <IconAlertCircle />,
            });
        }
    }

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={businessType ? 'Edit Business Type' : 'Add Business Type'}
            centered
        >
            <form onSubmit={form.onSubmit(handleSubmit)}>
                <Stack gap="md">
                    <TextInput
                        label="Name"
                        placeholder="Enter business type name"
                        required
                        {...form.getInputProps('name')}
                    />

                    <Textarea
                        label="Description"
                        placeholder="Enter optional description"
                        rows={3}
                        {...form.getInputProps('description')}
                    />

                    <Button type="submit" fullWidth>
                        {businessType ? 'Update' : 'Create'}
                    </Button>
                </Stack>
            </form>
        </Modal>
    );
}
