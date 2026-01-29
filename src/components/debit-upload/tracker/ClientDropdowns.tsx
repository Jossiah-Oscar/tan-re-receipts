'use client'

import { useState, useEffect } from 'react';
import { Select } from '@mantine/core';
import { API_BASE_URL } from "@/config/api";

interface Client {
    BROKER_CEDANT_CODE: string;
    BROKER_CEDANT_NAME: string;
    BROKER_CEDANT_TYPE: string;
}

interface ClientDropdownProps {
    value: string | null;
    onChange: (name: string | null) => void;
    label: string;
    placeholder?: string;
}

// Store the mapping of CODE -> NAME globally for this component
let codeToNameMap: Map<string, string> = new Map();

function ClientDropdown({ value, onChange, label, placeholder }: ClientDropdownProps) {
    const [options, setOptions] = useState<{ value: string; label: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedCode, setSelectedCode] = useState<string | null>(null);

    useEffect(() => {
        const fetchClients = async () => {
            const token = localStorage.getItem('jwt');
            if (!token) {
                console.error("No JWT token found. Please log in.");
                setError("Authentication required. Please log in.");
                setLoading(false);
                return;
            }

            try {
                const res = await fetch(`${API_BASE_URL}/api/client/list`, {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json",
                        "Accept": "application/json",
                    },
                });

                if (!res.ok) {
                    if (res.status === 401 || res.status === 403) {
                        localStorage.removeItem("jwt");
                        window.location.href = "/login";
                        return;
                    }
                    throw new Error(`HTTP ${res.status} - ${res.statusText}`);
                }

                const data: Client[] = await res.json();

                // Build CODE -> NAME mapping
                codeToNameMap.clear();
                data.forEach((c) => {
                    codeToNameMap.set(c.BROKER_CEDANT_CODE, c.BROKER_CEDANT_NAME);
                });

                // Map to dropdown format using CODE as unique value
                setOptions(data.map((c) => ({
                    value: c.BROKER_CEDANT_CODE, // Use CODE as unique identifier
                    label: `${c.BROKER_CEDANT_NAME} (${c.BROKER_CEDANT_CODE})`,
                })));
                setError(null);
            } catch (err: any) {
                console.error("Error fetching clients:", err);
                setError(err.message || "Failed to load options");
            } finally {
                setLoading(false);
            }
        };

        fetchClients();
    }, []);

    // When component receives a NAME as value (from existing case), find the matching CODE
    useEffect(() => {
        if (value && !loading) {
            // Check if value is already a CODE
            if (codeToNameMap.has(value)) {
                setSelectedCode(value);
            } else {
                // Value is a NAME, find the corresponding CODE
                const foundCode = Array.from(codeToNameMap.entries()).find(
                    ([code, name]) => name === value
                )?.[0];
                setSelectedCode(foundCode || null);
            }
        } else {
            setSelectedCode(null);
        }
    }, [value, loading]);

    const handleChange = (code: string | null) => {
        setSelectedCode(code);
        // Convert CODE back to NAME when notifying parent
        const name = code ? codeToNameMap.get(code) || null : null;
        onChange(name);
    };

    return (
        <Select
            label={label}
            placeholder={placeholder || "Select one..."}
            searchable
            data={options}
            value={selectedCode}
            onChange={handleChange}
            disabled={loading}
            error={error}
        />
    );
}

export function CedantDropdown({ value, onChange }: Omit<ClientDropdownProps, 'label' | 'placeholder'>) {
    return (
        <ClientDropdown
            value={value}
            onChange={onChange}
            label="Cedant (Primary Insurer)"
            placeholder="Select cedant..."
        />
    );
}

export function ReinsurerDropdown({ value, onChange }: Omit<ClientDropdownProps, 'label' | 'placeholder'>) {
    return (
        <ClientDropdown
            value={value}
            onChange={onChange}
            label="Reinsurer"
            placeholder="Select reinsurer..."
        />
    );
}
