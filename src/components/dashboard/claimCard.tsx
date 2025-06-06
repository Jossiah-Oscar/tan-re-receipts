import {Card, Stack, Text, Title} from '@mantine/core';


interface ClaimsCardProps {
    claimsAmount: number;
    cardName: string;
}

export default function ClaimsCard({ claimsAmount, cardName}: ClaimsCardProps) {
    return (
        <Card shadow="sm" padding="lg" radius="md" withBorder>
       <Stack align="center" gap="sm">
           <Title order={4} mb="xs">{cardName}</Title>
           {/*<Text w={700} size="sm" >TZS {claimsAmount.toLocaleString()}</Text>*/}
           <Text size="lg">TZS {claimsAmount.toLocaleString()}</Text>

           <Text size="sm" color="dimmed">Claims Payout this month</Text>
       </Stack>
        </Card>
    );
}