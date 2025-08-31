import {DatePickerInput} from "@mantine/dates";
import {
    Alert,
    Button,
    Group,
    Loader,
    NumberInput,
    Progress,
    Select,
    Stack,
    TextInput,
    Text,
} from "@mantine/core";
import {useForm} from "@mantine/form";
import {useReportStore} from "@/store/useReportStore";
import {IconCalendar, IconDownload, IconInfoCircle} from "@tabler/icons-react";
import {useEffect} from "react";

export function TanreOutstandingForm() {
    const reportStore = useReportStore();

    const form = useForm({
        initialValues: {
            startDate: null,
            endDate: null,
            clientName: '',
            clientCode: '',
            brokerCode: '',
            contractNumber: '',
            insuredName: '',
            underwritingYear: undefined as number | undefined,  // ✅ use undefined
        },
    });
    useEffect(() => {
        if (reportStore.clients.length === 0) {
            reportStore.loadDropdownData();
        }
    }, []);


    return (
        <form
            onSubmit={form.onSubmit(async (values) => {
                await reportStore.handleDownload({
                    reportType: "tanre_outstanding",
                    ...values,
                });
            })}
        >
            <Stack justify="space-around" gap="md">
                {/* Client selection */}
                <Group grow>
                    <Select
                        label="Cedant Name"
                        placeholder="Select cedant name"
                        data={reportStore.getCedantSelectData()}
                        value={form.values.clientCode}
                        onChange={(value) => {
                            const selectedClient = reportStore.cedants.find(
                                (cedant) => cedant.BROKER_CEDANT_CODE === value
                            );

                            form.setValues({
                                clientCode: value || "",
                                clientName: selectedClient?.BROKER_CEDANT_NAME || "",
                            });
                        }}
                        searchable
                    />
                </Group>
                <Group grow>
                    <Select
                        label="Broker Name"
                        placeholder="Select broker name"
                        data={reportStore.getBrokerSelectData()}
                        value={form.values.brokerCode}
                        onChange={(value) => {
                            const selectedClient = reportStore.brokers.find(
                                (broker) => broker.BROKER_CEDANT_CODE === value
                            );

                            form.setValues({
                                brokerCode: value || "",
                                // clientName: selectedClient?.BROKER_CEDANT_NAME || "",
                            });
                        }}
                        searchable
                    />
                </Group>


                {/* Extra filters */}
                <Group grow>
                    <TextInput
                        label="Contract Number"
                        placeholder="Enter contract number"
                        {...form.getInputProps("contractNumber")}
                    />
                </Group>

                <Group grow>
                    <TextInput
                        label="Insured Name"
                        placeholder="Enter insured name"
                        {...form.getInputProps("insuredName")}
                    />
                    <NumberInput
                        label="Underwriting Year"
                        placeholder="Enter year"
                        min={1900}
                        max={2100}
                        {...form.getInputProps("underwritingYear")}
                    />
                </Group>

                {/* Date range */}
                <Group grow>
                    <DatePickerInput
                        label="Start Date"
                        placeholder="Select start date"
                        leftSection={<IconCalendar size={16} />}
                        clearable
                        {...form.getInputProps("startDate")}
                        required
                    />
                    <DatePickerInput
                        label="End Date"
                        placeholder="Select end date"
                        leftSection={<IconCalendar size={16} />}
                        clearable
                        {...form.getInputProps("endDate")}
                        required
                    />
                </Group>

                {reportStore.downloading && (
                    <Alert color="blue" icon={<IconInfoCircle size={16} />}>
                        <Stack gap="xs">
                            <Text size="sm" fw={500}>
                                Generating your report... {reportStore.downloadProgress}%
                            </Text>
                            <Progress
                                value={reportStore.downloadProgress}
                                size="md"
                                animated
                                color="blue"
                            />
                        </Stack>
                    </Alert>
                )}

                <Group justify="flex-end" mt="xl">
                    <Button
                        type="submit"
                        leftSection={reportStore.downloading ? <Loader size={16}/> : <IconDownload size={16}/>}
                        loading={reportStore.downloading}
                        disabled={reportStore.downloading}
                        size="md"
                        gradient={{ from: 'blue', to: 'cyan', deg: 45 }}
                    >
                        {reportStore.downloading ? `Downloading... ${reportStore.downloadProgress}%` : 'Download' +
                            ' Outstanding Report'}
                    </Button>
                </Group>
            </Stack>
        </form>
    );
}
