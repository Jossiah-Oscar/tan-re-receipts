'use client';

import { Select } from '@mantine/core';

interface SearchableDropdownProps {
    label: string;
    placeholder: string;
    value: string;
    onChange: (value: string) => void;
    options: string[];
    disabled?: boolean;
}

export default function SearchableDropdown({
    label,
    placeholder,
    value,
    onChange,
    options,
    disabled = false
}: SearchableDropdownProps) {
    const data = options.map(option => ({
        value: option,
        label: option
    }));

    return (
        <Select
            label={label}
            placeholder={placeholder}
            searchable
            clearable
            data={data}
            value={value || null}
            onChange={(val) => onChange(val || '')}
            disabled={disabled}
            styles={{
                input: {
                    borderColor: '#d1d5db',
                    '&:focus': {
                        borderColor: '#3b82f6',
                        boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)'
                    }
                }
            }}
        />
    );
}
