"use client"

import { useEffect, useState} from "react";
import {
    Box,
    Card,
    Center,
    Container,
    Grid,
    Group,
    Loader,
    Modal, rem,
    Table,
    Text
} from "@mantine/core";
import {StatCard} from "@/components/dashboard/gwpCard";
import {ClaimStatCard} from "@/components/dashboard/claimCard";
import GwpMonthlyCard from "@/components/dashboard/gwpTable";
import { IconDotsVertical, } from "@tabler/icons-react";
import {formatShortNumber} from "@/utils/format";
import {BarChart, CartesianGrid, XAxis, YAxis, Legend, Bar, Tooltip, ResponsiveContainer} from "recharts";
import useDashboardStore from "@/store/useDashboardStore"


export default function Dashboard() {
    const [opened, setOpened] = useState(false);
    const [openedYearModal, setOpenedYearModal] = useState(false);


    const {
        gwp,
        gwpYear,
        claims,
        claimYear,
        gwpList,
        gwpTrends,
        cedantBalance,
        loading,
        fetchDashboardData
    } = useDashboardStore()

    const monthlyTarget = 336_903_845_564 / 12;
    const yearlyTarget: number = 336903845564;

    useEffect(() => {
      fetchDashboardData()
    }, [fetchDashboardData]);


    if (gwp === null || gwpYear === null) return <Center><Loader variant="bars" /> </Center>;

    const progress = (gwp / monthlyTarget) * 100;
    const yearProgress =  (gwpYear / yearlyTarget) * 100

    // @ts-ignore
    return (
        <>
        <Container size="xl" py="sm" color={'red'}>

            <div className="p-6">
                <Text size="xl" fw={700} mb="md">Dashboard Overview</Text>

                <Grid>
                    <Grid.Col span={{ base: 12, md: 3 }}>
                        <Box onClick={() => setOpened(true)} style={{ cursor: 'pointer' }}>
                        <StatCard
                            cardName={'Current Month GWP'}
                            currentGwp={gwp}
                            targetGwp={monthlyTarget}
                            progress={Number(progress.toFixed(2))}
                            month={'June'} // Or make dynamic
                        />
                        </Box>
                    </Grid.Col>

                    <Grid.Col span={{ base: 12, md: 3 }}>
                        <Box onClick={() => setOpenedYearModal(true)} style={{ cursor: 'pointer' }}>
                        <StatCard
                            cardName={'Current Year GWP'}
                                    currentGwp={gwpYear!}
                                    targetGwp={yearlyTarget}
                                    progress={Number(yearProgress.toFixed(2))}
                                    month={'June'} // Or make dynamic
                        />
                        </Box>
                    </Grid.Col>

                    <Grid.Col span={{ base: 12, md: 3 }}>
                        <ClaimStatCard
                            claimsAmount={claims!}
                            cardName="Claims Payout this month"
                        />
                    </Grid.Col>

                    <Grid.Col span={{ base: 12, md: 3 }}>
                        <ClaimStatCard
                          claimsAmount={claimYear!}
                          cardName="Claims Payout this Year"
                        />
                    </Grid.Col>

                    {/* Charts Section */}
                    <Grid.Col span={{ base: 12, md: 12 }}>
                        <Card shadow="sm" padding="lg" radius="md" withBorder>
                            <Group justify="space-between" mb="md">
                                <Text fw={600}>Current Year vs Last Year Premium Trend</Text>
                            </Group>

                            <ResponsiveContainer width="100%" height={400}>
                                <BarChart data={gwpTrends}>
                                    height={300}
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <Tooltip />
                                    <YAxis
                                        tickFormatter={(value) =>
                                            new Intl.NumberFormat('en-US', {
                                                notation: 'compact',
                                                maximumFractionDigits: 1,
                                            }).format(value)
                                        }
                                    />
                                    <Legend />
                                    <Bar dataKey="lastYearPremium" name="Last Year Premium" fill="#3b82f6" /> {/* blue.6 */}
                                    <Bar dataKey="thisYearPremium" name="This Year Premium" fill="#7c3aed" /> {/* violet.6 */}
                                </BarChart>
                            </ResponsiveContainer>
                        </Card>
                    </Grid.Col>

                    {/* Top Ten Cedants */}
                    <Grid.Col span={{ base: 12, md: 5 }}>
                        <Card shadow="sm" padding="lg" radius="md" withBorder>
                            <Group justify="space-between" mb="md">
                                <Text fw={600}>2025 Top 10 Cedant by GWP</Text>
                                {/*<Text size="xs" c="dimmed">Showing latest 5 of 125 claims</Text>*/}
                            </Group>
                            <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                            <Table striped>
                                <Table.Thead>
                                    <Table.Tr>
                                        <Table.Th>Cedant</Table.Th>
                                        <Table.Th>Amount</Table.Th>
                                        <Table.Th />
                                    </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>
                                    {gwpList.map((cedant) => (
                                        <Table.Tr key={cedant.cedantCode}>
                                            <Table.Td>{cedant.cedantName}</Table.Td>
                                            <Table.Td>
                                                <Text fw={500}>
                                                {formatShortNumber(cedant.totalBookedPremium)}
                                                </Text>
                                            </Table.Td>
                                            <Table.Td>
                                                {/*<ActionIcon variant="subtle" color="gray">*/}
                                                <IconDotsVertical style={{ width: rem(16), height: rem(16) }} />
                                                {/*</ActionIcon>*/}
                                            </Table.Td>
                                        </Table.Tr>
                                    ))}
                                </Table.Tbody>
                            </Table>
                            </div>
                        </Card>
                    </Grid.Col>

                    {/* Outstanding Balances */}
                    <Grid.Col span={{ base: 12, md: 7 }}>
                        <Card shadow="sm" padding="lg" radius="md" withBorder>
                            <Group justify="space-between" mb="md">
                                <Text fw={600}>Local Cedant Outstanding Balances Since 2021</Text>
                                {/*<Text size="xs" c="dimmed">Showing latest 5 of 125 claims</Text>*/}
                            </Group>

                            <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                            <Table striped>
                                <Table.Thead>
                                    <Table.Tr>
                                        <Table.Th>Cedant</Table.Th>
                                        <Table.Th>Amount</Table.Th>
                                        <Table.Th />
                                    </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>
                                    {cedantBalance.map((cedant) => (
                                        <Table.Tr key={cedant.brokerCedantName}>
                                            <Table.Td>{cedant.brokerCedantName}</Table.Td>
                                            <Table.Td>
                                                <Text fw={500}>
                                                TZS {new Intl.NumberFormat('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(cedant.balanceRepCcy)}
                                                    </Text>
                                            </Table.Td>
                                            <Table.Td>
                                                {/*<ActionIcon variant="subtle" color="gray">*/}
                                                <IconDotsVertical style={{ width: rem(16), height: rem(16) }} />
                                                {/*</ActionIcon>*/}
                                            </Table.Td>
                                        </Table.Tr>
                                    ))}
                                </Table.Tbody>
                            </Table>
                            </div>
                        </Card>
                    </Grid.Col>
                </Grid>
            </div>
        </Container>


            {/* The Modal with the table */}
            <Modal
                opened={opened}
                onClose={() => setOpened(false)}
                size="lg"
                centered
            >
                <GwpMonthlyCard endPoint={"/api/dashboard/month/performance"} cardName={"GWP Performance – Current Month"}/>

            </Modal>

            {/* The Modal with the table */}
            <Modal
                opened={openedYearModal}
                onClose={() => setOpenedYearModal(false)}
                size="lg"
                centered
            >
                <GwpMonthlyCard endPoint={"/api/dashboard/year/performance"} cardName={"GWP Performance – Current Year"}/>

            </Modal>
        </>

    );
}