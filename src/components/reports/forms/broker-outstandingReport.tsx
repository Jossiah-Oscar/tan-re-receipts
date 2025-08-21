import {DatePickerInput} from "@mantine/dates";
import {Button, Group, Loader, Select, Stack, TextInput} from "@mantine/core";
import {useForm} from "@mantine/form";
import {useReportStore} from "@/store/useReportStore";
import {IconCalendar, IconDownload} from "@tabler/icons-react";

export function BrokerOutstandingForm() {
    const reportStore = useReportStore();

    const form = useForm({
        initialValues: {
            clientName: "",
            clientCode: "",
            startDate: null,
            endDate: null,
        },
    });

    return (
        <form
            onSubmit={form.onSubmit(async (values) => {
                await reportStore.handleDownload({reportType: "broker_outstanding", ...values});
            })}
        >
            <Stack justify="space-around" gap="md">
                {/*<Group grow>*/}
                <Select
                    label="Client Name"
                    placeholder="Select client name"
                    data={reportStore.getClientSelectData()}
                    value={form.values.clientCode}
                    onChange={(value) => {
                        // Find the selected client to get both code and name
                        const selectedClient = reportStore.clients.find(client => client.BROKER_CEDANT_CODE === value);

                        form.setValues({
                            clientCode: value || '',
                            clientName: selectedClient?.BROKER_CEDANT_NAME || ''
                        });
                    }}
                    searchable
                    required
                />

                {/*</Group>*/}
                <Group grow>
                    <DatePickerInput
                        label="Start Date"
                        placeholder="Select start date"
                        leftSection={<IconCalendar size={16}/>}
                        clearable
                        {...form.getInputProps('startDate')}
                    />
                    <DatePickerInput
                        label="End Date"
                        placeholder="Select end date"
                        leftSection={<IconCalendar size={16}/>}
                        clearable
                        {...form.getInputProps('endDate')}
                    />
                </Group>
                <Group justify="flex-end" mt="xl">
                    <Button type="submit"
                            leftSection={
                                // loading ? <Loader size={16}/> :
                                <IconDownload size={16}/>}
                            size="md"
                            gradient={{ from: 'blue', to: 'cyan', deg: 45 }}
                    >Download
                        Broker SOA</Button>
                </Group>
            </Stack>
        </form>
    );
}
