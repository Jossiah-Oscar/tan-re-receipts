"use client"
import {Card, Text, Progress, Group, Title, RingProgress, Stack} from '@mantine/core';



interface GwpCardProps {
    currentGwp: number;
    targetGwp: number;
    progress: number;
    month: string;
    cardName: string;
}

export default function GwpCard({ currentGwp, targetGwp, progress, cardName }: GwpCardProps) {
    return (
        <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Stack align="center" gap="sm">
                <Title order={4}>{cardName}</Title>

                <RingProgress
                    size={120}
                    thickness={12}
                    sections={[{ value: progress, color: 'blue' }]}
                    label={
                        <Text c="blue" fw={700} ta="center" size="xl">
                            {Math.round(progress)}%
                        </Text>
                    }
                />

                {/*<Text size="sm" c="dimmed">{progress}% of target</Text>*/}
                <Text size="lg">TZS {currentGwp.toLocaleString()}</Text>
                <Text size="sm" c="gray">Target: TZS {targetGwp.toLocaleString()}</Text>
            </Stack>
        </Card>
    );
}
