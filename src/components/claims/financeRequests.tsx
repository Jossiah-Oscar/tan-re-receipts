'use client'

import {
    ActionIcon, Button,
    Card,
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
import {IconDotsVertical, IconEye} from "@tabler/icons-react";
import ProcessingPayments from "@/components/claims/processingPayments";
import {useRouter} from "next/navigation";
import useFinanceRequestStore from "@/store/useFinanceRequestStore";
import PendingAllocation from "@/components/claims/awaitingAllocation";
import CompletePaymentTable from "@/components/claims/completedPaymentsTab";


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

    const {
        items,
        loading,
        financeStatuses,
        modalStates,
        comment,
        financeStatusId,
        fetchItems,
        fetchFinanceStatuses,
        setModalState,
        setSelectedDocId,
        setFinanceStatusId,
        setComment,
        changeFinanceStatus
    } = useFinanceRequestStore()

    useEffect(() => {
        fetchItems()
    }, [fetchItems]);

    const router = useRouter();

    const viewDocumentDetails = (docID: number, sequenceNo: number) => {
        router.push(`/claims-payment/${docID}/edit?value=${sequenceNo}`);
    };


    const handleOpenModal = (docId: number) => {
        setSelectedDocId(docId)
        setModalState('evidenceModal', true)
        fetchFinanceStatuses()
    }

    const pendingDocs = items.filter((d) => d.status.name === 'PENDING_PAYMENT');


    return (
        <>
          <Card shadow="sm" padding="sm" radius="md" withBorder>
              <Tabs defaultValue="PENDING-PAYMENT" variant="outline">
                  <Tabs.List>
                      <Tabs.Tab value="PENDING-PAYMENT">PENDING-PAYMENT </Tabs.Tab>
                      <Tabs.Tab value="PROCESSING-PAYMENT">PROCESSING PAYMENT </Tabs.Tab>
                      <Tabs.Tab value="PENDING-ALLOCATION">PENDING ALLOCATION</Tabs.Tab>
                      <Tabs.Tab value="COMPLETED">COMPLETED</Tabs.Tab>
                  </Tabs.List>

                  <Tabs.Panel value="PENDING-PAYMENT" pt="md">
                      {loading ? (
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
                                                              onClick={
                                                                  () => handleOpenModal(it.id)
                                                              }> Process Payment
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

                    <ProcessingPayments/>

                  </Tabs.Panel>

                  <Tabs.Panel value="PENDING-ALLOCATION" pt="md">
                      <PendingAllocation />
                  </Tabs.Panel>

                  <Tabs.Panel value="COMPLETED" pt="md">
                      <CompletePaymentTable />
                  </Tabs.Panel>


              </Tabs>
                  </Card>

            <Modal
                opened={modalStates.evidenceModal}
                onClose={() => setModalState('evidenceModal', false)}
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
                            onClick={() => changeFinanceStatus(3)}
                    >
                        Process Payment
                    </Button>
                </Stack>
            </Modal>
            </>
    );
}