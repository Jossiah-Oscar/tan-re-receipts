'use client';

import { Stack, Paper, Text, Group, ActionIcon, Tooltip, Modal, Divider, Badge, Loader, Center } from '@mantine/core';
import { IconEye } from '@tabler/icons-react';
import { useState } from 'react';
import { ProcessDetailProps } from '@/types/workflow';
import { useDisclosure } from '@mantine/hooks';
import { showNotification } from '@mantine/notifications';
import {apiFetch} from "@/config/api";

type ChecklistFile = {
  id: number;
  fileName: string;
  originalFileName: string;
  contentType: string;
  fileSize: number;
  uploadedBy: string;
  uploadedAt: string;
};

type DebitUploadCaseData = {
  id: number;
  caseName: string;
  cedant: string;
  reinsurer: string;
  lineOfBusiness: string;
  status: 'PENDING' | 'READY';
  checklist: Array<{
    id: number;
    documentName: string;
    section: 'OPERATIONS' | 'FINANCE';
    files: ChecklistFile[];
  }>;
  operationsApprovalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
};

export function DebitUploadDetail({ data, task, loading }: ProcessDetailProps<DebitUploadCaseData>) {
  const [pdfModalOpened, { open: openPdfModal, close: closePdfModal }] = useDisclosure(false);
  const [currentPdfUrl, setCurrentPdfUrl] = useState<string>('');
  const [currentFileName, setCurrentFileName] = useState<string>('');
  const [pdfLoading, setPdfLoading] = useState(false);

  if (loading) {
    return (
      <Paper p="md" withBorder>
        <Center>
          <Stack align="center" gap="sm">
            <Loader size="md" />
            <Text size="sm" c="dimmed">Loading case details...</Text>
          </Stack>
        </Center>
      </Paper>
    );
  }

  if (!data) {
    return (
      <Paper p="md" withBorder>
        <Text size="sm" c="dimmed" ta="center">
          No case data available
        </Text>
      </Paper>
    );
  }

  // Extract OPERATIONS documents
  const operationsDocuments: ChecklistFile[] = [];
  data.checklist
    .filter(item => item.section === 'OPERATIONS')
    .forEach(item => {
      operationsDocuments.push(...item.files);
    });

  const viewPDF = async (file: ChecklistFile) => {
    setPdfLoading(true);
    try {
      const token = localStorage.getItem('jwt');
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_DOC_URL || 'http://localhost:3003';

      const response = await fetch(`${apiBaseUrl}/api/document-tracker/files/${file.id}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load PDF');
      }

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      setCurrentPdfUrl(blobUrl);
      setCurrentFileName(file.fileName);
      setPdfLoading(false);
      openPdfModal();
    } catch (error) {
      console.error('Error loading PDF:', error);
      setPdfLoading(false);
      showNotification({
        title: 'Error',
        message: 'Failed to load PDF file',
        color: 'red',
      });
    }
  };

  const handleClosePdfModal = () => {
    closePdfModal();
    // Clean up blob URL to prevent memory leaks
    if (currentPdfUrl) {
      window.URL.revokeObjectURL(currentPdfUrl);
      setCurrentPdfUrl('');
      setCurrentFileName('');
    }
  };

  const getApprovalStatusBadge = () => {
    switch (data.operationsApprovalStatus) {
      case 'APPROVED':
        return <Badge color="green" size="lg" variant="light">Approved</Badge>;
      case 'REJECTED':
        return <Badge color="red" size="lg" variant="light">Rejected</Badge>;
      case 'PENDING':
      default:
        return <Badge color="orange" size="lg" variant="light">Pending Approval</Badge>;
    }
  };

  return (
    <Stack gap="md">
      {/* Case Information */}
      <Paper p="md" withBorder radius="md" bg="gray.0">
        <Stack gap="sm">
          <Group justify="space-between" align="flex-start">
            <div style={{ flex: 1 }}>
              <Text fw={700} size="lg">{data.caseName}</Text>
              <Group gap="lg" mt="xs">
                <div>
                  <Text size="xs" c="dimmed" tt="uppercase" fw={600}>Cedant</Text>
                  <Text size="sm" fw={500}>{data.cedant}</Text>
                </div>
                <div>
                  <Text size="xs" c="dimmed" tt="uppercase" fw={600}>Reinsurer</Text>
                  <Text size="sm" fw={500}>{data.reinsurer}</Text>
                </div>
                <div>
                  <Text size="xs" c="dimmed" tt="uppercase" fw={600}>Line of Business</Text>
                  <Text size="sm" fw={500}>{data.lineOfBusiness}</Text>
                </div>
              </Group>
            </div>
            {getApprovalStatusBadge()}
          </Group>
        </Stack>
      </Paper>

      {/* OPERATIONS Documents Panel */}
      <Paper p="md" withBorder radius="md">
        <Stack gap="md">
          <Group justify="space-between">
            <Text fw={600} size="md">Operations Documents</Text>
            <Badge variant="filled" size="lg">
              {operationsDocuments.length} {operationsDocuments.length === 1 ? 'Document' : 'Documents'}
            </Badge>
          </Group>

          <Divider />

          {operationsDocuments.length === 0 ? (
            <Text size="sm" c="dimmed" ta="center" py="md">
              No Operations documents available
            </Text>
          ) : (
            <Group gap="xs">
              {operationsDocuments.map((file) => (
                <Tooltip key={file.id} label={file.fileName}>
                  <ActionIcon
                    variant="light"
                    color="blue"
                    size="lg"
                    onClick={() => viewPDF(file)}
                    loading={pdfLoading}
                  >
                    <IconEye size={18} />
                  </ActionIcon>
                </Tooltip>
              ))}
            </Group>
          )}
        </Stack>
      </Paper>

      {/* PDF Viewer Modal */}
      <Modal
        opened={pdfModalOpened}
        onClose={handleClosePdfModal}
        title={currentFileName}
        size="xl"
        fullScreen
      >
        {currentPdfUrl && (
          <div style={{ height: '85vh' }}>
            <iframe
              src={currentPdfUrl}
              style={{ width: '100%', height: '100%', border: 'none' }}
              title={currentFileName}
            />
          </div>
        )}
      </Modal>
    </Stack>
  );
}
