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
} from '@mantine/core';
import { DatePickerInput, DateTimePicker } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import { useEffect, useMemo, useState } from 'react';
import {useReportStore} from "@/store/useReportStore";
import { IconTrash, IconEdit, IconPlus, IconCalculator } from '@tabler/icons-react';


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
    const [formValues, setFormValues] = useState<Partial<RetroConfiguration>>(
        config || {
            lineOfBusinessId: '',
            retroTypeId: '',
            retroYear: new Date().getFullYear(),
            periodFrom: new Date(),
            periodTo: new Date(),
            sumInsuredOs: 0,
            premiumOs: 0,
            shareOfferedPct: 0,
            shareAcceptedPct: 0,
        }
    );

    // Update form when config changes (e.g., when opening modal for editing)
    useEffect(() => {
        if (config) {
            setFormValues(config);
            setSelectedLobId(config.lineOfBusinessId ? Number(config.lineOfBusinessId) : null);
        }
    }, [config?.id]); // Only update when config ID changes (different config opened)

    const handleLobChange = (lobId: string | null) => {
        setSelectedLobId(lobId ? Number(lobId) : null);
        setFormValues({ ...formValues, lineOfBusinessId: lobId || '', retroTypeId: '' });
    };

    const handleSave = async () => {
        if (!formValues.lineOfBusinessId || !formValues.retroTypeId) {
            showNotification({
                title: 'Error',
                message: 'Please fill in all required fields',
                color: 'red',
            });
            return;
        }

        const configToSave = config
            ? { ...config, ...formValues } as RetroConfiguration
            : (formValues as RetroConfiguration); // Don't set id, let store generate it

        onSave(configToSave);
        onClose();
    };

    return (
        <Modal opened={opened} onClose={onClose} title={config ? 'Edit Retro Configuration' : 'Add Retro Configuration'} centered>
            <Stack gap="md">
                <Select
                    label="Line of Business"
                    placeholder="Select LOB"
                    data={dropdownStore.getLineOfBusinessSelectData()}
                    value={formValues.lineOfBusinessId}
                    onChange={handleLobChange}
                    required
                    withAsterisk
                />

                <Select
                    label="Retro Type"
                    placeholder={selectedLobId ? 'Select retro type' : 'Select LOB first'}
                    data={dropdownStore.getRetroTypeSelectData(selectedLobId || undefined)}
                    value={formValues.retroTypeId}
                    onChange={(val) => setFormValues({ ...formValues, retroTypeId: val || '' })}
                    disabled={!selectedLobId}
                    required
                    withAsterisk
                />

                <NumberInput
                    label="Retro Year"
                    placeholder="e.g., 2024"
                    min={2000}
                    max={2100}
                    value={formValues.retroYear}
                    onChange={(val) => setFormValues({ ...formValues, retroYear: Number(val) || new Date().getFullYear() })}
                    required
                    withAsterisk
                />

                <Group grow>
                    <DatePickerInput
                        label="Period From"
                        placeholder="Policy start"
                        value={formValues.periodFrom}
                        onChange={(val) => setFormValues({ ...formValues, periodFrom: val || new Date() })}
                        required
                        withAsterisk
                    />
                    <DatePickerInput
                        label="Period To"
                        placeholder="Policy end"
                        value={formValues.periodTo}
                        onChange={(val) => setFormValues({ ...formValues, periodTo: val || new Date() })}
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
                    value={formValues.sumInsuredOs}
                    onChange={(val) => setFormValues({ ...formValues, sumInsuredOs: Number(val) || 0 })}
                />

                <NumberInput
                    label="Premium"
                    placeholder="0.00"
                    decimalScale={2}
                    thousandSeparator=","
                    min={0}
                    value={formValues.premiumOs}
                    onChange={(val) => setFormValues({ ...formValues, premiumOs: Number(val) || 0 })}
                />

                <Group grow>
                    <NumberInput
                        label="Share Offered %"
                        placeholder="0.00"
                        decimalScale={2}
                        min={0}
                        max={100}
                        value={formValues.shareOfferedPct}
                        onChange={(val) => setFormValues({ ...formValues, shareOfferedPct: Number(val) || 0 })}
                    />
                    <NumberInput
                        label="Share Accepted %"
                        placeholder="0.00"
                        decimalScale={2}
                        min={0}
                        max={100}
                        value={formValues.shareAcceptedPct}
                        onChange={(val) => setFormValues({ ...formValues, shareAcceptedPct: Number(val) || 0 })}
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
        try {
            const ok = await offerStore.submitForm(values);

            if (ok) {
                showNotification({ title: 'Saved', message: 'Offer analysis saved successfully', color: 'green' });
                form.reset();
                offerStore.resetForm();
            }
        } catch {
            showNotification({ title: 'Error', message: offerStore.error || 'Failed to save offer analysis', color: 'red' });
        }
    };


    // convenience flags
    const isBusy = dropdownStore.loading || offerStore.loading;

    const number = (v?: number) =>
        typeof v === 'number' && !isNaN(v) ? v.toLocaleString(undefined, { maximumFractionDigits: 2 }) : '-';

    return (
        <Container size="xl" py="xl">
            {/* Header and Analysis Type Selector */}
            <Paper shadow="sm" p="lg" radius="md" mb="xl">
                <Stack gap="md">
                    <div>
                        <Title order={1} mb="xs">Underwriting Analysis</Title>
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
                                            <TextInput
                                                label="Country"
                                                placeholder="e.g., Tanzania"
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

                                {/* Notes */}
                                <Textarea
                                    label="Notes / Recommendation"
                                    placeholder="Add any notes or recommendations..."
                                    {...form.getInputProps('notes')}
                                    autosize
                                    minRows={2}
                                    maxRows={4}
                                />

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
                                                retroConfigs.length === 0 ||
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


