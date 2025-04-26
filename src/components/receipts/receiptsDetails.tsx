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
    Button
} from '@mantine/core';
import {
    IconArrowLeft,
    IconPrinter,
    IconFileDownload,
    IconAlertCircle
} from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation'; // Changed from react-router-dom
import { Receipt } from "@/types/receipts";
import {API_BASE_URL} from "@/config/api";

// This is a Next.js dynamic page component (app/receipts/[receiptNumber]/page.tsx)
export default function ReceiptDetail() {
    const params = useParams();
    const receiptNumber = params?.receiptNumber as string; // Next.js params are different

    const router = useRouter(); // Changed from useNavigate
    const [receipt, setReceipt] = useState<Receipt | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchReceiptDetail = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${API_BASE_URL}/api/receipts/${receiptNumber}`);

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const data = await response.json();
                setReceipt(data);
                setError(null);
            } catch (err) {
                console.error('Error fetching receipt details:', err);
                // setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (receiptNumber) {
            fetchReceiptDetail();
        }
    }, [receiptNumber]);

    const handleBack = () => {
        router.back(); // Changed from navigate(-1)
    };

    const handlePrint = () => {
        window.print();
    };

    const downloadReceiptPdf = async () => {
        if (!receipt) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/receipts/${receipt.receiptNumber}/pdf`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/pdf',
                },
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
                                <Table.Td>{receipt.receiptReference}</Table.Td>
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
                        </Table.Tbody>
                    </Table>
                </Card>
            </Grid.Col>
        </Grid>
    );
}