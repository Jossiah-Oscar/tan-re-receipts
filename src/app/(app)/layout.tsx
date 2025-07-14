"use client";



import {Notifications} from "@mantine/notifications";
import {AppShell, Burger, Group, MantineProvider, Menu, NavLink} from "@mantine/core";
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

export default function Layout({ children }: { children: React.ReactNode }) {
    const [opened, { toggle }] = useDisclosure();
    const {username, roles} = useAuth();
    const isFinanca = roles.includes("FINANCE");
    const isAdmin = roles.includes("ADMIN");




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
                <AppShell.Navbar p="md">
                    <NavLink
                        component={Link}
                        href="/dashboard"
                        label="Dashboard"
                        leftSection={<IconDashboard size={16} stroke={1.5} />}
                        // rightSection={
                        //     <IconChevronRight size={12} stroke={1.5} className="mantine-rotate-rtl" />
                        // }
                    />
                    <NavLink
                        component={Link}
                        href="/debit-upload"
                        label="Document Upload"
                        leftSection={<IconUpload size={16} stroke={1.5} />}

                        // rightSection={
                        //     <IconChevronRight size={12} stroke={1.5} className="mantine-rotate-rtl" />
                        // }
                    />
                    <NavLink
                        component={Link}
                        href="/receipts"
                        label="Receipts"
                        leftSection={<IconReceipt size={16} stroke={1.5} />}

                        // rightSection={
                        //     <IconChevronRight size={12} stroke={1.5} className="mantine-rotate-rtl" />
                        // }
                    />
                    <NavLink
                        component={Link}
                        href="/office-store"
                        label="Office Store"
                        leftSection={<IconBuildingStore size={16} stroke={1.5} />}

                        // rightSection={
                        //     <IconChevronRight size={12} stroke={1.5} className="mantine-rotate-rtl" />
                        // }
                    />

                    <NavLink
                        href="#required-for-focus"
                        label="Claim"
                        leftSection={<IconReport size={16} stroke={1.5} />}
                        childrenOffset={28}
                    >

                        {/*<NavLink*/}
                        {/*    component={Link}*/}
                        {/*    href="/claims"*/}
                        {/*    label="Register Claims"*/}
                        {/*    leftSection={<IconContract size={16} stroke={1.5} />}*/}
                        {/*/>*/}

                        <NavLink
                            component={Link}
                            href="/claims"
                            label="Submit to Finance"
                            leftSection={<IconDevicesExclamation size={16} stroke={1.5} />}

                            // rightSection={
                            //     <IconChevronRight size={12} stroke={1.5} className="mantine-rotate-rtl" />
                            // }
                        />

                        {/*{isFinanca && (*/}
                            <NavLink
                                component={Link}
                                href="/claims-payment"
                                label="Claims To Pay"
                                leftSection={<IconContract size={16} stroke={1.5} />}

                                // rightSection={
                                //     <IconChevronRight size={12} stroke={1.5} className="mantine-rotate-rtl" />
                                // }
                            />

                        {/*)}*/}
                        {/*<NavLink label="Second child link" href="#required-for-focus" />*/}
                        {/*<NavLink label="Third child link" href="#required-for-focus" />*/}
                    </NavLink>



                    {/*<NavLink*/}
                    {/*    href="#required-for-focus"*/}
                    {/*    label="Reports"*/}
                    {/*    leftSection={<IconReport size={16} stroke={1.5} />}*/}
                    {/*    childrenOffset={28}*/}
                    {/*>*/}
                    {/*    <NavLink label="Outstanding Transactions" href="/reports/premium-register" />*/}
                    {/*    /!*<NavLink label="Second child link" href="#required-for-focus" />*!/*/}
                    {/*    /!*<NavLink label="Third child link" href="#required-for-focus" />*!/*/}
                    {/*</NavLink>*/}


                    {isAdmin && (
                    <NavLink
                        component={Link}
                        href="/admin"
                        label="Admin"
                        leftSection={<IconSettings size={16} stroke={1.5} />}
                        // rightSection={
                        //     <IconChevronRight size={12} stroke={1.5} className="mantine-rotate-rtl" />
                        // }
                    />
                    )}
                    {/* add more links as needed */}
                </AppShell.Navbar>
                <AppShell.Main>{children}</AppShell.Main>
            </AppShell>
    );
}