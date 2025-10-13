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
    Badge, Textarea,
} from '@mantine/core';
import { DatePickerInput, DateTimePicker } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import { useEffect, useMemo } from 'react';
import {useReportStore} from "@/store/useReportStore";


export default function FacultativeOfferForm() {
    const dropdownStore = useDropdownStore();
    const offerStore = useOfferStore();
    const {getBrokerSelectData, getCedantSelectData, loadDropdownData} = useReportStore()

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
        <Box maw={1400} mx="auto" mt="xl">
            <Grid gutter="lg">
                <Grid.Col span={{ base: 12, md: 7 }}>
                    <Paper shadow="sm" p="lg" pos="relative">
                        <LoadingOverlay visible={isBusy} />
                        <Title order={2} mb="lg">
                            Offer Analysis
                        </Title>

                        <form onSubmit={form.onSubmit(handleSubmit)}>
                            {/* Basic Information */}
                            <Title order={4} mb="md">
                                Basic Information
                            </Title>
                            <Grid gutter="md" mb="lg">
                                <Grid.Col span={6}>
                                    <Select
                                        label="Cedant"
                                        placeholder="Select cedant"
                                        data={getCedantSelectData()}
                                        value={form.values.cedant}
                                        onChange={handleCedantChange}
                                        searchable
                                        required
                                    />
                                </Grid.Col>

                                <Grid.Col span={6}>
                                    <Select
                                        label="Broker"
                                        placeholder="Select broker"
                                        data={brokerOptions}
                                        value={form.values.broker}
                                        onChange={handleBrokerChange}
                                        searchable
                                    />
                                </Grid.Col>

                                <Grid.Col span={6}>
                                    <DatePickerInput
                                        label="Offer Received Date"
                                        placeholder="Select date and time"
                                        {...form.getInputProps('offerReceivedDate')}
                                        required
                                    />
                                </Grid.Col>

                                <Grid.Col span={6}>
                                    <TextInput
                                        label="Insured"
                                        placeholder="Enter insured name"
                                        {...form.getInputProps('insured')}
                                        required
                                    />
                                </Grid.Col>

                                <Grid.Col span={6}>
                                    <TextInput
                                        label="Occupation"
                                        placeholder="Enter occupation"
                                        {...form.getInputProps('occupation')}
                                        required
                                    />
                                </Grid.Col>

                                <Grid.Col span={6}>
                                    <TextInput
                                        label="Country"
                                        placeholder="Enter country"
                                        {...form.getInputProps('country')}
                                        required
                                    />
                                </Grid.Col>

                                <Grid.Col span={12}>
                                    <Select
                                        label="Contract Type"
                                        placeholder="Select contract type"
                                        data={dropdownStore.getContractTypeSelectData()}
                                        {...form.getInputProps('contractTypeId')}
                                        nothingFoundMessage="No contract types"
                                        required
                                    />
                                </Grid.Col>

                                <Grid.Col span={12}>
                                    <Select
                                        label="Program"
                                        placeholder="Select program"
                                        data={dropdownStore.getProgramSelectData()}
                                        {...form.getInputProps('programId')}
                                        nothingFoundMessage="No Program Found"
                                        required
                                    />
                                </Grid.Col>

                            </Grid>

                            <Divider my="lg" />

                            {/* Policy Period */}
                            <Title order={4} mb="md">
                                Policy Period
                            </Title>
                            <Grid gutter="md" mb="lg">
                                <Grid.Col span={6}>
                                    <DatePickerInput
                                        label="Period From"
                                        placeholder="Select start date"
                                        {...form.getInputProps('periodFrom')}
                                        required
                                    />
                                </Grid.Col>
                                <Grid.Col span={6}>
                                    <DatePickerInput
                                        label="Period To"
                                        placeholder="Select end date"
                                        {...form.getInputProps('periodTo')}
                                        required
                                    />
                                </Grid.Col>
                            </Grid>

                            <Divider my="lg" />

                            {/* Financial Information */}
                            <Title order={4} mb="md">
                                Financial Information
                            </Title>
                            <Grid gutter="md" mb="lg">
                                <Grid.Col span={6}>
                                    <Select
                                        label="Currency"
                                        placeholder="Select currency"
                                        data={dropdownStore.getCurrencySelectData()}
                                        value={form.values.currencyCode}
                                        onChange={handleCurrencyChange}
                                        searchable
                                        required
                                    />
                                </Grid.Col>

                                <Grid.Col span={6}>
                                    <NumberInput
                                        label="Exchange Rate"
                                        placeholder="1"
                                        decimalScale={6}
                                        min={0}
                                        value={form.values.exchangeRate}
                                        onChange={(val) => form.setFieldValue('exchangeRate', Number(val) || 1)}
                                        required
                                    />
                                </Grid.Col>

                                <Grid.Col span={6}>
                                    <NumberInput
                                        label="Sum Insured (Original Currency)"
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
                                        label="Premium (Original Currency)"
                                        placeholder="0.00"
                                        decimalScale={2}
                                        thousandSeparator=","
                                        min={0}
                                        value={form.values.premiumOs}
                                        onChange={(val) => form.setFieldValue('premiumOs', Number(val) || 0)}
                                    />
                                </Grid.Col>
                            </Grid>

                            <Divider my="lg" />

                            {/* Share Information */}
                            <Title order={4} mb="md">
                                Share Information
                            </Title>
                            <Grid gutter="md" mb="lg">
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

                                <Grid.Col span={12}>
                                    <Textarea
                                        label="Recommendation"
                                        placeholder="Please write your recommendation"
                                        {...form.getInputProps('notes')}
                                        required
                                        autosize
                                        minRows={2}
                                        maxRows={6}
                                    />
                                </Grid.Col>

                                {/*<Grid.Col span={12}>*/}
                                {/*     <Select*/}
                                {/*        label="Assign User"*/}
                                {/*        placeholder="Select User"*/}
                                {/*        data={dropdownStore.getUserSelectionData()}*/}
                                {/*        value={form.values.currencyCode}*/}
                                {/*        onChange={handleCurrencyChange}*/}
                                {/*        searchable*/}
                                {/*        required*/}
                                {/*        />*/}
                                {/*</Grid.Col>*/}
                            </Grid>

                            {/* Actions */}
                            <Group justify="right" mt="xl">
                                <Button
                                    variant="outline"
                                    onClick={handleCalculate}
                                    loading={offerStore.calculating}
                                    disabled={!form.values.currencyCode || !form.values.exchangeRate}
                                >
                                    Calculate
                                </Button>
                                <Button type="submit" loading={offerStore.loading} disabled={!form.isValid()}>
                                    Submit Analysis
                                </Button>
                            </Group>
                        </form>
                    </Paper>
                </Grid.Col>

                {/* RESULTS PANEL */}
                <Grid.Col span={{ base: 12, md: 5 }}>
                    <Stack gap="md">
                        <Paper withBorder p="md" radius="md">
                            <Group justify="space-between" mb="xs">
                                <Title order={4}>Calculation Result</Title>
                                {results.status && (
                                    <Badge
                                        color={
                                            results.status === 'SUCCESS'
                                                ? 'green'
                                                : results.status === 'WARNING'
                                                    ? 'yellow'
                                                    : 'red'
                                        }
                                    >
                                        {results.status}
                                    </Badge>
                                )}
                            </Group>
                            <div style={{ color: 'var(--mantine-color-dimmed)' }}>
                                {results.message || 'Run Calculate to see results.'}
                            </div>
                        </Paper>

                        <Paper withBorder p="md" radius="md">
                            <Title order={5} mb="sm">
                                Converted Amounts (TZS)
                            </Title>
                            <Table striped withTableBorder>
                                <Table.Tbody>
                                    <Table.Tr>
                                        <Table.Td>Sum Insured (TZS)</Table.Td>
                                        <Table.Td align="right">{number(results.sumInsuredTz)}</Table.Td>
                                    </Table.Tr>
                                    <Table.Tr>
                                        <Table.Td>Premium (TZS)</Table.Td>
                                        <Table.Td align="right">{number(results.premiumTz)}</Table.Td>
                                    </Table.Tr>
                                </Table.Tbody>
                            </Table>
                        </Paper>

                        <Paper withBorder p="md" radius="md">
                            <Title order={5} mb="sm">
                                Shares
                            </Title>
                            <Table striped withTableBorder>
                                <Table.Tbody>
                                    <Table.Tr>
                                        <Table.Td>SO Exposure (TZS)</Table.Td>
                                        <Table.Td align="right">{number(results.soExposureTz)}</Table.Td>
                                    </Table.Tr>
                                    <Table.Tr>
                                        <Table.Td>SO Premium (TZS)</Table.Td>
                                        <Table.Td align="right">{number(results.soPremiumTz)}</Table.Td>
                                    </Table.Tr>
                                    <Table.Tr>
                                        <Table.Td>SA Exposure (TZS)</Table.Td>
                                        <Table.Td align="right">{number(results.saExposureTz)}</Table.Td>
                                    </Table.Tr>
                                    <Table.Tr>
                                        <Table.Td>SA Premium (TZS)</Table.Td>
                                        <Table.Td align="right">{number(results.saPremiumTz)}</Table.Td>
                                    </Table.Tr>
                                </Table.Tbody>
                            </Table>
                        </Paper>

                        <Paper withBorder p="md" radius="md">
                            <Title order={5} mb="sm">
                                Retrocession Breakdown
                            </Title>
                            <Table striped withTableBorder>
                                <Table.Tbody>
                                    <Table.Tr>
                                        <Table.Td>TAN-RE Retention %</Table.Td>
                                        <Table.Td align="right">{number(offerStore.tanReRetentionPct)}</Table.Td>
                                    </Table.Tr>
                                    <Table.Tr>
                                        <Table.Td>TAN-RE Exposure (TZS)</Table.Td>
                                        <Table.Td align="right">{number(results.tanReRetExposureTz)}</Table.Td>
                                    </Table.Tr>
                                    <Table.Tr>
                                        <Table.Td>TAN-RE Premium (TZS)</Table.Td>
                                        <Table.Td align="right">{number(results.tanReRetPremiumTz)}</Table.Td>
                                    </Table.Tr>
                                    <Table.Tr>
                                        <Table.Td>Surplus Retro %</Table.Td>
                                        <Table.Td align="right">{number(offerStore.suRetroPct)}</Table.Td>
                                    </Table.Tr>
                                    <Table.Tr>
                                        <Table.Td>SU Retro Exposure (TZS)</Table.Td>
                                        <Table.Td align="right">{number(results.suRetroExposureTz)}</Table.Td>
                                    </Table.Tr>
                                    <Table.Tr>
                                        <Table.Td>SU Retro Premium (TZS)</Table.Td>
                                        <Table.Td align="right">{number(results.suRetroPremiumTz)}</Table.Td>
                                    </Table.Tr>
                                    <Table.Tr>
                                        <Table.Td>Fac Retro %</Table.Td>
                                        <Table.Td align="right">{number(offerStore.facRetroPct)}</Table.Td>
                                    </Table.Tr>
                                    <Table.Tr>
                                        <Table.Td>Fac Retro Exposure (TZS)</Table.Td>
                                        <Table.Td align="right">{number(results.facRetroExposureTz)}</Table.Td>
                                    </Table.Tr>
                                    <Table.Tr>
                                        <Table.Td>Fac Retro Premium (TZS)</Table.Td>
                                        <Table.Td align="right">{number(results.facRetroPremiumTz)}</Table.Td>
                                    </Table.Tr>
                                </Table.Tbody>
                            </Table>
                        </Paper>
                    </Stack>
                </Grid.Col>
            </Grid>
        </Box>
    );
}


