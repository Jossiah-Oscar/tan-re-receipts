'use client'

import {useEffect, useState} from 'react';
import {
    ActionIcon,
    Alert, Avatar,
    Badge,
    Button,
    Card,
    Container,
    Divider,
    FileInput,
    Group,
    Loader,
    Menu,
    Modal, Pagination,
    Stack,
    Table,
    Tabs,
    Text,
    Title,
} from '@mantine/core';
import {
    IconAlertCircle,
    IconArrowBackUp,
    IconDotsVertical, IconEdit,
    IconEye, IconFileTypeDoc,
    IconPhoto,
    IconPlus,
    IconTrash,
    IconClipboardList
} from '@tabler/icons-react';
import {DocumentSearch} from "@/components/debit-upload/debitSearch";
import {UploadForm} from "@/components/debit-upload/uploadForm";
import {DocumentDetailsModal} from "@/components/debit-upload/DocumentDetailsModal";
import {API_BASE_URl_DOC} from "@/config/api";
import {showNotification} from "@mantine/notifications";
import {useAuth} from "@/context/AuthContext";
import ReverseCommentModal from "@/components/debit-upload/reverseCommentModal";
import {useRouter} from "next/navigation";
import {EvidenceModal} from "@/components/debit-upload/evidenceModal";


interface DocumentDTO {
    id: number;
    cedantName: string;
    documentType: string;
    fileName: string;
    status: 'PENDING' | 'DONE' | 'RETURNED';
    dateCreated: string;
    dateUpdated: string;
    createdBy: string;
    files: { id: number; fileName: string }[];
}


export default function DocumentUploadPage() {
    const [documents, setDocuments] = useState<DocumentDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [uploadOpened, setUploadOpened] = useState(false);
    const [detailsOpened, setDetailsOpened] = useState(false);
    const [selectedDocId, setSelectedDocId] = useState<number | null>(null);
    const [reverseOpen, setReverseOpen] = useState(false);
    const [evidenceOpened, setEvidenceOpened] = useState(false);
    const [evidenceDocId, setEvidenceDocId] = useState<number | null>(null);
    const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [revId, setRevId] = useState<number | null>(null);
    const [openEvidenceDownloadModal, setOpenedEvidenceDownloadModal] = useState(false);
    const [evidenceDownloadDocId, setEvidenceDownloadDocId] = useState<number | null>(null);
    const [currentPage, setCurrentPage] = useState<Record<'PENDING' | 'DONE' | 'RETURNED', number>>({
        PENDING: 1,
        DONE: 1,
        RETURNED: 1
    });
    const pageSize = 10;



    //AUTH
    const {username, roles} = useAuth();
    const isFinance = roles.includes("FINANCE");

    const currentUser = typeof window !== "undefined"
        ? localStorage.getItem("username")
        : null;


    const viewFiles = (docId: number) => {
        setSelectedDocId(docId);
        setDetailsOpened(true);
    };

    const downloadFirstFile = (files: { id: number; fileName: string }[]) => {
        if (!files.length) return;
        const {id, fileName} = files[0];
        const token = localStorage.getItem('jwt');

        fetch(`${API_BASE_URl_DOC}/api/documents/files/${id}/download`, {
            headers: {Accept: 'application/octet-stream', 'Authorization': `Bearer ${token}`,},
        })
            .then((r) => r.blob())
            .then((blob) => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = fileName;
                document.body.append(a);
                a.click();
                a.remove();
                URL.revokeObjectURL(url);
            })
            .catch(console.error);
    };

    const paginateArray = (array:DocumentDTO[], page = 1) => {
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;

        return {
            data: array.slice(startIndex, endIndex),
            totalPages: Math.ceil(array.length / pageSize),
            currentPage: page
        };
    };

    // Filter helpers
    const pendingDocs = documents.filter((d) => d.status === 'PENDING');
    const doneDocs = documents.filter((d) => d.status === 'DONE');
    const returnedDocs = documents.filter((d) => d.status === 'RETURNED');

    // Pagination
    const paginatedPending = paginateArray(pendingDocs, currentPage.PENDING);
    const paginatedDone = paginateArray(doneDocs, currentPage.DONE);
    const paginatedReturned = paginateArray(returnedDocs, currentPage.RETURNED);


    const handlePageChange = (status: 'PENDING' | 'DONE' | 'RETURNED', newPage: number) => {
        setCurrentPage(prev => ({
            ...prev,
            [status]: newPage
        }));
    };



    // **Handlers for evidence modal**
    function openEvidenceModal(docId: number) {
        setEvidenceDocId(docId);
        setEvidenceFile(null);
        setEvidenceOpened(true);
    }

    function openEvidenceDownload(docId: number) {
        setEvidenceDownloadDocId(docId);
        // setEvidenceFile(null);
        setOpenedEvidenceDownloadModal(true);
    }

    function closeEvidenceModal() {
        setEvidenceOpened(false);
        setEvidenceDocId(null);
        setEvidenceFile(null);
    }

    async function submitEvidence() {
        if (!evidenceDocId || !evidenceFile) return;
        const form = new FormData();
        form.append('evidence', evidenceFile);
        const token = localStorage.getItem('jwt');

        await fetch(`${API_BASE_URl_DOC}/api/documents/${evidenceDocId}/evidence`, {
            method: 'POST',
            body: form,
            headers: {Accept: 'application/octet-stream', 'Authorization': `Bearer ${token}`,},

        });
        closeEvidenceModal();
        fetchDocuments();
    }

    async function submitReverse() {
        // try {
        //     await apiFetch(`/api/documents/${revId}/reverse`, {
        //         method: "POST",
        //         body: { comment: revComment },
        //     });
        //     showNotification({ message: "Reversed to Pending", color: "yellow" });
        //     loadDocs();
        // } catch (err: any) {
        //     showNotification({ message: err.message, color: "red" });
        // } finally {
        //     setModalOpen(false);
        // }
    }

    const fetchDocuments = async (criteria?: { cedantName: string; documentType: string }) => {
        setLoading(true);
        try {
            let url = `${API_BASE_URl_DOC}/api/documents`;
            const token = localStorage.getItem('jwt');


            if (criteria) {
                const params = new URLSearchParams();
                if (criteria.cedantName) params.append('cedantName', criteria.cedantName);
                if (criteria.documentType) params.append('documentType', criteria.documentType);
                url += `?${params.toString()}`;
            }
            const res = await fetch(url, {headers: {'Authorization': `Bearer ${token}`,}});

            if (res.status === 401) {
                localStorage.removeItem("jwt");
                window.location.href = "/login";
                return;
            }

            if (!res.ok) {
                throw new Error(`HTTP ${res.status} - ${res.statusText}`);
            }

            const docs: DocumentDTO[] = await res.json();

            setDocuments(docs);
            setError(null);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (docId: number) => {
        if (!window.confirm('Are you sure you want to delete this document and all its files?')) {
            return;
        }

        setDeletingId(docId);

        try {
            const token = localStorage.getItem('jwt');
            if (!token) {
                showNotification({message: 'Authentication required. Please log in.', color: 'red'});
                window.location.href = "/login";
                return;
            }

            const res = await fetch(`${API_BASE_URl_DOC}/api/documents/${docId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (res.status === 401 || res.status === 403) {
                localStorage.removeItem("jwt");
                showNotification({message: 'Session expired. Please log in again.', color: 'red'});
                window.location.href = "/login";
                return;
            }

            if (!res.ok) {
                throw new Error(`HTTP ${res.status} - ${res.statusText}`);
            }

            showNotification({message: 'Document deleted', color: 'green'});
            await fetchDocuments(); // refresh list
        } catch (err: any) {
            showNotification({message: `Delete failed: ${err.message}`, color: 'red'});
        } finally {
            setDeletingId(null);
        }
    };

    function openReverseModal(id: number) {
        setRevId(id);
        setReverseOpen(true);
    }


    const router = useRouter();

    const viewDocumentDetails = (docID: number) => {
        router.push(`/debit-upload/${docID}/edit`);
    };

    // initial load
    useEffect(() => {
        fetchDocuments();

    }, []);

    return (
        <Container size="xl" >
            <Stack gap="xs">
                <Group justify="space-between" mt="md">
                    <Title order={3}>Document Management</Title>
                    <Button
                        variant="light"
                        leftSection={<IconClipboardList size={16}/>}
                        onClick={() => router.push('/debit-upload/tracker')}
                    >
                        Document Tracker
                    </Button>
                </Group>
                {/*<Title order={3}>Document Management</Title>*/}
                <Card>
                    <Group justify="center">
                        <Card shadow="sm" p="md" radius="md" withBorder mb="xs">
                            <Group>
                                <IconFileTypeDoc></IconFileTypeDoc>
                                <Stack >
                                    <Text size="sm">
                                        Pending Documents
                                    </Text>
                                    <Text size="lg">{pendingDocs.length}</Text>

                                </Stack>
                        </Group>
                        </Card>
                        <Card shadow="sm" p="md" radius="md" withBorder mb="xs">
                            <Group>
                                <IconFileTypeDoc></IconFileTypeDoc>
                                <Stack >
                                    <Text size="sm">
                                        Done Documents
                                    </Text>
                                    <Text size="lg">{doneDocs.length}</Text>

                                </Stack>
                            </Group>
                        </Card>
                        <Card shadow="sm" p="md" radius="md" withBorder mb="xs">
                            <Group>
                                <IconFileTypeDoc></IconFileTypeDoc>
                                <Stack >
                                    <Text size="sm">
                                        Returned Documents
                                    </Text>
                                    <Text size="lg">{returnedDocs.length}</Text>

                                </Stack>
                            </Group>
                        </Card>

                    </Group>
                </Card>

                <DocumentSearch onSearch={(criteria) => fetchDocuments(criteria)}
                                onSearchStart={() => setLoading(true)}/>

                <Group justify="flex-end">
                    <Button leftSection={<IconPlus size={16}/>} onClick={() => setUploadOpened(true)}>
                        Upload Document
                    </Button>
                </Group>
                {error && (
                    <Alert color="red" icon={<IconAlertCircle size={16}/>}>
                        {error}
                    </Alert>
                )}

                {loading ? (
                    <Loader/>
                ) : (
                    <Card shadow="sm" padding="sm" radius="md" withBorder>
                        <Tabs defaultValue="PENDING" variant="outline">
                            <Tabs.List>
                                <Tabs.Tab value="PENDING">Pending ({pendingDocs.length})</Tabs.Tab>
                                <Tabs.Tab value="DONE">Done ({doneDocs.length})</Tabs.Tab>
                                <Tabs.Tab value="RETURNED">Returned ({returnedDocs.length})</Tabs.Tab>
                            </Tabs.List>

                            {/* Pending Tab */}
                            <Tabs.Panel value="PENDING" pt="md">
                                <Stack>
                                {paginatedPending.data.length === 0 ? (
                                    <Text color="dimmed">No pending documents.</Text>
                                ) : (
                                    <>
                                    <Table striped highlightOnHover verticalSpacing="sm">
                                        <Table.Thead>
                                            <Table.Tr>
                                                <Table.Th>ID</Table.Th>
                                                <Table.Th>Cedant</Table.Th>
                                                <Table.Th>Type</Table.Th>
                                                <Table.Th>Group Name</Table.Th>
                                                <Table.Th>Created By</Table.Th>
                                                <Table.Th>Created</Table.Th>
                                                <Table.Th>Updated</Table.Th>
                                                <Table.Th>Actions</Table.Th>
                                            </Table.Tr>
                                        </Table.Thead>
                                        <Table.Tbody>
                                            {paginatedPending.data.map((doc) => (
                                                <Table.Tr key={doc.id}>
                                                    <Table.Td>{doc.id}</Table.Td>
                                                    <Table.Td>{doc.cedantName}</Table.Td>
                                                    <Table.Td><Badge
                                                        variant="light">{doc.documentType}</Badge></Table.Td>
                                                    <Table.Td>{doc.fileName}</Table.Td>
                                                    <Table.Td>{doc.createdBy}</Table.Td>
                                                    <Table.Td>{new Date(doc.dateCreated).toLocaleDateString()}</Table.Td>
                                                    <Table.Td>{new Date(doc.dateUpdated).toLocaleDateString()}</Table.Td>
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
                                                                               onClick={() => viewFiles(doc.id)}>View</Menu.Item>
                                                                    {doc.createdBy === username && (
                                                                        <Menu.Item
                                                                            leftSection={<IconEdit size={16}/>}
                                                                            onClick={() => viewDocumentDetails(doc.id)}
                                                                        >
                                                                            Edit
                                                                        </Menu.Item>
                                                                    )}
                                                                    {/*<Menu.Item leftSection={<IconPhoto size={16}/>}*/}
                                                                    {/*           onClick={() => openEvidenceModal(doc.id)}>Add*/}
                                                                    {/*    Evidence</Menu.Item>*/}
                                                                    {/*<Divider/>*/}

                                                                    {/*Checking if the user is finance and returning the Reverse button*/}
                                                                    {isFinance && doc.status !== "DONE" && doc.status !== "RETURNED" && (
                                                                        <>
                                                                        <Menu.Item leftSection={<IconPhoto size={16}/>}
                                                                                   onClick={() => openEvidenceModal(doc.id)}>Add
                                                                            Evidence</Menu.Item>
                                                                        <Divider/>
                                                                        <Menu.Item
                                                                            leftSection={<IconArrowBackUp size={16}/>}
                                                                            onClick={() => openReverseModal(doc.id)}>Return
                                                                            Document</Menu.Item>
                                                                        </>
                                                                    )}

                                                                    {/*Checking is the current user cant delete the document*/}
                                                                    {doc.createdBy === currentUser && (
                                                                        <Menu.Item color="red"
                                                                                   leftSection={<IconTrash size={16}/>}
                                                                                   onClick={() => handleDelete(doc.id)}>Delete</Menu.Item>
                                                                    )}


                                                                    {/*<Menu.Item leftSection={<IconSettings size={16} />}>Settings</Menu.Item>*/}
                                                                </Menu.Dropdown>
                                                            </Menu>

                                                            {/* Uploader gets an Edit button only when it’s Pending */}
                                                            {/*{doc.createdBy === username && (*/}
                                                            {/*    <ActionIcon*/}
                                                            {/*        title="Edit"*/}
                                                            {/*        size="xs"*/}
                                                            {/*        color="blue"*/}
                                                            {/*        onClick={() => viewDocumentDetails(doc.id)}*/}
                                                            {/*    >*/}
                                                            {/*        <IconEdit size={16} />*/}
                                                            {/*    </ActionIcon>*/}
                                                            {/*)}*/}
                                                        </Group>
                                                    </Table.Td>
                                                </Table.Tr>
                                            ))}
                                        </Table.Tbody>
                                    </Table>

                                        {/* Pagination Controls */}
                                        {paginatedPending.totalPages > 1 && (
                                            <Group justify="center" mt="md">
                                                <Pagination
                                                    value={paginatedPending.currentPage}
                                                    onChange={(page) => handlePageChange('PENDING', page)}
                                                    total={paginatedPending.totalPages}
                                                    size="sm"
                                                />
                                            </Group>
                                        )}
                                    </>
                                )}
                                </Stack>
                            </Tabs.Panel>

                            {/* Done Tab */}
                            <Tabs.Panel value="DONE" pt="md">
                                <Stack>
                                    {doneDocs.length === 0 ? (
                                        <Text color="dimmed">No completed documents.</Text>
                                    ) : (
                                        <>
                                            <Table striped highlightOnHover verticalSpacing="sm">
                                                <Table.Thead>
                                                    <Table.Tr>
                                                        <Table.Th>ID</Table.Th>
                                                        <Table.Th>Cedant</Table.Th>
                                                        <Table.Th>Type</Table.Th>
                                                        <Table.Th>Group Name</Table.Th>
                                                        <Table.Th>Created By</Table.Th>
                                                        <Table.Th>Created</Table.Th>
                                                        <Table.Th>Updated</Table.Th>
                                                        <Table.Th>Actions</Table.Th>
                                                    </Table.Tr>
                                                </Table.Thead>
                                                <Table.Tbody>
                                                    {paginatedDone.data.map((doc) => (
                                                        <Table.Tr key={doc.id}>
                                                            <Table.Td>{doc.id}</Table.Td>
                                                            <Table.Td>{doc.cedantName}</Table.Td>
                                                            <Table.Td><Badge variant="light">{doc.documentType}</Badge></Table.Td>
                                                            <Table.Td>{doc.fileName}</Table.Td>
                                                            <Table.Td>{doc.createdBy}</Table.Td>
                                                            <Table.Td>{new Date(doc.dateCreated).toLocaleDateString()}</Table.Td>
                                                            <Table.Td>{new Date(doc.dateUpdated).toLocaleDateString()}</Table.Td>
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
                                                                                       onClick={() => viewFiles(doc.id)}>View</Menu.Item>
                                                                            <Menu.Item leftSection={<IconPhoto size={16}/>}
                                                                                       onClick={() => openEvidenceDownload(doc.id)}>Download
                                                                                Evidence</Menu.Item>
                                                                            <Divider/>
                                                                        </Menu.Dropdown>
                                                                    </Menu>
                                                                </Group>
                                                            </Table.Td>
                                                        </Table.Tr>
                                                    ))}
                                                </Table.Tbody>
                                            </Table>

                                            {/* Pagination Controls */}
                                            {paginatedDone.totalPages > 1 && (
                                                <Group justify="center" mt="md">
                                                    <Pagination
                                                        value={paginatedDone.currentPage}
                                                        onChange={(page) => handlePageChange('DONE', page)}
                                                        total={paginatedDone.totalPages}
                                                        size="sm"
                                                    />
                                                </Group>
                                            )}
                                        </>
                                    )}
                                </Stack>
                            </Tabs.Panel>

                            {/* Returned Tab */}
                            <Tabs.Panel value="RETURNED" pt="md">
                                {returnedDocs.length === 0 ? (
                                    <Text color="dimmed">No completed documents.</Text>
                                ) : (
                                    <Table striped highlightOnHover verticalSpacing="sm">
                                        <Table.Thead>
                                            <Table.Tr>
                                                <Table.Th>ID</Table.Th>
                                                <Table.Th>Cedant</Table.Th>
                                                <Table.Th>Type</Table.Th>
                                                <Table.Th>Group Name</Table.Th>
                                                <Table.Th>Created By</Table.Th>
                                                <Table.Th>Created</Table.Th>
                                                <Table.Th>Updated</Table.Th>
                                                <Table.Th>Actions</Table.Th>
                                            </Table.Tr>
                                        </Table.Thead>
                                        <Table.Tbody>
                                            {paginatedReturned.data.map((doc) => (
                                                <Table.Tr key={doc.id}>
                                                    <Table.Td>{doc.id}</Table.Td>
                                                    <Table.Td>{doc.cedantName}</Table.Td>
                                                    <Table.Td><Badge
                                                        variant="light">{doc.documentType}</Badge></Table.Td>
                                                    <Table.Td>{doc.fileName}</Table.Td>
                                                    <Table.Td>{doc.createdBy}</Table.Td>
                                                    <Table.Td>{new Date(doc.dateCreated).toLocaleDateString()}</Table.Td>
                                                    <Table.Td>{new Date(doc.dateUpdated).toLocaleDateString()}</Table.Td>
                                                    <Table.Td>
                                                        <Group>
                                                            {/*<ActionIcon color="blue" onClick={() => viewFiles(doc.id)} title="View Files">*/}
                                                            {/*    <IconEye size={16} />*/}
                                                            {/*</ActionIcon>*/}
                                                            {/*<ActionIcon color="blue" onClick={() => downloadFirstFile(doc.files)} title="Download Latest">*/}
                                                            {/*    <IconFileDownload size={16} />*/}
                                                            {/*</ActionIcon>*/}
                                                            {/*{isFinance && doc.status !== "PENDING" && (*/}
                                                            {/*    <ActionIcon*/}
                                                            {/*        size="xs"*/}
                                                            {/*        color="yellow"*/}
                                                            {/*        onClick={() => openReverseModal(doc.id)}*/}
                                                            {/*    >*/}
                                                            {/*        Reverse*/}
                                                            {/*    </ActionIcon>*/}
                                                            {/*)}*/}

                                                            <Menu shadow="md" width={200} position="bottom-end">
                                                                <Menu.Target>
                                                                    <ActionIcon variant="filled" color="blue">
                                                                        <IconDotsVertical size={20}/>
                                                                    </ActionIcon>
                                                                </Menu.Target>
                                                                <Menu.Dropdown>
                                                                    <Menu.Item leftSection={<IconEye size={16}/>}
                                                                               onClick={() => viewFiles(doc.id)}>View</Menu.Item>
                                                                    <Divider/>
                                                                    {isFinance && doc.status !== "DONE" && doc.status !== "RETURNED" && (
                                                                        <Menu.Item
                                                                            leftSection={<IconArrowBackUp size={16}/>}
                                                                            onClick={() => openReverseModal(doc.id)}>Return
                                                                            Document</Menu.Item>
                                                                    )}

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
                        </Tabs>
                    </Card>
                )}
            </Stack>

            {/* Upload Modal */}
            <Modal
                opened={uploadOpened}
                onClose={() => setUploadOpened(false)}
                title="Upload Document"
                centered
                size="lg"
            >
                <UploadForm
                    onSuccess={() => {
                        setUploadOpened(false);
                        fetchDocuments();
                    }}
                />
            </Modal>

            {/* Details Modal for specific document */}
            <DocumentDetailsModal
                documentId={selectedDocId}
                opened={detailsOpened}
                onClose={() => setDetailsOpened(false)}
            />

            <Modal
                opened={evidenceOpened}
                onClose={closeEvidenceModal}
                title="Add Evidence"
                size="sm"
                centered
            >
                <FileInput
                    label="Choose evidence image"
                    placeholder="Select a file"
                    // accept="image/*"
                    value={evidenceFile}
                    onChange={setEvidenceFile}
                    required
                />
                <Button fullWidth mt="md" onClick={submitEvidence} disabled={!evidenceFile}>
                    Submit Evidence
                </Button>
            </Modal>


            {/* ReverseCommentModal */}
            <ReverseCommentModal
                id={revId!}
                opened={reverseOpen}
                onReversed={() => fetchDocuments()}
                onClose={() => setReverseOpen(false)}
            />

            <EvidenceModal documentId={evidenceDownloadDocId} opened={openEvidenceDownloadModal} onClose={() => setOpenedEvidenceDownloadModal(false)} />
        </Container>
    );
}
