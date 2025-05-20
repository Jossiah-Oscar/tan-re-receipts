"use client";

import { useState, useEffect } from "react";
import {
    Group,
    Title,
    Tabs,
    Button,
    Loader,
    Table,
    Text,
    Modal,
    TextInput,
    NumberInput,
    ActionIcon,
    Select,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import { apiFetch } from "@/config/api";
import {useAuth} from "@/context/AuthContext";

//
// ——— Types
//
type Item = {
    id: number;
    name: string;
    quantity: number;
};

type RequestLine = {
    itemId?: number;
    quantity?: number;
    reason?: string;
};

type RequestDTO = {
    id: number;
    createdBy: string;
    createdAt: string;
    lines: {
        itemName: string;
        quantity: number;
        reason?: string;
    }[];
};

export default function InventoryPage() {
    //AUTH
    const {username, roles} = useAuth();
    const isOfficeAssistant = roles.includes("OFFICE-ASSISTANT");

    // ——— State for stock
    const [items, setItems] = useState<Item[]>([]);
    const [itemsLoading, setItemsLoading] = useState(true);

    // ——— State for requests
    const [requests, setRequests] = useState<RequestDTO[]>([]);
    const [reqLoading, setReqLoading] = useState(true);

    // ——— “Add Item” modal
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [newName, setNewName] = useState("");
    const [newQty, setNewQty] = useState<number | string>("");


    // ——— “Request Items” modal
    const [reqModalOpen, setReqModalOpen] = useState(false);
    const [rows, setRows] = useState<RequestLine[]>([{}]);


    // ——— Fetch stock & requests on mount
    useEffect(() => {
        fetchItems();
        fetchRequests();
        console.log(roles);
    }, []);

    async function fetchItems() {
        setItemsLoading(true);
        try {
            const data = await apiFetch<Item[]>("/api/items");
            setItems(data);
        } catch (e: any) {
            showNotification({ title: "Error", message: e.message, color: "red" });
        } finally {
            setItemsLoading(false);
        }
    }

    async function fetchRequests() {
        setReqLoading(true);
        try {
            const data = await apiFetch<RequestDTO[]>("/api/items/requests");
            setRequests(data);
        } catch (e: any) {
            showNotification({ title: "Error", message: e.message, color: "red" });
        } finally {
            setReqLoading(false);
        }
    }

    // ——— Add or update an Item
    async function saveItem() {
        if (!newName || newQty === "") {
            showNotification({ title: "Validation", message: "Name & qty required", color: "yellow" });
            return;
        }
        try {
            await apiFetch("/api/items", {
                method: "POST",
                body: { name: newName, quantity: Number(newQty) },
            });
            showNotification({ title: "Success", message: "Item saved", color: "green" });
            setAddModalOpen(false);
            setNewName("");
            setNewQty("");
            fetchItems();
        } catch (e: any) {
            showNotification({ title: "Error", message: e.message, color: "red" });
        }
    }

    // ——— Delete an Item
    async function deleteItem(id: number) {
        try {
            await apiFetch(`/api/items/${id}`, { method: "DELETE" });
            showNotification({ title: "Deleted", message: "Item removed", color: "blue" });
            fetchItems();
        } catch (e: any) {
            showNotification({ title: "Error", message: e.message, color: "red" });
        }
    }

    // ——— Multi-row Request form handlers
    function addRow() {
        setRows((r) => [...r, {}]);
    }
    function removeRow(idx: number) {
        setRows((r) => r.filter((_, i) => i !== idx));
    }
    function updateRow(idx: number, field: keyof RequestLine, val: any) {
        setRows((r) => r.map((row, i) => (i === idx ? { ...row, [field]: val } : row)));
    }

    async function submitRequest() {
        // validate
        for (const row of rows) {
            if (!row.itemId || !row.quantity) {
                showNotification({ title: "Validation", message: "Each row needs item & qty", color: "yellow" });
                return;
            }
        }
        try {
            await apiFetch("/api/items/requests", {
                method: "POST",
                body: rows,
            });
            showNotification({ title: "Requested", message: "Your request was saved", color: "green" });
            setReqModalOpen(false);
            setRows([{}]);
            fetchItems();    // refresh stock balances
            fetchRequests(); // refresh history
        } catch (e: any) {
            showNotification({ title: "Error", message: e.message, color: "red" });
        }
    }

    return (
        <>
            <Group justify="apart" mb="md">
                <Title order={2}>Inventory Management</Title>
            </Group>

            <Tabs defaultValue="requests">
                <Tabs.List>
                    <Tabs.Tab value="requests">Requests</Tabs.Tab>

                    {isOfficeAssistant && (

                        <Tabs.Tab value="inventory">Stock</Tabs.Tab>
                        )}
                </Tabs.List>

                {/** — Requests Tab */}
                <Tabs.Panel value="requests" pt="md">
                    <Group justify="right" mb="md">
                        <Button onClick={() => setReqModalOpen(true)}>Request Items</Button>
                    </Group>

                    {reqLoading ? (
                        <Loader />
                    ) : requests.length === 0 ? (
                        <Text>No requests made yet.</Text>
                    ) : (
                        <Table highlightOnHover striped verticalSpacing="md">
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>ID</Table.Th>
                                    <Table.Th>Requested By</Table.Th>
                                    <Table.Th>Date</Table.Th>
                                    <Table.Th>Items</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {requests.map((req) => (
                                    <Table.Tr key={req.id}>
                                        <Table.Td>{req.id}</Table.Td>
                                        <Table.Td>{req.createdBy}</Table.Td>
                                        <Table.Td>{new Date(req.createdAt).toLocaleString()}</Table.Td>
                                        <Table.Td>
                                            {req.lines
                                                .map((l) => `${l.quantity}×${l.itemName}`)
                                                .join(", ")}
                                        </Table.Td>
                                    </Table.Tr>
                                ))}
                            </Table.Tbody>
                        </Table>
                    )}
                </Tabs.Panel>

                {/** — Inventory Tab */}
                {isOfficeAssistant && (
                <Tabs.Panel value="inventory" pt="md">
                    <Group justify="right" mb="md">
                        <Button leftSection={<IconPlus />} onClick={() => setAddModalOpen(true)}>
                            Add New Item
                        </Button>
                    </Group>

                    {itemsLoading ? (
                        <Loader />
                    ) : items.length === 0 ? (
                        <Text>No items in stock.</Text>
                    ) : (
                        <Table highlightOnHover striped verticalSpacing="md">
                            <Table.Thead>
                            <Table.Tr>
                                <Table.Th>Name</Table.Th>
                                <Table.Th>Quantity</Table.Th>
                                <Table.Th>Actions</Table.Th>
                            </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                            {items.map((it) => (
                                <Table.Tr key={it.id}>
                                    <Table.Td>{it.name}</Table.Td>
                                    <Table.Td>{it.quantity}</Table.Td>
                                    <Table.Td>
                                        <Group justify="flex-end">
                                        <ActionIcon color="red" onClick={() => deleteItem(it.id)}>
                                            <IconTrash size={16} />
                                        </ActionIcon>
                                        </Group>
                                    </Table.Td>
                                </Table.Tr>
                            ))}
                            </Table.Tbody>
                        </Table>
                    )}
                </Tabs.Panel>
                )
                }


            </Tabs>

            {/** — Add Item Modal */}
            <Modal
                opened={addModalOpen}
                onClose={() => setAddModalOpen(false)}
                title="Add New Inventory Item"
            >
                <TextInput
                    label="Item Name"
                    value={newName}
                    onChange={(e) => setNewName(e.currentTarget.value)}
                    mb="sm"
                />
                <NumberInput
                    label="Starting Quantity"
                    value={newQty}
                    onChange={(val) => setNewQty(val)}
                    mb="sm"
                    min={0}
                />
                <Group justify="right">
                    <Button onClick={saveItem}>Save</Button>
                </Group>
            </Modal>

            {/** — Request Items Modal */}
            <Modal
                opened={reqModalOpen}
                onClose={() => setReqModalOpen(false)}
                title="Request Inventory Items"
                size="lg"
            >
                <Table verticalSpacing="sm">
                    <Table.Thead>
                    <Table.Tr>
                        <Table.Th>Item</Table.Th>
                        <Table.Th>Quantity</Table.Th>
                        <Table.Th>Reason (optional)</Table.Th>
                        <Table.Th></Table.Th>
                    </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                    {rows.map((row, idx) => (
                        <Table.Tr key={idx}>
                            <Table.Td>
                                <Select
                                    data={items.map((i) => ({
                                        value: i.id.toString(),
                                        label: i.name,
                                    }))}
                                    placeholder="Select item"
                                    value={row.itemId?.toString() || null}
                                    onChange={(v) => updateRow(idx, "itemId", Number(v))}
                                />
                            </Table.Td>
                            <Table.Td>
                                <NumberInput
                                    min={1}
                                    max={
                                        items.find((i) => i.id === row.itemId)?.quantity ?? undefined
                                    }
                                    value={row.quantity}
                                    onChange={(val) => updateRow(idx, "quantity", val)}
                                />
                            </Table.Td>
                            <Table.Td>
                                <TextInput
                                    placeholder="Reason"
                                    value={row.reason}
                                    onChange={(e) =>
                                        updateRow(idx, "reason", e.currentTarget.value)
                                    }
                                />
                            </Table.Td>
                            <Table.Td>
                                <Button
                                    color="red"
                                    variant="subtle"
                                    size="xs"
                                    onClick={() => removeRow(idx)}
                                >
                                    Remove
                                </Button>
                            </Table.Td>
                        </Table.Tr>
                    ))}
                    </Table.Tbody>
                </Table>
                <Group mt="md">
                    <Button onClick={addRow}>Add Another</Button>
                    <Button color="green" onClick={submitRequest}>
                        Submit Request
                    </Button>
                </Group>
            </Modal>
        </>
    );
}
