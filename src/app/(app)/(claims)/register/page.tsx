'use client';

import { useState, useEffect } from 'react';
import {RegisteredClaim, useClaimsStore, convertDateToDDMMYYYY} from "@/store/useClaimRegisterStore";
import SearchableDropdown from "@/components/claims/register/SearchableDropdown";
import {
    Table,
    Button,
    TextInput,
    Textarea,
    Modal,
    Paper,
    Card,
    Group,
    Stack,
    Badge,
    Title,
    Text,
    Grid,
    ActionIcon,
    NumberInput,
    Container,
    Divider,
    Box,
    SimpleGrid,
    Select,
    NativeSelect,
    Alert
} from '@mantine/core';
import { IconX, IconCheck, IconFileDownload, IconInfoCircle } from '@tabler/icons-react';


export default function ClaimsPage() {
    const [view, setView] = useState<'list' | 'register' | 'attach'>('list');
    const [step, setStep] = useState(1);
    const [selectedClaimForView, setSelectedClaimForView] = useState<RegisteredClaim | null>(null);
    const [registeredClaimId, setRegisteredClaimId] = useState<string | null>(null);
    const [attachingToClaimId, setAttachingToClaimId] = useState<string | null>(null);
    const [searchPerformed, setSearchPerformed] = useState(false);
    const [searchPerformedAttach, setSearchPerformedAttach] = useState(false);

    const store = useClaimsStore();

    // Generate CSV report from registered claims
    const generateClaimsReport = (): string => {
        const headers = [
            'Claim ID',
            'Date Registered',
            'Date of Loss',
            'Date Received',
            'Original Insured',
            'Cause of Loss',
            'Current Reserve (TZS)',
            'Salvage (TZS)',
            'Net Amount (TZS)',
            'Total Share Signed (%)',
            'TANRE TZS',
            'Retro Amount',
            'TANRE Retention',
            'Contract Count',
            'Contracts'
        ];

        const rows = store.registeredClaims.map(claim => [
            claim.claimId,
            convertDateToDDMMYYYY(claim.dateRegistered),
            claim.dateOfLoss ? convertDateToDDMMYYYY(claim.dateOfLoss) : '',
            convertDateToDDMMYYYY(claim.dateReceived),
            claim.originalInsured,
            `"${claim.causeOfLoss.replace(/"/g, '""')}"`, // Escape quotes in cause of loss
            claim.currentReserve,
            claim.salvage,
            claim.netAmount,
            claim.totalShareSigned.toFixed(2),
            claim.tanreTZS,
            claim.retroAmount,
            claim.tanreRetention,
            claim.contractCount,
            `"${claim.contracts.join(', ')}"` // Join contract numbers
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        return csvContent;
    };

    // Download CSV file
    const downloadReport = (csvContent: string) => {
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];
        const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
        const filename = `Claims_Register_Report_${dateStr}_${timeStr}.csv`;

        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Load dropdown data and registered claims on component mount
    useEffect(() => {
        console.log('Component mounted, loading data...');
        console.log('Initial dropdown state:', {
            cedantOptions: store.cedantOptions,
            subProfitCentreOptions: store.subProfitCentreOptions,
            lobOptions: store.lobOptions,
            typeOfBusinessOptions: store.typeOfBusinessOptions
        });

        // Load dropdown data for the search forms
        store.loadDropdownData().catch(err => {
            console.error('Failed to load dropdown data:', err);
        });

        // Load existing registered claims from the database
        store.loadRegisteredClaims().catch(err => {
            console.error('Failed to load registered claims:', err);
        });
    }, []);

    const calculateTotals = () => {
        const amount = parseFloat(store.claimDetails.currentReserve) || 0;
        const salvageAmount = parseFloat(store.claimDetails.salvage) || 0;
        const netAmount = amount - salvageAmount;
        const totalShareSigned = store.selectedContracts.reduce((sum, c) => sum + c.shareSigned, 0);
        const retroPercentage = store.selectedContracts[0]?.retroPercentage || 0;

        const tanreTZS = netAmount * (totalShareSigned / 100);
        const retroAmount = tanreTZS * (retroPercentage / 100);
        const tanreRetention = tanreTZS - retroAmount;

        return { netAmount, totalShareSigned, retroPercentage, tanreTZS, retroAmount, tanreRetention };
    };

    const isValidClaimDetails = () => {
        const { dateReceived, originalInsured, causeOfLoss, currentReserve, causeOfLossCustom } = store.claimDetails;
        // dateOfLoss is now optional, but other fields are required
        // causeOfLoss must be either a selected dropdown value OR a custom value
        const hasCauseOfLoss = causeOfLoss || causeOfLossCustom;
        return !!(dateReceived && originalInsured && hasCauseOfLoss && currentReserve);
    };

    const handleSubmit = async () => {
        const claim = await store.submitClaim();
        setRegisteredClaimId(claim.claimId);
    };

    const handleReset = () => {
        store.resetClaimForm();
        setRegisteredClaimId(null);
        setStep(1);
        setView('register');
    };

    const handleAttachContracts = (claimId: string) => {
        setAttachingToClaimId(claimId);
        store.setSelectedContracts([]);
        setSearchPerformedAttach(false);
        store.searchContracts();
        setView('attach');
    };

    const handleSubmitAttachContracts = async () => {
        if (attachingToClaimId && store.selectedContracts.length > 0) {
            await store.attachContractsToExistingClaim(attachingToClaimId, store.selectedContracts);
            setAttachingToClaimId(null);
            setView('list');
        }
    };

    const totals = calculateTotals();

    // Claim Detail Modal
    if (selectedClaimForView) {
        return (
            <Modal
                opened={!!selectedClaimForView}
                onClose={() => setSelectedClaimForView(null)}
                title={`Claim Details - ${selectedClaimForView.claimId}`}
                size="xl"
                padding="lg"
            >
                <Stack gap="md">
                    <Paper p="md" withBorder>
                        <Title order={3} size="h4" mb="md">Claim Information</Title>
                        <SimpleGrid cols={2} spacing="md">
                            <div>
                                <Text size="sm" c="dimmed">Claim ID</Text>
                                <Text fw={600} c="blue">{selectedClaimForView.claimId}</Text>
                            </div>
                            <div>
                                <Text size="sm" c="dimmed">Date Registered</Text>
                                <Text fw={600}>{convertDateToDDMMYYYY(selectedClaimForView.dateRegistered)}</Text>
                            </div>
                            <div>
                                <Text size="sm" c="dimmed">Original Insured</Text>
                                <Text fw={600}>{selectedClaimForView.originalInsured}</Text>
                            </div>
                            <div>
                                <Text size="sm" c="dimmed">Net Amount (TZS)</Text>
                                <Text fw={600} c="blue">{selectedClaimForView.netAmount.toLocaleString()}</Text>
                            </div>
                            <Box style={{ gridColumn: 'span 2' }}>
                                <Text size="sm" c="dimmed">Cause of Loss</Text>
                                <Text fw={600}>{selectedClaimForView.causeOfLoss}</Text>
                            </Box>
                        </SimpleGrid>
                    </Paper>

                    <Paper p="md" withBorder bg="blue.0">
                        <Title order={3} size="h4" mb="md">Financial Summary</Title>
                        <SimpleGrid cols={3} spacing="md">
                            <Paper p="md" bg="white">
                                <Text size="sm" c="dimmed">TANRE TZS</Text>
                                <Text size="xl" fw={700} c="green">
                                    {selectedClaimForView.tanreTZS.toLocaleString()}
                                </Text>
                            </Paper>
                            <Paper p="md" bg="white">
                                <Text size="sm" c="dimmed">Retro Amount</Text>
                                <Text size="xl" fw={700} c="orange">
                                    {selectedClaimForView.retroAmount.toLocaleString()}
                                </Text>
                            </Paper>
                            <Paper p="md" bg="white">
                                <Text size="sm" c="dimmed">Retention</Text>
                                <Text size="xl" fw={700} c="blue">
                                    {selectedClaimForView.tanreRetention.toLocaleString()}
                                </Text>
                            </Paper>
                        </SimpleGrid>
                    </Paper>

                    <Button
                        fullWidth
                        onClick={() => setSelectedClaimForView(null)}
                        size="md"
                    >
                        Close
                    </Button>
                </Stack>
            </Modal>
        );
    }

    // Success View
    if (registeredClaimId) {
        return (
            <Container size="md" py="xl">
                <Paper shadow="lg" p="xl" radius="md">
                    <Stack align="center" gap="lg" mb="xl">
                        <ActionIcon size={64} radius="xl" variant="filled" color="green">
                            <IconCheck size={32} />
                        </ActionIcon>
                        <Title order={2}>Claim Registered Successfully!</Title>
                        <Text c="dimmed">Claim ID: {registeredClaimId}</Text>
                    </Stack>

                    <Paper p="md" withBorder bg="blue.0" mb="lg">
                        <Title order={3} size="h4" mb="md">Financial Summary</Title>
                        <SimpleGrid cols={2} spacing="md">
                            <div>
                                <Text size="sm" c="dimmed">TANRE TZS</Text>
                                <Text size="xl" fw={700} c="green">{totals.tanreTZS.toLocaleString()}</Text>
                            </div>
                            <div>
                                <Text size="sm" c="dimmed">Retro Amount</Text>
                                <Text size="xl" fw={700} c="orange">{totals.retroAmount.toLocaleString()}</Text>
                            </div>
                        </SimpleGrid>
                    </Paper>

                    <Group grow>
                        <Button
                            variant="default"
                            onClick={() => { store.resetClaimForm(); setRegisteredClaimId(null); setView('list'); }}
                            size="md"
                        >
                            View All Claims
                        </Button>
                        <Button
                            onClick={handleReset}
                            size="md"
                        >
                            Register Another
                        </Button>
                    </Group>
                </Paper>
            </Container>
        );
    }

    // Claims List View
    if (view === 'list') {
        return (
            <Container size="xl" py="xl">
                <Stack gap="lg">
                    <Paper shadow="md" p="lg" radius="md">
                        <Group justify="space-between" align="flex-start">
                            <div>
                                <Title order={1} mb="xs">Registered Claims</Title>
                                <Text c="dimmed">View and manage all registered claims</Text>
                            </div>
                            <Group gap="sm">
                                <Button
                                    variant="light"
                                    leftSection={<IconFileDownload size={18} />}
                                    onClick={() => {
                                        // Generate CSV report
                                        const csvContent = generateClaimsReport();
                                        downloadReport(csvContent);
                                    }}
                                    size="md"
                                >
                                    Generate Report
                                </Button>
                                <Button
                                    onClick={() => { setView('register'); setStep(1); }}
                                    size="md"
                                >
                                    + Register New Claim
                                </Button>
                            </Group>
                        </Group>
                    </Paper>

                    <Paper shadow="sm" p="lg" radius="md">
                        <Title order={3} size="h4" mb="md">Summary</Title>
                        <SimpleGrid cols={4} spacing="lg">
                            <Paper p="md" withBorder bg="blue.0">
                                <Text size="sm" c="dimmed" mb="xs">Total Claims</Text>
                                <Text size="xl" fw={700} c="blue">{store.registeredClaims.length}</Text>
                            </Paper>
                            <Paper p="md" withBorder bg="green.0">
                                <Text size="sm" c="dimmed" mb="xs">Total TANRE TZS</Text>
                                <Text size="xl" fw={700} c="green">
                                    {store.registeredClaims.reduce((sum, c) => sum + c.tanreTZS, 0).toLocaleString()}
                                </Text>
                            </Paper>
                            <Paper p="md" withBorder bg="orange.0">
                                <Text size="sm" c="dimmed" mb="xs">Total Retro</Text>
                                <Text size="xl" fw={700} c="orange">
                                    {store.registeredClaims.reduce((sum, c) => sum + c.retroAmount, 0).toLocaleString()}
                                </Text>
                            </Paper>
                            <Paper p="md" withBorder bg="grape.0">
                                <Text size="sm" c="dimmed" mb="xs">Total Retention</Text>
                                <Text size="xl" fw={700} c="grape">
                                    {store.registeredClaims.reduce((sum, c) => sum + c.tanreRetention, 0).toLocaleString()}
                                </Text>
                            </Paper>
                        </SimpleGrid>
                    </Paper>

                    <Paper shadow="md" radius="md">
                        <Table highlightOnHover>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>Claim ID</Table.Th>
                                    <Table.Th>Date Registered</Table.Th>
                                    <Table.Th>Original Insured</Table.Th>
                                    <Table.Th>Net Amount (TZS)</Table.Th>
                                    <Table.Th>TANRE TZS</Table.Th>
                                    <Table.Th>Actions</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {store.registeredClaims.map((claim) => (
                                    <Table.Tr key={claim.claimId}>
                                        <Table.Td>
                                            <Text fw={600} c="blue">{claim.claimId}</Text>
                                        </Table.Td>
                                        <Table.Td>{convertDateToDDMMYYYY(claim.dateRegistered)}</Table.Td>
                                        <Table.Td>{claim.originalInsured}</Table.Td>
                                        <Table.Td>
                                            <Text fw={500}>{claim.netAmount.toLocaleString()}</Text>
                                        </Table.Td>
                                        <Table.Td>
                                            <Text fw={500} c="green">{claim.tanreTZS.toLocaleString()}</Text>
                                        </Table.Td>
                                        <Table.Td>
                                            <Group gap="xs">
                                                <Button
                                                    variant="subtle"
                                                    size="xs"
                                                    onClick={() => setSelectedClaimForView(claim)}
                                                >
                                                    View
                                                </Button>
                                                <Button
                                                    variant="subtle"
                                                    color="green"
                                                    size="xs"
                                                    onClick={() => handleAttachContracts(claim.claimId)}
                                                >
                                                    Attach Contracts
                                                </Button>
                                            </Group>
                                        </Table.Td>
                                    </Table.Tr>
                                ))}
                            </Table.Tbody>
                        </Table>
                    </Paper>
                </Stack>
            </Container>
        );
    }

    // Attach Contracts View
    if (view === 'attach' && attachingToClaimId) {
        const claim = store.registeredClaims.find(c => c.claimId === attachingToClaimId);

        return (
            <Container size="lg" py="xl">
                <Stack gap="lg">
                    <Paper shadow="md" p="lg" radius="md">
                        <Group justify="space-between" align="flex-start">
                            <div>
                                <Title order={2}>Attach Contracts to Claim</Title>
                                <Text c="dimmed" mt="xs">Claim ID: {attachingToClaimId}</Text>
                            </div>
                            <Button
                                variant="subtle"
                                onClick={() => { setView('list'); setAttachingToClaimId(null); store.setSelectedContracts([]); }}
                            >
                                ← Cancel
                            </Button>
                        </Group>
                    </Paper>

                    {claim && (
                        <Paper shadow="md" p="lg" radius="md">
                            <Title order={3} size="h4" mb="md">Current Claim Details</Title>
                            <SimpleGrid cols={3} spacing="md">
                                <div>
                                    <Text size="sm" c="dimmed">Original Insured:</Text>
                                    <Text fw={500}>{claim.originalInsured}</Text>
                                </div>
                                <div>
                                    <Text size="sm" c="dimmed">Current Contracts:</Text>
                                    <Text fw={500}>{claim.contractCount} contracts</Text>
                                </div>
                                <div>
                                    <Text size="sm" c="dimmed">Net Amount:</Text>
                                    <Text fw={500}>{claim.netAmount.toLocaleString()} TZS</Text>
                                </div>
                            </SimpleGrid>
                        </Paper>
                    )}

                    <Paper shadow="md" p="lg" radius="md">
                        <Title order={3} size="h5" mb="md">Search & Select Contracts</Title>
                        <SimpleGrid cols={3} spacing="md" mb="md">
                            <TextInput
                                label="Underwriting Year"
                                placeholder="e.g., 2020"
                                value={store.searchCriteria.underwritingYear}
                                onChange={(e) => store.setSearchCriteria({ underwritingYear: e.target.value })}
                            />
                            <Select
                                label="Cedant Code"
                                placeholder={store.cedantOptions.length === 0 ? "Loading..." : "Select cedant"}
                                value={store.searchCriteria.cedantCode || null}
                                onChange={(value) => store.setSearchCriteria({ cedantCode: value || '' })}
                                data={store.cedantOptions}
                                searchable
                                clearable
                            />
                            <Select
                                label="Sub Profit Centre"
                                placeholder={store.subProfitCentreOptions.length === 0 ? "Loading..." : "Select profit centre"}
                                value={store.searchCriteria.subProfitCentre || null}
                                onChange={(value) => store.setSearchCriteria({ subProfitCentre: value || '' })}
                                data={store.subProfitCentreOptions}
                                searchable
                                clearable
                            />
                            <Select
                                label="LOB Description"
                                placeholder={store.lobOptions.length === 0 ? "Loading..." : "Select LOB"}
                                value={store.searchCriteria.lobDescription || null}
                                onChange={(value) => store.setSearchCriteria({ lobDescription: value || '' })}
                                data={store.lobOptions}
                                searchable
                                clearable
                            />
                            <Select
                                label="Type of Business"
                                placeholder={store.typeOfBusinessOptions.length === 0 ? "Loading..." : "Select type"}
                                value={store.searchCriteria.typeOfBusiness || null}
                                onChange={(value) => store.setSearchCriteria({ typeOfBusiness: value || '' })}
                                data={store.typeOfBusinessOptions}
                                searchable
                                clearable
                            />
                        </SimpleGrid>
                        <Button
                            onClick={() => {
                                store.searchContracts();
                                setSearchPerformedAttach(true);
                            }}
                            loading={store.loading}
                        >
                            Search Contracts
                        </Button>
                    </Paper>

                    {searchPerformedAttach && store.searchResults.length === 0 && !store.loading && (
                        <Alert icon={<IconInfoCircle />} title="No Results" color="blue" mb="lg">
                            No contracts found matching your search criteria. Please try adjusting your search filters such as underwriting year, cedant code, or line of business.
                        </Alert>
                    )}

                    {store.searchResults.length > 0 && (
                        <Paper shadow="md" p="lg" radius="md">
                            <Title order={3} size="h5" mb="md">Available Contracts</Title>
                            <Stack gap="sm">
                                {store.searchResults.map((contract) => {
                                    const isSelected = store.selectedContracts.find(c => c.contractNumber === contract.contractNumber);
                                    return (
                                        <Paper
                                            key={contract.contractNumber}
                                            p="md"
                                            withBorder
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => store.toggleContractSelection(contract)}
                                            bg={isSelected ? 'blue.0' : undefined}
                                            className={isSelected ? '' : 'hover:border-blue-300'}
                                        >
                                            <Group justify="space-between" align="center">
                                                <div>
                                                    <Title order={4} size="h5" mb="xs">Contract #{contract.contractNumber}</Title>
                                                    <Text size="sm" c="dimmed">
                                                        Share: {contract.shareSigned}% | Retro: {contract.retroPercentage}% | {contract.insuredName}
                                                    </Text>
                                                </div>
                                                {isSelected && (
                                                    <Badge color="blue">Selected</Badge>
                                                )}
                                            </Group>
                                        </Paper>
                                    );
                                })}
                            </Stack>
                        </Paper>
                    )}

                    {store.selectedContracts.length > 0 && (
                        <Paper shadow="md" p="lg" radius="md">
                            <Group justify="space-between" align="center" mb="md">
                                <Title order={3} size="h5">
                                    Selected Contracts ({store.selectedContracts.length})
                                </Title>
                                <Button
                                    color="green"
                                    onClick={handleSubmitAttachContracts}
                                    loading={store.loading}
                                    size="md"
                                >
                                    Attach Contracts to Claim
                                </Button>
                            </Group>
                            <Group gap="xs" mb="md">
                                {store.selectedContracts.map((contract) => (
                                    <Badge key={contract.contractNumber} size="lg" variant="light">
                                        Contract #{contract.contractNumber} - Share: {contract.shareSigned}%
                                    </Badge>
                                ))}
                            </Group>

                            <Paper p="md" withBorder bg="blue.0">
                                <Title order={4} size="h6" mb="sm">New Calculations Preview</Title>
                                <SimpleGrid cols={3} spacing="md">
                                    <div>
                                        <Text size="sm" c="dimmed">Total Share Signed:</Text>
                                        <Text size="lg" fw={700}>
                                            {store.selectedContracts.reduce((sum, c) => sum + c.shareSigned, 0).toFixed(2)}%
                                        </Text>
                                    </div>
                                    <div>
                                        <Text size="sm" c="dimmed">New TANRE TZS:</Text>
                                        <Text size="lg" fw={700} c="green">
                                            {claim && (claim.netAmount * (store.selectedContracts.reduce((sum, c) => sum + c.shareSigned, 0) / 100)).toLocaleString()}
                                        </Text>
                                    </div>
                                    <div>
                                        <Text size="sm" c="dimmed">Contracts:</Text>
                                        <Text size="lg" fw={700}>{store.selectedContracts.length}</Text>
                                    </div>
                                </SimpleGrid>
                            </Paper>
                        </Paper>
                    )}
                </Stack>
            </Container>
        );
    }

    // Registration - Step 1: Claim Details
    if (step === 1) {
        return (
            <Container size="md" py="xl">
                <Stack gap="lg">
                    <Paper shadow="md" p="lg" radius="md">
                        <Group justify="space-between" align="center">
                            <Title order={2}>Register New Claim - Step 1/3</Title>
                            <Button variant="subtle" onClick={() => setView('list')}>
                                ← Back to List
                            </Button>
                        </Group>
                    </Paper>

                    <Paper shadow="md" p="lg" radius="md">
                        <Title order={3} size="h4" mb="lg">Enter Claim Details</Title>

                        <Stack gap="md">
                            <SimpleGrid cols={2} spacing="md">
                                <TextInput
                                    label={
                                        <Group gap={4} justify="flex-start">
                                            <span>Date of Loss</span>
                                            {!store.claimDetails.dateOfLoss && (
                                                <Badge size="sm" variant="light" color="gray">Optional - Can fill later</Badge>
                                            )}
                                        </Group>
                                    }
                                    type="date"
                                    placeholder="dd/mm/yyyy"
                                    value={store.claimDetails.dateOfLoss}
                                    onChange={(e) => store.setClaimDetails({ dateOfLoss: e.target.value })}
                                />

                                <TextInput
                                    label="Date Received"
                                    type="date"
                                    placeholder="dd/mm/yyyy"
                                    value={store.claimDetails.dateReceived}
                                    onChange={(e) => store.setClaimDetails({ dateReceived: e.target.value })}
                                    required
                                    withAsterisk
                                />
                            </SimpleGrid>

                            <TextInput
                                label="Original Insured"
                                value={store.claimDetails.originalInsured}
                                onChange={(e) => store.setClaimDetails({ originalInsured: e.target.value })}
                                required
                                withAsterisk
                            />

                            <Stack gap="sm">
                                <Select
                                    label="Cause of Loss"
                                    placeholder="Select a cause"
                                    value={store.claimDetails.causeOfLoss || null}
                                    onChange={(value) => store.setClaimDetails({ causeOfLoss: value || '', causeOfLossCustom: '' })}
                                    data={[
                                        { value: 'Fire damage', label: 'Fire damage' },
                                        { value: 'Storm damage', label: 'Storm damage' },
                                        { value: 'Water damage', label: 'Water damage' },
                                        { value: 'Theft', label: 'Theft' },
                                        { value: 'Vehicle accident', label: 'Vehicle accident' },
                                        { value: 'Natural disaster', label: 'Natural disaster' },
                                        { value: 'Other', label: 'Other - Please specify' }
                                    ]}
                                    required
                                    withAsterisk
                                    searchable
                                />

                                {store.claimDetails.causeOfLoss === 'Other' && (
                                    <TextInput
                                        label="Please specify the cause of loss"
                                        placeholder="Enter custom cause of loss"
                                        value={store.claimDetails.causeOfLossCustom || ''}
                                        onChange={(e) => store.setClaimDetails({ causeOfLossCustom: e.target.value })}
                                        required
                                        withAsterisk
                                    />
                                )}
                            </Stack>

                            <SimpleGrid cols={2} spacing="md">
                                <TextInput
                                    label="Current Reserve (TZS)"
                                    value={store.claimDetails.currentReserve}
                                    onChange={(e) => store.setClaimDetails({ currentReserve: e.target.value })}
                                    required
                                    withAsterisk
                                />

                                <TextInput
                                    label="Salvage (TZS)"
                                    value={store.claimDetails.salvage}
                                    onChange={(e) => store.setClaimDetails({ salvage: e.target.value })}
                                />
                            </SimpleGrid>

                            <Button
                                fullWidth
                                onClick={() => setStep(2)}
                                disabled={!isValidClaimDetails()}
                                size="md"
                                mt="md"
                            >
                                Continue to Search Contracts
                            </Button>
                        </Stack>
                    </Paper>
                </Stack>
            </Container>
        );
    }

    // Registration - Step 2: Contract Search
    if (step === 2) {
        return (
            <Container size="lg" py="xl">
                <Stack gap="lg">
                    <Paper shadow="md" p="lg" radius="md">
                        <Group justify="space-between" align="center">
                            <Title order={2}>Register New Claim - Step 2/3</Title>
                            <Button variant="subtle" onClick={() => setStep(1)}>
                                ← Back
                            </Button>
                        </Group>
                    </Paper>

                    <Paper shadow="md" p="lg" radius="md">
                        <Title order={3} size="h5" mb="md">Search Contracts</Title>
                        <SimpleGrid cols={3} spacing="md" mb="md">
                            <TextInput
                                label="Underwriting Year"
                                placeholder="e.g., 2020"
                                value={store.searchCriteria.underwritingYear}
                                onChange={(e) => store.setSearchCriteria({ underwritingYear: e.target.value })}
                            />
                            <Select
                                label="Cedant Code"
                                placeholder={store.cedantOptions.length === 0 ? "Loading..." : "Select cedant"}
                                value={store.searchCriteria.cedantCode || null}
                                onChange={(value) => store.setSearchCriteria({ cedantCode: value || '' })}
                                data={store.cedantOptions}
                                searchable
                                clearable
                            />
                            <Select
                                label="Sub Profit Centre"
                                placeholder={store.subProfitCentreOptions.length === 0 ? "Loading..." : "Select profit centre"}
                                value={store.searchCriteria.subProfitCentre || null}
                                onChange={(value) => store.setSearchCriteria({ subProfitCentre: value || '' })}
                                data={store.subProfitCentreOptions}
                                searchable
                                clearable
                            />
                            <Select
                                label="LOB Description"
                                placeholder={store.lobOptions.length === 0 ? "Loading..." : "Select LOB"}
                                value={store.searchCriteria.lobDescription || null}
                                onChange={(value) => store.setSearchCriteria({ lobDescription: value || '' })}
                                data={store.lobOptions}
                                searchable
                                clearable
                            />
                            <Select
                                label="Type of Business"
                                placeholder={store.typeOfBusinessOptions.length === 0 ? "Loading..." : "Select type"}
                                value={store.searchCriteria.typeOfBusiness || null}
                                onChange={(value) => store.setSearchCriteria({ typeOfBusiness: value || '' })}
                                data={store.typeOfBusinessOptions}
                                searchable
                                clearable
                            />
                        </SimpleGrid>
                        <Button
                            onClick={() => {
                                store.searchContracts();
                                setSearchPerformed(true);
                            }}
                            loading={store.loading}
                        >
                            Search Contracts
                        </Button>
                    </Paper>

                    {searchPerformed && store.searchResults.length === 0 && !store.loading && (
                        <Alert icon={<IconInfoCircle />} title="No Results" color="blue" mb="lg">
                            No contracts found matching your search criteria. Please try adjusting your search filters such as underwriting year, cedant code, or line of business.
                        </Alert>
                    )}

                    {store.searchResults.length > 0 && (
                        <Paper shadow="md" p="lg" radius="md">
                            <Title order={3} size="h5" mb="md">Search Results</Title>
                            <Stack gap="sm">
                                {store.searchResults.map((contract) => {
                                    const isSelected = store.selectedContracts.find(c => c.contractNumber === contract.contractNumber);
                                    return (
                                        <Paper
                                            key={contract.contractNumber}
                                            p="md"
                                            withBorder
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => store.toggleContractSelection(contract)}
                                            bg={isSelected ? 'blue.0' : undefined}
                                        >
                                            <Group justify="space-between" align="center">
                                                <div>
                                                    <Title order={4} size="h5" mb="xs">Contract #{contract.contractNumber}</Title>
                                                    <Text size="sm" c="dimmed">
                                                        Share: {contract.shareSigned}% | Retro: {contract.retroPercentage}% | {contract.insuredName}
                                                    </Text>
                                                </div>
                                                {isSelected && (
                                                    <Badge color="blue">Selected</Badge>
                                                )}
                                            </Group>
                                        </Paper>
                                    );
                                })}
                            </Stack>
                        </Paper>
                    )}

                    {store.selectedContracts.length > 0 && (
                        <Paper shadow="md" p="lg" radius="md">
                            <Group justify="space-between" align="center" mb="md">
                                <Title order={3} size="h5">Selected Contracts ({store.selectedContracts.length})</Title>
                                <Button
                                    color="green"
                                    onClick={() => setStep(3)}
                                >
                                    Continue to Review
                                </Button>
                            </Group>
                            <Group gap="xs">
                                {store.selectedContracts.map((contract) => (
                                    <Badge key={contract.contractNumber} size="lg" variant="light">
                                        Contract #{contract.contractNumber}
                                    </Badge>
                                ))}
                            </Group>
                        </Paper>
                    )}
                </Stack>
            </Container>
        );
    }

    // Registration - Step 3: Review & Submit
    return (
        <Container size="md" py="xl">
            <Stack gap="lg">
                <Paper shadow="md" p="lg" radius="md">
                    <Group justify="space-between" align="center">
                        <Title order={2}>Register New Claim - Step 3/3</Title>
                        <Button variant="subtle" onClick={() => setStep(2)}>
                            ← Back
                        </Button>
                    </Group>
                </Paper>

                <Paper shadow="md" p="lg" radius="md">
                    <Title order={3} size="h4" mb="lg">Review & Register Claim</Title>

                    <Paper p="md" withBorder mb="md">
                        <Group justify="space-between" align="center" mb="md">
                            <Title order={4} size="h5">Claim Information</Title>
                            <Button variant="subtle" size="xs" onClick={() => setStep(1)}>Edit</Button>
                        </Group>
                        <Stack gap="md">
                            <SimpleGrid cols={2} spacing="md">
                                <div>
                                    <Group gap={4} justify="flex-start">
                                        <Text size="sm" c="dimmed">Date of Loss</Text>
                                        {!store.claimDetails.dateOfLoss && (
                                            <Badge size="xs" variant="light" color="orange">Missing - Add later</Badge>
                                        )}
                                    </Group>
                                    <Text fw={600}>{store.claimDetails.dateOfLoss || '(Not provided)'}</Text>
                                </div>
                                <div>
                                    <Text size="sm" c="dimmed">Original Insured</Text>
                                    <Text fw={600}>{store.claimDetails.originalInsured}</Text>
                                </div>
                                <div>
                                    <Text size="sm" c="dimmed">Current Reserve (TZS)</Text>
                                    <Text fw={600}>{parseFloat(store.claimDetails.currentReserve).toLocaleString()}</Text>
                                </div>
                                <div>
                                    <Text size="sm" c="dimmed">Net Amount (TZS)</Text>
                                    <Text fw={600} c="blue">{totals.netAmount.toLocaleString()}</Text>
                                </div>
                            </SimpleGrid>
                            <div>
                                <Text size="sm" c="dimmed">Cause of Loss</Text>
                                <Text fw={600}>
                                    {store.claimDetails.causeOfLoss === 'Other'
                                        ? store.claimDetails.causeOfLossCustom
                                        : store.claimDetails.causeOfLoss}
                                </Text>
                            </div>
                        </Stack>
                    </Paper>

                    <Paper p="md" withBorder bg="blue.0" mb="md">
                        <Title order={4} size="h5" mb="md">Financial Summary</Title>
                        <SimpleGrid cols={2} spacing="md">
                            <Paper p="md" bg="white">
                                <Text size="sm" c="dimmed">Total Share Signed</Text>
                                <Text size="xl" fw={700}>{totals.totalShareSigned.toFixed(2)}%</Text>
                            </Paper>
                            <Paper p="md" bg="white">
                                <Text size="sm" c="dimmed">Retro Percentage</Text>
                                <Text size="xl" fw={700}>{totals.retroPercentage.toFixed(2)}%</Text>
                            </Paper>
                            <Paper p="md" bg="white">
                                <Text size="sm" c="dimmed">TANRE TZS</Text>
                                <Text size="xl" fw={700} c="green">{totals.tanreTZS.toLocaleString()}</Text>
                            </Paper>
                            <Paper p="md" bg="white">
                                <Text size="sm" c="dimmed">Retro Amount</Text>
                                <Text size="xl" fw={700} c="orange">{totals.retroAmount.toLocaleString()}</Text>
                            </Paper>
                            <Paper p="md" bg="white">
                                <Text size="sm" c="dimmed">TANRE Retention</Text>
                                <Text size="xl" fw={700} c="blue">{totals.tanreRetention.toLocaleString()}</Text>
                            </Paper>
                        </SimpleGrid>
                    </Paper>

                    <Box mb="md">
                        <Title order={4} size="h5" mb="sm">Selected Contracts ({store.selectedContracts.length})</Title>
                        <Paper p="sm" withBorder bg="blue.0" mb="sm">
                            <Text size="sm">
                                <Text component="span" fw={700}>Surplus Line:</Text> {store.selectedContracts[0]?.surplusLine} |
                                <Text component="span" fw={700}> Retro %:</Text> {store.selectedContracts[0]?.retroPercentage}%
                            </Text>
                        </Paper>
                        <Stack gap="xs">
                            {store.selectedContracts.map((contract) => (
                                <Paper key={contract.contractNumber} p="sm" withBorder>
                                    <Group justify="space-between">
                                        <Text fw={500}>Contract #{contract.contractNumber}</Text>
                                        <Text c="dimmed">Share: {contract.shareSigned}%</Text>
                                    </Group>
                                </Paper>
                            ))}
                        </Stack>
                    </Box>

                    <Button
                        fullWidth
                        color="green"
                        size="lg"
                        onClick={handleSubmit}
                        loading={store.loading}
                    >
                        Register Claim
                    </Button>
                </Paper>
            </Stack>
        </Container>
    );
}
