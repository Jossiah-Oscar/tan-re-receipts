"use client";

import {Modal, Textarea, Button, Stack} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { useState } from "react";
import {apiFetch} from "@/config/api";

interface ReverseCommentModalProps {
    id: number;
    opened: boolean;
    onClose: () => void;
    onReversed: () => void;
}

export default function ReverseCommentModal({ id, opened, onClose, onReversed }: ReverseCommentModalProps) {
    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleReverse = async () => {
        setSubmitting(true);
        try {
            await apiFetch(`/api/documents/${id}/reverse`, {
                method: "POST",
                body: { comment },
            });
            showNotification({ message: "Document reversed to Pending", color: "yellow" });
            onReversed();
            onClose();
        } catch (err: any) {
            showNotification({ message: err.message, color: "red" });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal opened={opened} onClose={onClose} title="Reverse Document">
            <Stack>
            <Textarea
                placeholder="Enter reason for reversal"
                autosize
                minRows={3}
                value={comment}
                onChange={(e) => setComment(e.currentTarget.value)}
            />
            <Button mt="md" fullWidth
                    onClick={handleReverse}
                    loading={submitting}>
                Confirm Reverse
            </Button>
                </Stack>
        </Modal>
    );
}