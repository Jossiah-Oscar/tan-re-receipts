'use client'

import {useReportStore} from "@/store/useReportStore";
import {useForm} from "@mantine/form";
import {Alert, Button, Group, Loader, Progress, Stack, Text} from "@mantine/core";
import {DatePickerInput} from "@mantine/dates";
import {IconCalendar, IconDownload, IconInfoCircle} from "@tabler/icons-react";
import {useAuth} from "@/context/AuthContext";

export function DebitNoteReport() {
    const reportStore = useReportStore();
    const {username} = useAuth();

    const form = useForm({
        initialValues: {
            startDate: null,
            endDate: null,
            userName: username,
        },
    });


    return (
        <form
            onSubmit={form.onSubmit(async (values) => {
                await reportStore.handleDownload({
                    reportType: "debit_note_report",
                    ...values,
                });
            })}
        >
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
                    {reportStore.downloading ? `Downloading... ${reportStore.downloadProgress}%` :
                        ' Debit/Credit Note Report'}
                </Button>
            </Group>


        </form>
    )

}
