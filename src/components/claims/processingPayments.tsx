'use client'

import {
    ActionIcon,
    Badge,
    Button,
    FileInput,
    Group,
    Loader,
    Menu,
    Modal, Select,
    Stack,
    Table,
    Tabs,
    Text, Textarea
} from "@mantine/core";
import {IconDotsVertical, IconEye} from "@tabler/icons-react";
import {useEffect, useState} from "react";
import {ClaimDocument, FinanceStatus} from "@/components/claims/financeRequests";
import {API_BASE_URl_DOC, apiFetch} from "@/config/api";
import {showNotification} from "@mantine/notifications";
import useClaimPaymentStore from "@/store/useClaimPaymentStore"
import {ClaimFinanceDocStatus} from "@/model/ClaimFinanceDocStatus";
import {useRouter} from "next/navigation";

interface ProcessingPaymentsProps {
    searchClaimNumber: string;
    searchInsuredName: string;
}

export default function ProcessingPayments({ searchClaimNumber, searchInsuredName }: ProcessingPaymentsProps) {

    const [docID, setDocID] = useState<number | null>(null);
    const router = useRouter();

    const {
        processingPaymentItems,
        loading,
        popFile,
        modalStates,
        financeStatuses,
        comment,
        financeStatusId,
        fetchItems,
        fetchFinanceStatuses,
        setPopFile,
        setModalState,
        setSelectedDocId,
        setComment,
        setFinanceStatusId,
        submitEvidence,
        changeFinanceStatus,
    } = useClaimPaymentStore()

    useEffect(() => {
        fetchItems()

    }, [fetchItems]);

    const filterBySearch = (items: typeof processingPaymentItems) => {
        return items.filter((it) => {
            const matchesClaim = it.claimDocuments.claimNumber.toLowerCase().includes(searchClaimNumber.toLowerCase());
            const matchesInsured = it.claimDocuments.insured.toLowerCase().includes(searchInsuredName.toLowerCase());
            return matchesClaim && matchesInsured;
        });
    };

    const filteredItems = filterBySearch(processingPaymentItems);


    const viewDocumentDetails = (docID: number, sequenceNo: number) => {
        router.push(`/claims-payment/${docID}/edit?value=${sequenceNo}`);
    };

    const handleOpenPopModal = (docId: number) => {
        setSelectedDocId(docId)
        setModalState('popModal', true)
    }

    const handleOpenFinanceStatusModal = (docId: number) => {
        setSelectedDocId(docId)
        setModalState('financeStatusModal', true)
        fetchFinanceStatuses()
    }

    return (
        <>
                {loading ? (
                    <Loader />
                ) : filteredItems.length === 0 ? (
                    <Text>No Processing Payments.</Text>
                ) : (
                    <Table highlightOnHover striped verticalSpacing="md">
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>Claim Number</Table.Th>
                                <Table.Th>Policy Number</Table.Th>
                                <Table.Th>Underwriting Year</Table.Th>
                                <Table.Th>Broker/Cedant</Table.Th>
                                <Table.Th>Insured Name</Table.Th>
                                <Table.Th>Loss Date</Table.Th>
                                <Table.Th>Finance Status</Table.Th>
                                <Table.Th>Actions</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {filteredItems.map((it) => (
                            <Table.Tr key={it.claimDocuments.id}>
                                <Table.Td>{it.claimDocuments.claimNumber}</Table.Td>
                                <Table.Td>{it.claimDocuments.contractNumber}</Table.Td>
                                <Table.Td>{it.claimDocuments.underwritingYear}</Table.Td>
                                <Table.Td>{it.claimDocuments.brokerCedant}</Table.Td>
                                <Table.Td>{it.claimDocuments.insured}</Table.Td>
                                <Table.Td>{it.claimDocuments.lossDate}</Table.Td>
                                <Table.Td>
                                    <Badge color="blue" variant="light">{it.claimDocumentFinanceStatus.label}  </Badge></Table.Td>
                                <Table.Td>
                                    <Group>
                                        <Menu shadow="md" width={200} position="bottom-end">
                                            <Menu.Target>
                                                <ActionIcon variant="filled" color="blue">
                                                    <IconDotsVertical size={20}/>
                                                </ActionIcon>
                                            </Menu.Target>

                                            <Menu.Dropdown>
                                                <Menu.Item leftSection={<IconEye size={16}/>}
                                                           onClick={()=>
                                                               viewDocumentDetails(it.claimDocuments.id, it.claimDocuments.sequenceNo)
                                                }>View
                                                </Menu.Item>
                                                <Menu.Item leftSection={<IconEye size={16}/>}
                                                           onClick={()=> {
                                                               handleOpenFinanceStatusModal(it.claimDocuments.id)
                                                           }}>Change Status
                                                </Menu.Item>
                                                <Menu.Item
                                                    leftSection={<IconEye size={16}/>}
                                                    onClick={()=> {
                                                        handleOpenPopModal(it.claimDocuments.id);
                                                        setDocID(it.claimDocuments.id);

                                                    }}> Attach POP
                                                </Menu.Item>
                                            </Menu.Dropdown>
                                        </Menu>
                                    </Group>
                                </Table.Td>
                            </Table.Tr>
                        ))}
                        </Table.Tbody>
                    </Table>
                )}


{/*Attach Proof of Payment MODAL*/}
            <Modal
                opened={modalStates.popModal}
                onClose={() => setModalState('popModal', false)}
                title="Proof Of Payment"
                size="sm"
                centered
            >
                <FileInput
                    label="Choose File"
                    placeholder="Select a file"
                    // accept="image/*"
                    value={popFile}
                    onChange={setPopFile}
                    required
                />
                <Button fullWidth mt="md" onClick={submitEvidence} disabled={!popFile}>
                    Submit Proof Of Payment
                </Button>
            </Modal>


            <Modal
                opened={modalStates.financeStatusModal}
                onClose={() => setModalState('financeStatusModal', false)}
                title="Change Status"
                size="sm"
                centered
            >
                <Stack>
                    <Select
                        placeholder="Processing Status"
                        data={financeStatuses.map(status => ({
                            value: status.id.toString(),
                            label: status.label
                        }))}
                        onChange={(_value, option) => setFinanceStatusId(_value!)}
                    />

                    <Textarea
                        placeholder="Other Reason"
                        autosize
                        minRows={2}
                        value={comment}
                        onChange={(e) => setComment(e.currentTarget.value)}
                    />
                    {/*)}*/}

                    <Button fullWidth mt="md"
                            onClick={() => {
                                changeFinanceStatus(3)
                            }
                            }
                    >
                        Process Payment
                    </Button>
                </Stack>
            </Modal>
</>
    )


}
