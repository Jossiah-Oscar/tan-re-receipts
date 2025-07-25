import {Card, Stack, Text, Title, Group} from '@mantine/core';
import { IconCash } from '@tabler/icons-react';


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

export function ClaimStatCard({ claimsAmount, cardName}: ClaimsCardProps) {
    // const TrendIcon = trend === 'up' ? IconTrendingUp : IconTrendingDown;

    return (
        <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Group justify="center" align="flex-start" wrap="nowrap">
                <Stack gap="xs" justify="center">

                    <Group justify="center">

                        <Text size="lg" c="dimmed">
                            {cardName}
                        </Text>
                    </Group>

                    <Group justify="center">

                        <IconCash size={98} color="green" />

                    </Group>

                    <Group gap={4} c="black">
                        {/*<TrendIcon size={16} style={{ flexShrink: 0 }} />*/}
                        <Text size="xl">TZS {claimsAmount.toLocaleString()}</Text>
                    </Group>

                    {/*<Group gap={4} c="dimmed">*/}
                    {/*    /!*<TrendIcon size={16} style={{ flexShrink: 0 }} />*!/*/}
                    {/*    <Text size="xl">TZS {claimsAmount.toLocaleString()}</Text>*/}

                    {/*</Group>*/}

                </Stack>
            </Group>
        </Card>
    );
}