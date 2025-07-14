'use client'

import {
    TextInput,
    NumberInput,
    Button,
    Box,
    Grid,
    Title,
    Table,
    Loader
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useState } from 'react';
import axios from 'axios';

export default function PolicySearchForm() {
    const form = useForm({
        initialValues: {
            contractNumber: '',
            insuredName: '',
            underwritingYear: null,
        },
    });

    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleSearch = async (values: typeof form.values) => {
        setLoading(true);
        try {
            const { data } = await axios.get('http://localhost:8089/api/inwards-policies/search/policy', {
                params: values,
            });
            setResults(data);
        } catch (err) {
            console.error('Search failed', err);
        }
        setLoading(false);
    };

    return (
        <Box maw={900} mx="auto" mt="xl">
            <Title order={2} ta="center" mb="lg">
                Search Inwards Policies
            </Title>

            <form onSubmit={form.onSubmit(handleSearch)}>
                <Grid>
                    <Grid.Col span={{ base: 12, md: 4 }}>
                        <TextInput label="Contract Number" {...form.getInputProps('contractNumber')} />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 4 }}>
                        <TextInput label="Insured Name" {...form.getInputProps('insuredName')} />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 4 }}>
                        <NumberInput label="Underwriting Year" {...form.getInputProps('underwritingYear')} />
                    </Grid.Col>
                </Grid>

                <Button type="submit" mt="md">Search</Button>
            </form>

            {loading && <Loader mt="lg" />}

            {!loading && results.length > 0 && (
                <Table mt="xl" striped highlightOnHover>
                    <thead>
                    <tr>
                        <th>Seq #</th>
                        <th>Contract #</th>
                        <th>Insured</th>
                        <th>Year</th>
                        <th>Share Signed</th>
                    </tr>
                    </thead>
                    <tbody>
                    {results.map((policy: any) => (
                        <tr key={policy.sequenceNumber}>
                            <td>{policy.sequenceNumber}</td>
                            <td>{policy.contractNumber}</td>
                            <td>{policy.insuredName}</td>
                            <td>{policy.underwritingYear}</td>
                            <td>{policy.shareSigned}</td>
                        </tr>
                    ))}
                    </tbody>
                </Table>
            )}
        </Box>
    );
}
