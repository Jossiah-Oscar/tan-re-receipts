"use client";

import {
    TextInput,
    NumberInput,
    Button,
    Box,
    Group,
    Grid,
    Accordion,
    Notification,
    Title
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useState } from 'react';
import axios from 'axios';
import {DateInput} from "@mantine/dates";

export default function NewPolicyForm() {
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const form = useForm({
        initialValues: {
            locationCode: '',
            contractNumber: '',
            underwritingYear: new Date().getFullYear(),
            portfolioType: '',
            typeOfContract: '',
            sourceOfBusiness: '',
            insuredName: '',
            lobCode: '',
            typeOfBusinessCode: '',
            riskRegionCode: '',
            riskCountryCode: '',
            accountHandler: '',
            inceptionDate: new Date(),
            expiryDate: new Date(),
            newBusinessInd: '',
            processingType: '',
            shareWritten: 100,
            shareSigned: 100,
        },
    });

    const handleSubmit = async (values: typeof form.values) => {
        try {
            await axios.post('/api/inwards-policies', values);
            setSuccess(true);
            form.reset();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Submission failed');
        }
    };

    return (
        <Box maw={900} mx="auto" mt="xl">
            <Title order={2} ta="center" mb="lg">
                Create New Inwards Policy
            </Title>
            <form onSubmit={form.onSubmit(handleSubmit)}>
                <Accordion defaultValue="basic-info" variant="separated" radius="md">
                    <Accordion.Item value="basic-info">
                        <Accordion.Control>Basic Information</Accordion.Control>
                        <Accordion.Panel>
                            <Grid>
                                <Grid.Col span={{ base: 12, md: 4 }}>
                                    <TextInput label="Location Code" {...form.getInputProps('locationCode')} />
                                </Grid.Col>
                                <Grid.Col span={{ base: 12, md: 4 }}>
                                    <TextInput label="Contract Number" {...form.getInputProps('contractNumber')} />
                                </Grid.Col>
                                <Grid.Col span={{ base: 12, md: 4 }}>
                                    <NumberInput label="Underwriting Year" {...form.getInputProps('underwritingYear')} />
                                </Grid.Col>
                            </Grid>
                        </Accordion.Panel>
                    </Accordion.Item>

                    <Accordion.Item value="policy-details">
                        <Accordion.Control>Policy Details</Accordion.Control>
                        <Accordion.Panel>
                            <Grid>
                                <Grid.Col span={{ base: 12, md: 4 }}>
                                    <TextInput label="Portfolio Type" {...form.getInputProps('portfolioType')} />
                                </Grid.Col>
                                <Grid.Col span={{ base: 12, md: 4 }}>
                                    <TextInput label="Type of Contract" {...form.getInputProps('typeOfContract')} />
                                </Grid.Col>
                                <Grid.Col span={{ base: 12, md: 4 }}>
                                    <TextInput label="Source of Business" {...form.getInputProps('sourceOfBusiness')} />
                                </Grid.Col>
                                <Grid.Col span={12}>
                                    <TextInput label="Insured Name" {...form.getInputProps('insuredName')} />
                                </Grid.Col>
                            </Grid>
                        </Accordion.Panel>
                    </Accordion.Item>

                    <Accordion.Item value="classification">
                        <Accordion.Control>Classification</Accordion.Control>
                        <Accordion.Panel>
                            <Grid>
                                <Grid.Col span={{ base: 12, md: 4 }}>
                                    <TextInput label="LOB Code" {...form.getInputProps('lobCode')} />
                                </Grid.Col>
                                <Grid.Col span={{ base: 12, md: 4 }}>
                                    <TextInput label="Type of Business Code" {...form.getInputProps('typeOfBusinessCode')} />
                                </Grid.Col>
                                <Grid.Col span={{ base: 12, md: 4 }}>
                                    <TextInput label="Account Handler" {...form.getInputProps('accountHandler')} />
                                </Grid.Col>
                            </Grid>
                        </Accordion.Panel>
                    </Accordion.Item>

                    <Accordion.Item value="dates">
                        <Accordion.Control>Policy Dates</Accordion.Control>
                        <Accordion.Panel>
                            <Grid>
                                <Grid.Col span={{ base: 12, md: 6 }}>
                                    <DateInput
                                        label="Inception Date"
                                        value={form.values.inceptionDate}
                                        onChange={(val) => form.setFieldValue('inceptionDate', val!)}
                                    />
                                </Grid.Col>
                                <Grid.Col span={{ base: 12, md: 6 }}>
                                    <DateInput
                                        label="Expiry Date"
                                        value={form.values.expiryDate}
                                        onChange={(val) => form.setFieldValue('expiryDate', val!)}
                                    />
                                </Grid.Col>
                            </Grid>
                        </Accordion.Panel>
                    </Accordion.Item>

                    <Accordion.Item value="technical">
                        <Accordion.Control>Technical Details</Accordion.Control>
                        <Accordion.Panel>
                            <Grid>
                                <Grid.Col span={{ base: 12, md: 4 }}>
                                    <TextInput label="New Business Indicator" {...form.getInputProps('newBusinessInd')} />
                                </Grid.Col>
                                <Grid.Col span={{ base: 12, md: 4 }}>
                                    <TextInput label="Processing Type" {...form.getInputProps('processingType')} />
                                </Grid.Col>
                                <Grid.Col span={{ base: 12, md: 4 }}>
                                    <NumberInput label="Share Written" {...form.getInputProps('shareWritten')} />
                                </Grid.Col>
                                <Grid.Col span={{ base: 12, md: 4 }}>
                                    <NumberInput label="Share Signed" {...form.getInputProps('shareSigned')} />
                                </Grid.Col>
                            </Grid>
                        </Accordion.Panel>
                    </Accordion.Item>
                </Accordion>

                <Group mt="xl">
                    <Button type="submit">Submit Policy</Button>
                </Group>
            </form>

            {success && (
                <Notification title="Success" color="green" mt="md">
                    Policy created successfully!
                </Notification>
            )}
            {error && (
                <Notification title="Error" color="red" mt="md">
                    {error}
                </Notification>
            )}
        </Box>
    );
}

