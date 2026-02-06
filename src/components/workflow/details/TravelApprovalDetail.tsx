'use client';

import { Stack, Paper, Text } from '@mantine/core';
import { ProcessDetailProps } from '@/types/workflow';

export function TravelApprovalDetail({ data, task }: ProcessDetailProps) {
  return (
    <Paper p="md" withBorder>
      <Stack gap="sm">
        <Text fw={600}>Travel Request Details</Text>
        <Text size="sm" c="dimmed">
          Travel approval UI to be implemented based on travel request data structure.
        </Text>
        {/* TODO: Implement travel-specific UI */}
      </Stack>
    </Paper>
  );
}
