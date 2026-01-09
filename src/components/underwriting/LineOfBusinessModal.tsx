'use client';

import { useEffect } from 'react';
import { Modal, TextInput, Button, Stack } from '@mantine/core';
import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import { IconAlertCircle } from '@tabler/icons-react';
import { apiFetch } from '@/config/api';

interface LineOfBusiness {
    id: number;
    name: string;
}

interface LineOfBusinessModalProps {
    opened: boolean;
    onClose: () => void;
    onSaved: () => void;
    lineOfBusiness: LineOfBusiness | null;
}

export default function LineOfBusinessModal({
    opened,
    onClose,
    onSaved,
    lineOfBusiness,
}: LineOfBusinessModalProps) {
    const form = useForm({
        initialValues: {
            name: '',
        },
        validate: {
            name: (value) => (!value.trim() ? 'Name is required' : null),
        },
    });

    useEffect(() => {
        if (opened) {
            if (lineOfBusiness) {
                form.setValues({
                    name: lineOfBusiness.name,
                });
            } else {
                form.reset();
            }
        }
    }, [opened, lineOfBusiness]);

    async function handleSubmit(values: typeof form.values) {
        try {
            const payload = {
                name: values.name.trim(),
            };

            if (lineOfBusiness) {
                await apiFetch(`/api/underwriting/line-of-business/${lineOfBusiness.id}`, {
                    method: 'PUT',
                    body: payload,
                });
                showNotification({
                    title: 'Success',
                    message: 'Line of business updated successfully',
                    color: 'green',
                });
            } else {
                await apiFetch('/api/underwriting/line-of-business', {
                    method: 'POST',
                    body: payload,
                });
                showNotification({
                    title: 'Success',
                    message: 'Line of business created successfully',
                    color: 'green',
                });
            }

            onSaved();
        } catch (error: any) {
            showNotification({
                title: 'Error',
                message: error.message || 'Failed to save line of business',
                color: 'red',
                icon: <IconAlertCircle />,
            });
        }
    }

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={lineOfBusiness ? 'Edit Line of Business' : 'Add Line of Business'}
            centered
        >
            <form onSubmit={form.onSubmit(handleSubmit)}>
                <Stack gap="md">
                    <TextInput
                        label="Name"
                        placeholder="Enter line of business name"
                        required
                        {...form.getInputProps('name')}
                    />

                    <Button type="submit" fullWidth>
                        {lineOfBusiness ? 'Update' : 'Create'}
                    </Button>
                </Stack>
            </form>
        </Modal>
    );
}
