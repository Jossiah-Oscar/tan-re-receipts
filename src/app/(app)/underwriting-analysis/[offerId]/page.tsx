'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    Container,
    Paper,
    Title,
    Text,
    Group,
    Stack,
    Badge,
    Button,
    Loader,
    Center,
    Grid,
    Divider,
    NumberFormatter
} from '@mantine/core';
import { IconArrowLeft, IconAlertCircle } from '@tabler/icons-react';
import { showNotification } from '@mantine/notifications';
import { apiFetch } from '@/config/api';
import OfferAttachmentsList from '@/components/underwriting/OfferAttachmentsList';

interface Attachment {
    id: number;
    fileName: string;
    contentType: string;
    fileSize: number;
    uploadedBy: string;
    uploadedAt: string;
}

interface analysis {
    tanrePremium: number,
        retentionExposure: number,
        acceptedPremium: number,
        facRetroPremium: number,
        surplusExposure: number,
        facRetroPercent: number,
        totalPremium: number,
        surplusSharePercent: number,
        totalExposure: number,
        tanreExposure: number,
        retentionSharePercent: number,
        retentionPremium: number,
        surplusPremium: number,
        facRetroExposure: number,
        tanreSharePercent: number,
        acceptedSharePercent: number,
        id: number,
        acceptedExposure: number
}
interface OfferDetails {
    id: number;
    cedant: string;
    insured: string;
    broker: string;
    country: string;
    currencyCode: string;
    sumInsured: number;
    premium: number;
    shareOfferedPct: number;
    acceptedSharePercent: number;
    status: string;
    offerReceivedDate: string;
    notes?: string;
    occupation?: string;
    retroYear: number;
    periodFrom: string;
    periodTo: string;
    unitManagerUsername: string;
}



interface OfferResponse {
    offer: OfferDetails;
    analysis: analysis;
    attachments: Attachment[];
    attachmentCount: number;
}

export default function OfferDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const offerId = params.offerId as string;

    const [loading, setLoading] = useState(true);
    const [offerData, setOfferData] = useState<OfferResponse | null>(null);

    useEffect(() => {
        loadOfferDetails();
    }, [offerId]);

    async function loadOfferDetails() {
        setLoading(true);
        try {
            const data = await apiFetch<OfferResponse>(
                `/api/underwriting/facultative/offer/${offerId}`
            );
            console.log('Offer data received:', data);
            console.log('Offer details:', data.offer);
            setOfferData(data);
        } catch (error: any) {
            showNotification({
                title: 'Error',
                message: error.message || 'Failed to load offer details',
                color: 'red',
                icon: <IconAlertCircle />,
            });
        } finally {
            setLoading(false);
        }
    }

    function getStatusColor(status: string | undefined | null): string {
        if (!status) return 'gray';
        switch (status.toUpperCase()) {
            case 'SUBMITTED':
            case 'PENDING':
                return 'yellow';
            case 'APPROVED':
                return 'green';
            case 'REJECTED':
                return 'red';
            default:
                return 'gray';
        }
    }

    if (loading) {
        return (
            <Container size="xl" py="md">
                <Center h={400}>
                    <Loader size="lg" />
                </Center>
            </Container>
        );
    }

    if (!offerData) {
        return (
            <Container size="xl" py="md">
                <Center h={400}>
                    <Stack align="center" gap="xs">
                        <IconAlertCircle size={48} stroke={1.5} color="gray" />
                        <Text c="dimmed">Offer not found</Text>
                    </Stack>
                </Center>
            </Container>
        );
    }

    const { offer, attachments, analysis } = offerData;

    return (
        <Container size="xl" py="md">
            <Stack gap="md">
                <Group justify="space-between">
                    <Group>
                        <Button
                            variant="subtle"
                            leftSection={<IconArrowLeft size={16} />}
                            onClick={() => router.push('/underwriting-analysis')}
                        >
                            Back to Overview
                        </Button>
                        <Title order={2}>Offer Details</Title>
                    </Group>
                    <Badge size="lg" color={getStatusColor(offer.status)}>
                        {offer.status}
                    </Badge>
                </Group>

                {/* Offer Information */}
                <Paper shadow="xs" p="md">
                    <Stack gap="md">
                        <Title order={4}>Offer Information</Title>
                        <Divider />

                        <Grid>
                            <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                                <Stack gap={4}>
                                    <Text size="xs" c="dimmed">Offer ID</Text>
                                    <Text fw={500}>{offer.id}</Text>
                                </Stack>
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                                <Stack gap={4}>
                                    <Text size="xs" c="dimmed">Cedant</Text>
                                    <Text fw={500}>{offer.cedant}</Text>
                                </Stack>
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                                <Stack gap={4}>
                                    <Text size="xs" c="dimmed">Insured</Text>
                                    <Text fw={500}>{offer.insured}</Text>
                                </Stack>
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                                <Stack gap={4}>
                                    <Text size="xs" c="dimmed">Broker</Text>
                                    <Text fw={500}>{offer.broker || '-'}</Text>
                                </Stack>
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                                <Stack gap={4}>
                                    <Text size="xs" c="dimmed">Country</Text>
                                    <Text fw={500}>{offer.country}</Text>
                                </Stack>
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                                <Stack gap={4}>
                                    <Text size="xs" c="dimmed">Occupation</Text>
                                    <Text fw={500}>{offer.occupation || '-'}</Text>
                                </Stack>
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                                <Stack gap={4}>
                                    <Text size="xs" c="dimmed">Currency</Text>
                                    <Text fw={500}>{offer.currencyCode}</Text>
                                </Stack>
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                                <Stack gap={4}>
                                    <Text size="xs" c="dimmed">Sum Insured</Text>
                                    <Text fw={500}>
                                        <NumberFormatter
                                            value={offer.sumInsured}
                                            thousandSeparator
                                            decimalScale={2}
                                        />
                                    </Text>
                                </Stack>
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                                <Stack gap={4}>
                                    <Text size="xs" c="dimmed">Premium</Text>
                                    <Text fw={500}>
                                        <NumberFormatter
                                            value={offer.premium}
                                            thousandSeparator
                                            decimalScale={2}
                                        />
                                    </Text>
                                </Stack>
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                                <Stack gap={4}>
                                    <Text size="xs" c="dimmed">Share Offered</Text>
                                    <Text fw={500}>{(offer.shareOfferedPct * 100).toFixed(0)}%</Text>
                                </Stack>
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                                <Stack gap={4}>
                                    <Text size="xs" c="dimmed">Share Accepted</Text>
                                    <Text fw={500}>{analysis.acceptedSharePercent}%</Text>
                                </Stack>
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                                <Stack gap={4}>
                                    <Text size="xs" c="dimmed">Offer Received Date</Text>
                                    <Text fw={500}>
                                        {new Date(offer.offerReceivedDate).toLocaleDateString()}
                                    </Text>
                                </Stack>
                            </Grid.Col>
                            {/*<Grid.Col span={{ base: 12, sm: 6, md: 4 }}>*/}
                            {/*    <Stack gap={4}>*/}
                            {/*        <Text size="xs" c="dimmed">Retro Year</Text>*/}
                            {/*        <Text fw={500}>{offer.retroYear}</Text>*/}
                            {/*    </Stack>*/}
                            {/*</Grid.Col>*/}
                            <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                                <Stack gap={4}>
                                    <Text size="xs" c="dimmed">Period</Text>
                                    <Text fw={500}>
                                        {new Date(offer.periodFrom).toLocaleDateString()} -{' '}
                                        {new Date(offer.periodTo).toLocaleDateString()}
                                    </Text>
                                </Stack>
                            </Grid.Col>
                            {/*<Grid.Col span={{ base: 12, sm: 6, md: 4 }}>*/}
                            {/*    <Stack gap={4}>*/}
                            {/*        <Text size="xs" c="dimmed">Unit Manager</Text>*/}
                            {/*        <Text fw={500}>{offer.unitManagerUsername}</Text>*/}
                            {/*    </Stack>*/}
                            {/*</Grid.Col>*/}
                        </Grid>

                        {offer.notes && (
                            <>
                                <Divider />
                                <Stack gap={4}>
                                    <Text size="xs" c="dimmed">Notes</Text>
                                    <Text>{offer.notes}</Text>
                                </Stack>
                            </>
                        )}
                    </Stack>
                </Paper>

                {/* Attachments */}
                <OfferAttachmentsList
                    offerId={offer.id}
                    attachments={attachments}
                    onRefresh={loadOfferDetails}
                    allowUpload={offer.status === 'SUBMITTED' || offer.status === 'PENDING'}
                />
            </Stack>
        </Container>
    );
}
