'use client';

import { Stack, Text, Paper, Code } from '@mantine/core';
import { ProcessDetailProps } from '@/types/workflow';

export function GenericProcessDetail({ data, task }: ProcessDetailProps) {
  return (
    <Paper p="md" withBorder>
      <Stack gap="sm">
        <Text size="sm" c="dimmed">
          No specific detail view configured for this process type.
        </Text>

        {task.variables && Object.keys(task.variables).length > 0 && (
          <>
            <Text size="sm" fw={600}>Task Variables:</Text>
            <Code block>
              {JSON.stringify(task.variables, null, 2)}
            </Code>
          </>
        )}
      </Stack>
    </Paper>
  );
}
