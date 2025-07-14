'use client'


import {Button, Container, FileInput, Group, Stack, Table, Tabs, Text, Title} from "@mantine/core";
import {API_BASE_URL, apiFetch} from "@/config/api";
import {showNotification} from "@mantine/notifications";
import {ClaimDocument} from "@/components/claims/financeRequests";
import {useEffect, useState} from "react";
import {useParams, useSearchParams} from "next/navigation";

export interface ClaimDocFileDTO {
    id: number;
    fileName: string;
    contentType: string;
    dateUploaded: string; // ISO format: "2025-06-25T14:30:00"
}

export interface ClaimWithOutstandingDTO {
    contractNumber: string;       // Preserves leading zeros
    underwritingYear: number;
    claimNumber: number;
    cedantName: string;
    insuredName: string;
    transReference: string;
    balanceAmountDue: number;
}


export default function EditDocumentPage() {
    const { id } = useParams();
    const searchParams = useSearchParams();
    const value = searchParams.get('value');
    const [itemsLoading, setItemsLoading] = useState(false);
    const [files, setFiles] = useState<ClaimDocFileDTO[]>([]);
    const [newFiles, setNewFiles] = useState<File[]>([]);
    const [outstandingClaims, setOutStandingClaim] = useState<ClaimWithOutstandingDTO[]>([]);
    const [uploading, setUploading] = useState(false);



    useEffect(() => {
        fetchItems();
        fetchOutstandingClaims();
    }, [id]);

    async function fetchItems() {
        setItemsLoading(true);
        try {
            const data = await apiFetch<ClaimDocFileDTO[]>(`/api/claim-documents/${id}/files`);
            setFiles(data);
            console.log(data);

        } catch (e: any) {
            showNotification({ title: "Error", message: e.message, color: "red" });
        } finally {
            setItemsLoading(false);
        }
    }

    const fetchOutstandingClaims = async () => {
        setItemsLoading(true);
        try {
            const url = `${API_BASE_URL}/api/claims/${value}/outstanding`;

            const response = await fetch(url);
            const data = await response.json();
            setOutStandingClaim(data);
        } catch (err) {
            console.error("Error fetching claims", err);
        } finally {
            setItemsLoading(false);
        }
    };


    async function handleUpload() {
        if (newFiles.length === 0) return;
        setUploading(true);
        try {
            const form = new FormData();
            newFiles.forEach((f) => form.append("files", f));
            await apiFetch(`/api/claim-documents/${id}/upload`, {
                method: "POST",
                body: form,          // FormData triggers file upload path
                requiresAuth: true,  // default true
            });
            showNotification({ message: "Files uploaded", color: "green" });
            setNewFiles([]);
            fetchItems(); // re-fetch files list
        } catch (e: any) {
            showNotification({ message: e.message, color: "red" });
        } finally {
            setUploading(false);
        }
    }

       return(
           <Container my="xl">
               <Title order={2}>Edit Document </Title>

               <Tabs defaultValue="outstanding" mt="md">
                   <Tabs.List>
                       <Tabs.Tab value="outstanding">Outstanding</Tabs.Tab>
                       <Tabs.Tab value="files">Files</Tabs.Tab>


                   </Tabs.List>

                   <Tabs.Panel value="files" pt="md">
                       {files.length === 0 ? (
                           <Text>No files attached.</Text>
                       ) : (

                           <Stack >
                               <Group justify="flex-end">
                                   <FileInput
                                       multiple
                                       placeholder="Select files"
                                       value={newFiles}
                                       onChange={setNewFiles}
                                   />
                                   <Button
                                       onClick={handleUpload} loading={uploading} disabled={newFiles.length===0}
                                   >
                                       Upload
                                   </Button>
                               </Group>
                               <Table highlightOnHover>
                                   <Table.Thead>
                                       <Table.Tr>
                                           <Table.Th>File Name</Table.Th>
                                           <Table.Th>Content Type</Table.Th>
                                           <Table.Th>Actions</Table.Th>
                                       </Table.Tr>
                                   </Table.Thead>
                                   <Table.Tbody>
                                       {files.map((f) => (
                                           <Table.Tr key={f.id}>
                                               <Table.Td>{f.fileName}</Table.Td>
                                               <Table.Td>{f.contentType}</Table.Td>
                                               <Table.Td>
                                                   <Group>
                                                       <Button
                                                           size="xs"
                                                           component="a"
                                                           href={`/api/documents/${id}/files/${f.id}`}
                                                           target="_blank"
                                                       >
                                                           Download
                                                       </Button>

                                                   </Group>
                                               </Table.Td>
                                           </Table.Tr>
                                       ))}
                                   </Table.Tbody>
                               </Table>
                           </Stack>
                       )}
                   </Tabs.Panel>

                   <Tabs.Panel value="outstanding" pt="md">
                       {outstandingClaims.length === 0 ? (
                           <Text>No Outstanding Transactions.</Text>
                       ) : (

                           <Stack >
                               <Group justify="flex-end">
                                   <FileInput
                                       multiple
                                       placeholder="Select files"
                                       value={newFiles}
                                       onChange={setNewFiles}
                                   />
                                   <Button
                                       onClick={handleUpload} loading={uploading} disabled={newFiles.length===0}
                                   >
                                       Upload
                                   </Button>
                               </Group>
                               <Table highlightOnHover>
                                   <Table.Thead>
                                       <Table.Tr>
                                           <Table.Th>Contract Number</Table.Th>
                                           <Table.Th>Underwriting Year</Table.Th>
                                           <Table.Th>Claim Number</Table.Th>
                                           <Table.Th>Cedant Name</Table.Th>
                                           <Table.Th>Insured Name</Table.Th>
                                           <Table.Th>Trans Reference</Table.Th>
                                           <Table.Th>Amount Due</Table.Th>
                                       </Table.Tr>
                                   </Table.Thead>
                                   <Table.Tbody>
                                       {outstandingClaims.map((ot) => (
                                           <Table.Tr key={ot.claimNumber}>
                                               <Table.Td>{ot.contractNumber}</Table.Td>
                                               <Table.Td>{ot.underwritingYear}</Table.Td>
                                               <Table.Td>{ot.claimNumber}</Table.Td>
                                               <Table.Td>{ot.cedantName}</Table.Td>
                                               <Table.Td>{ot.insuredName}</Table.Td>
                                               <Table.Td>{ot.transReference}</Table.Td>
                                               <Table.Td>{ot.balanceAmountDue}</Table.Td>
                                               <Table.Td>
                                                   <Group>
                                                       {/*<Button*/}
                                                       {/*    size="xs"*/}
                                                       {/*    component="a"*/}
                                                       {/*    href={`/api/documents/${id}/files/${f.id}`}*/}
                                                       {/*    target="_blank"*/}
                                                       {/*>*/}
                                                       {/*    Download*/}
                                                       {/*</Button>*/}

                                                   </Group>
                                               </Table.Td>
                                           </Table.Tr>
                                       ))}
                                   </Table.Tbody>
                               </Table>
                           </Stack>
                       )}
                   </Tabs.Panel>

               </Tabs>

           </Container>
       );
    }
