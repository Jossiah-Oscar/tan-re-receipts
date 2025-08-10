"use client";



import {AppShell, Burger, Group, MantineProvider, ColorSchemeScript , NavLink} from "@mantine/core";
import Link from "next/link";
import {
    IconArrowBackUp, IconBuildingStore,
    IconChevronRight, IconContract,
    IconDashboard, IconDevicesExclamation,
    IconFingerprint,
    IconReceipt, IconRegistered, IconReport, IconSettings,
    IconUpload
} from "@tabler/icons-react";
import {useDisclosure} from "@mantine/hooks";
import {useAuth} from "@/context/AuthContext";
import EnhancedNavbar from "@/components/dashboard-layout/navBar";

export default function Layout({ children }: { children: React.ReactNode }) {
    const [opened, { toggle }] = useDisclosure();
    const {username, roles} = useAuth();
    const isFinanca = roles.includes("FINANCE");
    const isAdmin = roles.includes("ADMIN");
    const isCEO = roles.includes("CEO");
    const user={ name: username, role: roles[0], avatar: null }





    return (

            <AppShell
                header={{ height: 50 }}
                navbar={{ width: 250, breakpoint: 'sm', collapsed: { mobile: !opened } }}
                // padding="xs"
            >
                <AppShell.Header>
                    <Group h="100%" px="md">
                        <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
                        {/*<MantineLogo size={30} />*/}
                    </Group>
                </AppShell.Header>

                {/*<EnhancedNavbar*/}
                {/*    isCEO={isCEO}*/}
                {/*    isAdmin={isAdmin}*/}
                {/*    user={user}*/}
                {/*/>*/}

                <AppShell.Navbar p="sm">
                    <NavLink
                        component={Link}
                        href="/dashboard"
                        label="Dashboard"
                        leftSection={<IconDashboard size={16} stroke={1.5} />}
                    />

                    {/* Only show these if NOT CEO */}
                    {!isCEO && (
                        <>
                            <NavLink
                                component={Link}
                                href="/debit-upload"
                                label="Document Upload"
                                leftSection={<IconUpload size={16} stroke={1.5} />}
                            />
                            <NavLink
                                component={Link}
                                href="/receipts"
                                label="Receipts"
                                leftSection={<IconReceipt size={16} stroke={1.5} />}
                            />
                            <NavLink
                                component={Link}
                                href="/office-store"
                                label="Office Store"
                                leftSection={<IconBuildingStore size={16} stroke={1.5} />}
                            />
                            <NavLink
                                href="#required-for-focus"
                                label="Claim"
                                leftSection={<IconReport size={16} stroke={1.5} />}
                                childrenOffset={28}
                            >
                                <NavLink
                                    component={Link}
                                    href="/claims"
                                    label="Submit to Finance"
                                    leftSection={<IconDevicesExclamation size={16} stroke={1.5} />}
                                />
                                <NavLink
                                    component={Link}
                                    href="/claims-payment"
                                    label="Claims To Pay"
                                    leftSection={<IconContract size={16} stroke={1.5} />}
                                />
                            </NavLink>

                            <NavLink
                                component={Link}
                                href="/reports"
                                label="Report Center"
                                leftSection={<IconReport size={16} stroke={1.5} />}
                            />

                            {isAdmin && (
                                <NavLink
                                    component={Link}
                                    href="/admin"
                                    label="Admin"
                                    leftSection={<IconSettings size={16} stroke={1.5} />}
                                />
                            )}
                        </>
                    )}
                </AppShell.Navbar>
                <AppShell.Main>{children}</AppShell.Main>
            </AppShell>
// </MantineProvider>
    );
}