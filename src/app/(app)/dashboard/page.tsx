"use client"

import {useEffect, useState} from "react";
import {Container, Loader, SimpleGrid} from "@mantine/core";
import GwpCard from "@/components/dashboard/gwpCard";
import ClaimsCard from "@/components/dashboard/claimCard";
import {API_BASE_URL} from "@/config/api";

export interface DashboardSummary {
    currentMonth: string;
    monthlyTarget: number;
    currentMonthGwp: number;
    gwpProgressPercent: number;
    totalClaimsYtd: number;
}

export default function Dashboard() {
    const [gwp, setGwp] = useState<number | null>(null);
    const [claims, setClaims] = useState<number | null>(null);
    const monthlyTarget = 336_903_845_564 / 12;

    `${API_BASE_URL}/api/dashboard/gwp`

    useEffect(() => {
        fetch(`${API_BASE_URL}/api/dashboard/gwp`)
            .then((res) => res.json())
            .then((data) => setGwp(data));

        // fetch(`${API_BASE_URL}/api/dashboard/claims`)
        //     .then((res) => res.json())
        //     .then((data) => setClaims(data));
    }, []);

    if (gwp === null) return <Loader variant="bars" />;

    const progress = (gwp / monthlyTarget) * 100;

    return (
        <Container>
            <SimpleGrid cols={3} spacing="lg" >
                <GwpCard
                    currentGwp={gwp}
                    targetGwp={monthlyTarget}
                    progress={Number(progress.toFixed(2))}
                    month={'June'} // Or make dynamic
                />
                <GwpCard
                    currentGwp={gwp}
                    targetGwp={monthlyTarget}
                    progress={Number(progress.toFixed(2))}
                    month={'June'} // Or make dynamic
                />
                <GwpCard
                    currentGwp={gwp}
                    targetGwp={monthlyTarget}
                    progress={Number(progress.toFixed(2))}
                    month={'June'} // Or make dynamic
                />
                {/*<ClaimsCard claimsAmount={claims} />*/}
            </SimpleGrid>
        </Container>
    );
}