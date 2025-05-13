"use client";



import {Notifications} from "@mantine/notifications";
import {AppShell, Burger, Group, MantineProvider, NavLink} from "@mantine/core";
import Link from "next/link";
import {IconChevronRight} from "@tabler/icons-react";
import {useDisclosure} from "@mantine/hooks";

export default function Layout({ children }: { children: React.ReactNode }) {
    const [opened, { toggle }] = useDisclosure();

    return (

            <AppShell
                header={{ height: 60 }}
                navbar={{ width: 300, breakpoint: 'sm', collapsed: { mobile: !opened } }}
                padding="md"
            >
                <AppShell.Header>
                    <Group h="100%" px="md">
                        <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
                        {/*<MantineLogo size={30} />*/}
                    </Group>
                </AppShell.Header>
                <AppShell.Navbar p="md">
                    <NavLink
                        component={Link}
                        href="/debit-upload"
                        label="Document Upload"
                        rightSection={
                            <IconChevronRight size={12} stroke={1.5} className="mantine-rotate-rtl" />
                        }
                    />
                    <NavLink
                        component={Link}
                        href="/receipts"
                        label="Receipts"
                        rightSection={
                            <IconChevronRight size={12} stroke={1.5} className="mantine-rotate-rtl" />
                        }
                    />
                    {/* add more links as needed */}
                </AppShell.Navbar>
                <AppShell.Main>{children}</AppShell.Main>
            </AppShell>
    );
}