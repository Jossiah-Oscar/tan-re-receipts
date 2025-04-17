'use client'

import { useState, useEffect } from 'react';
import {
    Grid,
    Card,
    Group,
    Text,
    Table,
    rem,
    ActionIcon,
    Loader,
    Alert,
    Button,
    TextInput,
    Textarea,
    Modal,
    Box
} from '@mantine/core';
import {
    IconArrowLeft,
    IconPrinter,
    IconFileDownload,
    IconAlertCircle,
    IconEdit,
    IconCheck
} from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { Receipt } from "@/types/receipts";

export default function ReceiptDetail() {
    const params = useParams();
    const receiptNumber = params?.receiptNumber as string;

    const router = useRouter();
    const [receipt, setReceipt] = useState<Receipt | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Added state for editable fields
    const [editingReference, setEditingReference] = useState(false);
    const [referenceText, setReferenceText] = useState('');
    const [signature, setSignature] = useState('');
    const [showSignatureModal, setShowSignatureModal] = useState(false);

    useEffect(() => {
        const fetchReceiptDetail = async () => {
            setLoading(true);
            try {
                const response = await fetch(`http://localhost:3001/api/receipts/${receiptNumber}`);

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const data = await response.json();
                setReceipt(data);
                setReferenceText(data.receiptReference); // Initialize with existing reference
                setError(null);
            } catch (err) {
                console.error('Error fetching receipt details:', err);
            } finally {
                setLoading(false);
            }
        };

        if (receiptNumber) {
            fetchReceiptDetail();
        }
    }, [receiptNumber]);

    const handleBack = () => {
        router.back();
    };

    const handlePrint = () => {
        window.print();
    };

    const handleReferenceEdit = () => {
        setEditingReference(true);
    };

    const saveReferenceEdit = () => {
        if (receipt) {
            // In a real application, you would call an API to update the reference
            // For this example, we'll just update the local state
            setReceipt({
                ...receipt,
                receiptReference: referenceText
            });
            setEditingReference(false);
        }
    };

    const openSignatureModal = () => {
        setShowSignatureModal(true);
    };

    const saveSignature = () => {
        setShowSignatureModal(false);
        // In a real app, you might save this to the server
    };

    const downloadReceiptPdf = async () => {
        if (!receipt) return;

        try {
            // Send the updated reference and signature to the server
            // First, create a modified receipt object with the updated values
            const modifiedReceipt = {
                ...receipt,
                receiptReference: referenceText, // Use the edited reference
                signature: signature // Add the signature
            };

            // Send the modified receipt to generate a custom PDF
            const response = await fetch(`http://localhost:3001/api/receipts/custom-pdf`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/pdf',
                },
                body: JSON.stringify(modifiedReceipt),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `receipt-${receipt.receiptNumber}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading PDF:', error);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                <Loader size="lg" />
            </div>
        );
    }

    if (error) {
        return (
            <Alert
                title="Error loading receipt details"
                color="red"
                icon={<IconAlertCircle />}
                m="md"
            >
                {error}
                <Button variant="outline" color="red" onClick={handleBack} mt="md">
                    Go Back
                </Button>
            </Alert>
        );
    }

    if (!receipt) {
        return (
            <Alert
                title="Receipt not found"
                color="yellow"
                icon={<IconAlertCircle />}
                m="md"
            >
                The receipt you're looking for could not be found.
                <Button variant="outline" onClick={handleBack} mt="md">
                    Go Back
                </Button>
            </Alert>
        );
    }

    return (
        <>
            <Grid>
                <Grid.Col span={{ base: 12, md: 12 }}>
                    <Card shadow="sm" padding="lg" radius="md" withBorder>
                        <Group justify="space-between" mb="xl">
                            <Group>
                                <ActionIcon
                                    variant="light"
                                    color="blue"
                                    onClick={handleBack}
                                    size="lg"
                                >
                                    <IconArrowLeft style={{ width: rem(20), height: rem(20) }} />
                                </ActionIcon>
                                <Text fw={600} size="lg">Receipt #{receipt.receiptNumber}</Text>
                            </Group>
                            <Group>
                                <Button
                                    variant="light"
                                    leftSection={<IconPrinter size={16} />}
                                    onClick={handlePrint}
                                >
                                    Print
                                </Button>
                                <Button
                                    variant="light"
                                    leftSection={<IconFileDownload size={16} />}
                                    onClick={downloadReceiptPdf}
                                >
                                    Export
                                </Button>
                            </Group>
                        </Group>

                        <Table>
                            <Table.Tbody>
                                <Table.Tr>
                                    <Table.Td fw={500} style={{ width: '20%' }}>Receipt Number</Table.Td>
                                    <Table.Td>{receipt.receiptNumber}</Table.Td>
                                    <Table.Td fw={500} style={{ width: '20%' }}>Instrument Type</Table.Td>
                                    <Table.Td>{receipt.instrumentType}</Table.Td>
                                </Table.Tr>
                                <Table.Tr>
                                    <Table.Td fw={500}>Receipt Date</Table.Td>
                                    <Table.Td>{new Date(receipt.receiptDate).toLocaleDateString()}</Table.Td>
                                    <Table.Td fw={500}>Instrument Number</Table.Td>
                                    <Table.Td>{receipt.instrumentNumber}</Table.Td>
                                </Table.Tr>
                                <Table.Tr>
                                    <Table.Td fw={500}>Receipt Reference</Table.Td>
                                    <Table.Td>
                                        {editingReference ? (
                                            <Group>
                                                <Textarea
                                                    value={referenceText}
                                                    onChange={(e) => setReferenceText(e.target.value)}
                                                    autosize
                                                    minRows={2}
                                                    style={{ flexGrow: 1 }}
                                                />
                                                <ActionIcon
                                                    color="green"
                                                    onClick={saveReferenceEdit}
                                                    variant="filled"
                                                >
                                                    <IconCheck size={16} />
                                                </ActionIcon>
                                            </Group>
                                        ) : (
                                            <Group>
                                                <Text>{receipt.receiptReference}</Text>
                                                <ActionIcon
                                                    size="sm"
                                                    color="blue"
                                                    onClick={handleReferenceEdit}
                                                >
                                                    <IconEdit size={16} />
                                                </ActionIcon>
                                            </Group>
                                        )}
                                    </Table.Td>
                                    <Table.Td fw={500}>Instrument Date</Table.Td>
                                    <Table.Td>
                                        {receipt.instrumentDate
                                            ? new Date(receipt.instrumentDate).toLocaleDateString()
                                            : '-'}
                                    </Table.Td>
                                </Table.Tr>
                                <Table.Tr>
                                    <Table.Td fw={500}>Broker/Cedant</Table.Td>
                                    <Table.Td>{receipt.brokerCedantName}</Table.Td>
                                    <Table.Td fw={500}>Bank Name</Table.Td>
                                    <Table.Td>{receipt.instrumentBankName}</Table.Td>
                                </Table.Tr>
                                <Table.Tr>
                                    <Table.Td fw={500}>Address</Table.Td>
                                    <Table.Td>
                                        {receipt.address1}<br />
                                        {receipt.address2}<br />
                                        {receipt.address3}<br />
                                        {receipt.address4}
                                    </Table.Td>
                                    <Table.Td fw={500}>Amount</Table.Td>
                                    <Table.Td>
                                        <Group gap="xs">
                                            <Text>{receipt.instrumentCurrencyCode}</Text>
                                            <Text fw={600}>{receipt.instrumentAmount}</Text>
                                        </Group>
                                    </Table.Td>
                                </Table.Tr>
                                <Table.Tr>
                                    <Table.Td fw={500}>Signature</Table.Td>
                                    <Table.Td colSpan={3}>
                                        <Group>
                                            <Text>{signature || 'No signature added'}</Text>
                                            <Button
                                                variant="outline"
                                                size="xs"
                                                onClick={openSignatureModal}
                                            >
                                                Add Initials
                                            </Button>
                                        </Group>
                                    </Table.Td>
                                </Table.Tr>
                            </Table.Tbody>
                        </Table>
                    </Card>
                </Grid.Col>
            </Grid>

            {/* Signature Modal */}
            <Modal
                opened={showSignatureModal}
                onClose={() => setShowSignatureModal(false)}
                title="Add Your Initials"
                centered
            >
                <TextInput
                    label="Your Initials"
                    placeholder="Enter your initials (e.g., JD)"
                    value={signature}
                    onChange={(e) => setSignature(e.target.value)}
                    mb="md"
                />
                <Group justify="flex-end">
                    <Button variant="outline" onClick={() => setShowSignatureModal(false)}>
                        Cancel
                    </Button>
                    <Button onClick={saveSignature}>
                        Save
                    </Button>
                </Group>
            </Modal>
        </>
    );
}