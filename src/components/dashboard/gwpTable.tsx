'use client'

import {useEffect, useState} from "react";
import axios from "axios";
import {Card, Center, Loader, Table, Text} from "@mantine/core";
import {API_BASE_URL} from "@/config/api";

interface GwpMonthlyCardProps {
    endPoint: string;
    cardName: string;
}

export default function GwpMonthlyCard({ endPoint, cardName }: GwpMonthlyCardProps) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true); // Show loader
        fetch(`${API_BASE_URL}${endPoint}`)
            .then((res) => res.json())
            .then((data) => {
                setData(data)       ;
                setLoading(false); // Hide loader
            });
    }, []);

    if (loading) {
        return (
            <Center style={{ height: '25vh' }}>
                <Loader size="lg" />
            </Center>
        );
    }

    return (
        <>
                <Card mt="md" shadow="sm" padding="lg" withBorder>
                    <Text size="lg" w={500} mb="sm">{cardName}</Text>
                    <Table striped highlightOnHover>
                        <Table.Thead>
                        <Table.Tr>
                            <Table.Th>Unit</Table.Th>
                            <Table.Th>Actual GWP</Table.Th>
                            <Table.Th>Target</Table.Th>
                            <Table.Th>Performance (%)</Table.Th>
                        </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                        {data.map((row: any, index: number) => (
                            <Table.Tr key={index}>
                                <Table.Td>{row.category}</Table.Td>
                                <Table.Td>{Number(row.actualGwp).toLocaleString(undefined, { minimumFractionDigits: 2 })}</Table.Td>
                                <Table.Td>{Number(row.target).toLocaleString(undefined, { minimumFractionDigits: 2 })}</Table.Td>
                                <Table.Td>{row.performancePercent}%</Table.Td>
                            </Table.Tr>
                        ))}
                        </Table.Tbody>
                    </Table>
                </Card>

        </>
    );
}