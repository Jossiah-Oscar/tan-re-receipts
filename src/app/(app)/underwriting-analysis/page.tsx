'use client'

import { useDropdownStore, useOfferStore } from "@/store/useOfferAnalysisStore";
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
    Title
} from "@mantine/core";
import {DatePicker, DatePickerInput, DateTimePicker} from "@mantine/dates";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import { useEffect } from "react";

export default function FacultativeOfferForm() {
    // Store hooks
    const dropdownStore = useDropdownStore();
    const offerStore = useOfferStore();

    // Mantine form with store integration
    const form = useForm({
        initialValues: offerStore.getInitialValues(),
        validate: offerStore.validateForm,
    });

    // Load dropdown data on mount
    useEffect(() => {
        dropdownStore.loadDropdownData();
    }, []);

    // Handle form submission
    const handleSubmit = async (values: any) => {
        try {
            const success = await offerStore.submitForm(values);

            if (success) {
                showNotification({
                    title: 'Success',
                    message: 'Offer analysis saved successfully',
                    color: 'green',
                });
                form.reset();
                offerStore.resetForm();
            }
        } catch (error) {
            showNotification({
                title: 'Error',
                message: offerStore.error || 'Failed to save offer analysis',
                color: 'red',
            });
        }
    };

    // Handle calculate button
    const handleCalculate = async () => {
        try {
            // Update store with current form values first
            offerStore.setValues(form.values);

            await offerStore.calculateValues();

            // Update form with calculated values
            form.setValues(offerStore.getInitialValues());

            // Show notification based on calculation status
            showNotification({
                title: offerStore.calculationStatus || 'Success',
                message: offerStore.calculationMessage || 'Values calculated successfully',
                color: offerStore.calculationStatus === 'SUCCESS' ? 'blue' :
                    offerStore.calculationStatus === 'WARNING' ? 'yellow' : 'red'
            });

        } catch (error) {
            showNotification({
                title: 'Error',
                message: offerStore.error || 'Calculation failed',
                color: 'red',
            });
        }
    };

    return (
        <Box maw={1200} mx="auto" mt="xl">
            <Paper shadow="sm" p="lg" pos="relative">
                <LoadingOverlay visible={dropdownStore.loading || offerStore.loading} />

                <Title order={2} mb="lg">Offer Analysis</Title>

                <form onSubmit={form.onSubmit(handleSubmit)}>
                    {/* Basic Information */}
                    <Title order={4} mb="md">Basic Information</Title>
                    <Grid gutter="md" mb="lg">
                        {/*<Grid.Col span={6}>*/}
                        {/*    <TextInput*/}
                        {/*        label="Cedant"*/}
                        {/*        placeholder="Enter cedant name"*/}
                        {/*        {...form.getInputProps('cedant')}*/}
                        {/*        required*/}
                        {/*    />*/}
                        {/*</Grid.Col>*/}
                        <Grid.Col span={6}>
                        <Select
                            label="Cedant"
                            placeholder="Select cedant name"
                            data={dropdownStore.getCedantSelectData()}
                            {...form.getInputProps('cedant')}
                            searchable
                            required
                        />
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <DateTimePicker
                                label="Date Time Created"
                                placeholder="Select date and time"
                                {...form.getInputProps('dateTimeCreated')}
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
                        <Grid.Col span={4}>
                            <Select
                                label="Business Class"
                                placeholder="Select business class"
                                data={dropdownStore.getClassSelectData()}
                                {...form.getInputProps('businessClassId')}
                                required
                            />
                        </Grid.Col>
                        <Grid.Col span={4}>
                            <Select
                                label="Contract Type"
                                placeholder="Select contract type"
                                data={dropdownStore.getContractTypeSelectData()}
                                {...form.getInputProps('contractTypeId')}
                                required
                            />
                        </Grid.Col>
                        <Grid.Col span={4}>
                            <TextInput
                                label="Country"
                                placeholder="Enter country"
                                {...form.getInputProps('country')}
                                required
                            />
                        </Grid.Col>
                    </Grid>

                    <Divider my="lg" />

                    {/* Policy Period */}
                    <Title order={4} mb="md">Policy Period</Title>
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
                    <Title order={4} mb="md">Financial Information</Title>
                    <Grid gutter="md" mb="lg">
                        <Grid.Col span={6}>
                            <Select
                                label="Currency"
                                placeholder="Select currency"
                                data={dropdownStore.getCurrencySelectData()}
                                {...form.getInputProps('currencyCode')}
                                required
                            />

                        </Grid.Col>
                        <Grid.Col span={6}>
                            <NumberInput
                                label="Exchange Rate"
                                placeholder="1"
                                decimalScale={2}
                                defaultValue={1}
                                {...form.getInputProps('exchangeRate')}
                                required
                            />

                        </Grid.Col>
                        <Grid.Col span={6}>
                            <NumberInput
                                label="Sum Insured (Original Currency)"
                                placeholder="0.00"
                                decimalScale={2}
                                thousandSeparator=","
                                defaultValue={1_000_000}
                                min={0}
                                {...form.getInputProps('sumInsuredOs')}
                            />
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <NumberInput
                                label="Premium (Original Currency)"
                                placeholder="0.00"
                                decimalScale={2}
                                thousandSeparator=","
                                defaultValue={1_000_000}
                                min={0}
                                {...form.getInputProps('premiumOs')}
                            />
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <NumberInput
                                label="Sum Insured (TZS)"
                                placeholder="0.00"
                                thousandSeparator=","
                                decimalScale={2}
                                {...form.getInputProps('sumInsuredTz')}
                                readOnly
                            />
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <NumberInput
                                label="Premium (TZS)"
                                placeholder="0.00"
                                thousandSeparator=","
                                decimalScale={2}
                                {...form.getInputProps('premiumTz')}
                                readOnly
                            />
                        </Grid.Col>
                    </Grid>

                    <Divider my="lg" />

                    {/* Share Information */}
                    <Title order={4} mb="md">Share Information</Title>
                    <Grid gutter="md" mb="lg">
                        <Grid.Col span={4}>
                            <NumberInput
                                label="Share Offered %"
                                placeholder="0.00"
                                decimalScale={2}
                                min={0}
                                max={100}
                                {...form.getInputProps('shareOfferedPct')}
                            />
                        </Grid.Col>
                        <Grid.Col span={4}>
                            <NumberInput
                                label="SO Exposure (TZS)"
                                placeholder="0.00"
                                decimalScale={2}
                                thousandSeparator=","
                                {...form.getInputProps('soExposureTz')}
                                readOnly
                            />
                        </Grid.Col>
                        <Grid.Col span={4}>
                            <NumberInput
                                label="SO Premium (TZS)"
                                placeholder="0.00"
                                decimalScale={2}
                                thousandSeparator=","
                                {...form.getInputProps('soPremiumTz')}
                                readOnly
                            />
                        </Grid.Col>
                        <Grid.Col span={4}>
                            <NumberInput
                                label="Share Accepted %"
                                placeholder="0.00"
                                decimalScale={2}
                                min={0}
                                max={100}
                                {...form.getInputProps('shareAcceptedPct')}
                            />
                        </Grid.Col>
                        <Grid.Col span={4}>
                            <NumberInput
                                label="SA Exposure (TZS)"
                                placeholder="0.00"
                                decimalScale={2}
                                thousandSeparator=","
                                {...form.getInputProps('saExposureTz')}
                                readOnly
                            />
                        </Grid.Col>
                        <Grid.Col span={4}>
                            <NumberInput
                                label="SA Premium (TZS)"
                                placeholder="0.00"
                                decimalScale={2}
                                thousandSeparator=","
                                {...form.getInputProps('saPremiumTz')}
                                readOnly
                            />
                        </Grid.Col>
                    </Grid>

                    <Divider my="lg" />

                    {/* Retrocession Information */}
                    <Title order={4} mb="md">Retrocession Information</Title>
                    <Grid gutter="md" mb="lg">
                        {/* TAN Re Retention */}
                        <Grid.Col span={4}>
                            <NumberInput
                                label="TAN Re Retention %"
                                placeholder="0.00"
                                decimalScale={2}
                                min={0}
                                max={100}
                                {...form.getInputProps('tanReRetentionPct')}
                            />
                        </Grid.Col>
                        <Grid.Col span={4}>
                            <NumberInput
                                label="TAN Re Exposure (TZS)"
                                placeholder="0.00"
                                thousandSeparator=","
                                defaultValue={1_000_000}
                                decimalScale={2}
                                {...form.getInputProps('tanReRetExposureTz')}
                                readOnly
                            />
                        </Grid.Col>
                        <Grid.Col span={4}>
                            <NumberInput
                                label="TAN Re Premium (TZS)"
                                placeholder="0.00"
                                thousandSeparator=","
                                decimalScale={2}
                                {...form.getInputProps('tanReRetPremiumTz')}
                                readOnly
                            />
                        </Grid.Col>

                        {/* Surplus Retro */}
                        <Grid.Col span={4}>
                            <NumberInput
                                label="Surplus Retro %"
                                placeholder="0.00"
                                decimalScale={2}
                                min={0}
                                max={100}
                                {...form.getInputProps('suRetroPct')}
                            />
                        </Grid.Col>
                        <Grid.Col span={4}>
                            <NumberInput
                                label="SU Retro Exposure (TZS)"
                                placeholder="0.00"
                                thousandSeparator=","
                                decimalScale={2}
                                {...form.getInputProps('suRetroExposureTz')}
                                readOnly
                            />
                        </Grid.Col>
                        <Grid.Col span={4}>
                            <NumberInput
                                label="SU Retro Premium (TZS)"
                                placeholder="0.00"
                                decimalScale={2}
                                thousandSeparator=","
                                {...form.getInputProps('suRetroPremiumTz')}
                                readOnly
                            />
                        </Grid.Col>

                        {/* Facultative Retro */}
                        <Grid.Col span={4}>
                            <NumberInput
                                label="Facultative Retro %"
                                placeholder="0.00"
                                decimalScale={2}
                                min={0}
                                max={100}
                                {...form.getInputProps('facRetroPct')}
                            />
                        </Grid.Col>
                        <Grid.Col span={4}>
                            <NumberInput
                                label="FAC Retro Exposure (TZS)"
                                placeholder="0.00"
                                thousandSeparator=","
                                decimalScale={2}
                                {...form.getInputProps('facRetroExposureTz')}
                                readOnly
                            />
                        </Grid.Col>
                        <Grid.Col span={4}>
                            <NumberInput
                                label="FAC Retro Premium (TZS)"
                                placeholder="0.00"
                                thousandSeparator=","
                                decimalScale={2}
                                {...form.getInputProps('facRetroPremiumTz')}
                                readOnly
                            />
                        </Grid.Col>
                    </Grid>

                    {/* Action Buttons */}
                    <Group justify="right" mt="xl">
                        <Button
                            variant="outline"
                            onClick={handleCalculate}
                            loading={offerStore.calculating}
                            disabled={!form.values.currencyCode || !form.values.exchangeRate}
                        >
                            Calculate
                        </Button>
                        <Button
                            type="submit"
                            loading={offerStore.loading}
                            disabled={!form.isValid()}
                        >
                            Submit Analysis
                        </Button>
                    </Group>
                </form>
            </Paper>
        </Box>
    );
}
