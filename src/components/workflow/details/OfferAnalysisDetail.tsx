'use client';

import {
  Stack, Paper, Text, Group, ThemeIcon, Badge, Divider,
  SimpleGrid, Loader, Center, ScrollArea
} from '@mantine/core';
import {
  IconFileCheck, IconBuildingBank, IconCoin
} from '@tabler/icons-react';
import { ProcessDetailProps } from '@/types/workflow';

type OfferAnalysisData = {
  offer: {
    id: number;
    rmsNumber: string;
    cedant: string;
    insured: string;
    broker: string;
    country: string;
    occupation: string;
    currencyCode: string;
    exchangeRate: number;
    periodFrom: string;
    periodTo: string;
    offerReceivedDate: string;
    sumInsured: number;
    premium: number;
    rateDecimal: number;
    shareOfferedPct: number;
    notes: string;
  };
  analysis: {
    id: number;
    type?: 'facultative' | 'policy-cession';
    tanreSharePercent: number;
    tanreExposure: number;
    tanrePremium: number;
    acceptedSharePercent: number;
    acceptedExposure: number;
    acceptedPremium: number;
    retentionSharePercent: number;
    retentionExposure: number;
    retentionPremium: number;
    surplusSharePercent?: number;
    surplusExposure?: number;
    surplusPremium?: number;
    facRetroPercent?: number;
    facRetroExposure?: number;
    facRetroPremium?: number;
    firstSurplusPercent?: number;
    firstSurplusExposure?: number;
    firstSurplusPremium?: number;
    secondSurplusPercent?: number;
    secondSurplusExposure?: number;
    secondSurplusPremium?: number;
    autoFacRetroPercent?: number;
    autoFacRetroExposure?: number;
    autoFacRetroPremium?: number;
    totalExposure: number;
    totalPremium: number;
  };
};

export function OfferAnalysisDetail({
  data,
  loading
}: ProcessDetailProps<OfferAnalysisData>) {
  function formatCurrency(value: number, currency: string = 'TZS') {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value) + ` ${currency}`;
  }

  function formatPercentage(value: number) {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value) + '%';
  }

  if (loading) {
    return (
      <Paper p="md" withBorder>
        <Center>
          <Stack align="center" gap="sm">
            <Loader size="sm" />
            <Text size="sm" c="dimmed">Loading offer details...</Text>
          </Stack>
        </Center>
      </Paper>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <Stack gap="md">
      {/* Offer Type Indicator */}
      {data.analysis && (
        <Paper p="md" withBorder radius="md" bg={data.analysis.type === 'policy-cession' ? 'orange.0' : 'grape.0'}>
          <Group justify="space-between" align="center">
            <Group gap="xs">
              <ThemeIcon
                size="lg"
                variant="filled"
                color={data.analysis.type === 'policy-cession' ? 'orange' : 'grape'}
              >
                <IconFileCheck size={20} />
              </ThemeIcon>
              <div>
                <Text size="xs" c="dimmed" tt="uppercase">Analysis Type</Text>
                <Text fw={700} size="lg">
                  {data.analysis.type === 'policy-cession' ? 'Policy Cession' : 'Facultative'}
                </Text>
              </div>
            </Group>
          </Group>
        </Paper>
      )}

      {/* Offer Information */}
      {data.offer && (
        <Paper p="md" withBorder radius="md" bg="blue.0">
          <Stack gap="sm">
            <Group justify="space-between">
              <Text size="md" fw={500} mb="xs">Underwriter&apos;s Comments</Text>
            </Group>
            <Divider />
            <ScrollArea h={150}>
              <Text size="sm" fw={600} mb="xs">{data.offer.notes}</Text>
            </ScrollArea>
            <Group justify="space-between">
              <Group gap="xs">
                <ThemeIcon variant="light" color="blue">
                  <IconBuildingBank size={18} />
                </ThemeIcon>
                <Text fw={500} size="md">Offer Information</Text>
              </Group>
              <Badge size="lg" variant="filled">
                {data.offer.currencyCode}
              </Badge>
            </Group>

            <Divider />

            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
              <div>
                <Text size="xs" c="dimmed" tt="uppercase">Cedant</Text>
                <Text fw={600}>{data.offer.cedant}</Text>
              </div>
              <div>
                <Text size="xs" c="dimmed" tt="uppercase">Insured</Text>
                <Text fw={600}>{data.offer.insured}</Text>
              </div>
              <div>
                <Text size="xs" c="dimmed" tt="uppercase">Country</Text>
                <Text fw={600}>{data.offer.country}</Text>
              </div>
              <div>
                <Text size="xs" c="dimmed" tt="uppercase">Broker</Text>
                <Text fw={600}>{data.offer.broker || 'N/A'}</Text>
              </div>
              <div>
                <Text size="xs" c="dimmed" tt="uppercase">Sum Insured</Text>
                <Text fw={600}>{formatCurrency(data.offer.sumInsured, data.offer.currencyCode)}</Text>
              </div>
              <div>
                <Text size="xs" c="dimmed" tt="uppercase">Premium</Text>
                <Text fw={600}>{formatCurrency(data.offer.premium, data.offer.currencyCode)}</Text>
              </div>
              <div>
                <Text size="xs" c="dimmed" tt="uppercase">Period</Text>
                <Text fw={600}>
                  {new Date(data.offer.periodFrom).toLocaleDateString()} - {new Date(data.offer.periodTo).toLocaleDateString()}
                </Text>
              </div>
              <div>
                <Text size="xs" c="dimmed" tt="uppercase">Exchange Rate</Text>
                <Text fw={600}>{data.offer.exchangeRate.toFixed(6)}</Text>
              </div>
            </SimpleGrid>
          </Stack>
        </Paper>
      )}

      {/* Analysis Breakdown */}
      {data.analysis && (
        <Paper p="md" withBorder radius="md" bg="green.0">
          <Stack gap="sm">
            <Group gap="xs">
              <ThemeIcon variant="light" color="green">
                <IconCoin size={18} />
              </ThemeIcon>
              <Text fw={500} size="md">Analysis Breakdown</Text>
            </Group>

            <Divider />

            {/* TAN-RE Share */}
            <Paper p="sm" withBorder bg="white">
              <Stack gap="xs">
                <Text fw={700} size="sm" c="blue">TAN-RE Share Offered</Text>
                <SimpleGrid cols={3} spacing="xs">
                  <div>
                    <Text size="xs" c="dimmed">Share %</Text>
                    <Text fw={600}>{formatPercentage(data.analysis.tanreSharePercent)}</Text>
                  </div>
                  <div>
                    <Text size="xs" c="dimmed">Exposure</Text>
                    <Text fw={600}>{formatCurrency(data.analysis.tanreExposure, 'TZS')}</Text>
                  </div>
                  <div>
                    <Text size="xs" c="dimmed">Premium</Text>
                    <Text fw={600}>{formatCurrency(data.analysis.tanrePremium, 'TZS')}</Text>
                  </div>
                </SimpleGrid>
              </Stack>
            </Paper>

            {/* Accepted Share */}
            <Paper p="sm" withBorder bg="white">
              <Stack gap="xs">
                <Text fw={700} size="sm" c="teal">Share Accepted by TAN-RE</Text>
                <SimpleGrid cols={3} spacing="xs">
                  <div>
                    <Text size="xs" c="dimmed">Share %</Text>
                    <Text fw={600}>{formatPercentage(data.analysis.acceptedSharePercent)}</Text>
                  </div>
                  <div>
                    <Text size="xs" c="dimmed">Exposure</Text>
                    <Text fw={600}>{formatCurrency(data.analysis.acceptedExposure, 'TZS')}</Text>
                  </div>
                  <div>
                    <Text size="xs" c="dimmed">Premium</Text>
                    <Text fw={600}>{formatCurrency(data.analysis.acceptedPremium, 'TZS')}</Text>
                  </div>
                </SimpleGrid>
              </Stack>
            </Paper>

            <Divider label="Breakdown of Accepted Share" labelPosition="center" />

            {/* Retention */}
            <Paper p="sm" withBorder bg="white">
              <Stack gap="xs">
                <Text fw={700} size="sm" c="violet">TAN-RE Retention</Text>
                <SimpleGrid cols={3} spacing="xs">
                  <div>
                    <Text size="xs" c="dimmed">Share %</Text>
                    <Text fw={600}>{formatPercentage(data.analysis.retentionSharePercent)}</Text>
                  </div>
                  <div>
                    <Text size="xs" c="dimmed">Exposure</Text>
                    <Text fw={600}>{formatCurrency(data.analysis.retentionExposure, 'TZS')}</Text>
                  </div>
                  <div>
                    <Text size="xs" c="dimmed">Premium</Text>
                    <Text fw={600}>{formatCurrency(data.analysis.retentionPremium, 'TZS')}</Text>
                  </div>
                </SimpleGrid>
              </Stack>
            </Paper>

            {/* Conditional rendering based on type */}
            {data.analysis.type === 'policy-cession' ? (
              <>
                {/* 1st Surplus */}
                <Paper p="sm" withBorder bg="white">
                  <Stack gap="xs">
                    <Text fw={700} size="sm" c="cyan">1st Surplus</Text>
                    <SimpleGrid cols={3} spacing="xs">
                      <div>
                        <Text size="xs" c="dimmed">Share %</Text>
                        <Text fw={600}>{formatPercentage(data.analysis.firstSurplusPercent || 0)}</Text>
                      </div>
                      <div>
                        <Text size="xs" c="dimmed">Exposure</Text>
                        <Text fw={600}>{formatCurrency(data.analysis.firstSurplusExposure || 0, 'TZS')}</Text>
                      </div>
                      <div>
                        <Text size="xs" c="dimmed">Premium</Text>
                        <Text fw={600}>{formatCurrency(data.analysis.firstSurplusPremium || 0, 'TZS')}</Text>
                      </div>
                    </SimpleGrid>
                  </Stack>
                </Paper>

                {/* 2nd Surplus */}
                <Paper p="sm" withBorder bg="white">
                  <Stack gap="xs">
                    <Text fw={700} size="sm" c="indigo">2nd Surplus</Text>
                    <SimpleGrid cols={3} spacing="xs">
                      <div>
                        <Text size="xs" c="dimmed">Share %</Text>
                        <Text fw={600}>{formatPercentage(data.analysis.secondSurplusPercent || 0)}</Text>
                      </div>
                      <div>
                        <Text size="xs" c="dimmed">Exposure</Text>
                        <Text fw={600}>{formatCurrency(data.analysis.secondSurplusExposure || 0, 'TZS')}</Text>
                      </div>
                      <div>
                        <Text size="xs" c="dimmed">Premium</Text>
                        <Text fw={600}>{formatCurrency(data.analysis.secondSurplusPremium || 0, 'TZS')}</Text>
                      </div>
                    </SimpleGrid>
                  </Stack>
                </Paper>

                {/* Auto Fac Retro */}
                <Paper p="sm" withBorder bg="white">
                  <Stack gap="xs">
                    <Text fw={700} size="sm" c="red">Auto Fac Retro</Text>
                    <SimpleGrid cols={3} spacing="xs">
                      <div>
                        <Text size="xs" c="dimmed">Share %</Text>
                        <Text fw={600}>{formatPercentage(data.analysis.autoFacRetroPercent || 0)}</Text>
                      </div>
                      <div>
                        <Text size="xs" c="dimmed">Exposure</Text>
                        <Text fw={600}>{formatCurrency(data.analysis.autoFacRetroExposure || 0, 'TZS')}</Text>
                      </div>
                      <div>
                        <Text size="xs" c="dimmed">Premium</Text>
                        <Text fw={600}>{formatCurrency(data.analysis.autoFacRetroPremium || 0, 'TZS')}</Text>
                      </div>
                    </SimpleGrid>
                  </Stack>
                </Paper>
              </>
            ) : (
              <>
                {/* Surplus */}
                <Paper p="sm" withBorder bg="white">
                  <Stack gap="xs">
                    <Text fw={700} size="sm" c="orange">Surplus Retro</Text>
                    <SimpleGrid cols={3} spacing="xs">
                      <div>
                        <Text size="xs" c="dimmed">Share %</Text>
                        <Text fw={600}>{formatPercentage(data.analysis.surplusSharePercent || 0)}</Text>
                      </div>
                      <div>
                        <Text size="xs" c="dimmed">Exposure</Text>
                        <Text fw={600}>{formatCurrency(data.analysis.surplusExposure || 0, 'TZS')}</Text>
                      </div>
                      <div>
                        <Text size="xs" c="dimmed">Premium</Text>
                        <Text fw={600}>{formatCurrency(data.analysis.surplusPremium || 0, 'TZS')}</Text>
                      </div>
                    </SimpleGrid>
                  </Stack>
                </Paper>

                {/* Fac Retro */}
                <Paper p="sm" withBorder bg="white">
                  <Stack gap="xs">
                    <Text fw={700} size="sm" c="red">Facultative Retro</Text>
                    <SimpleGrid cols={3} spacing="xs">
                      <div>
                        <Text size="xs" c="dimmed">Share %</Text>
                        <Text fw={600}>{formatPercentage(data.analysis.facRetroPercent || 0)}</Text>
                      </div>
                      <div>
                        <Text size="xs" c="dimmed">Exposure</Text>
                        <Text fw={600}>{formatCurrency(data.analysis.facRetroExposure || 0, 'TZS')}</Text>
                      </div>
                      <div>
                        <Text size="xs" c="dimmed">Premium</Text>
                        <Text fw={600}>{formatCurrency(data.analysis.facRetroPremium || 0, 'TZS')}</Text>
                      </div>
                    </SimpleGrid>
                  </Stack>
                </Paper>
              </>
            )}

            <Divider />

            {/* Total */}
            <Paper p="sm" withBorder bg="gray.1">
              <Group justify="space-between">
                <Text fw={700} size="md">Total</Text>
                <Group gap="xl">
                  <div>
                    <Text size="xs" c="dimmed" ta="right">Total Exposure</Text>
                    <Text fw={700} size="lg">{formatCurrency(data.analysis.totalExposure, 'TZS')}</Text>
                  </div>
                  <div>
                    <Text size="xs" c="dimmed" ta="right">Total Premium</Text>
                    <Text fw={700} size="lg">{formatCurrency(data.analysis.totalPremium, 'TZS')}</Text>
                  </div>
                </Group>
              </Group>
            </Paper>
          </Stack>
        </Paper>
      )}
    </Stack>
  );
}
