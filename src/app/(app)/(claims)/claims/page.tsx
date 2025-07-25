"use client";

import { useEffect, useState } from "react";
import {
    Table,
    Pagination,
    TextInput,
    Group,
    Loader,
    Paper,
    Text, Menu, ActionIcon, Divider, Container,
    Modal,
    FileInput, Button,
} from "@mantine/core";
import {API_BASE_URL, API_BASE_URl_DOC} from "@/config/api";
import {IconArrowBackUp, IconDotsVertical, IconEye} from "@tabler/icons-react";
import {showNotification} from "@mantine/notifications";

export interface Claim {
    claimNumber: string;
    policySequence: number;
    contractNumber: string;
    underwritingYear: string;
    brokerCedantName: string;
    cedantBrokerClaimRef: string;
    claimCurrency: string;
    initialLossEstimate: number;
    lossDate: string;
    insuredName: string;
    claimStatusDescription: string;
    claimDescription: string;
}

 export interface ClaimDTO {
    claimNumber: string;
    policySequence: number;
    contractNumber: string;
    underwritingYear: string;
    brokerCedantName: string;
    lossDate: string;
    claimDescription: string;
}

export default function ClaimsTable() {
    const [claims, setClaims] = useState<Claim[]>([]);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [files, setFiles] = useState<File[]>([]);
    const [loading, setLoading] = useState(false);
    const [evidenceOpened, setEvidenceOpened] = useState(false);
    const [claim, setClaim] = useState<ClaimDTO>();



    function closeClaimDocModal() {
        setEvidenceOpened(false);
        // setEvidenceDocId(null);
        // setEvidenceFile(null);
    }

    function openClaimDocModal() {
        setEvidenceOpened(true);
        // setEvidenceDocId(null);
        // setEvidenceFile(null);
    }


    const handleSubmit = async () => {
        setLoading(true);
        if (!files || !claim) {
            alert('Please Upload a file!');
            return;
        }

        // setSubmitting(true);

        try {
            const token = localStorage.getItem('jwt');
            if (!token) {
                alert("Authentication required. Please log in.");
                window.location.href = "/login";
                return;
            }

            const formData = new FormData();
            formData.append('brokerCedant', claim.brokerCedantName);
            formData.append('insuredName', claim.claimDescription);
            formData.append('contractNumber', claim.contractNumber);
            formData.append('claimNumber', claim.claimNumber);
            formData.append('lossDate', claim.lossDate);
            formData.append('underwritingYear', claim.underwritingYear);
            formData.append('sequenceNumber', claim.policySequence.toString());
            files.forEach((file) => formData.append('files', file));

            const response = await fetch(`${API_BASE_URl_DOC}/api/claim-documents/upload`, {
                method: 'POST',
                body: formData,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json', // Expecting a JSON response
                },
            });

            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem("jwt");
                alert("Session expired. Please log in again.");
                window.location.href = "/login";
                return;
            }

            if (!response.ok) {
                const errorText = await response.text();
                console.error("Upload error:", errorText);

                showNotification({ title: "Error", message: `${errorText}`, color: "red" });

                return;
            }

            // Success handling
            // onSuccess();
        } catch (err) {
            console.error("Upload failed:", err);
            alert('Error uploading documents');
        } finally {
            // setSubmitting(false);
            setLoading(false);
            closeClaimDocModal()
        }
    };


        const fetchClaims = async () => {
        setLoading(true);
        try {
            const url = search.trim()
                ? `${API_BASE_URL}/api/claims/search?claimNumber=${encodeURIComponent(search.trim())}`
                : `${API_BASE_URL}/api/claims/latest`;

            const response = await fetch(url);
            const data = await response.json();
            setClaims(data);
        } catch (err) {
            console.error("Error fetching claims", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!search) {
            fetchClaims();
        }
    }, [page]);


    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            fetchClaims();
        }, 300);

        return () => clearTimeout(delayDebounce);
    }, [search]);

    const filteredClaims = claims.filter((claim) =>
        claim.claimNumber.toLowerCase().includes(search.toLowerCase()) ||
        claim.insuredName?.toLowerCase().includes(search.toLowerCase())
    );

    const rows = filteredClaims.map((claim) => (
        <Table.Tr key={claim.claimNumber}>
            <Table.Td>{claim.claimNumber}</Table.Td>
            {/*<Table.Td>{claim.contractNumber}</Table.Td>*/}
            <Table.Td>{claim.brokerCedantName}</Table.Td>
            <Table.Td>{claim.insuredName}</Table.Td>
            <Table.Td>{claim.cedantBrokerClaimRef}</Table.Td>
            <Table.Td>{claim.underwritingYear}</Table.Td>
            {/*<Table.Td>{claim.initialLossEstimate?.toLocaleString()}</Table.Td>*/}
            <Table.Td>{new Date(claim.lossDate).toLocaleDateString()}</Table.Td>
            <Table.Td>{claim.claimDescription}</Table.Td>
            <Table.Td>{claim.claimStatusDescription}</Table.Td>
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
                                       onClick={() => { openClaimDocModal(); setClaim(claim)}}>Attach Documents
                            </Menu.Item>
                            <Divider/>
                            <Menu.Item leftSection={<IconEye size={16}/>}
                                       onClick={() => console.log("Hello World")}>View
                            </Menu.Item>
                        </Menu.Dropdown>
                    </Menu>
                </Group>
            </Table.Td>
        </Table.Tr>
    ));

    return (
        <Container size="xl" py="xl">
        <Paper shadow="xs" p="md">
            <Group justify="apart" mb="md">
                <Text w={500}>Claims</Text>
                <TextInput
                    placeholder="Search Claim Number"
                    value={search}
                    onChange={(e) => {
                        setSearch(e.currentTarget.value);
                        setPage(1);
                    }}
                    w={300}
                />
            </Group>

            {loading ? (
                <Loader />
            ) : (
                <Table >
                    <Table.Thead>
                    <Table.Tr>
                        <Table.Th>Claim Number</Table.Th>
                        <Table.Th>Broker</Table.Th>
                        <Table.Th>Cedant</Table.Th>
                        <Table.Th>Reference</Table.Th>
                        <Table.Th>UW-Year</Table.Th>
                        {/*<Table.Th>Loss Estimate</Table.Th>*/}
                        <Table.Th>Loss Date</Table.Th>
                        <Table.Th>Insured</Table.Th>
                        <Table.Th>Status</Table.Th>
                        <Table.Th>Actions</Table.Th>
                    </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>{rows}</Table.Tbody>
                </Table>
            )}

            {/*<Group justify="right" mt="md">*/}
            {/*    <Pagination*/}
            {/*        page={page}*/}
            {/*        onChange={setPage}*/}
            {/*        total={totalPages}*/}
            {/*        size="sm"*/}
            {/*    />*/}
            {/*</Group>*/}
        </Paper>

            <Modal
                opened={evidenceOpened}
                onClose={closeClaimDocModal}
                title="Add Evidence"
                size="sm"
                centered
            >
                <FileInput
                    label="Choose Documents"
                    placeholder="Select a file"
                    multiple
                    // accept="image/*"
                    value={files}
                    onChange={(f) => setFiles(Array.isArray(f) ? f : [])}
                    required
                />
                <Button fullWidth mt="md" onClick={handleSubmit}
                        // disabled={!evidenceFile}
                >
                    Submit For Payment
                </Button>
            </Modal>

        </Container>
    );
}
