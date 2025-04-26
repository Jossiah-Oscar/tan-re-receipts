'use client'

import { useState, useEffect } from 'react';
import { Select } from '@mantine/core';
import {API_BASE_URl_DOC} from "@/config/api";

interface Cedant {
    code: string;
    name: string;
    type: 'B' | 'C';
}

interface BrokerCedantDropdownProps {
    value: string | null;
    onChange: (val: string | null) => void;
}

export function BrokerCedantDropdown({value,
                                         onChange,
                                     }: BrokerCedantDropdownProps) {
    const [options, setOptions] = useState<{ value: string; label: string }[]>([]);

    useEffect(() => {
        fetch(`${API_BASE_URl_DOC}/api/broker-cedants`)
            .then((res) => res.json())
            .then((data: Cedant[]) =>
                setOptions(
                    data.map((c) => ({
                        value: c.code,
                        label: `${c.name} (${c.code})`,
                    }))
                )
            );
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