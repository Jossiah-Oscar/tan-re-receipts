'use client'

import { useState, useEffect } from 'react';
import { Select } from '@mantine/core';
import { API_BASE_URL } from "@/config/api";

interface Client {
    BROKER_CEDANT_CODE: string;
    BROKER_CEDANT_NAME: string;
    BROKER_CEDANT_TYPE: string;
}

interface BrokerCedantDropdownProps {
    value: string | null;
    onChange: (val: string | null) => void;
}

export function BrokerCedantDropdown({value,
                                         onChange,
                                     }: BrokerCedantDropdownProps) {
    const [options, setOptions] = useState<{ value: string; label: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);


    useEffect(() => {
        const fetchCedants = async () => {
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
                setOptions(data.map((c) => ({
                    value: c.BROKER_CEDANT_CODE,
                    label: `${c.BROKER_CEDANT_NAME} (${c.BROKER_CEDANT_CODE})`,
                })));
                setError(null);
            } catch (err: any) {
                console.error("Error fetching broker cedants:", err);
                setError(err.message || "Failed to load options");
            } finally {
                setLoading(false);
            }
        };

        fetchCedants();
    }, []);

    return (
        <Select
            label="Broker / Cedant"
            placeholder="Select one…"
            searchable
            // nothingFound="No options"
            data={options}
            value={value}
            onChange={onChange}
        />
    );
}