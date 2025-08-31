'use client'

import {useState, useEffect} from 'react';
import {
    Container,
    Paper,
    Title,
    Text,
    Group,
    Stack,
    Button,
    Select,
    Card,
    Badge,
    Grid,
    Alert,
    Progress,
    Modal,
    Loader,
    Switch,
    NumberInput
} from '@mantine/core';
import {
    IconDownload,
    IconFileSpreadsheet,
    IconCalendar,
    IconRefresh,
    IconInfoCircle,
} from '@tabler/icons-react';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import {DatePickerInput} from "@mantine/dates";
import {useReportStore} from "@/store/useReportStore";
import {BrokerOutstandingForm} from "@/components/reports/forms/broker-outstandingReport";
import {CedantOutstandingForm} from "@/components/reports/forms/cedant-outstandingReport";
import {TanreOutstandingForm} from "@/components/reports/forms/tanre-outstandingReport";
import {ClaimDocumentsForm} from "@/components/reports/forms/claim-documentReport";
import {DebitNoteReport} from "@/components/reports/forms/debit-noteReport";

const ReportDownloadInterface = () => {
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [settingsOpened, setSettingsOpened] = useState(false);
    const [reportType, setReportType] = useState<string | null>(null);
    const reportStore = useReportStore();


    useEffect(() => {
        reportStore.loadDropdownData();
    }, []);


    const [downloadHistory, setDownloadHistory] = useState([
        { name: 'Transaction Report - Aug 2024', date: '2024-08-07', status: 'completed' },
        { name: 'Summary Report - Jul 2024', date: '2024-07-15', status: 'completed' }
    ]);

    const form = useForm({
        initialValues: reportStore.getClientFormInitialValues(),
    });

    const reportTypes = [
        { value: 'broker_outstanding', label: 'Broker Outstanding Statement' },
        { value: 'cedant_outstanding', label: 'Cedant Outstanding Statement' },
        { value: 'tanre_outstanding', label: 'Outstanding Transaction Statement' },
        { value: 'claim_documents', label: 'Claim Documents Status Report' },
        { value: 'debit_note_report', label: 'Debit/Credit Status Report' },
    ];

    const handleReset = () => {
        form.reset();
        notifications.show({
            title: 'Form Reset',
            message: 'All filters have been cleared',
            color: 'blue'
        });
    };

    return (
        <>
        <Container size="xl" >
            {/* Header Section */}
            <Paper shadow="xs" p="xl" mb="xl" style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white'
            }}>
                <Group justify="space-between" align="center">
                    <div>
                        <Title order={1} size="h2" mb="xs">
                            TAN-RE Report Download Center
                        </Title>
                        <Text size="lg" opacity={0.9}>
                            Generate and download reports
                        </Text>
                    </div>
                    <Group>
                        <Badge size="lg" color="rgba(255,255,255,0.2)" variant="light">
                            Excel Reports
                        </Badge>
                        {/*<ActionIcon*/}
                        {/*    size="lg"*/}
                        {/*    variant="light"*/}
                        {/*    color="white"*/}
                        {/*    onClick={() => setSettingsOpened(true)}*/}
                        {/*>*/}
                        {/*    <IconSettings size={20} />*/}
                        {/*</ActionIcon>*/}
                    </Group>
                </Group>
            </Paper>

            <Grid>
                {/* Main Form Section */}
                <Grid.Col span={{ base: 12, md: 8 }}>
                    <Paper shadow="sm" p="xl" radius="md">
                        <div>
                            <Stack gap="lg">
                                {/* Report Type Selection */}
                                <div>
                                    <Title order={3} mb="md" c="dark.7">
                                        <IconFileSpreadsheet size={24} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                                        Report Configuration
                                    </Title>

                                    <Select
                                        label="Report Type"
                                        placeholder="Choose the type of report to generate"
                                        data={reportTypes}
                                        searchable
                                        size="md"
                                        leftSection={<IconFileSpreadsheet size={16} />}
                                        // value={form.values.reportType}
                                        {...form.getInputProps('reportType')}
                                        // onChange={(value) => {
                                        //     form.setFieldValue('reportType', value);
                                        // }}
                                    />
                                </div>

                                {/* Progress Bar */}
                                {loading && (
                                    <Alert color="blue" icon={<IconInfoCircle size={16} />}>
                                        <Text size="sm" mb="xs">Generating your report...</Text>
                                        <Progress value={progress} size="sm" animated />
                                    </Alert>
                                )}

                                {form.values.reportType === "broker_outstanding" && <BrokerOutstandingForm />}
                                {form.values.reportType === "cedant_outstanding" && <CedantOutstandingForm />}
                                {form.values.reportType === "tanre_outstanding" && <TanreOutstandingForm />}
                                {form.values.reportType === "claim_documents" && <ClaimDocumentsForm />}
                                {form.values.reportType === "debit_note_report" && <DebitNoteReport />}



                            </Stack>
                        </div>

                    </Paper>
                </Grid.Col>


                {/* Sidebar - Download History */}
                <Grid.Col span={{ base: 12, md: 4 }}>
                    <Stack>
                        {/* Quick Actions */}
                        <Paper shadow="sm" p="md" radius="md">
                            <Title order={4} mb="md">Quick Actions (Coming Soon)</Title>
                            <Stack gap="xs">
                                <Button
                                    variant="light"
                                    fullWidth
                                    leftSection={<IconFileSpreadsheet size={16} />}
                                    onClick={() => form.setFieldValue('reportType', 'transaction_summary')}
                                >
                                    Transaction Summary
                                </Button>
                                <Button
                                    variant="light"
                                    fullWidth
                                    leftSection={<IconFileSpreadsheet size={16} />}
                                    onClick={() => form.setFieldValue('reportType', 'outstanding_balance')}
                                >
                                    Outstanding Balance
                                </Button>
                            </Stack>
                        </Paper>



                        {/*/!* Download History *!/*/}
                        {/*<Paper shadow="sm" p="md" radius="md">*/}
                        {/*    <Group justify="space-between" mb="md">*/}
                        {/*        <Title order={4}>Recent Downloads</Title>*/}
                        {/*        <Badge size="sm" variant="light">{downloadHistory.length}</Badge>*/}
                        {/*    </Group>*/}

                        {/*    <Stack gap="xs">*/}
                        {/*        {downloadHistory.slice(0, 5).map((item, index) => (*/}
                        {/*            <Card key={index} p="sm" withBorder radius="sm">*/}
                        {/*                <Group justify="space-between">*/}
                        {/*                    <div style={{ flex: 1 }}>*/}
                        {/*                        <Text size="sm" fw={500} lineClamp={1}>*/}
                        {/*                            {item.name}*/}
                        {/*                        </Text>*/}
                        {/*                        <Text size="xs" c="dimmed">*/}
                        {/*                            {item.date}*/}
                        {/*                        </Text>*/}
                        {/*                    </div>*/}
                        {/*                    <Badge*/}
                        {/*                        size="xs"*/}
                        {/*                        color={item.status === 'completed' ? 'green' : 'yellow'}*/}
                        {/*                    >*/}
                        {/*                        {item.status}*/}
                        {/*                    </Badge>*/}
                        {/*                </Group>*/}
                        {/*            </Card>*/}
                        {/*        ))}*/}
                        {/*    </Stack>*/}
                        {/*</Paper>*/}

                        {/* Report Statistics */}
                        <Paper shadow="sm" p="md" radius="md">
                            <Title order={4} mb="md">Statistics</Title>
                            <Stack gap="md">
                                <Group justify="space-between">
                                    <Text size="sm">Total Reports</Text>
                                    <Badge variant="light">156</Badge>
                                </Group>
                                <Group justify="space-between">
                                    <Text size="sm">This Month</Text>
                                    <Badge variant="light" color="blue">23</Badge>
                                </Group>
                                <Group justify="space-between">
                                    <Text size="sm">Last Download</Text>
                                    <Badge variant="light" color="green">Today</Badge>
                                </Group>
                            </Stack>
                        </Paper>
                    </Stack>
                </Grid.Col>
            </Grid>

            {/* Settings Modal */}
            <Modal
                opened={settingsOpened}
                onClose={() => setSettingsOpened(false)}
                title="Report Settings"
                size="md"
            >
                <Stack>
                    <NumberInput
                        label="Max Records per Report"
                        placeholder="10000"
                        min={1}
                        max={100000}
                    />
                    <Select
                        label="Default File Format"
                        data={[
                            { value: 'xlsx', label: 'Excel (.xlsx)' },
                            { value: 'csv', label: 'CSV (.csv)' },
                            { value: 'pdf', label: 'PDF (.pdf)' }
                        ]}
                        defaultValue="xlsx"
                    />
                    <Switch
                        label="Auto-download on generation"
                        description="Automatically start download when report is ready"
                    />
                    <Switch
                        label="Email notifications"
                        description="Send email when large reports are ready"
                    />
                </Stack>
            </Modal>
        </Container>
            </>
    );
};

export default ReportDownloadInterface;
