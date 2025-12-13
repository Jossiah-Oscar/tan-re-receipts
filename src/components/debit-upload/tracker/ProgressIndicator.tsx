import { Progress, Text, Group, Stack } from '@mantine/core';

interface ProgressIndicatorProps {
    collected: number;
    total: number;
    size?: 'sm' | 'md' | 'lg';
}

export function ProgressIndicator({ collected, total, size = 'md' }: ProgressIndicatorProps) {
    const percentage = total > 0 ? (collected / total) * 100 : 0;
    const isComplete = collected === total;

    return (
        <Stack gap="xs">
            <Group justify="space-between">
                <Text size="sm" fw={500}>
                    Document Progress
                </Text>
                <Text size="sm" c={isComplete ? 'green' : 'orange'} fw={600}>
                    {collected}/{total} documents
                </Text>
            </Group>
            <Progress
                value={percentage}
                color={isComplete ? 'green' : 'orange'}
                size={size}
                animated={!isComplete}
            />
            <Text size="xs" c="dimmed" ta="right">
                {percentage.toFixed(0)}% complete
            </Text>
        </Stack>
    );
}
