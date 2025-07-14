'use client'

import {
    ActionIcon, Button,
    Card,
    Container,
    Divider, FileInput,
    Group,
    Loader,
    Menu,
    Modal, Select,
    Stack,
    Table,
    Tabs,
    Text, Textarea
} from "@mantine/core";
import {apiFetch} from "@/config/api";
import {showNotification} from "@mantine/notifications";
import {useEffect, useState} from "react";
import {Claim, ClaimDTO} from "@/app/(app)/(claims)/claims/page";
import {IconArrowBackUp, IconDotsVertical, IconEdit, IconEye, IconPhoto, IconTrash} from "@tabler/icons-react";
import ProcessPaymentTab from "@/components/claims/processPaymentTab";
import {useRouter} from "next/navigation";


export interface ClaimDocument {
    id: number;
    brokerCedant: string;
    insured: string;
    contractNumber: string;
    claimNumber: string;
    lossDate: string; // or Date, depending on how you're handling dates
    underwritingYear: number;
    sequenceNo: number;
    status: ClaimDocumentStatus;
    createdAt: string; // or Date
    updatedAt: string; // or Date
}

export interface ClaimDocumentStatus {
    id: number;
    name: string;
    description?: string;
    active: boolean;
}


export interface FinanceStatus {
    id: number;
    name: string;        // e.g., "FUNDS_NOT_AVAILABLE"
    label: string;       // e.g., "Funds Not Available"
    description?: string;
    active: boolean;
    requiresComment: boolean;

    mainStatus?: {
        id: number;
        name: string;      // Should be "PROCESSING_PAYMENT"
    };
}



export default function ClaimsPaymentTable() {


    const [itemsLoading, setItemsLoading] = useState(true);
    const [items, setItems] = useState<ClaimDocument[]>([]);
    const [financeStatues, setFinanceStatues] = useState<FinanceStatus[]>([]);

    const [loading, setLoading] = useState(false);
    const [evidenceOpened, setEvidenceOpened] = useState(false);
    const [docID, setDocID] = useState<number>();
    const [financeStatusID, setFinanceStatusID] = useState<string>();
    const [comment, setComment] = useState("");


    function closeClaimDocModal() {
        setEvidenceOpened(false);

    }

    function openClaimDocModal() {
        setEvidenceOpened(true);
        fetchFinanceStatues();
    }


    useEffect(() => {
        fetchItems()

    }, []);


        const pendingDocs = items.filter((d) => d.status.name === 'PENDING_PAYMENT');
        const processingPayments = items.filter((d) => d.status.name === 'PROCESSING_PAYMENT');
        const completed = items.filter((d) => d.status.name === 'COMPLETED');




    async function fetchItems() {
        setItemsLoading(true);
        try {
            const data = await apiFetch<ClaimDocument[]>("/api/claim-documents/claim-payments");
            setItems(data);

        } catch (e: any) {
            showNotification({ title: "Error", message: e.message, color: "red" });
        } finally {
            setItemsLoading(false);
        }
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
            closeClaimDocModal();
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
          <Card shadow="sm" padding="sm" radius="md" withBorder>
              <Tabs defaultValue="PENDING-PAYMENT" variant="outline">
                  <Tabs.List>
                      <Tabs.Tab value="PENDING-PAYMENT">PENDING-PAYMENT </Tabs.Tab>
                      <Tabs.Tab value="PROCESSING-PAYMENT">PROCESSING PAYMENT </Tabs.Tab>
                      <Tabs.Tab value="COMPLETED">COMPLETED</Tabs.Tab>
                  </Tabs.List>

                  <Tabs.Panel value="PENDING-PAYMENT" pt="md">
                      {itemsLoading ? (
                          <Loader />
                      ) : pendingDocs.length === 0 ? (
                          <Text>No Claim to Pay.</Text>
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
                                      <Table.Th>Actions</Table.Th>
                                  </Table.Tr>
                              </Table.Thead>
                              <Table.Tbody>
                                  {pendingDocs.map((it) => (
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
                                                          <Menu.Item leftSection={<IconEye size={16}/>}
                                                                     onClick={()=> viewDocumentDetails(it.id, it.sequenceNo)}>View
                                                          </Menu.Item>
                                                          <Menu.Item
                                                              leftSection={<IconEye size={16}/>}
                                                              onClick={()=> {
                                                                         openClaimDocModal();
                                                                         setDocID(it.id);

                                                                     }}> Process Payment
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
                  </Tabs.Panel>

                  <Tabs.Panel value="PROCESSING-PAYMENT" pt="md">

                    <ProcessPaymentTab/>

                  </Tabs.Panel>

              </Tabs>
                  </Card>

            <Modal
                opened={evidenceOpened}
                onClose={closeClaimDocModal}
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
    );
}