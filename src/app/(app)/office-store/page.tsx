"use client";

import { useState, useEffect } from "react";
import {
    Container,
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
    Paper,
    Badge,
    Stack,
    Center,
    Tooltip,
    Card,
    SimpleGrid,
    ThemeIcon,
    Group,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import {
    IconPlus,
    IconTrash,
    IconPackage,
    IconFileDescription,
    IconAlertCircle,
    IconBox,
    IconShoppingCart,
} from "@tabler/icons-react";
import { useAuth } from "@/context/AuthContext";
import useOfficeStoreInventory, { RequestLine } from "@/store/useOfficeStoreInventory";

export default function InventoryPage() {
    const { roles } = useAuth();
    const isOfficeAssistant = roles.includes("OFFICE-ASSISTANT");

    // Zustand store
    const {
        items,
        itemsLoading,
        requests,
        requestsLoading,
        fetchItems,
        fetchRequests,
        addItem,
        deleteItem,
        submitRequest,
    } = useOfficeStoreInventory();

    // Modal states
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [reqModalOpen, setReqModalOpen] = useState(false);

    // Add Item form
    const [newName, setNewName] = useState("");
    const [newQty, setNewQty] = useState<number | string>("");

    // Request Items form
    const [rows, setRows] = useState<RequestLine[]>([{}]);

    // Load data on mount
    useEffect(() => {
        fetchItems();
        fetchRequests();
    }, [fetchItems, fetchRequests]);

    // Add Item handler
    const handleSaveItem = async () => {
        if (!newName || newQty === "") {
            return;
        }
        const success = await addItem(newName, Number(newQty));
        if (success) {
            setAddModalOpen(false);
            setNewName("");
            setNewQty("");
        }
    };

    // Delete Item handler
    const handleDeleteItem = (id: number, name: string) => {
        modals.openConfirmModal({
            title: "Delete Item",
            centered: true,
            children: (
                <Stack gap="sm">
                    <Group gap="xs">
                        <IconAlertCircle size={20} color="var(--mantine-color-red-6)" />
                        <Text size="sm">
                            Are you sure you want to delete <strong>{name}</strong>?
                        </Text>
                    </Group>
                    <Text size="sm" c="dimmed">
                        This action cannot be undone.
                    </Text>
                </Stack>
            ),
            labels: { confirm: "Delete", cancel: "Cancel" },
            confirmProps: { color: "red" },
            onConfirm: () => deleteItem(id),
        });
    };

    // Request form handlers
    const addRow = () => setRows((r) => [...r, {}]);
    const removeRow = (idx: number) => setRows((r) => r.filter((_, i) => i !== idx));
    const updateRow = (idx: number, field: keyof RequestLine, val: any) => {
        setRows((r) => r.map((row, i) => (i === idx ? { ...row, [field]: val } : row)));
    };

    const handleSubmitRequest = async () => {
        const success = await submitRequest(rows);
        if (success) {
            setReqModalOpen(false);
            setRows([{}]);
        }
    };

    const getLowStockCount = () => items.filter((item) => item.quantity < 10).length;

    return (
        <Container size="xl" my="xl">
            {/* Header */}
            <Paper shadow="sm" p="lg" radius="md" mb="xl">
                <Group justify="space-between" mb="xs">
                    <div>
                        <Title order={1}>Office Store</Title>
                        <Text size="sm" c="dimmed" mt={4}>
                            Manage inventory and submit requests for office supplies
                        </Text>
                    </div>
                    <Group>
                        <Badge
                            size="lg"
                            variant="light"
                            color="blue"
                            leftSection={<IconBox size={14} />}
                        >
                            {items.length} Items
                        </Badge>
                        {getLowStockCount() > 0 && (
                            <Badge
                                size="lg"
                                variant="light"
                                color="orange"
                                leftSection={<IconAlertCircle size={14} />}
                            >
                                {getLowStockCount()} Low Stock
                            </Badge>
                        )}
                    </Group>
                </Group>
            </Paper>

            {/* Tabs */}
            <Tabs defaultValue="requests" variant="pills">
                <Tabs.List mb="lg">
                    <Tabs.Tab
                        value="requests"
                        leftSection={<IconFileDescription size={16} />}
                    >
                        My Requests
                    </Tabs.Tab>
                    {isOfficeAssistant && (
                        <Tabs.Tab value="inventory" leftSection={<IconPackage size={16} />}>
                            Inventory Management
                        </Tabs.Tab>
                    )}
                </Tabs.List>

                {/* Requests Tab */}
                <Tabs.Panel value="requests">
                    <Stack gap="md">
                        <Paper shadow="xs" p="md" radius="md">
                            <Group justify="space-between" mb="md">
                                <div>
                                    <Title order={3}>Item Requests</Title>
                                    <Text size="sm" c="dimmed">
                                        {requests.length} request{requests.length !== 1 ? "s" : ""} submitted
                                    </Text>
                                </div>
                                <Button
                                    leftSection={<IconShoppingCart size={18} />}
                                    onClick={() => setReqModalOpen(true)}
                                >
                                    Request Items
                                </Button>
                            </Group>

                            {requestsLoading ? (
                                <Center h={200}>
                                    <Loader size="lg" />
                                </Center>
                            ) : requests.length === 0 ? (
                                <Paper p="xl" withBorder>
                                    <Center>
                                        <Stack align="center" gap="xs">
                                            <IconFileDescription size={48} stroke={1.5} opacity={0.3} />
                                            <Text c="dimmed">No requests submitted yet</Text>
                                            <Button
                                                variant="light"
                                                size="sm"
                                                leftSection={<IconShoppingCart size={16} />}
                                                onClick={() => setReqModalOpen(true)}
                                            >
                                                Submit your first request
                                            </Button>
                                        </Stack>
                                    </Center>
                                </Paper>
                            ) : (
                                <Table.ScrollContainer minWidth={600}>
                                    <Table highlightOnHover verticalSpacing="sm">
                                        <Table.Thead>
                                            <Table.Tr>
                                                <Table.Th>Request ID</Table.Th>
                                                <Table.Th>Date</Table.Th>
                                                <Table.Th>Items</Table.Th>
                                                <Table.Th>Status</Table.Th>
                                            </Table.Tr>
                                        </Table.Thead>
                                        <Table.Tbody>
                                            {requests.map((req) => (
                                                <Table.Tr key={req.id}>
                                                    <Table.Td>
                                                        <Badge variant="light">#{req.id}</Badge>
                                                    </Table.Td>
                                                    <Table.Td>
                                                        {new Date(req.createdAt).toLocaleDateString()}
                                                    </Table.Td>
                                                    <Table.Td>
                                                        <Stack gap={4}>
                                                            {req.lines.map((line, idx) => (
                                                                <Text key={idx} size="sm">
                                                                    {line.quantity}× {line.itemName}
                                                                    {line.reason && (
                                                                        <Text size="xs" c="dimmed" component="span">
                                                                            {" "}
                                                                            ({line.reason})
                                                                        </Text>
                                                                    )}
                                                                </Text>
                                                            ))}
                                                        </Stack>
                                                    </Table.Td>
                                                    <Table.Td>
                                                        <Badge color="blue" variant="light">
                                                            Submitted
                                                        </Badge>
                                                    </Table.Td>
                                                </Table.Tr>
                                            ))}
                                        </Table.Tbody>
                                    </Table>
                                </Table.ScrollContainer>
                            )}
                        </Paper>
                    </Stack>
                </Tabs.Panel>

                {/* Inventory Tab (Office Assistant only) */}
                {isOfficeAssistant && (
                    <Tabs.Panel value="inventory">
                        <Stack gap="md">
                            <Paper shadow="xs" p="md" radius="md">
                                <Group justify="space-between" mb="md">
                                    <div>
                                        <Title order={3}>Stock Management</Title>
                                        <Text size="sm" c="dimmed">
                                            Manage office inventory items
                                        </Text>
                                    </div>
                                    <Button
                                        leftSection={<IconPlus size={18} />}
                                        onClick={() => setAddModalOpen(true)}
                                    >
                                        Add Item
                                    </Button>
                                </Group>

                                {itemsLoading ? (
                                    <Center h={200}>
                                        <Loader size="lg" />
                                    </Center>
                                ) : items.length === 0 ? (
                                    <Paper p="xl" withBorder>
                                        <Center>
                                            <Stack align="center" gap="xs">
                                                <IconPackage size={48} stroke={1.5} opacity={0.3} />
                                                <Text c="dimmed">No items in inventory</Text>
                                                <Button
                                                    variant="light"
                                                    size="sm"
                                                    leftSection={<IconPlus size={16} />}
                                                    onClick={() => setAddModalOpen(true)}
                                                >
                                                    Add your first item
                                                </Button>
                                            </Stack>
                                        </Center>
                                    </Paper>
                                ) : (
                                    <>
                                        {/* Card Grid View */}
                                        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md" mb="lg">
                                            {items.map((item) => {
                                                const isLowStock = item.quantity < 10;
                                                const isOutOfStock = item.quantity === 0;
                                                return (
                                                    <Card
                                                        key={item.id}
                                                        shadow="sm"
                                                        padding="lg"
                                                        radius="md"
                                                        withBorder
                                                    >
                                                        <Group justify="space-between" mb="xs">
                                                            <Group gap="xs">
                                                                <ThemeIcon
                                                                    variant="light"
                                                                    size="lg"
                                                                    color={isOutOfStock ? "red" : isLowStock ? "orange" : "blue"}
                                                                >
                                                                    <IconBox size={20} />
                                                                </ThemeIcon>
                                                                <Text fw={500}>{item.name}</Text>
                                                            </Group>
                                                            <Tooltip label="Delete item">
                                                                <ActionIcon
                                                                    variant="subtle"
                                                                    color="red"
                                                                    onClick={() =>
                                                                        handleDeleteItem(item.id, item.name)
                                                                    }
                                                                >
                                                                    <IconTrash size={16} />
                                                                </ActionIcon>
                                                            </Tooltip>
                                                        </Group>

                                                        <Text size="sm" c="dimmed" mb="md">
                                                            Stock Quantity
                                                        </Text>

                                                        <Group justify="space-between" align="center">
                                                            <Badge
                                                                size="xl"
                                                                variant="filled"
                                                                color={isOutOfStock ? "red" : isLowStock ? "orange" : "green"}
                                                            >
                                                                {item.quantity}
                                                            </Badge>
                                                            {isLowStock && !isOutOfStock && (
                                                                <Badge color="orange" variant="light" size="sm">
                                                                    Low Stock
                                                                </Badge>
                                                            )}
                                                            {isOutOfStock && (
                                                                <Badge color="red" variant="light" size="sm">
                                                                    Out of Stock
                                                                </Badge>
                                                            )}
                                                        </Group>
                                                    </Card>
                                                );
                                            })}
                                        </SimpleGrid>

                                        {/* Table View */}
                                        <details>
                                            <summary style={{ cursor: "pointer", marginBottom: "1rem" }}>
                                                <Text size="sm" c="dimmed" component="span">
                                                    Show table view
                                                </Text>
                                            </summary>
                                            <Table.ScrollContainer minWidth={500}>
                                                <Table highlightOnHover verticalSpacing="sm">
                                                    <Table.Thead>
                                                        <Table.Tr>
                                                            <Table.Th>Item Name</Table.Th>
                                                            <Table.Th>Quantity</Table.Th>
                                                            <Table.Th>Status</Table.Th>
                                                            <Table.Th w={100}>Actions</Table.Th>
                                                        </Table.Tr>
                                                    </Table.Thead>
                                                    <Table.Tbody>
                                                        {items.map((item) => {
                                                            const isLowStock = item.quantity < 10;
                                                            const isOutOfStock = item.quantity === 0;
                                                            return (
                                                                <Table.Tr key={item.id}>
                                                                    <Table.Td>
                                                                        <Group gap="xs">
                                                                            <IconBox size={16} />
                                                                            <Text size="sm">{item.name}</Text>
                                                                        </Group>
                                                                    </Table.Td>
                                                                    <Table.Td>
                                                                        <Badge
                                                                            variant="light"
                                                                            color={isOutOfStock ? "red" : isLowStock ? "orange" : "green"}
                                                                        >
                                                                            {item.quantity}
                                                                        </Badge>
                                                                    </Table.Td>
                                                                    <Table.Td>
                                                                        {isOutOfStock ? (
                                                                            <Badge color="red" variant="light" size="sm">
                                                                                Out of Stock
                                                                            </Badge>
                                                                        ) : isLowStock ? (
                                                                            <Badge color="orange" variant="light" size="sm">
                                                                                Low Stock
                                                                            </Badge>
                                                                        ) : (
                                                                            <Badge color="green" variant="light" size="sm">
                                                                                In Stock
                                                                            </Badge>
                                                                        )}
                                                                    </Table.Td>
                                                                    <Table.Td>
                                                                        <Tooltip label="Delete item">
                                                                            <ActionIcon
                                                                                variant="light"
                                                                                color="red"
                                                                                onClick={() =>
                                                                                    handleDeleteItem(item.id, item.name)
                                                                                }
                                                                            >
                                                                                <IconTrash size={16} />
                                                                            </ActionIcon>
                                                                        </Tooltip>
                                                                    </Table.Td>
                                                                </Table.Tr>
                                                            );
                                                        })}
                                                    </Table.Tbody>
                                                </Table>
                                            </Table.ScrollContainer>
                                        </details>
                                    </>
                                )}
                            </Paper>
                        </Stack>
                    </Tabs.Panel>
                )}
            </Tabs>

            {/* Add Item Modal */}
            <Modal
                opened={addModalOpen}
                onClose={() => setAddModalOpen(false)}
                title={
                    <Group gap="xs">
                        <IconPlus size={20} />
                        <Text fw={600}>Add New Item</Text>
                    </Group>
                }
                size="md"
            >
                <Stack gap="md">
                    <TextInput
                        label="Item Name"
                        placeholder="e.g., Pens, Paper, Stapler"
                        value={newName}
                        onChange={(e) => setNewName(e.currentTarget.value)}
                        leftSection={<IconBox size={16} />}
                        required
                    />
                    <NumberInput
                        label="Initial Quantity"
                        placeholder="Enter starting quantity"
                        value={newQty}
                        onChange={(val) => setNewQty(val)}
                        min={0}
                        required
                    />
                    <Group justify="flex-end" mt="md">
                        <Button variant="subtle" onClick={() => setAddModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSaveItem}>Add Item</Button>
                    </Group>
                </Stack>
            </Modal>

            {/* Request Items Modal */}
            <Modal
                opened={reqModalOpen}
                onClose={() => setReqModalOpen(false)}
                title={
                    <Group gap="xs">
                        <IconShoppingCart size={20} />
                        <Text fw={600}>Request Office Items</Text>
                    </Group>
                }
                size="xl"
            >
                <Stack gap="md">
                    <Table verticalSpacing="sm">
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>Item</Table.Th>
                                <Table.Th>Quantity</Table.Th>
                                <Table.Th>Reason (Optional)</Table.Th>
                                <Table.Th w={80}></Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {rows.map((row, idx) => (
                                <Table.Tr key={idx}>
                                    <Table.Td>
                                        <Select
                                            data={items.map((i) => ({
                                                value: i.id.toString(),
                                                label: `${i.name} (${i.quantity} available)`,
                                            }))}
                                            placeholder="Select item"
                                            value={row.itemId?.toString() || null}
                                            onChange={(v) => updateRow(idx, "itemId", Number(v))}
                                        />
                                    </Table.Td>
                                    <Table.Td>
                                        <NumberInput
                                            min={1}
                                            max={items.find((i) => i.id === row.itemId)?.quantity || undefined}
                                            value={row.quantity}
                                            onChange={(val) => updateRow(idx, "quantity", val)}
                                            placeholder="Qty"
                                        />
                                    </Table.Td>
                                    <Table.Td>
                                        <TextInput
                                            placeholder="Why do you need this?"
                                            value={row.reason}
                                            onChange={(e) => updateRow(idx, "reason", e.currentTarget.value)}
                                        />
                                    </Table.Td>
                                    <Table.Td>
                                        <Tooltip label="Remove row">
                                            <ActionIcon
                                                color="red"
                                                variant="subtle"
                                                onClick={() => removeRow(idx)}
                                                disabled={rows.length === 1}
                                            >
                                                <IconTrash size={16} />
                                            </ActionIcon>
                                        </Tooltip>
                                    </Table.Td>
                                </Table.Tr>
                            ))}
                        </Table.Tbody>
                    </Table>

                    <Group justify="space-between" mt="md">
                        <Button variant="light" leftSection={<IconPlus size={16} />} onClick={addRow}>
                            Add Another Item
                        </Button>
                        <Group>
                            <Button variant="subtle" onClick={() => setReqModalOpen(false)}>
                                Cancel
                            </Button>
                            <Button color="green" onClick={handleSubmitRequest}>
                                Submit Request
                            </Button>
                        </Group>
                    </Group>
                </Stack>
            </Modal>
        </Container>
    );
}
