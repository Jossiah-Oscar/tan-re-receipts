import { Card, Text, Title } from '@mantine/core';


interface ClaimsCardProps {
    claimsAmount: number;
}

export default function ClaimsCard({ claimsAmount }: ClaimsCardProps) {
    return (
        <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Title order={4} mb="xs">Total Claims (YTD)</Title>
            <Text w={700} size="xl" color="red">TZS {claimsAmount.toLocaleString()}</Text>
            <Text size="sm" color="dimmed">Year to date claim payout</Text>
        </Card>
    );
}