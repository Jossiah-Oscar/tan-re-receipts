import { Modal, TextInput, Select, Button, Group, Stack } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useEffect } from 'react';
import type { Case } from '@/store/useDocumentTrackerStore';

interface CaseFormModalProps {
    opened: boolean;
    onClose: () => void;
    onSubmit: (data: CaseFormData) => void;
    editCase?: Case | null;
}

export interface CaseFormData {
    caseName: string;
    cedant: string;
    reinsurer: string;
    lineOfBusiness: string;
}

const LINE_OF_BUSINESS_OPTIONS = [
    { value: 'Property', label: 'Property' },
    { value: 'Motor', label: 'Motor' },
    { value: 'Marine', label: 'Marine' },
    { value: 'Aviation', label: 'Aviation' },
    { value: 'Engineering', label: 'Engineering' },
    { value: 'Liability', label: 'Liability' },
    { value: 'Life', label: 'Life' },
    { value: 'Health', label: 'Health' },
    { value: 'Other', label: 'Other' },
];

export function CaseFormModal({ opened, onClose, onSubmit, editCase }: CaseFormModalProps) {
    const form = useForm<CaseFormData>({
        initialValues: {
            caseName: '',
            cedant: '',
            reinsurer: '',
            lineOfBusiness: '',
        },
        validate: {
            caseName: (value) => (value.trim().length === 0 ? 'Case name is required' : null),
        },
    });

    // Update form when editCase changes
    useEffect(() => {
        if (editCase) {
            form.setValues({
                caseName: editCase.caseName,
                cedant: editCase.cedant,
                reinsurer: editCase.reinsurer,
                lineOfBusiness: editCase.lineOfBusiness,
            });
        } else {
            form.reset();
        }
    }, [editCase, opened]);

    const handleSubmit = (values: CaseFormData) => {
        onSubmit(values);
        form.reset();
        onClose();
    };

    const handleClose = () => {
        form.reset();
        onClose();
    };

    return (
        <Modal
            opened={opened}
            onClose={handleClose}
            title={editCase ? 'Edit Case' : 'Create New Case'}
            size="md"
            centered
        >
            <form onSubmit={form.onSubmit(handleSubmit)}>
                <Stack gap="md">
                    <TextInput
                        label="Case Name / Reference"
                        placeholder="e.g., Marine Hull - Q1 2025"
                        required
                        {...form.getInputProps('caseName')}
                    />

                    <TextInput
                        label="Cedant (Primary Insurer)"
                        placeholder="e.g., ABC Insurance Company Ltd"
                        {...form.getInputProps('cedant')}
                    />

                    <TextInput
                        label="Reinsurer"
                        placeholder="e.g., Tan Re, Africa Re"
                        {...form.getInputProps('reinsurer')}
                    />

                    <Select
                        label="Line of Business"
                        placeholder="Select..."
                        data={LINE_OF_BUSINESS_OPTIONS}
                        {...form.getInputProps('lineOfBusiness')}
                    />

                    <Group justify="flex-end" mt="md">
                        <Button variant="default" onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button type="submit">
                            {editCase ? 'Update' : 'Create'}
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    );
}
