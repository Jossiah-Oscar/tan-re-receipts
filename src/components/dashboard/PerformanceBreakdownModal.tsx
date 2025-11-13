"use client";

import { Modal, Table, Stack, Group, Text, Badge, Loader, Center } from "@mantine/core";
import { formatShortNumber } from "@/utils/format";

export interface GwpPerformanceDTO {
  category: string;
  actualGwp: number | null | undefined;
  target: number | null | undefined;
  performancePercent: number | null | undefined;
}

interface PerformanceBreakdownModalProps {
  opened: boolean;
  onClose: () => void;
  type: "monthly" | "yearly";
  data: GwpPerformanceDTO[];
  loading?: boolean;
  error?: string | null;
}

export default function PerformanceBreakdownModal({
  opened,
  onClose,
  type,
  data,
  loading = false,
  error = null,
}: PerformanceBreakdownModalProps) {
  const title =
    type === "monthly"
      ? "Monthly Performance Breakdown"
      : "Yearly Performance Breakdown";

  // Helper function to safely format numbers
  const formatNumber = (value: number | null | undefined): string => {
    const num = value ?? 0;
    return num.toLocaleString();
  };

  const totalActual = data.reduce((sum, item) => sum + (item.actualGwp ?? 0), 0);
  const totalTarget = data.reduce((sum, item) => sum + (item.target ?? 0), 0);
  const overallPerformance =
    totalTarget > 0 ? (totalActual / totalTarget) * 100 : 0;

  const rows = data.map((item) => {
    const perf = item.performancePercent ?? 0;
    return (
      <Table.Tr key={item.category}>
        <Table.Td>
          <Text size="sm" fw={500}>
            {item.category}
          </Text>
        </Table.Td>
        <Table.Td align="right">
          <Text size="sm" fw={600}>
            TZS {formatNumber(item.actualGwp)}
          </Text>
        </Table.Td>
        <Table.Td align="right">
          <Text size="sm" c="dimmed">
            TZS {formatNumber(item.target)}
          </Text>
        </Table.Td>
        <Table.Td align="right">
          <Badge color={perf >= 100 ? "green" : "red"} variant="light">
            {perf.toFixed(1)}%
          </Badge>
        </Table.Td>
      </Table.Tr>
    );
  });

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={title}
      size="lg"
      scrollAreaComponent={Stack}
    >
      {loading ? (
        <Center h={200}>
          <Stack align="center" gap="md">
            <Loader size="md" variant="bars" />
            <Text c="dimmed" size="sm">
              Loading performance data...
            </Text>
          </Stack>
        </Center>
      ) : error ? (
        <Center h={200}>
          <Stack align="center" gap="md">
            <Text c="red" size="sm" fw={500}>
              Unable to load performance data
            </Text>
            <Text c="dimmed" size="xs">
              {error}
            </Text>
          </Stack>
        </Center>
      ) : data.length === 0 ? (
        <Center h={200}>
          <Text c="dimmed">No performance data available</Text>
        </Center>
      ) : (
        <Stack gap="lg">
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Category</Table.Th>
                <Table.Th align="right">Actual GWP</Table.Th>
                <Table.Th align="right">Target</Table.Th>
                <Table.Th align="right">Performance</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>{rows}</Table.Tbody>
          </Table>

          {/* Summary Footer */}
          <Group
            p="md"
            style={{ borderTop: "1px solid var(--mantine-color-gray-2)" }}
            justify="space-between"
          >
            <Stack gap={0}>
              <Text size="sm" c="dimmed">
                Total
              </Text>
              <Group gap="lg">
                <div>
                  <Text size="xs" c="dimmed">
                    Actual
                  </Text>
                  <Text size="sm" fw={700}>
                    TZS {formatNumber(totalActual)}
                  </Text>
                </div>
                <div>
                  <Text size="xs" c="dimmed">
                    Target
                  </Text>
                  <Text size="sm" fw={700}>
                    TZS {formatNumber(totalTarget)}
                  </Text>
                </div>
              </Group>
            </Stack>

            <div>
              <Text size="xs" c="dimmed" ta="center">
                Overall Performance
              </Text>
              <Badge
                size="lg"
                color={overallPerformance >= 100 ? "green" : "red"}
                variant="light"
              >
                {overallPerformance.toFixed(1)}%
              </Badge>
            </div>
          </Group>
        </Stack>
      )}
    </Modal>
  );
}
