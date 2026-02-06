'use client';

import { ActionIcon, Group, Stack, Text, Tooltip, Modal } from '@mantine/core';
import { IconEye } from '@tabler/icons-react';
import { useState } from 'react';
import { apiFetch } from '@/config/api';
import { useDisclosure } from '@mantine/hooks';

export interface ChecklistFile {
  id: number;
  checklistItemId: number;
  fileName: string;
  originalFileName: string;
  contentType: string;
  fileSize: number;
  uploadedBy: string;
  uploadedAt: string;
}

interface DocumentSectionPanelProps {
  documents: ChecklistFile[];
  sectionTitle?: string;
  caseId?: number;
}

export function DocumentSectionPanel({
  documents,
  sectionTitle = 'Documents',
  caseId
}: DocumentSectionPanelProps) {
  const [pdfModalOpened, { open: openPdfModal, close: closePdfModal }] = useDisclosure(false);
  const [selectedPDF, setSelectedPDF] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  async function viewPDF(file: ChecklistFile) {
    setPdfLoading(true);
    openPdfModal();

    try {
      const blob = await apiFetch<Blob>(
        `/api/debit-upload/tracker/case/${caseId}/file/${file.id}`,
        {
          requiresAuth: true,
        }
      );

      const url = URL.createObjectURL(blob);
      setSelectedPDF(url);
    } catch (error) {
      console.error('Error loading PDF:', error);
    } finally {
      setPdfLoading(false);
    }
  }

  if (documents.length === 0) {
    return null;
  }

  return (
    <>
      <Stack gap="xs">
        <Text size="sm" fw={500}>
          {sectionTitle} ({documents.length})
        </Text>
        <Group gap="xs">
          {documents.map((file) => (
            <Tooltip key={file.id} label={file.fileName}>
              <ActionIcon
                variant="light"
                color="blue"
                size="lg"
                onClick={() => viewPDF(file)}
              >
                <IconEye size={18} />
              </ActionIcon>
            </Tooltip>
          ))}
        </Group>
      </Stack>

      {/* PDF Viewer Modal */}
      <Modal
        opened={pdfModalOpened}
        onClose={() => {
          closePdfModal();
          if (selectedPDF) {
            URL.revokeObjectURL(selectedPDF);
            setSelectedPDF(null);
          }
        }}
        title="Document Viewer"
        size="xl"
        centered
      >
        {pdfLoading ? (
          <Text>Loading document...</Text>
        ) : selectedPDF ? (
          <iframe
            src={selectedPDF}
            style={{ width: '100%', height: '70vh', border: 'none' }}
            title="PDF Viewer"
          />
        ) : (
          <Text>No document selected</Text>
        )}
      </Modal>
    </>
  );
}
