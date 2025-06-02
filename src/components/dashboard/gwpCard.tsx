"use client"
import { Card, Text, Progress, Group, Title } from '@mantine/core';



interface GwpCardProps {
    currentGwp: number;
    targetGwp: number;
    progress: number;
    month: string;
}

export default function GwpCard({ currentGwp, targetGwp, progress, month }: GwpCardProps) {
    return (
        <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Group justify="apart" mb="xs">
                <Title order={4}>GWP – {month}</Title>
            </Group>
            <Text size="sm" color="dimmed">{progress}% of monthly target</Text>
            <Text w={500} size="lg">TZS {currentGwp.toLocaleString()}</Text>
            <Progress value={progress} mt="md" size="lg" color="green" />
            <Text size="sm" color="gray" mt="sm">Target: TZS {targetGwp.toLocaleString()}</Text>
        </Card>
    );
}
