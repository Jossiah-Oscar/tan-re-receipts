import {ActionIcon, Button, Group, Loader, Menu, Table, Text} from "@mantine/core";
import {IconDotsVertical, IconEye} from "@tabler/icons-react";
import useFinanceRequestStore from "@/store/useFinanceRequestStore";
import {useRouter} from "next/navigation";
import {useEffect} from "react";

export default function CompletePaymentTable() {

    const {
        items,
        loading,
        fetchItems,
        refreshAllocation
    } = useFinanceRequestStore()

    const router = useRouter()

    useEffect(() => {
        fetchItems()
    }, [fetchItems])

    const pendingAllocation = items.filter((d) => d.status.name === 'COMPLETED')

    const viewDocumentDetails = (docID: number, sequenceNo: number) => {
        router.push(`/claims-payment/${docID}/edit?value=${sequenceNo}`)
    }


    return (
        <>
            {loading ? (
                <Loader />
            ) : pendingAllocation.length === 0 ? (
                <Text>No Claims Pending Allocation.</Text>
            ) : (
                <>
                    {/*<Group justify="flex-end">*/}
                    {/*    <Button variant="default" onClick={refreshAllocation}>Check Allocation</Button>*/}
                    {/*</Group>*/}
                    <Table highlightOnHover striped verticalSpacing="md">
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>Claim Number</Table.Th>
                                <Table.Th>Policy Number</Table.Th>
                                <Table.Th>Underwriting Year</Table.Th>
                                <Table.Th>Broker/Cedant</Table.Th>
                                <Table.Th>Insured Name</Table.Th>
                                <Table.Th>Loss Date</Table.Th>
                                <Table.Th>Actions</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {pendingAllocation.map((it) => (
                                <Table.Tr key={it.id}>
                                    <Table.Td>{it.claimNumber}</Table.Td>
                                    <Table.Td>{it.contractNumber}</Table.Td>
                                    <Table.Td>{it.underwritingYear}</Table.Td>
                                    <Table.Td>{it.brokerCedant}</Table.Td>
                                    <Table.Td>{it.insured}</Table.Td>
                                    <Table.Td>{it.lossDate}</Table.Td>
                                    <Table.Td>
                                        <Group>
                                            <Menu shadow="md" width={200} position="bottom-end">
                                                <Menu.Target>
                                                    <ActionIcon variant="filled" color="blue">
                                                        <IconDotsVertical size={20}/>
                                                    </ActionIcon>
                                                </Menu.Target>

                                                <Menu.Dropdown>
                                                    <Menu.Item
                                                        leftSection={<IconEye size={16}/>}
                                                        onClick={() => viewDocumentDetails(it.id, it.sequenceNo)}
                                                    >
                                                        View
                                                    </Menu.Item>
                                                </Menu.Dropdown>
                                            </Menu>
                                        </Group>
                                    </Table.Td>
                                </Table.Tr>
                            ))}
                        </Table.Tbody>
                    </Table>
                </>
            )}
        </>
    )

}
