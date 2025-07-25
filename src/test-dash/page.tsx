// 'use client'
//
// import {
//     Grid,
//     Card,
//     Text,
//     Group,
//     Stack,
//     Table,
//     rem, Progress, RingProgress, Paper,
// } from '@mantine/core';
// import { BarChart,AreaChart} from '@mantine/charts';
// import {
//     IconTrendingUp,
//     IconTrendingDown,
//     IconReceipt2,
//     IconAlertTriangle,
//     IconFileAnalytics,
//     IconUserCheck,
//     IconDotsVertical, IconReceipt, IconCash,
// } from '@tabler/icons-react';
// import {useEffect, useState} from "react";
// import {API_BASE_URL} from "@/config/api";
// import {StatCard} from "@/components/dashboard/gwpCard";
//
//  const mockChartData = [
//     { month: 'Jan', premiums: 5.0, claims: 2.1 },
//     { month: 'Feb', premiums: 5.8, claims: 2.3 },
//     { month: 'Mar', premiums: 6.2, claims: 2.5 },
//     { month: 'Apr', premiums: 6.0, claims: 2.4 },
//     { month: 'May', premiums: 7.0, claims: 2.7 },
//     { month: 'Jun', premiums: 7.8, claims: 2.8 },
//     { month: 'Jul', premiums: 7.5, claims: 2.8 },
//     { month: 'Aug', premiums: 8.0, claims: 2.9 },
// ];
//
// interface StatCardProps {
//     title: string;
//     value: string;
//     trend: 'up' | 'down';
//     trendText: string;
//     icon: React.ElementType;
//     color: string;
// }
//
// type CedantGwp = {
//     cedantName: string;
//     cedantCode: string;
//     totalBookedPremium: number;
// };
//
// type PremiumTrend = {
//     month: string;
//     thisYearPremium: number;
//     lastYearPremium: number;
// };
//
//
//
//
//
//
// export default function DashboardPage() {
//
//     const [gwpList, setGwpList] = useState<CedantGwp[]>([]);
//     const [gwpTrends, setGwpTrends] = useState<PremiumTrend[]>([]);
//
//
//     useEffect(() => {
//         fetch(`${API_BASE_URL}/api/dashboard/gwp/top-cedants`)
//             .then((res) => res.json())
//             .then((data) => setGwpList(data));
//
//         fetch(`${API_BASE_URL}/api/dashboard/monthly-trend`)
//             .then((res) => res.json())
//             .then((data) => setGwpTrends(data))
//         ;
//     }, []);
//
//     const tooltipProps = {
//         content: ({ active, payload, label }) => {
//             if (active && payload && payload.length) {
//                 return (
//                     <div style={{
//                         backgroundColor: 'white',
//                         padding: '12px',
//                         border: '1px solid #e5e7eb',
//                         borderRadius: '8px',
//                         // boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
//                         boxShadow:'box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.1)'
//                     }}>
//                         <p style={{ color: '#374151', fontWeight: '600', marginBottom: '8px' }}>
//                             {`Month: ${label}`}
//                         </p>
//                         {payload.map((entry, index) => (
//                             <p key={index} style={{
//                                 color: entry.color,
//                                 fontSize: '14px',
//                                 margin: '2px 0'
//                             }}>
//                                 {`${entry.name}: ${new Intl.NumberFormat('en-US').format(entry.value)}`}
//                             </p>
//                         ))}
//                     </div>
//                 );
//             }
//             return null;
//         }
//     };
//
//
//     return (
//         <div className="p-6">
//             <Text size="xl" fw={700} mb="md">Dashboard Overview</Text>
//
//             <Grid>
//                 <Grid.Col span={{ base: 12, md: 3 }}>
//                     <ClaimStatCard
//                         title="Current Month GWP"
//                         value="TZS 4,181,118,809.7"
//                         trend="up"
//                         trendText="12% vs last month"
//                         icon={IconReceipt2}
//                         color="teal"
//                     />
//                 </Grid.Col>
//
//                 <Grid.Col span={{ base: 12, md: 3 }}>
//                     <ClaimStatCard
//                         title="Current Year GWP"
//                         value="TZS 164,142,367,262.2"
//                         trend="down"
//                         trendText="2.1% vs last month"
//                         icon={IconAlertTriangle}
//                         color="red"
//                     />
//                 </Grid.Col>
//
//                 <Grid.Col span={{ base: 12, md: 3 }}>
//                     <ClaimStatCard
//                         title="Claim Payout this Month"
//                         value="TZS 164,142,367,262.2"
//                         trend="up"
//                         trendText="TZS 164,142,367,262.2"
//                         icon={IconFileAnalytics}
//                         color="blue"
//                     />
//                 </Grid.Col>
//
//                 <Grid.Col span={{ base: 12, md: 3 }}>
//                     <ClaimStatCard
//                         title="Claim Payout this Year"
//                         value="TZS 164,142,367,262.2"
//                         trend="up"
//                         trendText="TZS 164,142,367,262.2"
//                         icon={IconUserCheck}
//                         color="black"
//                     />
//                 </Grid.Col>
//
//                 {/* Charts Section */}
//                 <Grid.Col span={{ base: 12, md: 12 }}>
//                     <Card shadow="sm" padding="lg" radius="md" withBorder>
//                         <Group justify="space-between" mb="md">
//                             <Text fw={600}>Current Year vs Last Year Premium Trend</Text>
//                         </Group>
//
//                         <div style={{ height: 400 }}>
//                             <BarChart
//                                 h={400}
//                                 data={gwpTrends}
//                                 dataKey="month"
//                                 valueFormatter={(value) => new Intl.NumberFormat('en-US').format(value)}
//                                 withBarValueLabel
//                                 // withLegend
//                                 tooltipProps={tooltipProps}
//
//                                 barProps={{ stroke: 'none' }}
//                                 // valueLabelProps={{ position: 'inside', fill: 'white' }}
//                                 yAxisProps={{
//                                     tickFormatter: (value) => {
//                                         if (value >= 1_000_000_000) return (value / 1_000_000_000).toFixed(1) + 'B';
//                                         if (value >= 1_000_000) return (value / 1_000_000).toFixed(1) + 'M';
//                                         if (value >= 1_000) return (value / 1_000).toFixed(1) + 'K';
//                                         return value;
//                                     },
//                                 }}
//                                 series={[
//                                     { name: 'thisYearPremium', color: 'violet.6', stroke:'none'},
//                                     { name: 'lastYearPremium', color: 'blue.6' , stroke:'none' },
//                                 ]}
//                             />
//
//                         </div>
//
//
//
//                     </Card>
//                 </Grid.Col>
//
//                 {/* Recent Claims */}
//                 <Grid.Col span={{ base: 12, md: 6 }}>
//                     <Card shadow="sm" padding="lg" radius="md" withBorder>
//                         <Group justify="space-between" mb="md">
//                             <Text fw={600}>2025 Top 10 Cedant by GWP</Text>
//                             {/*<Text size="xs" c="dimmed">Showing latest 5 of 125 claims</Text>*/}
//                         </Group>
//
//                         <Table>
//                             <Table.Thead>
//                                 <Table.Tr>
//                                     <Table.Th>Cedant</Table.Th>
//                                     <Table.Th>Amount</Table.Th>
//                                     <Table.Th />
//                                 </Table.Tr>
//                             </Table.Thead>
//                             <Table.Tbody>
//                                 {gwpList.map((cedant) => (
//                                     <Table.Tr key={cedant.cedantCode}>
//                                         <Table.Td>{cedant.cedantName}</Table.Td>
//                                         <Table.Td>
//                                             TZS {new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(cedant.totalBookedPremium)}
//                                         </Table.Td>
//                                         <Table.Td>
//                                             {/*<ActionIcon variant="subtle" color="gray">*/}
//                                                 <IconDotsVertical style={{ width: rem(16), height: rem(16) }} />
//                                             {/*</ActionIcon>*/}
//                                         </Table.Td>
//                                     </Table.Tr>
//                                 ))}
//                             </Table.Tbody>
//                         </Table>
//                     </Card>
//                 </Grid.Col>
//             </Grid>
//         </div>
//     );
// }