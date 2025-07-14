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
import {ClaimFinanceDocStatus} from "@/model/ClaimFinanceDocStatus";
import {useRouter} from "next/navigation";

export default function ProcessPaymentTab() {
    const [itemsLoading, setItemsLoading] = useState(true);
    const [openPOPModal, setOpenPOPModal] = useState(false);
    const [financeStatusModal, setFinanceStatus] = useState(false);
    const [financeStatues, setFinanceStatues] = useState<FinanceStatus[]>([]);
    const[popFile, setPopFile] = useState<File | null>(null);
    const [docID, setDocID] = useState<number | null>(null);
    const [items, setItems] = useState<ClaimFinanceDocStatus[]>([])
    const [financeStatusID, setFinanceStatusID] = useState<string>();
    const [comment, setComment] = useState("");




    function closePOPModal() {
        setOpenPOPModal(false);

    }

    function openPopModal() {
        setOpenPOPModal(true);
    }
    useEffect(() => {
        fetchItems()

    }, []);

    function closeFinanceStatusModal() {
        setFinanceStatus(false);

    }

    function openFinanceStatusModal() {
        setFinanceStatus(true);
        fetchFinanceStatues();
    }


    async function submitEvidence() {
        if (!setDocID || !popFile) return;
        const form = new FormData();
        form.append('files', popFile);
        const token = localStorage.getItem('jwt');

        await fetch(`${API_BASE_URl_DOC}/api/claim-documents/${docID}/upload`, {
            method: 'POST',
            body: form,
            headers: {Accept: 'application/octet-stream', 'Authorization': `Bearer ${token}`,},

        }).then(async (response) => {
            changeMainStatus(docID!, 4)
        })
        closePOPModal();
    }

    async function fetchFinanceStatues() {
        setItemsLoading(true);
        try {
            const data = await apiFetch<FinanceStatus[]>("/api/claim-documents/finance-status");
            setFinanceStatues(data);
        } catch (e: any) {
            showNotification({ title: "Error", message: e.message, color: "red" });
        } finally {
            setItemsLoading(false);
        }
    }

    async function changeMainStatus(docId: number, statusId: number) {
        if (!statusId) {
            showNotification({ title: "Validation", message: "Status is required", color: "yellow" });
            return;
        }
        try {
            await apiFetch(`/api/claim-documents/${docId}/status`, {
                method: "POST",
                body: {
                    statusId,
                },
            });
            showNotification({ title: "Success", message: "Document status updated", color: "green" });
            // Optional: refresh data or close modal
            // fetchItems(docId);
        } catch (e: any) {
            showNotification({ title: "Error", message: e.message, color: "red" });
        }
    }

    async function fetchItems() {
        setItemsLoading(true);
        try {
            const data = await apiFetch<ClaimFinanceDocStatus[]>("/api/claim-documents/claim-process-payments");
            setItems(data);

        } catch (e: any) {
            showNotification({ title: "Error", message: e.message, color: "red" });
        } finally {
            setItemsLoading(false);
        }
    }

    async function changeFinanceStatus(docId: number, financeStatusId: number, comment: string, mainStatusId: number) {
        if (!financeStatusId) {
            showNotification({ title: "Validation", message: "Finance status is required", color: "yellow" });
            return;
        }

        const selectedStatus = financeStatues.find(status => status.id === financeStatusId);

        if (!selectedStatus) {
            showNotification({ title: "Error", message: "Selected status not found", color: "red" });
            return;
        }

        if (selectedStatus.name === "OTHER" && (!comment || comment.trim() === "")) {
            showNotification({ title: "Validation", message: "Comment is required for 'Other' status", color: "yellow" });
            return;
        }

        try {
            await apiFetch(`/api/claim-documents/${docId}/finance-status`, {
                method: "POST",
                body: {
                    financeStatusId,
                    mainStatusId,
                    comment
                },
            });

            showNotification({ title: "Success", message: "Finance status updated", color: "green" });
            // Optional: refresh data or close modal
            closeFinanceStatusModal();
            // fetchDocument(docId);
        } catch (e: any) {
            showNotification({ title: "Error", message: e.message, color: "red" });
        }
    }

    const router = useRouter();

    const viewDocumentDetails = (docID: number, sequenceNo: number) => {
        router.push(`/claims-payment/${docID}/edit?value=${sequenceNo}`);
    };


    return (
        <>
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
                        {items.map((it) => (
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
                                                               openFinanceStatusModal()
                                                               setDocID(it.claimDocuments.id);
                                                           }}>Change Status
                                                </Menu.Item>
                                                <Menu.Item
                                                    leftSection={<IconEye size={16}/>}
                                                    onClick={()=> {
                                                        openPopModal();
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


{/*Attach Proof of Payment MODAL*/}

            <Modal
                opened={openPOPModal}
                onClose={closePOPModal}
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
                opened={financeStatusModal}
                onClose={closeFinanceStatusModal}
                title="Change Status"
                size="sm"
                centered
            >
                <Stack>
                    <Select
                        // label="Your favorite library"
                        placeholder="Processing Status"
                        data={financeStatues.map(status => ({
                            value: status.id.toString(),
                            label: status.label
                        }))}
                        onChange={(_value, option) => setFinanceStatusID(_value!)}
                    />

                    {/*{selectedStatus?.name === "OTHER" && (!comment || comment.trim() === "") && (*/}
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
                                changeFinanceStatus(docID!, Number(financeStatusID), comment, 3)
                            }
                            }
                        // disabled={!evidenceFile}
                    >
                        Process Payment
                    </Button>
                </Stack>
            </Modal>
</>
    )


}
