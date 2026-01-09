"use client";

import { useEffect, useState, useMemo } from "react";
import { Button, Modal, NumberInput, Textarea, Stack, Group, Text } from "@mantine/core";
import { IconTarget, IconCalendar, IconCoin } from "@tabler/icons-react";
import { apiFetch } from "@/config/api";
import { showNotification } from "@mantine/notifications";
import { YearlyTarget } from "@/types/target";

interface Props {
    opened: boolean;
    editTarget: YearlyTarget | null;
    onClose(): void;
    onSaved(): void;
}

export default function TargetModal({ opened, onClose, editTarget, onSaved }: Props) {
    const [year, setYear] = useState<number | string>(new Date().getFullYear());
    const [targetAmount, setTargetAmount] = useState<number | string>("");
    const [notes, setNotes] = useState("");
    const [saving, setSaving] = useState(false);

    const currentYear = new Date().getFullYear();

    // Calculate monthly target for preview
    const monthlyTarget = useMemo(() => {
        const amount = typeof targetAmount === "number" ? targetAmount : parseFloat(targetAmount as string);
        if (isNaN(amount) || amount <= 0) return null;
        return amount / 12;
    }, [targetAmount]);

    // Reset form when modal opens/closes or editTarget changes
    useEffect(() => {
        if (opened) {
            if (editTarget) {
                setYear(editTarget.year);
                setTargetAmount(editTarget.targetAmount);
                setNotes(editTarget.notes || "");
            } else {
                setYear(currentYear);
                setTargetAmount("");
                setNotes("");
            }
        }
    }, [opened, editTarget, currentYear]);

    async function handleSave() {
        // Validation
        const yearNum = typeof year === "number" ? year : parseInt(year as string);
        const amountNum = typeof targetAmount === "number" ? targetAmount : parseFloat(targetAmount as string);

        if (isNaN(yearNum)) {
            showNotification({
                title: "Validation Error",
                message: "Year is required",
                color: "red"
            });
            return;
        }

        if (yearNum < 2000) {
            showNotification({
                title: "Validation Error",
                message: "Year must be 2000 or later",
                color: "red"
            });
            return;
        }

        if (yearNum > currentYear) {
            showNotification({
                title: "Validation Error",
                message: `Cannot set targets for future years (current year: ${currentYear})`,
                color: "red"
            });
            return;
        }

        if (isNaN(amountNum) || amountNum <= 0) {
            showNotification({
                title: "Validation Error",
                message: "Target amount must be greater than zero",
                color: "red"
            });
            return;
        }

        if (amountNum > 999_999_999_999_999) {
            showNotification({
                title: "Validation Error",
                message: "Target amount is too large",
                color: "red"
            });
            return;
        }

        if (notes.length > 500) {
            showNotification({
                title: "Validation Error",
                message: "Notes cannot exceed 500 characters",
                color: "red"
            });
            return;
        }

        setSaving(true);
        try {
            if (editTarget) {
                // Update existing target
                await apiFetch(`/targets/${yearNum}`, {
                    method: "PUT",
                    body: { targetAmount: amountNum, notes: notes || undefined },
                });
                showNotification({
                    title: "Success",
                    message: `Target for ${yearNum} updated successfully`,
                    color: "green"
                });
            } else {
                // Create new target
                await apiFetch("/targets", {
                    method: "POST",
                    body: { year: yearNum, targetAmount: amountNum, notes: notes || undefined },
                });
                showNotification({
                    title: "Success",
                    message: `Target for ${yearNum} created successfully`,
                    color: "green"
                });
            }
            onSaved();
        } catch (e: any) {
            showNotification({
                title: "Error",
                message: e.message || "Failed to save target",
                color: "red"
            });
        } finally {
            setSaving(false);
        }
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-TZ", {
            style: "currency",
            currency: "TZS",
            notation: "compact",
            maximumFractionDigits: 2
        }).format(amount);
    };

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={
                <Group gap="xs">
                    <IconTarget size={20} />
                    <Text fw={600}>
                        {editTarget ? `Edit ${editTarget.year} Target` : "Add Yearly Target"}
                    </Text>
                </Group>
            }
            size="md"
        >
            <Stack gap="md">
                <NumberInput
                    label="Target Year"
                    placeholder="2026"
                    value={year}
                    onChange={setYear}
                    leftSection={<IconCalendar size={16} />}
                    min={2000}
                    max={currentYear}
                    disabled={!!editTarget}
                    required
                    description={editTarget ? "Year cannot be changed" : `Maximum: ${currentYear} (current year)`}
                />

                <NumberInput
                    label="Yearly Target Amount (TZS)"
                    placeholder="336,903,845,564"
                    value={targetAmount}
                    onChange={setTargetAmount}
                    leftSection={<IconCoin size={16} />}
                    min={1}
                    max={999_999_999_999_999}
                    required
                    thousandSeparator=","
                    decimalScale={0}
                    hideControls
                    description={
                        monthlyTarget
                            ? `Monthly target: ${formatCurrency(monthlyTarget)}`
                            : "Enter target amount to see monthly breakdown"
                    }
                />

                <Textarea
                    label="Notes"
                    placeholder="Optional notes about this target..."
                    value={notes}
                    onChange={(e) => setNotes(e.currentTarget.value)}
                    rows={3}
                    maxLength={500}
                    description={`${notes.length}/500 characters`}
                />

                <Group justify="flex-end" mt="md">
                    <Button variant="subtle" onClick={onClose} disabled={saving}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} loading={saving}>
                        {editTarget ? "Update Target" : "Create Target"}
                    </Button>
                </Group>
            </Stack>
        </Modal>
    );
}
