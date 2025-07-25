'use client'


import ClaimsTable from "@/app/(app)/(claims)/claims/page";
import ClaimsPaymentTable from "@/components/claims/financeRequests";
import {Container, Stack, Title} from "@mantine/core";

export default function ClaimsPayment() {

    return (
       <Container size="xl" py="xl">
           <Stack>
           <Title order={2}>Claim Payment</Title>
       <ClaimsPaymentTable />

           </Stack>
       </Container>
    );
}