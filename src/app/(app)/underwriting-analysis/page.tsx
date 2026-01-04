'use client';

import { useDropdownStore, useOfferStore, RetroConfiguration } from '@/store/useOfferAnalysisStore';
import {
    Box,
    Button,
    Divider,
    Grid,
    Group,
    LoadingOverlay,
    NumberInput,
    Paper,
    Select,
    TextInput,
    Title,
    Table,
    Stack,
    Badge,
    Textarea,
    Text,
    Container,
    Checkbox,
    Accordion,
    Modal,
    ActionIcon,
    Tooltip,
    Tabs,
    Loader,
    Alert,
    Card,
    SimpleGrid,
    ThemeIcon,
} from '@mantine/core';
import { DatePickerInput, DateTimePicker } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import { useEffect, useMemo, useState } from 'react';
import {useReportStore} from "@/store/useReportStore";
import {
    IconTrash,
    IconEdit,
    IconPlus,
    IconCalculator,
    IconFileAnalytics,
    IconClock,
    IconChecks,
    IconX,
    IconAlertCircle,
    IconRefresh,
} from '@tabler/icons-react';
import { apiFetch } from '@/config/api';

// TypeScript interfaces for API response
interface Metrics {
    totalSubmissions: number;
    pendingApprovals: number;
    approvedThisMonth: number;
    rejectedThisMonth: number;
    averageProcessingTime: string;
}

interface Submission {
    offerId: number;
    cedant: string;
    insured: string;
    sumInsured: number;
    currency: string;
    submittedDate: string;
    shareOfferedPct: number;
    shareAcceptedPct: number;
    status: string;
    processInstanceId: string;
}

interface OverviewApiResponse {
    metrics: Metrics;
    recentSubmissions: Submission[];
}

// Utility function to format large numbers
const formatShortNumber = (num: number): string => {
    if (num >= 1_000_000_000) {
        return (num / 1_000_000_000).toFixed(2) + 'B';
    } else if (num >= 1_000_000) {
        return (num / 1_000_000).toFixed(1) + 'M';
    } else if (num >= 1_000) {
        return (num / 1_000).toFixed(0) + 'K';
    }
    return num.toLocaleString();
};

// Modal component for adding/editing retro config
function RetroConfigModal({
    opened,
    onClose,
    config,
    onSave,
    selectedLobId: initialLobId,
    dropdownStore,
    offerStore,
}: {
    opened: boolean;
    onClose: () => void;
    config?: RetroConfiguration;
    onSave: (config: RetroConfiguration) => void;
    selectedLobId: number | null;
    dropdownStore: any;
    offerStore: any;
}) {
    const [selectedLobId, setSelectedLobId] = useState<number | null>(initialLobId || null);

    const modalForm = useForm({
        initialValues: config || {
            lineOfBusinessId: '',
            retroTypeId: '',
            retroYear: new Date().getFullYear(),
            periodFrom: new Date(),
            periodTo: new Date(),
            sumInsuredOs: 0,
            premiumOs: 0,
            shareOfferedPct: 0,
            shareAcceptedPct: 0,
        },
        validate: {
            lineOfBusinessId: (value) => (!value ? 'Line of Business is required' : null),
            retroTypeId: (value) => (!value ? 'Retro Type is required' : null),
            periodFrom: (value, values) => {
                if (!value) return 'Period From is required';
                if (values.periodTo && value >= values.periodTo) {
                    return 'Period From must be before Period To';
                }
                return null;
            },
            periodTo: (value, values) => {
                if (!value) return 'Period To is required';
                if (values.periodFrom && value <= values.periodFrom) {
                    return 'Period To must be after Period From';
                }
                return null;
            },
        },
    });

    // Update form when modal opens with config
    useEffect(() => {
        if (opened) {
            if (config) {
                modalForm.setValues(config);
                setSelectedLobId(config.lineOfBusinessId ? Number(config.lineOfBusinessId) : null);
            } else {
                modalForm.reset();
                setSelectedLobId(initialLobId);
            }
        }
    }, [opened, config?.id]); // Reset when modal opens or config changes

    const handleLobChange = (lobId: string | null) => {
        setSelectedLobId(lobId ? Number(lobId) : null);
        modalForm.setFieldValue('lineOfBusinessId', lobId || '');
        modalForm.setFieldValue('retroTypeId', ''); // Reset retro type
    };

    const handleSave = () => {
        const validation = modalForm.validate();

        if (validation.hasErrors) {
            showNotification({
                title: 'Validation Error',
                message: 'Please fix the errors in the form before saving',
                color: 'red',
            });
            return;
        }

        const configToSave = config
            ? { ...config, ...modalForm.values } as RetroConfiguration
            : (modalForm.values as RetroConfiguration);

        onSave(configToSave);
        modalForm.reset();
        onClose();
    };

    return (
        <Modal opened={opened} onClose={onClose} title={config ? 'Edit Retro Configuration' : 'Add Retro Configuration'} centered>
            <Stack gap="md">
                <Select
                    label="Line of Business"
                    placeholder="Select LOB"
                    data={dropdownStore.getLineOfBusinessSelectData()}
                    {...modalForm.getInputProps('lineOfBusinessId')}
                    onChange={handleLobChange}
                    required
                    withAsterisk
                />

                <Select
                    label="Retro Type"
                    placeholder={selectedLobId ? 'Select retro type' : 'Select LOB first'}
                    data={dropdownStore.getRetroTypeSelectData(selectedLobId || undefined)}
                    {...modalForm.getInputProps('retroTypeId')}
                    disabled={!selectedLobId}
                    required
                    withAsterisk
                />

                <NumberInput
                    label="Retro Year"
                    placeholder="e.g., 2024"
                    min={2000}
                    max={2100}
                    {...modalForm.getInputProps('retroYear')}
                    required
                    withAsterisk
                />

                <Group grow>
                    <DatePickerInput
                        label="Period From"
                        placeholder="Policy start"
                        {...modalForm.getInputProps('periodFrom')}
                        required
                        withAsterisk
                    />
                    <DatePickerInput
                        label="Period To"
                        placeholder="Policy end"
                        {...modalForm.getInputProps('periodTo')}
                        required
                        withAsterisk
                    />
                </Group>

                <NumberInput
                    label="Sum Insured"
                    placeholder="0.00"
                    decimalScale={2}
                    thousandSeparator=","
                    min={0}
                    {...modalForm.getInputProps('sumInsuredOs')}
                />

                <NumberInput
                    label="Premium"
                    placeholder="0.00"
                    decimalScale={2}
                    thousandSeparator=","
                    min={0}
                    {...modalForm.getInputProps('premiumOs')}
                />

                <Group grow>
                    <NumberInput
                        label="Share Offered %"
                        placeholder="e.g., 50.00"
                        decimalScale={2}
                        min={0}
                        max={100}
                        suffix="%"
                        {...modalForm.getInputProps('shareOfferedPct')}
                    />
                    <NumberInput
                        label="Share Accepted %"
                        placeholder="e.g., 50.00"
                        decimalScale={2}
                        min={0}
                        max={100}
                        suffix="%"
                        {...modalForm.getInputProps('shareAcceptedPct')}
                    />
                </Group>

                <Group justify="flex-end" gap="xs">
                    <Button variant="light" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave}>
                        Save Configuration
                    </Button>
                </Group>
            </Stack>
        </Modal>
    );
}

export default function UnderwritingAnalysisPage() {
    const [selectedTypes, setSelectedTypes] = useState<string[]>(['facultative']);
    const [editingConfigId, setEditingConfigId] = useState<string | null>(null);
    const [modalOpened, setModalOpened] = useState(false);
    const [selectedLobId, setSelectedLobId] = useState<number | null>(null);
    const [expandedConfigId, setExpandedConfigId] = useState<string | null>(null);
    const dropdownStore = useDropdownStore();
    const offerStore = useOfferStore();
    const {getBrokerSelectData, getCedantSelectData, loadDropdownData} = useReportStore()
    const retroConfigs = useOfferStore(state => state.retroConfigurations);

    // Overview tab state
    const [overviewData, setOverviewData] = useState<OverviewApiResponse | null>(null);
    const [overviewLoading, setOverviewLoading] = useState(false);
    const [overviewError, setOverviewError] = useState<string | null>(null);

    // Fetch overview data
    const fetchOverviewData = async () => {
        setOverviewLoading(true);
        setOverviewError(null);
        try {
            const response = await apiFetch<OverviewApiResponse>(
                '/api/underwriting/facultative/overview?limit=10&offset=0'
            );
            setOverviewData(response);
        } catch (err: any) {
            console.error('Failed to fetch overview data:', err);
            setOverviewError(err?.message || 'Failed to load data');
        } finally {
            setOverviewLoading(false);
        }
    };

    const toggleFormType = (type: string) => {
        setSelectedTypes(prev => {
            if (prev.includes(type)) {
                // Remove if already selected (but keep at least one)
                return prev.length > 1 ? prev.filter(t => t !== type) : prev;
            } else {
                // Add if not selected
                return [...prev, type];
            }
        });
    };

    const form = useForm({
        initialValues: offerStore.getInitialValues(),
        validate: offerStore.validateForm,
    });

    // Load dropdowns
    useEffect(() => {
        loadDropdownData();
        dropdownStore.loadDropdownData().catch(e => {
            console.error('Dropdown load failed', e);
        });
    }, []);

    // Load overview data on mount
    useEffect(() => {
        fetchOverviewData();
    }, []);

    // Sync form retroConfigurations with store
    useEffect(() => {
        form.setFieldValue('retroConfigurations', retroConfigs);
    }, [retroConfigs]);

    // Initialize expanded config when first config is added
    useEffect(() => {
        if (retroConfigs.length > 0 && !expandedConfigId) {
            setExpandedConfigId(retroConfigs[0].id);
        }
    }, [retroConfigs.length]);

    useEffect(() => {
        console.log('contracts raw:', dropdownStore.contractTypes);
        console.log('select data:', dropdownStore.getContractTypeSelectData());
    }, [dropdownStore.contractTypes]);


    // Keep exchange rate in sync when the currency changes via Select
    const handleCurrencyChange = (code: string | null) => {
        form.setFieldValue('currencyCode', code || '');
        if (code) {
            offerStore.updateCurrencyAndExchangeRate(code);
            // reflect updated rate from the store back into the form
            const rate = useOfferStore.getState().exchangeRate;
            form.setFieldValue('exchangeRate', rate);
        }
    };

    // Cedant change (Select returns string value)
    const handleCedantChange = (code: string | null) => {
        form.setFieldValue('cedant', code || '');
    };

    // Broker change
    const brokerOptions = getBrokerSelectData();
    const handleBrokerChange = (code: string | null) => {
        form.setFieldValue('broker', code || '');
    };

    // Line of Business change - reset retro type when LOB changes
    const handleLobChange = (lobId: string | null) => {
        form.setFieldValue('lineOfBusinessId', lobId || '');
        form.setFieldValue('retroTypeId', ''); // Reset retro type
        setSelectedLobId(lobId ? Number(lobId) : null);
    };

    // Retro Type change
    const handleRetroTypeChange = (retroTypeId: string | null) => {
        form.setFieldValue('retroTypeId', retroTypeId || '');
    };

    // Handle adding/editing a retro configuration
    const handleSaveRetroConfig = (config: RetroConfiguration) => {
        if (editingConfigId) {
            // Update existing - use the editingConfigId to update
            offerStore.updateRetroConfig(editingConfigId, config);
            setEditingConfigId(null);
            showNotification({
                title: 'Success',
                message: 'Configuration updated',
                color: 'green',
            });
        } else {
            // Add new configuration
            offerStore.addRetroConfig(config);
            showNotification({
                title: 'Success',
                message: 'Configuration added',
                color: 'green',
            });
        }
        setModalOpened(false);
    };

    // Calculate for specific config
    const handleCalculateConfig = async (configId: string) => {
        try {
            // Ensure accordion is expanded while calculating
            setExpandedConfigId(configId);

            // Only sync currency details needed for calculation
            // DO NOT sync entire form.values as it overwrites retroConfigurations
            offerStore.setValues({
                currencyCode: form.values.currencyCode,
                exchangeRate: form.values.exchangeRate,
            });

            await offerStore.calculateRetroConfig(configId);
            const config = offerStore.getRetroConfig(configId);
            if (config) {
                showNotification({
                    title: config.calculationStatus || 'Success',
                    message: config.calculationMessage || 'Values calculated successfully',
                    color:
                        config.calculationStatus === 'SUCCESS'
                            ? 'blue'
                            : config.calculationStatus === 'WARNING'
                                ? 'yellow'
                                : 'red',
                });
            }
        } catch {
            showNotification({
                title: 'Error',
                message: offerStore.error || 'Calculation failed',
                color: 'red',
            });
        }
    };

    // Submit action: send all configs
    const handleSubmit = async (values: any) => {
        // Validate form before submission
        const validation = form.validate();

        if (validation.hasErrors) {
            const errorMessages = Object.values(validation.errors).filter(Boolean);
            showNotification({
                title: 'Validation Failed',
                message: errorMessages.length > 0
                    ? errorMessages.join(', ')
                    : 'Please fix all form errors before submitting',
                color: 'red',
                autoClose: 5000,
            });
            return;
        }

        try {
            const ok = await offerStore.submitForm(values);

            if (ok) {
                showNotification({
                    title: 'Success',
                    message: 'Offer analysis saved successfully and submitted for approval',
                    color: 'green'
                });
                form.reset();
                offerStore.resetForm();
            } else {
                showNotification({
                    title: 'Submission Failed',
                    message: offerStore.error || 'Failed to save offer analysis',
                    color: 'red'
                });
            }
        } catch (err) {
            showNotification({
                title: 'Error',
                message: offerStore.error || 'Failed to save offer analysis',
                color: 'red'
            });
        }
    };


    // convenience flags
    const isBusy = dropdownStore.loading || offerStore.loading;

    const number = (v?: number) =>
        typeof v === 'number' && !isNaN(v) ? v.toLocaleString(undefined, { maximumFractionDigits: 2 }) : '-';

    return (
        <Container size="xl" py="xl">
            <Group justify="space-between" mb="xl">
                <Title order={1}>Underwriting Analysis</Title>
                <Button
                    leftSection={<IconRefresh size={16} />}
                    variant="light"
                    onClick={fetchOverviewData}
                    loading={overviewLoading}
                >
                    Refresh
                </Button>
            </Group>

            <Tabs defaultValue="overview" variant="pills">
                <Tabs.List mb="lg">
                    <Tabs.Tab value="overview" leftSection={<IconFileAnalytics size={16} />}>
                        Overview
                    </Tabs.Tab>
                    <Tabs.Tab value="new-analysis" leftSection={<IconPlus size={16} />}>
                        New Analysis
                    </Tabs.Tab>
                </Tabs.List>

                {/* Overview Tab */}
                <Tabs.Panel value="overview">
                    {/* Loading State */}
                    {overviewLoading && (
                        <Stack align="center" py="xl">
                            <Loader size="lg" />
                            <Text c="dimmed">Loading overview data...</Text>
                        </Stack>
                    )}

                    {/* Error State */}
                    {overviewError && !overviewData && (
                        <Alert
                            icon={<IconAlertCircle size={16} />}
                            title="Error Loading Data"
                            color="red"
                            mb="md"
                        >
                            {overviewError}
                            <Button
                                size="xs"
                                variant="light"
                                onClick={fetchOverviewData}
                                mt="sm"
                            >
                                Try Again
                            </Button>
                        </Alert>
                    )}

                    {/* Data Display */}
                    {!overviewLoading && overviewData && (
                        <Stack gap="xl">
                            {/* Summary Metrics Cards */}
                            <div>
                                <Title order={3} mb="md">
                                    Summary Metrics
                                </Title>
                                <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
                                    {/* Total Submissions */}
                                    <Card shadow="sm" padding="lg" radius="md" withBorder className="hover:shadow-md transition-shadow">
                                        <Group gap="sm">
                                            <ThemeIcon size={48} radius="md" color="blue" variant="light">
                                                <IconFileAnalytics size={24} />
                                            </ThemeIcon>
                                            <div>
                                                <Text size="xs" c="dimmed">Total Submissions</Text>
                                                <Text size="xl" fw={700}>{overviewData.metrics.totalSubmissions}</Text>
                                            </div>
                                        </Group>
                                    </Card>

                                    {/* Pending Approvals */}
                                    <Card shadow="sm" padding="lg" radius="md" withBorder className="hover:shadow-md transition-shadow">
                                        <Group gap="sm">
                                            <ThemeIcon size={48} radius="md" color="orange" variant="light">
                                                <IconClock size={24} />
                                            </ThemeIcon>
                                            <div>
                                                <Text size="xs" c="dimmed">Pending Approvals</Text>
                                                <Text size="xl" fw={700}>{overviewData.metrics.pendingApprovals}</Text>
                                            </div>
                                        </Group>
                                    </Card>

                                    {/* Approved This Month */}
                                    <Card shadow="sm" padding="lg" radius="md" withBorder className="hover:shadow-md transition-shadow">
                                        <Group gap="sm">
                                            <ThemeIcon size={48} radius="md" color="green" variant="light">
                                                <IconChecks size={24} />
                                            </ThemeIcon>
                                            <div>
                                                <Text size="xs" c="dimmed">Approved This Month</Text>
                                                <Text size="xl" fw={700}>{overviewData.metrics.approvedThisMonth}</Text>
                                            </div>
                                        </Group>
                                    </Card>

                                    {/* Rejected This Month */}
                                    <Card shadow="sm" padding="lg" radius="md" withBorder className="hover:shadow-md transition-shadow">
                                        <Group gap="sm">
                                            <ThemeIcon size={48} radius="md" color="red" variant="light">
                                                <IconX size={24} />
                                            </ThemeIcon>
                                            <div>
                                                <Text size="xs" c="dimmed">Rejected This Month</Text>
                                                <Text size="xl" fw={700}>{overviewData.metrics.rejectedThisMonth}</Text>
                                            </div>
                                        </Group>
                                    </Card>
                                </SimpleGrid>
                            </div>

                            {/* Recent Submissions Table */}
                            <Paper shadow="sm" p="lg" radius="md" withBorder>
                                <Title order={4} mb="md">
                                    Recent Submissions
                                </Title>
                                <Table striped highlightOnHover>
                                    <Table.Thead>
                                        <Table.Tr>
                                            <Table.Th>Date</Table.Th>
                                            <Table.Th>Cedant</Table.Th>
                                            <Table.Th>Insured</Table.Th>
                                            <Table.Th style={{ textAlign: 'right' }}>Sum Insured</Table.Th>
                                            <Table.Th>Currency</Table.Th>
                                            <Table.Th style={{ textAlign: 'right' }}>Share Offered</Table.Th>
                                            <Table.Th style={{ textAlign: 'right' }}>Share Accepted</Table.Th>
                                            <Table.Th>Status</Table.Th>
                                        </Table.Tr>
                                    </Table.Thead>
                                    <Table.Tbody>
                                        {overviewData.recentSubmissions.map((submission) => (
                                            <Table.Tr
                                                key={submission.offerId}
                                                style={{ cursor: 'pointer' }}
                                                onClick={() => console.log('View details:', submission.offerId)}
                                            >
                                                <Table.Td>{new Date(submission.submittedDate).toLocaleDateString()}</Table.Td>
                                                <Table.Td>{submission.cedant}</Table.Td>
                                                <Table.Td>{submission.insured}</Table.Td>
                                                <Table.Td style={{ textAlign: 'right' }}>{submission.sumInsured.toLocaleString()}</Table.Td>
                                                <Table.Td>{submission.currency}</Table.Td>
                                                <Table.Td style={{ textAlign: 'right' }}>{(submission.shareOfferedPct * 100).toFixed(1)}%</Table.Td>
                                                <Table.Td style={{ textAlign: 'right' }}>{(submission.shareAcceptedPct * 100).toFixed(1)}%</Table.Td>
                                                <Table.Td>
                                                    <Badge
                                                        color={
                                                            submission.status === 'Approved'
                                                                ? 'green'
                                                                : submission.status === 'In Progress'
                                                                ? 'orange'
                                                                : 'red'
                                                        }
                                                        variant="light"
                                                    >
                                                        {submission.status}
                                                    </Badge>
                                                </Table.Td>
                                            </Table.Tr>
                                        ))}
                                    </Table.Tbody>
                                </Table>
                            </Paper>
                        </Stack>
                    )}
                </Tabs.Panel>

                {/* New Analysis Tab */}
                <Tabs.Panel value="new-analysis">
                    {/* Header for Analysis Type Selector */}
                    <Paper shadow="sm" p="lg" radius="md" mb="xl">
                        <Stack gap="md">
                            <div>
                                <Title order={2} mb="xs">Create New Analysis</Title>
                                <Text c="dimmed">Select one or more analysis types for this offer</Text>
                            </div>

                            <Group gap="xl">
                                <Checkbox
                                    label="Facultative"
                                    checked={selectedTypes.includes('facultative')}
                                    onChange={() => toggleFormType('facultative')}
                                    size="md"
                                />
                                <Checkbox
                                    label="Policy Cession"
                                    checked={selectedTypes.includes('policy-cession')}
                                    onChange={() => toggleFormType('policy-cession')}
                                    size="md"
                                />
                                <Checkbox
                                    label="Treaty"
                                    checked={selectedTypes.includes('treaty')}
                                    onChange={() => toggleFormType('treaty')}
                                    size="md"
                                />
                            </Group>
                        </Stack>
                    </Paper>

                    {/* Accordion for Multiple Analysis Types */}
                    <Accordion multiple defaultValue={selectedTypes}>
            {['facultative', 'policy-cession', 'treaty']
                .filter(type => selectedTypes.includes(type))
                .map(type => {
                    if (type === 'facultative') {
                        return (
                            <Accordion.Item key="facultative" value="facultative">
                                <Accordion.Control>
                                    <Group>
                                        <Title order={3}>Facultative Analysis</Title>
                                        <Badge color="blue">Active</Badge>
                                    </Group>
                                </Accordion.Control>
                                <Accordion.Panel>
            <Box maw={1400} mx="auto" mt="md">
            <Grid gutter="lg">
                <Grid.Col span={{ base: 12, md: 7 }}>
                    <Paper shadow="sm" p="lg" pos="relative">
                        <LoadingOverlay visible={isBusy} />
                        <Title order={2} mb="lg">
                            Offer Analysis
                        </Title>

                        <form onSubmit={form.onSubmit(handleSubmit)}>
                            <Stack gap="lg">
                                {/* Offer Details Section */}
                                <Paper p="md" withBorder bg="gray.0">
                                    <Title order={5} mb="md">Offer Details</Title>
                                    <Grid gutter="md">
                                        <Grid.Col span={6}>
                                            <Select
                                                label="Cedant"
                                                placeholder="Select cedant"
                                                data={getCedantSelectData()}
                                                value={form.values.cedant}
                                                onChange={handleCedantChange}
                                                searchable
                                                required
                                                withAsterisk
                                            />
                                        </Grid.Col>
                                        <Grid.Col span={6}>
                                            <TextInput
                                                label="Insured Name"
                                                placeholder="Enter insured name"
                                                {...form.getInputProps('insured')}
                                                required
                                                withAsterisk
                                            />
                                        </Grid.Col>
                                        <Grid.Col span={6}>
                                            <Select
                                                label="Country"
                                                placeholder="Select country"
                                                data={dropdownStore.getCountrySelectData()}
                                                searchable
                                                {...form.getInputProps('country')}
                                            />
                                        </Grid.Col>
                                        <Grid.Col span={6}>
                                            <DatePickerInput
                                                label="Offer Received Date"
                                                placeholder="Select date"
                                                {...form.getInputProps('offerReceivedDate')}
                                            />
                                        </Grid.Col>
                                    </Grid>
                                </Paper>
                                {/* Currency & Exchange Rate (Offer-level) */}
                                <Paper p="md" withBorder bg="green.0">
                                    <Title order={5} mb="md">Currency & Exchange Rate</Title>
                                    <Grid gutter="md">
                                        <Grid.Col span={6}>
                                            <Select
                                                label="Currency"
                                                placeholder="Select currency"
                                                data={dropdownStore.getCurrencySelectData()}
                                                value={form.values.currencyCode}
                                                onChange={handleCurrencyChange}
                                                searchable
                                                required
                                                withAsterisk
                                            />
                                        </Grid.Col>
                                        <Grid.Col span={6}>
                                            <NumberInput
                                                label="Exchange Rate"
                                                placeholder="Auto-filled"
                                                decimalScale={6}
                                                min={0}
                                                value={form.values.exchangeRate}
                                                onChange={(val) => form.setFieldValue('exchangeRate', Number(val) || 1)}
                                                required
                                                withAsterisk
                                            />
                                        </Grid.Col>
                                    </Grid>
                                </Paper>

                                {/* Retro Configurations Section */}
                                <Paper p="md" withBorder bg="blue.0">
                                    <Group justify="space-between" mb="md">
                                        <Title order={5}>Retro Configurations</Title>
                                        <Button
                                            leftSection={<IconPlus size={16} />}
                                            size="xs"
                                            onClick={() => {
                                                setEditingConfigId(null);
                                                setModalOpened(true);
                                            }}
                                        >
                                            Add Configuration
                                        </Button>
                                    </Group>

                                    {retroConfigs.length === 0 ? (
                                        <Text c="dimmed" size="sm">No configurations added yet. Click "Add Configuration" to get started.</Text>
                                    ) : (
                                        <Table striped highlightOnHover>
                                            <Table.Thead>
                                                <Table.Tr>
                                                    <Table.Th>LOB</Table.Th>
                                                    <Table.Th>Retro Type</Table.Th>
                                                    <Table.Th>Year</Table.Th>
                                                    <Table.Th>Period</Table.Th>
                                                    <Table.Th>Sum Insured</Table.Th>
                                                    <Table.Th>Status</Table.Th>
                                                    <Table.Th>Actions</Table.Th>
                                                </Table.Tr>
                                            </Table.Thead>
                                            <Table.Tbody>
                                                {retroConfigs.map((config) => {

                                                    const lob = dropdownStore.lineOfBusinesses.find(
                                                        l => String(l.id) === config.lineOfBusinessId
                                                    );
                                                    const retroType = dropdownStore.retroTypes.find(
                                                        rt => String(rt.id) === config.retroTypeId
                                                    );

                                                    return (
                                                        <Table.Tr key={config.id}>
                                                            <Table.Td>{lob?.name || '-'}</Table.Td>
                                                            <Table.Td>{retroType?.name || '-'}</Table.Td>
                                                            <Table.Td>{config.retroYear}</Table.Td>
                                                            <Table.Td>
                                                                {config.periodFrom.toLocaleDateString()} - {config.periodTo.toLocaleDateString()}
                                                            </Table.Td>
                                                            <Table.Td>{number(config.sumInsuredOs)}</Table.Td>
                                                            <Table.Td>
                                                                {config.calculationStatus ? (
                                                                    <Badge
                                                                        color={
                                                                            config.calculationStatus === 'SUCCESS'
                                                                                ? 'green'
                                                                                : config.calculationStatus === 'WARNING'
                                                                                    ? 'yellow'
                                                                                    : 'red'
                                                                        }
                                                                    >
                                                                        {config.calculationStatus}
                                                                    </Badge>
                                                                ) : (
                                                                    <Badge color="gray">Not Calculated</Badge>
                                                                )}
                                                            </Table.Td>
                                                            <Table.Td>
                                                                <Group gap={0} justify="flex-end">
                                                                    <Tooltip label={config.calculationStatus ? "Recalculate" : "Calculate"}>
                                                                        <ActionIcon
                                                                            size="xs"
                                                                            color="green"
                                                                            variant="subtle"
                                                                            onClick={() => handleCalculateConfig(config.id)}
                                                                            loading={config.isCalculating}
                                                                        >
                                                                            <IconCalculator size={16} />
                                                                        </ActionIcon>
                                                                    </Tooltip>
                                                                    <Tooltip label="Edit">
                                                                        <ActionIcon
                                                                            size="xs"
                                                                            color="blue"
                                                                            variant="subtle"
                                                                            onClick={() => {
                                                                                setEditingConfigId(config.id);
                                                                                setModalOpened(true);
                                                                            }}
                                                                        >
                                                                            <IconEdit size={16} />
                                                                        </ActionIcon>
                                                                    </Tooltip>
                                                                    <Tooltip label="Delete">
                                                                        <ActionIcon
                                                                            size="xs"
                                                                            color="red"
                                                                            variant="subtle"
                                                                            onClick={() => {
                                                                                offerStore.removeRetroConfig(config.id);
                                                                                showNotification({
                                                                                    title: 'Deleted',
                                                                                    message: 'Configuration removed',
                                                                                    color: 'green',
                                                                                });
                                                                            }}
                                                                        >
                                                                            <IconTrash size={16} />
                                                                        </ActionIcon>
                                                                    </Tooltip>
                                                                </Group>
                                                            </Table.Td>
                                                        </Table.Tr>
                                                    );
                                                })}
                                            </Table.Tbody>
                                        </Table>
                                    )}
                                </Paper>

                                {/* Notes */}
                                <Textarea
                                    label="Notes / Recommendation"
                                    placeholder="Add any notes or recommendations..."
                                    {...form.getInputProps('notes')}
                                    autosize
                                    minRows={2}
                                    maxRows={4}
                                />

                                {/* Unit Manager */}
                                <Select
                                    label="Unit Manager"
                                    placeholder="Select unit manager..."
                                    description="Select the unit manager who will review this offer"
                                    data={dropdownStore.getUnitManagerSelectData()}
                                    {...form.getInputProps('unitManagerUsername')}
                                    searchable
                                    required
                                    withAsterisk
                                    disabled={dropdownStore.unitManagers.length === 0}
                                />

                                {dropdownStore.unitManagers.length === 0 && (
                                    <Alert
                                        icon={<IconAlertCircle size={16} />}
                                        title="No Unit Managers Available"
                                        color="yellow"
                                    >
                                        No unit managers available. Please contact administrator.
                                    </Alert>
                                )}

                                {/* Actions */}
                                <Group justify="space-between">
                                    <Text size="sm" c="dimmed">
                                        * Add at least one configuration and fill required fields before submitting
                                    </Text>
                                    <Group>
                                        <Button
                                            type="submit"
                                            loading={offerStore.loading}
                                            disabled={
                                                !form.values.cedant ||
                                                !form.values.insured ||
                                                !form.values.currencyCode ||
                                                form.values.exchangeRate <= 0 ||
                                                !form.values.unitManagerUsername ||
                                                retroConfigs.length === 0 ||
                                                dropdownStore.unitManagers.length === 0 ||
                                                offerStore.loading
                                            }
                                        >
                                            Submit Analysis
                                        </Button>
                                    </Group>
                                </Group>
                            </Stack>
                        </form>
                    </Paper>
                </Grid.Col>

                {/* RESULTS PANEL - Shows calculation results for selected config */}
                <Grid.Col span={{ base: 12, md: 5 }}>
                    <Stack gap="md">
                        {retroConfigs.length === 0 ? (
                            <Paper withBorder p="md" radius="md">
                                <Text c="dimmed" ta="center">
                                    Add configurations above to see calculation results here
                                </Text>
                            </Paper>
                        ) : (
                            <>
                            <Accordion
                                value={expandedConfigId}
                                onChange={setExpandedConfigId}
                            >
                                {retroConfigs.map((config) => {

                                    const lob = dropdownStore.lineOfBusinesses.find(
                                        l => String(l.id) === config.lineOfBusinessId
                                    );
                                    const retroType = dropdownStore.retroTypes.find(
                                        rt => String(rt.id) === config.retroTypeId
                                    );

                                    return (
                                        <Accordion.Item
                                            key={config.id}
                                            value={config.id}
                                        >
                                            <Accordion.Control>
                                                <Group justify="space-between" style={{ width: '100%' }}>
                                                    <div>
                                                        <Text fw={500}>
                                                            {lob?.name} - {retroType?.name}
                                                        </Text>
                                                        <Text size="sm" c="dimmed">
                                                            Year: {config.retroYear}
                                                        </Text>
                                                    </div>
                                                    {config.calculationStatus && (
                                                        <Badge
                                                            color={
                                                                config.calculationStatus === 'SUCCESS'
                                                                    ? 'green'
                                                                    : config.calculationStatus === 'WARNING'
                                                                        ? 'yellow'
                                                                        : 'red'
                                                            }
                                                        >
                                                            {config.calculationStatus}
                                                        </Badge>
                                                    )}
                                                </Group>
                                            </Accordion.Control>
                                            <Accordion.Panel>
                                            <Stack gap="md">
                                                {config.calculationStatus ? (
                                                    <div>
                                                        <Group justify="space-between">
                                                            <Button
                                                                size="xs"
                                                                variant="light"
                                                                onClick={() => handleCalculateConfig(config.id)}
                                                                loading={config.isCalculating}
                                                            >
                                                                Recalculate
                                                            </Button>
                                                            {config.calculationMessage && (
                                                                <Text size="sm" c="dimmed">
                                                                    {config.calculationMessage}
                                                                </Text>
                                                            )}
                                                        </Group>

                                                        <Paper withBorder p="sm" bg="blue.0">
                                                            <Title order={6} mb="xs">Offer Summary (TZS)</Title>
                                                            <Stack gap="xs">
                                                                <Group justify="space-between">
                                                                    <Text size="sm">Exposure Offered:</Text>
                                                                    <Text size="sm" fw={600} c="blue">{number(config.soExposureTz)}</Text>
                                                                </Group>
                                                                <Group justify="space-between">
                                                                    <Text size="sm">Premium Offered:</Text>
                                                                    <Text size="sm" fw={600} c="blue">{number(config.soPremiumTz)}</Text>
                                                                </Group>
                                                                <Divider size="xs" />
                                                                <Group justify="space-between">
                                                                    <Text size="sm">Exposure Accepted:</Text>
                                                                    <Text size="sm" fw={600} c="green">{number(config.saExposureTz)}</Text>
                                                                </Group>
                                                                <Group justify="space-between">
                                                                    <Text size="sm">Premium Accepted:</Text>
                                                                    <Text size="sm" fw={600} c="green">{number(config.saPremiumTz)}</Text>
                                                                </Group>
                                                            </Stack>
                                                        </Paper>

                                                        <Paper withBorder p="sm">
                                                            <Title order={6} mb="xs">Retention Breakdown</Title>
                                                            <Stack gap="xs">
                                                                <div>
                                                                    <Group justify="space-between" mb={4}>
                                                                        <Text size="sm" fw={600}>TAN-RE Retention</Text>
                                                                        <Badge size="sm" variant="light">{number(config.tanReRetentionPct)}%</Badge>
                                                                    </Group>
                                                                    <Group justify="space-between">
                                                                        <Text size="xs" c="dimmed">Exposure:</Text>
                                                                        <Text size="xs" fw={500}>{number(config.tanReRetExposureTz)}</Text>
                                                                    </Group>
                                                                    <Group justify="space-between">
                                                                        <Text size="xs" c="dimmed">Premium:</Text>
                                                                        <Text size="xs" fw={500}>{number(config.tanReRetPremiumTz)}</Text>
                                                                    </Group>
                                                                </div>

                                                                <Divider size="xs" />

                                                                <div>
                                                                    <Group justify="space-between" mb={4}>
                                                                        <Text size="sm" fw={600}>Surplus Retro</Text>
                                                                        <Badge size="sm" variant="light" color="orange">{number(config.suRetroPct)}%</Badge>
                                                                    </Group>
                                                                    <Group justify="space-between">
                                                                        <Text size="xs" c="dimmed">Exposure:</Text>
                                                                        <Text size="xs" fw={500}>{number(config.suRetroExposureTz)}</Text>
                                                                    </Group>
                                                                    <Group justify="space-between">
                                                                        <Text size="xs" c="dimmed">Premium:</Text>
                                                                        <Text size="xs" fw={500}>{number(config.suRetroPremiumTz)}</Text>
                                                                    </Group>
                                                                </div>

                                                                <Divider size="xs" />

                                                                <div>
                                                                    <Group justify="space-between" mb={4}>
                                                                        <Text size="sm" fw={600}>Fac Retro</Text>
                                                                        <Badge size="sm" variant="light" color="grape">{number(config.facRetroPct)}%</Badge>
                                                                    </Group>
                                                                    <Group justify="space-between">
                                                                        <Text size="xs" c="dimmed">Exposure:</Text>
                                                                        <Text size="xs" fw={500}>{number(config.facRetroExposureTz)}</Text>
                                                                    </Group>
                                                                    <Group justify="space-between">
                                                                        <Text size="xs" c="dimmed">Premium:</Text>
                                                                        <Text size="xs" fw={500}>{number(config.facRetroPremiumTz)}</Text>
                                                                    </Group>
                                                                </div>
                                                            </Stack>
                                                        </Paper>
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <Group justify="space-between">
                                                            <Text size="sm" c="dimmed">Not calculated yet</Text>
                                                            <Button
                                                                size="xs"
                                                                onClick={() => handleCalculateConfig(config.id)}
                                                                loading={config.isCalculating}
                                                            >
                                                                Calculate
                                                            </Button>
                                                        </Group>
                                                    </div>
                                                )}
                                            </Stack>
                                            </Accordion.Panel>
                                        </Accordion.Item>
                                    );
                                })}
                            </Accordion>
                            </>
                        )}
                    </Stack>
                </Grid.Col>
            </Grid>
            </Box>
            </Accordion.Panel>
                                </Accordion.Item>
                            );
                        } else if (type === 'policy-cession') {
                            return (
                                <Accordion.Item key="policy-cession" value="policy-cession">
                                    <Accordion.Control>
                                        <Group>
                                            <Title order={3}>Policy Cession Analysis</Title>
                                            <Badge color="orange">Coming Soon</Badge>
                                        </Group>
                                    </Accordion.Control>
                                    <Accordion.Panel>
                                        <Paper p="xl" withBorder>
                                            <Stack align="center" gap="md">
                                                <Text size="lg" c="dimmed">
                                                    Policy Cession analysis form is under development
                                                </Text>
                                                <Text size="sm" c="dimmed">
                                                    This will allow you to analyze policy cession offers with specific calculations
                                                </Text>
                                            </Stack>
                                        </Paper>
                                    </Accordion.Panel>
                                </Accordion.Item>
                            );
                        } else if (type === 'treaty') {
                            return (
                                <Accordion.Item key="treaty" value="treaty">
                                    <Accordion.Control>
                                        <Group>
                                            <Title order={3}>Treaty Analysis</Title>
                                            <Badge color="grape">Coming Soon</Badge>
                                        </Group>
                                    </Accordion.Control>
                                    <Accordion.Panel>
                                        <Paper p="xl" withBorder>
                                            <Stack align="center" gap="md">
                                                <Text size="lg" c="dimmed">
                                                    Treaty analysis form is under development
                                                </Text>
                                                <Text size="sm" c="dimmed">
                                                    This will allow you to analyze treaty offers with specific calculations
                                                </Text>
                                            </Stack>
                                        </Paper>
                                    </Accordion.Panel>
                                </Accordion.Item>
                            );
                        }
                        return null;
                    })
                }
            </Accordion>
                </Tabs.Panel>
            </Tabs>

            {/* Modal for adding/editing retro configurations */}
            <RetroConfigModal
                opened={modalOpened}
                onClose={() => {
                    setModalOpened(false);
                    setEditingConfigId(null);
                }}
                config={editingConfigId ? offerStore.getRetroConfig(editingConfigId) : undefined}
                onSave={handleSaveRetroConfig}
                selectedLobId={selectedLobId}
                dropdownStore={dropdownStore}
                offerStore={offerStore}
            />
        </Container>
    );
}


