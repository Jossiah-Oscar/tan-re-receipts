'use client'


import ClaimsTable from "@/app/(app)/(claims)/claims/page";
import ClaimsPaymentTable from "@/components/claims/financeRequests";
import {Button, Card, Container, Group, Select, Stack, TextInput, Title} from "@mantine/core";

export default function ClaimsPayment() {

    return (
       <Container size="xl">
           <Stack>
           <Title order={3}>Claim Payment</Title>

       <ClaimsPaymentTable />

           </Stack>
       </Container>
    );
}
