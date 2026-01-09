'use client';

import { Container, Paper, Title, Text, Tabs, rem } from '@mantine/core';
import {
    IconBuildingFactory2,
    IconChartLine,
    IconStack2,
    IconCoin
} from '@tabler/icons-react';
import { useState } from 'react';
import BusinessTypesTable from '@/components/underwriting/BusinessTypesTable';
import LineOfBusinessTable from '@/components/underwriting/LineOfBusinessTable';
import RetroTypesTable from '@/components/underwriting/RetroTypesTable';
import CapacitiesTable from '@/components/underwriting/CapacitiesTable';

export default function CapacityUploadPage() {
    const iconStyle = { width: rem(18), height: rem(18) };

    return (
        <Container size="xl" py="md">
            <Paper shadow="sm" p="md" mb="md">
                <Title order={2}>Capacity Configuration Management</Title>
                <Text size="sm" c="dimmed" mt="xs">
                    Manage business types, lines of business, retro types, and capacity configurations
                </Text>
            </Paper>

            <Tabs defaultValue="business-types" variant="outline">
                <Tabs.List>
                    <Tabs.Tab
                        value="business-types"
                        leftSection={<IconBuildingFactory2 style={iconStyle} />}
                    >
                        Business Types
                    </Tabs.Tab>
                    <Tabs.Tab
                        value="line-of-business"
                        leftSection={<IconChartLine style={iconStyle} />}
                    >
                        Line of Business
                    </Tabs.Tab>
                    <Tabs.Tab
                        value="retro-types"
                        leftSection={<IconStack2 style={iconStyle} />}
                    >
                        Retro Types
                    </Tabs.Tab>
                    <Tabs.Tab
                        value="capacities"
                        leftSection={<IconCoin style={iconStyle} />}
                    >
                        Capacities
                    </Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="business-types" pt="md">
                    <BusinessTypesTable />
                </Tabs.Panel>

                <Tabs.Panel value="line-of-business" pt="md">
                    <LineOfBusinessTable />
                </Tabs.Panel>

                <Tabs.Panel value="retro-types" pt="md">
                    <RetroTypesTable />
                </Tabs.Panel>

                <Tabs.Panel value="capacities" pt="md">
                    <CapacitiesTable />
                </Tabs.Panel>
            </Tabs>
        </Container>
    );
}
