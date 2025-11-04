"use client";

import React, { useMemo, useState } from "react";
import {
    ActionIcon,
    Box,
    Button,
    Card,
    Container,
    Divider,
    Grid,
    Group,
    Modal,
    NumberInput,
    Paper,
    ScrollArea,
    Select,
    SimpleGrid,
    Stack,
    Table,
    Text,
    TextInput,
    Textarea,
    ThemeIcon,
    Title,
    Badge,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import {
    IconDeviceFloppy,
    IconEye,
    IconPlus,
    IconPrinter,
    IconTrash,
    IconFileInvoice,
    IconFileText,
    IconUser,
    IconUserCheck,
    IconCoin,
    IconCurrencyDollar,
    IconList,
    IconReceipt,
} from "@tabler/icons-react";

// ---------------- Types ----------------
// Test currencies - will be replaced by API later
const CURRENCIES = [
    { value: "KSH", label: "KSH - Kenyan Shilling" },
    { value: "USD", label: "USD - US Dollar" },
    { value: "EUR", label: "EUR - Euro" },
    { value: "GBP", label: "GBP - British Pound" },
];

interface AccountEntry {
    accountCode: string;
    accountName: string;
    sourceAmount: number; // amount in selected currency
    rateOfExchange: number; // selected currency -> TSH
    amountInTSH: number; // computed
}

interface VoucherFormData {
    voucherNumber: string;
    sourceCurrency: string; // selected currency (KSH, USD, etc.)
    payeeName: string;
    payeeAddress: string;
    dateOfPayment: Date | null;
    description: string;
    chequeNo: string;
    preparedBy: string;
    checkedBy: string;
    amountInWords: string;
    accountEntries: AccountEntry[];
}

// ---------------- Helpers ----------------
const fmt = (n: number) =>
    (Number.isFinite(n) ? n : 0).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

function numberToWords(num: number): string {
    // Basic EN words up to billions
    const ones = [
        "",
        "one",
        "two",
        "three",
        "four",
        "five",
        "six",
        "seven",
        "eight",
        "nine",
    ];
    const teens = [
        "ten",
        "eleven",
        "twelve",
        "thirteen",
        "fourteen",
        "fifteen",
        "sixteen",
        "seventeen",
        "eighteen",
        "nineteen",
    ];
    const tens = [
        "",
        "",
        "twenty",
        "thirty",
        "forty",
        "fifty",
        "sixty",
        "seventy",
        "eighty",
        "ninety",
    ];

    const chunk = (n: number): string => {
        if (n === 0) return "";
        if (n < 10) return ones[n];
        if (n < 20) return teens[n - 10];
        if (n < 100)
            return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
        return (
            ones[Math.floor(n / 100)] +
            " hundred" +
            (n % 100 ? " " + chunk(n % 100) : "")
        );
    };

    if (num === 0) return "zero";

    let words = "";
    const billions = Math.floor(num / 1_000_000_000);
    const millions = Math.floor((num % 1_000_000_000) / 1_000_000);
    const thousands = Math.floor((num % 1_000_000) / 1000);
    const rest = num % 1000;

    if (billions) words += chunk(billions) + " billion ";
    if (millions) words += chunk(millions) + " million ";
    if (thousands) words += chunk(thousands) + " thousand ";
    if (rest) words += chunk(rest);

    return words.trim();
}

const toYmd = (d: Date | null) =>
    d ? new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10) : "";

// ---------------- Component ----------------
export default function PaymentVoucherFormMantine() {
    const [formData, setFormData] = useState<VoucherFormData>({
        voucherNumber: "",
        sourceCurrency: "KSH", // default currency
        payeeName: "",
        payeeAddress: "",
        dateOfPayment: null,
        description: "",
        chequeNo: "",
        preparedBy: "",
        checkedBy: "",
        amountInWords: "",
        accountEntries: [
            { accountCode: "", accountName: "", sourceAmount: 0, rateOfExchange: 1, amountInTSH: 0 },
        ],
    });

    const [showPreview, setShowPreview] = useState(false);
    const [saving, setSaving] = useState(false);

    // ---- derived values ----
    const totalSourceAmount = useMemo(
        () => formData.accountEntries.reduce((t, e) => t + (e.sourceAmount || 0), 0),
        [formData.accountEntries]
    );

    const totalTsh = useMemo(
        () => formData.accountEntries.reduce((t, e) => t + (e.amountInTSH || 0), 0),
        [formData.accountEntries]
    );

    const amountInWords = useMemo(() => {
        const whole = Math.floor(totalTsh);
        const cents = Math.round((totalTsh - whole) * 100);
        let words = "TZS. ";
        const wholeWords = numberToWords(whole);
        words += wholeWords ? wholeWords[0].toUpperCase() + wholeWords.slice(1) : "Zero";
        if (cents > 0) words += " and " + numberToWords(cents) + " cents";
        return words + " only.";
    }, [totalTsh]);

    // ---- handlers ----
    const update = (k: keyof VoucherFormData, v: any) =>
        setFormData((p) => ({ ...p, [k]: v }));

    const updateEntry = (
        idx: number,
        field: keyof AccountEntry,
        value: string | number
    ) => {
        setFormData((prev) => {
            const entries = prev.accountEntries.map((e, i) => {
                if (i !== idx) return e;
                const next: AccountEntry = { ...e };
                // coerce numeric inputs
                if (field === "sourceAmount" || field === "rateOfExchange") {
                    (next as any)[field] = typeof value === "number" ? value : parseFloat(String(value)) || 0;
                    next.amountInTSH = (next.sourceAmount || 0) * (next.rateOfExchange || 1);
                } else {
                    (next as any)[field] = value as any;
                }
                return next;
            });
            return { ...prev, accountEntries: entries };
        });
    };

    const addEntry = () =>
        setFormData((p) => ({
            ...p,
            accountEntries: [
                ...p.accountEntries,
                { accountCode: "", accountName: "", sourceAmount: 0, rateOfExchange: 1, amountInTSH: 0 },
            ],
        }));

    const removeEntry = (idx: number) =>
        setFormData((p) => ({
            ...p,
            accountEntries: p.accountEntries.length > 1 ? p.accountEntries.filter((_, i) => i !== idx) : p.accountEntries,
        }));

    const handleSave = async () => {
        setSaving(true);
        try {
            const payload = {
                ...formData,
                dateOfPayment: toYmd(formData.dateOfPayment),
                total: totalTsh,
                totalTSH: totalTsh,
                amountInWords,
            };
            const res = await fetch("/api/payment-vouchers", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (!res.ok) throw new Error("Failed to save voucher");
            alert("Payment voucher saved successfully!");
        } catch (e: any) {
            alert(`Error: ${e?.message || e}`);
        } finally {
            setSaving(false);
        }
    };

    const handlePrint = () => {
        const win = window.open("", "_blank");
        if (!win) return;

        const d = toYmd(formData.dateOfPayment);

        // Calculate totals directly
        const totalSourceAmt = formData.accountEntries.reduce((total, entry) => {
            return total + (entry.sourceAmount || 0);
        }, 0);

        const totalTsh = formData.accountEntries.reduce((total, entry) => {
            return total + (entry.amountInTSH || 0);
        }, 0);

        // Generate amount in words
        const numberToWords = (num: number): string => {
            const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
            const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
            const teens = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];

            if (num === 0) return 'zero';
            if (num < 10) return ones[num];
            if (num < 20) return teens[num - 10];
            if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 !== 0 ? ' ' + ones[num % 10] : '');
            if (num < 1000) return ones[Math.floor(num / 100)] + ' hundred' + (num % 100 !== 0 ? ' ' + numberToWords(num % 100) : '');
            if (num < 1000000) return numberToWords(Math.floor(num / 1000)) + ' thousand' + (num % 1000 !== 0 ? ' ' + numberToWords(num % 1000) : '');
            if (num < 1000000000) return numberToWords(Math.floor(num / 1000000)) + ' million' + (num % 1000000 !== 0 ? ' ' + numberToWords(num % 1000000) : '');

            return num.toString();
        };

        const generateAmountInWords = () => {
            const wholePart = Math.floor(totalTsh);
            const decimalPart = Math.round((totalTsh - wholePart) * 100);

            let words = 'TZS. ' + numberToWords(wholePart).charAt(0).toUpperCase() + numberToWords(wholePart).slice(1);
            if (decimalPart > 0) {
                words += ' and ' + numberToWords(decimalPart) + ' cents';
            }
            words += ' only.';

            return words;
        };

        const amountInWords = generateAmountInWords();

        const rows = formData.accountEntries
            .map((e) => `
            <tr class="account-row">
                <td class="account-code">${e.accountCode || ""}</td>
                <td class="account-name">${e.accountName || ""}</td>
                <td class="amount-cell">${fmt(e.sourceAmount || 0)}</td>
                <td class="rate-cell">${e.rateOfExchange || 1}</td>
                <td class="amount-cell">${fmt(e.amountInTSH || 0)}</td>
            </tr>`)
            .join("");

        const empty = Array.from({ length: Math.max(0, 12 - formData.accountEntries.length) })
            .map(() => `
            <tr class="empty-row">
                <td>&nbsp;</td><td></td><td></td><td></td><td class="amount-cell">-</td>
            </tr>`)
            .join("");

        const html = `<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Voucher ${formData.voucherNumber}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            line-height: 1.4;
            color: #1f2937;
            background: #ffffff;
            padding: 40px;
            font-size: 13px;
        }

        .voucher-container {
            max-width: 210mm;
            margin: 0 auto;
            background: white;
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
            border-radius: 8px;
            overflow: hidden;
        }

        .header {
            background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
            color: white;
            padding: 24px 32px;
            text-align: center;
            position: relative;
        }

        .header h1 {
            font-size: 22px;
            font-weight: 700;
            margin-bottom: 12px;
            letter-spacing: 0.5px;
        }

        .header-subtitle {
            font-size: 12px;
            opacity: 0.9;
            line-height: 1.5;
        }

        .voucher-number {
            position: absolute;
            top: 24px;
            right: 32px;
            background: rgba(255, 255, 255, 0.15);
            backdrop-filter: blur(10px);
            padding: 8px 16px;
            border-radius: 6px;
            font-size: 18px;
            font-weight: 700;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .content {
            padding: 32px;
        }

        .section {
            margin-bottom: 24px;
        }

        .section-title {
            font-size: 14px;
            font-weight: 600;
            color: #374151;
            margin-bottom: 12px;
            padding-bottom: 6px;
            border-bottom: 2px solid #e5e7eb;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .info-table {
            border: none;
            box-shadow: none;
        }

        .info-table td {
            border: none;
            padding: 8px 12px;
            vertical-align: top;
        }

        .info-table .label {
            font-weight: 600;
            color: #374151;
            width: 30%;
        }

        .payment-details-table {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
        }

        .payment-details-table td {
            border: 1px solid #e2e8f0;
            padding: 12px;
        }

        .payment-details-table .header-cell {
            background: #1e40af;
            color: white;
            font-weight: 600;
            text-align: center;
        }

        .payment-details-table .bank-cell {
            background: #1e40af;
            color: white;
            font-weight: 600;
        }

        .payment-details-table .amount-highlight {
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
            font-weight: 700;
            font-size: 16px;
            text-align: center;
            color: #92400e;
        }

        .accounts-table th {
            background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
            color: white;
            padding: 12px;
            text-align: left;
            font-weight: 600;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .accounts-table td {
            border: 1px solid #e2e8f0;
            padding: 10px 12px;
        }

        .account-row:nth-child(even) {
            background: #f8fafc;
        }

        .account-row:hover {
            background: #f1f5f9;
        }

        .account-code {
            font-family: 'Courier New', monospace;
            font-weight: 500;
            color: #1e40af;
        }

        .account-name {
            font-weight: 500;
        }

        .amount-cell {
            text-align: right;
            font-weight: 500;
            font-family: 'Courier New', monospace;
        }

        .rate-cell {
            text-align: center;
            font-family: 'Courier New', monospace;
        }

        .empty-row {
            color: #9ca3af;
            font-style: italic;
        }

        .total-row {
            background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%) !important;
            color: white !important;
            font-weight: 700;
        }

        .total-row td {
            border-color: #1e40af !important;
        }

        .signatures-table {
            margin-top: 32px;
        }

        .signatures-table th {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            padding: 12px;
            font-weight: 600;
            color: #374151;
            text-align: center;
        }

        .signatures-table td {
            border: 1px solid #e2e8f0;
            padding: 20px 12px;
            height: 80px;
            vertical-align: bottom;
            position: relative;
        }

        .signature-line {
            border-top: 2px solid #374151;
            text-align: center;
            font-size: 11px;
            color: #6b7280;
            padding-top: 4px;
            margin-top: 8px;
        }

        .payee-signature {
            margin-bottom: 32px;
            font-size: 11px;
            color: #6b7280;
        }

        .amount-words {
            background: #f0f9ff;
            border: 1px solid #bfdbfe;
            padding: 12px;
            border-radius: 6px;
            font-style: italic;
            color: #1e40af;
            font-weight: 500;
        }

        .highlight-box {
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
            border: 1px solid #f59e0b;
            border-radius: 6px;
            padding: 12px;
            margin: 8px 0;
        }

        /* Print optimizations - Single Page */
        @media print {
            body {
                padding: 0;
                font-size: 10px;
                line-height: 1.2;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
            
            .voucher-container {
                box-shadow: none;
                border-radius: 0;
                height: 100vh;
                display: flex;
                flex-direction: column;
                page-break-inside: avoid;
            }
            
            .header {
                padding: 16px 24px;
                flex-shrink: 0;
            }
            
            .header h1 {
                font-size: 18px;
                margin-bottom: 8px;
            }
            
            .header-subtitle {
                font-size: 10px;
                line-height: 1.3;
            }
            
            .voucher-number {
                padding: 6px 12px;
                font-size: 16px;
                top: 16px;
                right: 24px;
            }
            
            .content {
                padding: 16px 24px;
                flex: 1;
                display: flex;
                flex-direction: column;
            }
            
            .section {
                margin-bottom: 12px;
                page-break-inside: avoid;
                break-inside: avoid;
            }
            
            .section-title {
                font-size: 12px;
                margin-bottom: 8px;
                padding-bottom: 4px;
            }
            
            .accounts-table {
                margin-bottom: 12px;
                font-size: 9px;
            }
            
            .accounts-table th {
                padding: 6px 8px;
                font-size: 9px;
            }
            
            .accounts-table td {
                padding: 4px 8px;
                font-size: 9px;
            }
            
            .signatures-table {
                margin-top: 16px;
                page-break-inside: avoid;
                break-inside: avoid;
            }
            
            .signatures-table th {
                padding: 8px;
                font-size: 9px;
            }
            
            .signatures-table td {
                padding: 12px 8px;
                height: 60px;
                font-size: 9px;
            }
            
            .payment-details-table {
                font-size: 10px;
            }
            
            .payment-details-table td {
                padding: 8px;
            }
            
            .amount-highlight {
                font-size: 14px;
            }
            
            .info-table td {
                padding: 4px 8px;
                font-size: 10px;
            }
            
            /* Force single page */
            * {
                page-break-inside: avoid !important;
                break-inside: avoid !important;
            }
            
            .voucher-container * {
                page-break-before: avoid !important;
                page-break-after: avoid !important;
            }
        }

        @page {
            margin: 15mm;
            size: A4 portrait;
            page-break-inside: avoid;
        }
    </style>
</head>
<body>
    <div class="voucher-container">
        <div class="header">
            <div class="voucher-number">#${formData.voucherNumber || ""}</div>
            <h1>TANZANIA REINSURANCE COMPANY LTD</h1>
            <div class="header-subtitle">
                8th & 9th Floors, TAN-RE House, Longido Street<br>
                Plot No. 406, Upanga, P.O.Box 1505 Dar es salaam<br>
                Email: mail@tan-re.co.tz • Website: www.tan-re.co.tz
            </div>
        </div>

        <div class="content">
            <!-- Payee Information Section -->
            <div class="section">
                <div class="section-title">Payee Information</div>
                <table class="info-table">
                    <tr>
                        <td class="label">Payee's Name & Address:</td>
                        <td><strong>${formData.payeeName || ""}</strong><br>${formData.payeeAddress || ""}</td>
                        <td class="label">Date of Payment:</td>
                        <td><strong>${d}</strong></td>
                    </tr>
                    <tr>
                        <td class="label">Description:</td>
                        <td colspan="3">${formData.description || ""}</td>
                    </tr>
                </table>
            </div>

            <!-- Payment Details Section -->
            <div class="section">
                <div class="section-title">Payment Details</div>
                <table class="payment-details-table">
                    <tr>
                        <td class="bank-cell">Bank</td>
                        <td class="header-cell">Cheque No</td>
                        <td class="header-cell">Date</td>
                        <td class="header-cell">Amount in TZS</td>
                    </tr>
                    <tr>
                        <td>CRDB</td>
                        <td style="text-align:center; font-weight:700; font-size:16px">${formData.chequeNo || ""}</td>
                        <td style="text-align:center; font-weight:600">${d}</td>
                        <td class="amount-highlight">${fmt(totalTsh)}</td>
                    </tr>
                </table>

                <table class="payment-details-table">
                    <tr>
                        <td class="label"><strong>Prepared By (ACC/AA/AAT):</strong><br>${formData.preparedBy || ""}</td>
                        <td class="label"><strong>Checked By (MA/AT):</strong><br>${formData.checkedBy || ""}</td>
                        <td class="label"><strong>Amount in Words:</strong><br><div class="amount-words">${amountInWords}</div></td>
                    </tr>
                </table>
            </div>

            <!-- Account Entries Section -->
            <div class="section">
                <div class="section-title">Account Breakdown</div>
                <table class="accounts-table">
                    <thead>
                        <tr>
                            <th style="width:15%">Account Code</th>
                            <th style="width:35%">Account Name</th>
                            <th style="width:15%">${formData.sourceCurrency}</th>
                            <th style="width:15%">Exchange Rate</th>
                            <th style="width:20%">Amount in TSH</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows}
                        ${empty}
                        <tr class="total-row">
                            <td colspan="2" style="text-align:center; font-weight:700">TOTAL</td>
                            <td >${fmt(totalSourceAmt)}</td>
                            <td></td>
                            <td >${fmt(totalTsh)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Signatures Section -->
            <div class="section">
                <div class="section-title">Authorization & Receipt</div>
                <table class="signatures-table">
                    <tr>
                        <th>Payment Certified By<br>CFAO/COO/SA</th>
                        <th>Payment Approved By<br>CEO/COO/CFAO</th>
                        <th>Payment Received By</th>
                    </tr>
                    <tr>
                        <td>
                            <div class="signature-line">Signature & Date</div>
                        </td>
                        <td>
                            <div class="signature-line">Signature & Date</div>
                        </td>
                        <td>
                            <div class="payee-signature">Signature of Payee</div>
                            <div class="signature-line">Signature & Date</div>
                        </td>
                    </tr>
                </table>
            </div>

            <!-- Footer -->
            <div style="margin-top: 32px; text-align: center; color: #6b7280; font-size: 11px; border-top: 1px solid #e5e7eb; padding-top: 16px;">
                <p>This document was generated electronically on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
                <p>Tanzania Reinsurance Company Ltd • Confidential Document</p>
            </div>
        </div>
    </div>
</body>
</html>`;

        win.document.open();
        win.document.write(html);
        win.document.close();
        win.focus();

        // Add a slight delay before printing to ensure CSS loads
        setTimeout(() => {
            win.print();
        }, 500);
    };

    // ---------------- UI ----------------
    return (
        <Container size="xl" py="md">
            {/* Header */}
            <Paper shadow="sm" p="lg" radius="md" mb="xl">
                <Group justify="space-between">
                    <div>
                        <Group gap="xs" mb={4}>
                            <IconFileInvoice size={28} />
                            <Title order={1}>Payment Voucher Generator</Title>
                        </Group>
                        <Text size="sm" c="dimmed" mt={4}>
                            Create and manage payment vouchers with automatic calculations
                        </Text>
                    </div>
                    <Group>
                        <Badge size="lg" variant="light" color="orange">
                            Draft Mode
                        </Badge>
                        <Badge size="lg" variant="light" color="blue">
                            {new Date().toLocaleDateString()}
                        </Badge>
                    </Group>
                </Group>

                <Divider my="md" />

                <Group justify="flex-end" gap="xs">
                    <Button leftSection={<IconEye size={16} />} variant="light" color="blue" onClick={() => setShowPreview(true)}>
                        Preview
                    </Button>
                    <Button leftSection={<IconPrinter size={16} />} variant="default" onClick={handlePrint}>
                        Print
                    </Button>
                    <Button leftSection={<IconDeviceFloppy size={16} />} color="green" loading={saving} onClick={handleSave}>
                        Save Voucher
                    </Button>
                </Group>
            </Paper>

            <Stack gap="lg">
                {/* Voucher Details Card */}
                <Card withBorder shadow="xs" radius="md" p="lg">
                    <Group gap="xs" mb="md">
                        <ThemeIcon size="lg" radius="md" variant="light" color="blue">
                            <IconFileText size={20} />
                        </ThemeIcon>
                        <div>
                            <Title order={4}>Voucher Details</Title>
                            <Text size="sm" c="dimmed">Basic voucher information and payment details</Text>
                        </div>
                    </Group>

                    <Grid gutter="md">
                        <Grid.Col span={{ base: 12, md: 3 }}>
                            <TextInput
                                label="Voucher Number"
                                placeholder="e.g., 111960"
                                value={formData.voucherNumber}
                                onChange={(e) => update("voucherNumber", e.currentTarget.value)}
                                required
                                withAsterisk
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 3 }}>
                            <Select
                                label="Source Currency"
                                placeholder="Select currency"
                                data={CURRENCIES}
                                value={formData.sourceCurrency}
                                onChange={(v) => update("sourceCurrency", v || "KSH")}
                                required
                                withAsterisk
                                leftSection={<IconCurrencyDollar size={16} />}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 3 }}>
                            <DateInput
                                label="Date of Payment"
                                value={formData.dateOfPayment}
                                onChange={(v) => update("dateOfPayment", v)}
                                valueFormat="YYYY-MM-DD"
                                required
                                withAsterisk
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 3 }}>
                            <TextInput
                                label="Cheque Number"
                                placeholder="e.g., 012924"
                                value={formData.chequeNo}
                                onChange={(e) => update("chequeNo", e.currentTarget.value)}
                                required
                                withAsterisk
                            />
                        </Grid.Col>
                    </Grid>
                </Card>

                {/* Payee Information Card */}
                <Card withBorder shadow="xs" radius="md" p="lg">
                    <Group gap="xs" mb="md">
                        <ThemeIcon size="lg" radius="md" variant="light" color="violet">
                            <IconUser size={20} />
                        </ThemeIcon>
                        <div>
                            <Title order={4}>Payee Information</Title>
                            <Text size="sm" c="dimmed">Details about the payment recipient</Text>
                        </div>
                    </Group>

                    <Grid gutter="md">
                        <Grid.Col span={12}>
                            <TextInput
                                label="Payee Name"
                                placeholder="e.g., TANZINDIA ASSURANCE CO. LTD"
                                value={formData.payeeName}
                                onChange={(e) => update("payeeName", e.currentTarget.value)}
                                required
                                withAsterisk
                            />
                        </Grid.Col>
                        <Grid.Col span={12}>
                            <Textarea
                                label="Payee Address"
                                placeholder="Full address of the payee"
                                autosize
                                minRows={2}
                                value={formData.payeeAddress}
                                onChange={(e) => update("payeeAddress", e.currentTarget.value)}
                            />
                        </Grid.Col>
                        <Grid.Col span={12}>
                            <Textarea
                                label="Description"
                                placeholder="e.g., Being amount paid for SETTLEMENT OF ARISING CLAIM ON NMB BANK LTD"
                                autosize
                                minRows={2}
                                value={formData.description}
                                onChange={(e) => update("description", e.currentTarget.value)}
                                required
                                withAsterisk
                            />
                        </Grid.Col>
                    </Grid>
                </Card>

                {/* Approval Details Card */}
                <Card withBorder shadow="xs" radius="md" p="lg">
                    <Group gap="xs" mb="md">
                        <ThemeIcon size="lg" radius="md" variant="light" color="green">
                            <IconUserCheck size={20} />
                        </ThemeIcon>
                        <div>
                            <Title order={4}>Approval Details</Title>
                            <Text size="sm" c="dimmed">Preparation and verification information</Text>
                        </div>
                    </Group>

                    <Grid gutter="md">
                        <Grid.Col span={{ base: 12, md: 6 }}>
                            <TextInput
                                label="Prepared By (ACC/AA/AAT)"
                                placeholder="Name of preparer"
                                value={formData.preparedBy}
                                onChange={(e) => update("preparedBy", e.currentTarget.value)}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6 }}>
                            <TextInput
                                label="Checked By (MA/AT)"
                                placeholder="Name of checker"
                                value={formData.checkedBy}
                                onChange={(e) => update("checkedBy", e.currentTarget.value)}
                            />
                        </Grid.Col>
                    </Grid>
                </Card>

                {/* Account Entries Card */}
                <Card withBorder shadow="xs" radius="md" p="lg">
                    <Group justify="space-between" align="center" mb="md">
                        <Group gap="xs">
                            <ThemeIcon size="lg" radius="md" variant="light" color="orange">
                                <IconReceipt size={20} />
                            </ThemeIcon>
                            <div>
                                <Title order={4}>Account Entries</Title>
                                <Text size="sm" c="dimmed">Line items with account codes and amounts</Text>
                            </div>
                        </Group>
                        <Button leftSection={<IconPlus size={16} />} onClick={addEntry} variant="light" color="orange">
                            Add Entry
                        </Button>
                    </Group>

                    {/* Summary Stats Cards */}
                    <SimpleGrid cols={{ base: 1, sm: 3 }} mb="lg">
                        <Card shadow="sm" padding="md" radius="md" withBorder bg="blue.0">
                            <Group>
                                <ThemeIcon size="lg" radius="md" variant="light" color="blue">
                                    <IconCoin size={20} />
                                </ThemeIcon>
                                <div>
                                    <Text size="xs" c="dimmed">Total {formData.sourceCurrency}</Text>
                                    <Text size="lg" fw={700}>{fmt(totalSourceAmount)}</Text>
                                </div>
                            </Group>
                        </Card>

                        <Card shadow="sm" padding="md" radius="md" withBorder bg="green.0">
                            <Group>
                                <ThemeIcon size="lg" radius="md" variant="light" color="green">
                                    <IconCurrencyDollar size={20} />
                                </ThemeIcon>
                                <div>
                                    <Text size="xs" c="dimmed">Total TSH</Text>
                                    <Text size="lg" fw={700}>{fmt(totalTsh)}</Text>
                                </div>
                            </Group>
                        </Card>

                        <Card shadow="sm" padding="md" radius="md" withBorder bg="violet.0">
                            <Group>
                                <ThemeIcon size="lg" radius="md" variant="light" color="violet">
                                    <IconList size={20} />
                                </ThemeIcon>
                                <div>
                                    <Text size="xs" c="dimmed">Number of Entries</Text>
                                    <Text size="lg" fw={700}>{formData.accountEntries.length}</Text>
                                </div>
                            </Group>
                        </Card>
                    </SimpleGrid>

                <ScrollArea>
                    <Table striped highlightOnHover withTableBorder withColumnBorders stickyHeader>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th style={{ width: "16%" }}>Account Code</Table.Th>
                                <Table.Th style={{ width: "34%" }}>Account Name</Table.Th>
                                <Table.Th style={{ width: "16%" }}>{formData.sourceCurrency}</Table.Th>
                                <Table.Th style={{ width: "16" }}>Rate</Table.Th>
                                <Table.Th style={{ width: "16%" }}>Amount in TSH</Table.Th>
                                <Table.Th style={{ width: 44 }}></Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {formData.accountEntries.map((e, i) => (
                                <Table.Tr key={i}>
                                    <Table.Td>
                                        <TextInput
                                            placeholder="Code"
                                            value={e.accountCode}
                                            onChange={(ev) => updateEntry(i, "accountCode", ev.currentTarget.value)}
                                        />
                                    </Table.Td>
                                    <Table.Td>
                                        <TextInput
                                            placeholder="Account name"
                                            value={e.accountName}
                                            onChange={(ev) => updateEntry(i, "accountName", ev.currentTarget.value)}
                                        />
                                    </Table.Td>
                                    <Table.Td>
                                        <NumberInput
                                            decimalScale={2}
                                            thousandSeparator
                                            placeholder="0.00"
                                            value={e.sourceAmount}
                                            onChange={(val) => updateEntry(i, "sourceAmount", Number(val) || 0)}
                                        />
                                    </Table.Td>
                                    <Table.Td>
                                        <NumberInput
                                            decimalScale={4}
                                            value={e.rateOfExchange}
                                            onChange={(val) => updateEntry(i, "rateOfExchange", Number(val) || 0)}
                                        />
                                    </Table.Td>
                                    <Table.Td>
                                        <Text fw={600} ta="right">{fmt(e.amountInTSH)}</Text>
                                    </Table.Td>
                                    <Table.Td>
                                        <ActionIcon
                                            color="red"
                                            variant="subtle"
                                            onClick={() => removeEntry(i)}
                                            disabled={formData.accountEntries.length <= 1}
                                            aria-label="Remove entry"
                                        >
                                            <IconTrash size={16} />
                                        </ActionIcon>
                                    </Table.Td>
                                </Table.Tr>
                            ))}
                        </Table.Tbody>
                    </Table>
                </ScrollArea>

                    <Divider my="lg" />

                    {/* Summary Totals Section */}
                    <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
                        <Card shadow="sm" padding="lg" radius="md" withBorder>
                            <Group gap="xs" mb="sm">
                                <ThemeIcon size="md" radius="md" variant="light" color="gray">
                                    <IconFileText size={18} />
                                </ThemeIcon>
                                <Text fw={600} size="sm">Amount in Words</Text>
                            </Group>
                            <Paper p="md" withBorder bg="gray.0">
                                <Text size="sm" c="dimmed" style={{ fontStyle: "italic" }}>
                                    {amountInWords}
                                </Text>
                            </Paper>
                        </Card>

                        <Stack gap="md">
                            <Card shadow="sm" padding="md" radius="md" withBorder bg="blue.1">
                                <Group justify="space-between">
                                    <Group gap="xs">
                                        <ThemeIcon size="md" radius="md" variant="filled" color="blue">
                                            <IconCoin size={18} />
                                        </ThemeIcon>
                                        <Text fw={600} size="sm">Total {formData.sourceCurrency}</Text>
                                    </Group>
                                    <Text fw={700} size="lg" c="blue.9">{fmt(totalSourceAmount)}</Text>
                                </Group>
                            </Card>

                            <Card shadow="sm" padding="md" radius="md" withBorder bg="green.1">
                                <Group justify="space-between">
                                    <Group gap="xs">
                                        <ThemeIcon size="md" radius="md" variant="filled" color="green">
                                            <IconCurrencyDollar size={18} />
                                        </ThemeIcon>
                                        <Text fw={600} size="sm">Total TSH</Text>
                                    </Group>
                                    <Text fw={700} size="lg" c="green.9">{fmt(totalTsh)}</Text>
                                </Group>
                            </Card>
                        </Stack>
                    </SimpleGrid>
                </Card>
            </Stack>

            <Modal
                opened={showPreview}
                onClose={() => setShowPreview(false)}
                size="85%"
                title={<Group gap={8}><IconEye size={16} /><Text>Payment Voucher Preview</Text></Group>}
                centered
                scrollAreaComponent={ScrollArea.Autosize}
            >
                {/* The preview content mirrors the printed layout but shown inline */}
                <Stack gap="sm">
                    <Group justify="space-between" align="center">
                        <Title order={4}>TANZANIA REINSURANCE COMPANY LTD</Title>
                        <Text fw={700} fz="lg">{formData.voucherNumber}</Text>
                    </Group>
                    <Text size="sm">8th & 9th Floors, TAN-RE House, Longido Street • Plot No. 406, Upanga, P.O.Box 1505 Dar es salaam</Text>
                    <Text size="sm">Email: mail@tan-re.co.tz • website: www.tan-re.co.tz</Text>

                    <Divider my="xs" />

                    <Grid>
                        <Grid.Col span={{ base: 12, md: 6 }}>
                            <Text fw={600}>Payee's Name & Address</Text>
                            <Text>{formData.payeeName}</Text>
                            <Text>{formData.payeeAddress}</Text>
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6 }}>
                            <Group justify="space-between">
                                <Text fw={600}>Date of Payment</Text>
                                <Text>{toYmd(formData.dateOfPayment)}</Text>
                            </Group>
                            <Group justify="space-between">
                                <Text fw={600}>Description</Text>
                                <Text>{formData.description}</Text>
                            </Group>
                        </Grid.Col>
                    </Grid>

                    <Card withBorder>
                        <Table withTableBorder>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>Bank</Table.Th>
                                    <Table.Th ta="center">Cheque No</Table.Th>
                                    <Table.Th ta="center">Date</Table.Th>
                                    <Table.Th ta="center">Amount in TZS</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                <Table.Tr>
                                    <Table.Td>CRDB</Table.Td>
                                    <Table.Td ta="center"><Text fw={700}>{formData.chequeNo}</Text></Table.Td>
                                    <Table.Td ta="center">{toYmd(formData.dateOfPayment)}</Table.Td>
                                    <Table.Td ta="center"><Text fw={700}>{fmt(totalTsh)}</Text></Table.Td>
                                </Table.Tr>
                            </Table.Tbody>
                        </Table>
                    </Card>

                    <Card withBorder>
                        <Table withTableBorder withColumnBorders>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>Account Code</Table.Th>
                                    <Table.Th>Account Name</Table.Th>
                                    <Table.Th ta="right">{formData.sourceCurrency}</Table.Th>
                                    <Table.Th ta="center">Rate</Table.Th>
                                    <Table.Th ta="right">Amount in TSH</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {formData.accountEntries.map((e, i) => (
                                    <Table.Tr key={i}>
                                        <Table.Td>{e.accountCode}</Table.Td>
                                        <Table.Td>{e.accountName}</Table.Td>
                                        <Table.Td ta="right">{fmt(e.sourceAmount)}</Table.Td>
                                        <Table.Td ta="center">{e.rateOfExchange}</Table.Td>
                                        <Table.Td ta="right">{fmt(e.amountInTSH)}</Table.Td>
                                    </Table.Tr>
                                ))}
                                <Table.Tr>
                                    <Table.Td fw={700} ta="center">Total</Table.Td>
                                    <Table.Td></Table.Td>
                                    <Table.Td ta="right" fw={700}>{fmt(totalSourceAmount)}</Table.Td>
                                    <Table.Td></Table.Td>
                                    <Table.Td ta="right" fw={700}>{fmt(totalTsh)}</Table.Td>
                                </Table.Tr>
                            </Table.Tbody>
                        </Table>
                    </Card>

                    <Group>
                        <Button leftSection={<IconPrinter size={16} />} onClick={handlePrint}>Print</Button>
                        <Button variant="default" onClick={() => setShowPreview(false)}>Close</Button>
                    </Group>
                </Stack>
            </Modal>
        </Container>
    );
}
