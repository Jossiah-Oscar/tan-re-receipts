'use client';

import { useDropdownStore, useOfferStore } from '@/store/useOfferAnalysisStore';
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
} from '@mantine/core';
import { DatePickerInput, DateTimePicker } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import { useEffect, useMemo, useState } from 'react';
import {useReportStore} from "@/store/useReportStore";


export default function UnderwritingAnalysisPage() {
    const [selectedTypes, setSelectedTypes] = useState<string[]>(['facultative']);
    const [selectedLobId, setSelectedLobId] = useState<number | null>(null);
    const dropdownStore = useDropdownStore();
    const offerStore = useOfferStore();
    const {getBrokerSelectData, getCedantSelectData, loadDropdownData} = useReportStore()

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

    // Calculate action: push form → store → calculate → show results
    const handleCalculate = async () => {
        try {
            offerStore.setValues(form.values); // push inputs to store
            await offerStore.calculateValues(); // compute results (store updates itself)

            showNotification({
                title: offerStore.calculationStatus || 'Success',
                message: offerStore.calculationMessage || 'Values calculated successfully',
                color:
                    offerStore.calculationStatus === 'SUCCESS'
                        ? 'blue'
                        : offerStore.calculationStatus === 'WARNING'
                            ? 'yellow'
                            : 'red',
            });
        } catch {
            showNotification({
                title: 'Error',
                message: offerStore.error || 'Calculation failed',
                color: 'red',
            });
        }
    };

    // Submit action: send form inputs + (optionally) the current computed snapshot
    const handleSubmit = async (values: any) => {
        try {
            const snap = useOfferStore.getState(); // latest computed numbers

            const ok = await offerStore.submitForm({
                ...values, // inputs from the form
                // snapshot: override with store values
                sumInsuredTz:        snap.sumInsuredTz,
                premiumTz:           snap.premiumTz,
                soExposureTz:        snap.soExposureTz,
                soPremiumTz:         snap.soPremiumTz,
                saExposureTz:        snap.saExposureTz,
                saPremiumTz:         snap.saPremiumTz,
                tanReRetentionPct:   snap.tanReRetentionPct,
                tanReRetExposureTz:  snap.tanReRetExposureTz,
                tanReRetPremiumTz:   snap.tanReRetPremiumTz,
                suRetroPct:          snap.suRetroPct,
                suRetroExposureTz:   snap.suRetroExposureTz,
                suRetroPremiumTz:    snap.suRetroPremiumTz,
                facRetroPct:         snap.facRetroPct,
                facRetroExposureTz:  snap.facRetroExposureTz,
                facRetroPremiumTz:   snap.facRetroPremiumTz,
            });

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

    // Right-side results pulled directly from store (read-only)
    const sumInsuredTz = useOfferStore(state => state.sumInsuredTz);
    const premiumTz = useOfferStore(state => state.premiumTz);
    const soExposureTz = useOfferStore(state => state.soExposureTz);
    const soPremiumTz = useOfferStore(state => state.soPremiumTz);
    const saExposureTz = useOfferStore(state => state.saExposureTz);
    const saPremiumTz = useOfferStore(state => state.saPremiumTz);
    const tanReRetentionPct = useOfferStore(state => state.tanReRetentionPct);
    const tanReRetExposureTz = useOfferStore(state => state.tanReRetExposureTz);
    const tanReRetPremiumTz = useOfferStore(state => state.tanReRetPremiumTz);
    const suRetroPct = useOfferStore(state => state.suRetroPct);
    const suRetroExposureTz = useOfferStore(state => state.suRetroExposureTz);
    const suRetroPremiumTz = useOfferStore(state => state.suRetroPremiumTz);
    const facRetroPct = useOfferStore(state => state.facRetroPct);
    const facRetroExposureTz = useOfferStore(state => state.facRetroExposureTz);
    const facRetroPremiumTz = useOfferStore(state => state.facRetroPremiumTz);
    const status = useOfferStore(state => state.calculationStatus);
    const message = useOfferStore(state => state.calculationMessage);

// Create results object only when needed for rendering
    const results = {
        sumInsuredTz, premiumTz, soExposureTz, soPremiumTz,
        saExposureTz, saPremiumTz, tanReRetentionPct, tanReRetExposureTz,
        tanReRetPremiumTz, suRetroPct, suRetroExposureTz, suRetroPremiumTz,
        facRetroPct, facRetroExposureTz, facRetroPremiumTz, status, message
    };

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
            {/* Facultative Form */}
            {selectedTypes.includes('facultative') && (
            <Accordion.Item value="facultative">
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

                                {/* Program & Retro Configuration */}
                                <Paper p="md" withBorder bg="blue.0">
                                    <Title order={5} mb="md">Retro Configuration</Title>
                                    <Grid gutter="md">
                                        <Grid.Col span={4}>
                                            <Select
                                                label="Line of Business"
                                                placeholder="Select LOB"
                                                data={dropdownStore.getLineOfBusinessSelectData()}
                                                value={form.values.lineOfBusinessId}
                                                onChange={handleLobChange}
                                                required
                                                withAsterisk
                                            />
                                        </Grid.Col>
                                        <Grid.Col span={4}>
                                            <NumberInput
                                                label="Retro Year"
                                                placeholder="e.g., 2024"
                                                min={2000}
                                                max={2100}
                                                value={form.values.retroYear}
                                                onChange={(val) => form.setFieldValue('retroYear', Number(val) || new Date().getFullYear())}
                                                required
                                                withAsterisk
                                            />
                                        </Grid.Col>
                                        <Grid.Col span={4}>
                                            <Select
                                                label="Retro Type"
                                                placeholder={selectedLobId ? "Select retro type" : "Select LOB first"}
                                                data={dropdownStore.getRetroTypeSelectData(selectedLobId || undefined)}
                                                value={form.values.retroTypeId}
                                                onChange={handleRetroTypeChange}
                                                disabled={!selectedLobId}
                                                required
                                                withAsterisk
                                            />
                                        </Grid.Col>
                                        <Grid.Col span={6}>
                                            <DatePickerInput
                                                label="Period From"
                                                placeholder="Policy start"
                                                {...form.getInputProps('periodFrom')}
                                                required
                                                withAsterisk
                                            />
                                        </Grid.Col>
                                        <Grid.Col span={6}>
                                            <DatePickerInput
                                                label="Period To"
                                                placeholder="Policy end"
                                                {...form.getInputProps('periodTo')}
                                                required
                                                withAsterisk
                                            />
                                        </Grid.Col>
                                    </Grid>
                                </Paper>

                                {/* Financial Details */}
                                <Paper p="md" withBorder bg="green.0">
                                    <Title order={5} mb="md">Financial Details</Title>
                                    <Grid gutter="md">
                                        <Grid.Col span={4}>
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
                                        <Grid.Col span={4}>
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
                                        <Grid.Col span={4}></Grid.Col>
                                        <Grid.Col span={6}>
                                            <NumberInput
                                                label="Sum Insured"
                                                placeholder="0.00"
                                                decimalScale={2}
                                                thousandSeparator=","
                                                min={0}
                                                value={form.values.sumInsuredOs}
                                                onChange={(val) => form.setFieldValue('sumInsuredOs', Number(val) || 0)}
                                            />
                                        </Grid.Col>
                                        <Grid.Col span={6}>
                                            <NumberInput
                                                label="Premium"
                                                placeholder="0.00"
                                                decimalScale={2}
                                                thousandSeparator=","
                                                min={0}
                                                value={form.values.premiumOs}
                                                onChange={(val) => form.setFieldValue('premiumOs', Number(val) || 0)}
                                            />
                                        </Grid.Col>
                                        <Grid.Col span={6}>
                                            <NumberInput
                                                label="Share Offered %"
                                                placeholder="0.00"
                                                decimalScale={2}
                                                min={0}
                                                max={100}
                                                value={form.values.shareOfferedPct}
                                                onChange={(val) => form.setFieldValue('shareOfferedPct', Number(val) || 0)}
                                            />
                                        </Grid.Col>
                                        <Grid.Col span={6}>
                                            <NumberInput
                                                label="Share Accepted %"
                                                placeholder="0.00"
                                                decimalScale={2}
                                                min={0}
                                                max={100}
                                                value={form.values.shareAcceptedPct}
                                                onChange={(val) => form.setFieldValue('shareAcceptedPct', Number(val) || 0)}
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
                                        * Required fields must be filled before calculating
                                    </Text>
                                    <Group>
                                        <Button
                                            variant="light"
                                            onClick={handleCalculate}
                                            loading={offerStore.calculating}
                                            disabled={!form.values.currencyCode || !form.values.lineOfBusinessId || !form.values.retroTypeId}
                                        >
                                            Calculate
                                        </Button>
                                        <Button
                                            type="submit"
                                            loading={offerStore.loading}
                                            disabled={
                                                !form.values.cedant ||
                                                !form.values.insured ||
                                                !form.values.lineOfBusinessId ||
                                                !form.values.retroTypeId ||
                                                !form.values.currencyCode ||
                                                !form.values.periodFrom ||
                                                !form.values.periodTo ||
                                                form.values.exchangeRate <= 0 ||
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

                {/* RESULTS PANEL */}
                <Grid.Col span={{ base: 12, md: 5 }}>
                    <Stack gap="md">
                        {/* Status Card */}
                        <Paper withBorder p="md" radius="md" bg={
                            results.status === 'SUCCESS' ? 'green.0' :
                            results.status === 'WARNING' ? 'yellow.0' :
                            results.status === 'ERROR' ? 'red.0' : 'gray.0'
                        }>
                            <Group justify="space-between" mb="xs">
                                <Title order={5}>Calculation Status</Title>
                                {results.status && (
                                    <Badge
                                        size="lg"
                                        color={
                                            results.status === 'SUCCESS' ? 'green' :
                                            results.status === 'WARNING' ? 'yellow' : 'red'
                                        }
                                    >
                                        {results.status}
                                    </Badge>
                                )}
                            </Group>
                            <Text size="sm" c="dimmed">
                                {results.message || 'Click Calculate to see results'}
                            </Text>
                        </Paper>

                        {/* Key Metrics */}
                        {results.status && (
                            <>
                                <Paper withBorder p="md" radius="md">
                                    <Title order={5} mb="md">Offer Summary (TZS)</Title>
                                    <Stack gap="sm">
                                        <Group justify="space-between">
                                            <Text fw={500}>Exposure Offered:</Text>
                                            <Text fw={700} c="blue">{number(results.soExposureTz)}</Text>
                                        </Group>
                                        <Group justify="space-between">
                                            <Text fw={500}>Premium Offered:</Text>
                                            <Text fw={700} c="blue">{number(results.soPremiumTz)}</Text>
                                        </Group>
                                        <Divider />
                                        <Group justify="space-between">
                                            <Text fw={500}>Exposure Accepted:</Text>
                                            <Text fw={700} c="green">{number(results.saExposureTz)}</Text>
                                        </Group>
                                        <Group justify="space-between">
                                            <Text fw={500}>Premium Accepted:</Text>
                                            <Text fw={700} c="green">{number(results.saPremiumTz)}</Text>
                                        </Group>
                                    </Stack>
                                </Paper>

                                <Paper withBorder p="md" radius="md" bg="blue.0">
                                    <Title order={5} mb="md">Retention Breakdown</Title>
                                    <Stack gap="sm">
                                        <div>
                                            <Group justify="space-between" mb={4}>
                                                <Text size="sm" fw={600}>TAN-RE Retention</Text>
                                                <Badge variant="light">{number(offerStore.tanReRetentionPct)}%</Badge>
                                            </Group>
                                            <Group justify="space-between">
                                                <Text size="sm" c="dimmed">Exposure:</Text>
                                                <Text size="sm" fw={500}>{number(results.tanReRetExposureTz)}</Text>
                                            </Group>
                                            <Group justify="space-between">
                                                <Text size="sm" c="dimmed">Premium:</Text>
                                                <Text size="sm" fw={500}>{number(results.tanReRetPremiumTz)}</Text>
                                            </Group>
                                        </div>

                                        <Divider />

                                        <div>
                                            <Group justify="space-between" mb={4}>
                                                <Text size="sm" fw={600}>Surplus Retro</Text>
                                                <Badge variant="light" color="orange">{number(offerStore.suRetroPct)}%</Badge>
                                            </Group>
                                            <Group justify="space-between">
                                                <Text size="sm" c="dimmed">Exposure:</Text>
                                                <Text size="sm" fw={500}>{number(results.suRetroExposureTz)}</Text>
                                            </Group>
                                            <Group justify="space-between">
                                                <Text size="sm" c="dimmed">Premium:</Text>
                                                <Text size="sm" fw={500}>{number(results.suRetroPremiumTz)}</Text>
                                            </Group>
                                        </div>

                                        <Divider />

                                        <div>
                                            <Group justify="space-between" mb={4}>
                                                <Text size="sm" fw={600}>Fac Retro</Text>
                                                <Badge variant="light" color="grape">{number(offerStore.facRetroPct)}%</Badge>
                                            </Group>
                                            <Group justify="space-between">
                                                <Text size="sm" c="dimmed">Exposure:</Text>
                                                <Text size="sm" fw={500}>{number(results.facRetroExposureTz)}</Text>
                                            </Group>
                                            <Group justify="space-between">
                                                <Text size="sm" c="dimmed">Premium:</Text>
                                                <Text size="sm" fw={500}>{number(results.facRetroPremiumTz)}</Text>
                                            </Group>
                                        </div>
                                    </Stack>
                                </Paper>
                            </>
                        )}
                    </Stack>
                </Grid.Col>
            </Grid>
            </Box>
            </Accordion.Panel>
            </Accordion.Item>
            )}

            {/* Policy Cession Form */}
            {selectedTypes.includes('policy-cession') && (
            <Accordion.Item value="policy-cession">
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
            )}

            {/* Treaty Form */}
            {selectedTypes.includes('treaty') && (
            <Accordion.Item value="treaty">
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
            )}
            </Accordion>
        </Container>
    );
}


