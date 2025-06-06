"use client"

import {useEffect, useState} from "react";
import {Box, Container, Flex, Loader, Modal, SimpleGrid, Stack} from "@mantine/core";
import GwpCard from "@/components/dashboard/gwpCard";
import ClaimsCard from "@/components/dashboard/claimCard";
import {API_BASE_URL} from "@/config/api";
import GwpMonthlyCard from "@/components/dashboard/gwpTable";

export interface DashboardSummary {
    currentMonth: string;
    monthlyTarget: number;
    currentMonthGwp: number;
    gwpProgressPercent: number;
    totalClaimsYtd: number;
}

export default function Dashboard() {
    const [gwp, setGwp] = useState<number | null>(null);
    const [gwpYear, setGwpYear] = useState<number | null>(null);
    const [claims, setClaims] = useState<number | null>(null);
    const [claimYear, setClaimYEar] = useState<number | null>(null);
    const [opened, setOpened] = useState(false);
    const [openedYearModal, setOpenedYearModal] = useState(false);



    const monthlyTarget = 336_903_845_564 / 12;
    const yearlyTarget: number = 336903845564;


    useEffect(() => {
        fetch(`${API_BASE_URL}/api/dashboard/gwp`)
            .then((res) => res.json())
            .then((data) => setGwp(data));

        fetch(`${API_BASE_URL}/api/dashboard/year-gwp`)
            .then((res) => res.json())
            .then((data) => setGwpYear(data));

        fetch(`${API_BASE_URL}/api/dashboard/claims`)
            .then((res) => res.json())
            .then((data) => setClaims(data));
        fetch(`${API_BASE_URL}/api/dashboard/year-claim`)
            .then((res) => res.json())
            .then((data) => setClaimYEar(data));
    }, []);

    if (gwp === null || gwpYear === null) return <Loader variant="bars" />;

    const progress = (gwp / monthlyTarget) * 100;
    const yearProgress =  (gwpYear / yearlyTarget) * 100

    return (
        <>
        <Container size="xl" py="sm" color={'red'}>
            <Stack align="center">
                <SimpleGrid cols={2} spacing="md" >
                    <Box onClick={() => setOpened(true)} style={{ cursor: 'pointer' }}>

                    <GwpCard
                        cardName={'Current Month GWP'}
                        currentGwp={gwp}
                        targetGwp={monthlyTarget}
                        progress={Number(progress.toFixed(2))}
                        month={'June'} // Or make dynamic
                    />
                    </Box>
                    <Box onClick={() => setOpenedYearModal(true)} style={{ cursor: 'pointer' }}>

                    <GwpCard
                        cardName={'Current Year GWP'}
                        currentGwp={gwpYear!}
                        targetGwp={yearlyTarget}
                        progress={Number(yearProgress.toFixed(2))}
                        month={'June'} // Or make dynamic
                    />
                    </Box>

                </SimpleGrid>

                    <SimpleGrid cols={2} spacing="md">
                        <ClaimsCard claimsAmount={claims!} cardName="Claims Payout this month" />
                        <ClaimsCard claimsAmount={claimYear!} cardName="Claims Payout this Year" />
                    </SimpleGrid>
            </Stack>
        </Container>


            {/* The Modal with the table */}
            <Modal
                opened={opened}
                onClose={() => setOpened(false)}
                size="lg"
                centered
            >
                <GwpMonthlyCard endPoint={"/api/dashboard/month/performance"} cardName={"GWP Performance – Current Month"}/>

            </Modal>

            {/* The Modal with the table */}
            <Modal
                opened={openedYearModal}
                onClose={() => setOpenedYearModal(false)}
                size="lg"
                centered
            >
                <GwpMonthlyCard endPoint={"/api/dashboard/year/performance"} cardName={"GWP Performance – Current Year"}/>

            </Modal>
        </>

    );
}