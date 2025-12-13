import { Table, Badge, Menu, ActionIcon } from '@mantine/core';
import { IconDotsVertical, IconEye, IconEdit, IconTrash } from '@tabler/icons-react';
import { modals } from '@mantine/modals';
import type { Case } from '@/store/useDocumentTrackerStore';
import { useRouter } from 'next/navigation';

interface CaseTableProps {
    cases: Case[];
    onEdit: (caseItem: Case) => void;
    onDelete: (caseId: number) => void;
}

export function CaseTable({ cases, onEdit, onDelete }: CaseTableProps) {
    const router = useRouter();

    const handleDelete = (caseItem: Case) => {
        modals.openConfirmModal({
            title: 'Delete Case',
            children: `Are you sure you want to delete "${caseItem.caseName}"? All files will be lost.`,
            labels: { confirm: 'Delete', cancel: 'Cancel' },
            confirmProps: { color: 'red' },
            onConfirm: () => onDelete(caseItem.id),
        });
    };

    const handleView = (caseId: number) => {
        router.push(`/debit-upload/tracker/${caseId}`);
    };

    if (cases.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '3rem 2rem', color: 'var(--mantine-color-dimmed)' }}>
                <p>No cases yet</p>
                <p style={{ fontSize: '0.875rem' }}>Create your first case to start tracking documents</p>
            </div>
        );
    }

    return (
        <Table striped highlightOnHover withTableBorder withColumnBorders>
            <Table.Thead>
                <Table.Tr>
                    <Table.Th>Case Name</Table.Th>
                    {/*<Table.Th>Cedent</Table.Th>*/}
                    <Table.Th>Reinsurer</Table.Th>
                    <Table.Th>Line of Business</Table.Th>
                    <Table.Th>Progress</Table.Th>
                    <Table.Th>Status</Table.Th>
                    <Table.Th>Actions</Table.Th>
                </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
                {cases.map((caseItem) => (
                    <Table.Tr key={caseItem.id}>
                        <Table.Td>
                            <div>
                                <div style={{ fontWeight: 500 }}>{caseItem.caseName}</div>
                                {caseItem.cedant && (
                                    <div style={{ fontSize: '0.75rem', color: 'var(--mantine-color-dimmed)' }}>
                                        {caseItem.cedant}
                                    </div>
                                )}
                            </div>
                        </Table.Td>
                        <Table.Td>{caseItem.reinsurer || '-'}</Table.Td>
                        <Table.Td>{caseItem.lineOfBusiness || '-'}</Table.Td>
                        <Table.Td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <div style={{ flex: 1, maxWidth: '100px' }}>
                                    <div
                                        style={{
                                            height: '4px',
                                            background: 'var(--mantine-color-gray-3)',
                                            borderRadius: '2px',
                                            overflow: 'hidden',
                                        }}
                                    >
                                        <div
                                            style={{
                                                height: '100%',
                                                width: `${(caseItem.progress.collected / caseItem.progress.total) * 100}%`,
                                                background:
                                                    caseItem.status === 'READY'
                                                        ? 'var(--mantine-color-green-6)'
                                                        : 'var(--mantine-color-orange-6)',
                                                borderRadius: '2px',
                                                transition: 'width 0.3s ease',
                                            }}
                                        />
                                    </div>
                                </div>
                                <span style={{ fontSize: '0.75rem', color: 'var(--mantine-color-dimmed)' }}>
                                    {caseItem.progress.collected}/{caseItem.progress.total}
                                </span>
                            </div>
                        </Table.Td>
                        <Table.Td>
                            <Badge color={caseItem.status === 'READY' ? 'green' : 'orange'} variant="light">
                                {caseItem.status}
                            </Badge>
                        </Table.Td>
                        <Table.Td>
                            <Menu shadow="md" width={200} position="bottom-end">
                                <Menu.Target>
                                    <ActionIcon variant="subtle" color="gray">
                                        <IconDotsVertical size={16} />
                                    </ActionIcon>
                                </Menu.Target>
                                <Menu.Dropdown>
                                    <Menu.Item
                                        leftSection={<IconEye size={16} />}
                                        onClick={() => handleView(caseItem.id)}
                                    >
                                        View Details
                                    </Menu.Item>
                                    <Menu.Item
                                        leftSection={<IconEdit size={16} />}
                                        onClick={() => onEdit(caseItem)}
                                    >
                                        Edit
                                    </Menu.Item>
                                    <Menu.Divider />
                                    <Menu.Item
                                        color="red"
                                        leftSection={<IconTrash size={16} />}
                                        onClick={() => handleDelete(caseItem)}
                                    >
                                        Delete
                                    </Menu.Item>
                                </Menu.Dropdown>
                            </Menu>
                        </Table.Td>
                    </Table.Tr>
                ))}
            </Table.Tbody>
        </Table>
    );
}
