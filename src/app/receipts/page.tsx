'use client'

import ReceiptSearch from "@/components/receipts/receiptSearch";

import {ActionIcon, Alert, Badge, Card, Container, Grid, Group, Loader, Paper, rem, Stack, Table, Text, Title} from "@mantine/core";

import {IconAlertCircle, IconDotsVertical, IconEye, IconFileDownload} from "@tabler/icons-react";
import {useEffect, useState} from "react";
import {Receipt} from "@/types/receipts";
import { useRouter } from "next/navigation"; // Change from react-router to Next.js


export default function ReportPage() {
    const router = useRouter(); // Use Next.js router instead of useNavigate
    // Initialize with the proper type
    const [receipts, setReceipts] = useState<Receipt[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);


    const [searched, setSearched] = useState(false);

    const handleSearchResults = (results: Receipt[]) => {
        setReceipts(results);
        setSearched(true);
        setLoading(false);
    };

    const handleSearchStart = () => {
        setLoading(true);
    };


    // Fetch data from the Spring Boot API
    useEffect(() => {
        const fetchReceipts = async () => {
            setLoading(true);
            try {
                const response = await fetch('http://192.168.1.45:3001/api/receipts/recent');

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const data = await response.json();
                setReceipts(data);
                setError(null);
            } catch (err) {
                console.error('Error fetching receipts:', err);
                setError(err instanceof Error ? err.message : 'An unknown error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchReceipts();
    }, []);

    const viewReceiptDetails = (receiptNumber: number) => {
        router.push(`/receipts/${receiptNumber}`); // Use router.push instead of navigate
    };

    const downloadReceiptPdf = async (receiptNumber: number) => {
        try {
            // Using fetch API to get the PDF as a blob
            const response = await fetch(`http://192.168.1.45:3001/api/receipts/${receiptNumber}/pdf`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/pdf',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            // Convert the response to a blob
            const blob = await response.blob();

            // Create a URL for the blob
            const url = window.URL.createObjectURL(blob);

            // Create a temporary link element
            const link = document.createElement('a');
            link.href = url;
            link.download = `receipt-${receiptNumber}.pdf`;

            // Append to the document, click it, and then remove it
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Release the object URL
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading PDF:', error);
            // Handle the error appropriately in your UI
        }
    };


    return (
            <Stack>
                <Title order={2} mb="md">Receipt Management</Title>

                <ReceiptSearch
                    onSearch={handleSearchResults}
                    onSearchStart={handleSearchStart}
                />


                <Grid>
                    <Grid.Col span={{ base: 12, md: 12 }}>
                        <Card shadow="sm" padding="lg" radius="md" withBorder>
                            <Group justify="space-between" mb="md">
                                <Text fw={600}>Receipts</Text>
                                <Text size="xs" c="dimmed">
                                    {loading ? 'Loading...' : `Showing ${receipts.length} receipts`}
                                </Text>
                            </Group>

                            {error && (
                                <Alert
                                    title="Error loading data"
                                    color="red"
                                    icon={<IconAlertCircle />}
                                    mb="md"
                                >
                                    {error}
                                </Alert>
                            )}

                            {loading ? (
                                <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                                    <Loader />
                                </div>
                            ) : (
                                <Table>
                                    <Table.Thead>
                                        <Table.Tr>
                                            <Table.Th>Receipt #</Table.Th>
                                            <Table.Th>Date</Table.Th>
                                            <Table.Th>Reference</Table.Th>
                                            <Table.Th>Broker/Cedant</Table.Th>
                                            <Table.Th>Instrument</Table.Th>
                                            <Table.Th>Amount</Table.Th>
                                            <Table.Th>Actions</Table.Th>
                                        </Table.Tr>
                                    </Table.Thead>
                                    <Table.Tbody>
                                        {receipts.length > 0 ? (
                                            receipts.map((receipt) => (
                                                <Table.Tr key={receipt.receiptNumber}>
                                                    <Table.Td>{receipt.receiptNumber}</Table.Td>
                                                    <Table.Td>{new Date(receipt.receiptDate).toLocaleDateString()}</Table.Td>
                                                    <Table.Td>{receipt.receiptReference}</Table.Td>
                                                    <Table.Td>{receipt.brokerCedantName}</Table.Td>
                                                    <Table.Td>
                                                        <Group gap="xs">
                                                            <Badge size="sm" variant="light">
                                                                {receipt.instrumentType}
                                                            </Badge>
                                                            <Text size="xs" c="dimmed">{receipt.instrumentNumber}</Text>
                                                        </Group>
                                                    </Table.Td>
                                                    <Table.Td>
                                                        <Group gap={4}>
                                                            <Text size="sm" c="dimmed">{receipt.instrumentCurrencyCode}</Text>
                                                            <Text size="sm" fw={500}>{receipt.instrumentAmount}</Text>
                                                        </Group>
                                                    </Table.Td>
                                                    <Table.Td>
                                                        <Group gap="xs">
                                                            <ActionIcon
                                                                variant="subtle"
                                                                color="blue"
                                                                onClick={() => viewReceiptDetails(receipt.receiptNumber)}
                                                            >
                                                                <IconEye style={{ width: rem(16), height: rem(16) }} />
                                                            </ActionIcon>
                                                            <ActionIcon
                                                                variant="subtle"
                                                                color="blue"
                                                                onClick={() => downloadReceiptPdf(receipt.receiptNumber)}
                                                                title="Download PDF"
                                                            >
                                                                <IconFileDownload style={{ width: rem(16), height: rem(16) }} />
                                                            </ActionIcon>
                                                            <ActionIcon variant="subtle" color="gray">
                                                                <IconDotsVertical style={{ width: rem(16), height: rem(16) }} />
                                                            </ActionIcon>
                                                        </Group>
                                                    </Table.Td>
                                                </Table.Tr>
                                            ))
                                        ) : (
                                            <Table.Tr>
                                                <Table.Td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>
                                                    {searched ? 'No receipts found matching your search criteria' : 'No receipts found'}
                                                </Table.Td>
                                            </Table.Tr>
                                        )}
                                    </Table.Tbody>
                                </Table>
                            )}
                        </Card>
                    </Grid.Col>
                </Grid>

            </Stack>
    );
}