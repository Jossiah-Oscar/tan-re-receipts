'use client'

import {AppShell, NavLink, rem, Space, Stack, Text} from '@mantine/core';
import {
    IconDashboard,
    IconUpload,
    IconReceipt,
    IconBuildingStore,
    IconReport,
    IconDevicesExclamation,
    IconContract,
    IconSettings,
    IconFileAnalytics,
    IconCoin, IconListNumbers
} from '@tabler/icons-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {useState} from "react";
import { usePathname } from "next/navigation";


interface SimpleNavbarProps {
    isCEO: boolean;
    isAdmin: boolean;
    userName: string;
}

export const SimpleNavbar = ({ isCEO, isAdmin, userName }: SimpleNavbarProps) => {
    let currentPath = '/dashboard';
    const [active, setActive] = useState('Billing');
    const pathname = usePathname();


    try {
        const router = useRouter();
        currentPath = router.pathname;
    } catch {
        // Router not available
    }

    // Common styles for nav links
    const navLinkStyles = {
        root: {
            borderRadius: rem(8),
            marginBottom: rem(4),
            fontWeight: 500,
            '&[dataActive]': {
                backgroundColor: 'var(--mantine-color-blue-0)',
                color: 'var(--mantine-color-blue-7)',
                '&:hover': {
                    backgroundColor: 'var(--mantine-color-blue-1)',
                }
            },
            '&:hover': {
                backgroundColor: 'var(--mantine-color-gray-0)',
            }
        },
        label: {
            fontSize: rem(14),
        }
    };

    return (
        <AppShell.Navbar
            p="md"
            style={{
                backgroundColor: 'var(--mantine-color-gray-0)',
                borderRight: '1px solid var(--mantine-color-gray-3)'
            }}
        >
            {/*<Stack gap="xs">*/}
            {/*    /!*<Text size="md">{userName}</Text>*!/*/}
            {/*    /!*<Text size="xs">{user.role}</Text>*!/*/}
            {/*</Stack>*/}
            {/*<Space h="xl" />*/}
            {/* Dashboard - Always visible */}
            <NavLink
                component={Link}
                href="/dashboard"
                label="Dashboard"
                leftSection={<IconDashboard size={18} stroke={1.5} />}
                styles={navLinkStyles}
                active={active === "dashboard"}
                onClick={() => setActive('dashboard')}
            />

            {/* Only show these if NOT CEO */}
            {!isCEO && (
                <>
                    <NavLink
                        component={Link}
                        href="/debit-upload"
                        label="Document Upload"
                        leftSection={<IconUpload size={18} stroke={1.5} />}
                        active={active === "Document_Upload"}
                        onClick={() => setActive('Document_Upload')}
                        styles={navLinkStyles}
                    />

                    <NavLink
                        component={Link}
                        href="/receipts"
                        label="Receipts"
                        leftSection={<IconReceipt size={18} stroke={1.5} />}
                        active={active === "Receipts"}
                        onClick={() => setActive('Receipts')}
                        styles={navLinkStyles}
                    />

                    <NavLink
                        component={Link}
                        href="/office-store"
                        label="Office Store"
                        leftSection={<IconBuildingStore size={18} stroke={1.5} />}
                        active={active === "Office_Store"}
                        onClick={() => setActive('Office_Store')}
                        styles={navLinkStyles}
                    />

                    <NavLink
                        component={Link}
                        href="/travel/processes-overview"
                        label="My Tasks"
                        leftSection={<IconListNumbers size={18} stroke={1.5} />}
                        active={active === "My_Tasks"}
                        onClick={() => setActive('My_Tasks')}
                        styles={navLinkStyles}
                    />

                    {/* Claims section */}
                    <NavLink
                        label="Claims"
                        leftSection={<IconReport size={18} stroke={1.5} />}
                        childrenOffset={32}
                        defaultOpened={currentPath.startsWith('/claims')}
                        styles={{
                            ...navLinkStyles,
                            root: {
                                ...navLinkStyles.root,
                                marginTop: rem(8),
                                marginBottom: rem(8),
                            }
                        }}
                    >
                        <NavLink
                            component={Link}
                            href="/claims"
                            label="Submit to Finance"
                            leftSection={<IconDevicesExclamation size={16} stroke={1.5} />}
                            active={active === "Submit_to_Finance"}
                            onClick={() => setActive('Submit_to_Finance')}
                            styles={{
                                root: {
                                    borderRadius: rem(6),
                                    marginBottom: rem(2),
                                    '&[dataActive]': {
                                        backgroundColor: 'var(--mantine-color-blue-0)',
                                        color: 'var(--mantine-color-blue-7)',
                                    },
                                    '&:hover': {
                                        backgroundColor: 'var(--mantine-color-gray-0)',
                                    }
                                }
                            }}
                        />
                        <NavLink
                            component={Link}
                            href="/claims-payment"
                            label="Claims To Pay"
                            leftSection={<IconContract size={16} stroke={1.5} />}
                            active={active === "Claims_To_Pay"}
                            onClick={() => setActive('Claims_To_Pay')}
                            styles={{
                                root: {
                                    borderRadius: rem(6),
                                    marginBottom: rem(2),
                                    '&[dataActive]': {
                                        backgroundColor: 'var(--mantine-color-blue-0)',
                                        color: 'var(--mantine-color-blue-7)',
                                    },
                                    '&:hover': {
                                        backgroundColor: 'var(--mantine-color-gray-0)',
                                    }
                                }
                            }}
                        />
                    </NavLink>

                    {/* Underwriting section */}
                    <NavLink
                        label="Underwriting"
                        leftSection={<IconContract size={18} stroke={1.5} />}
                        childrenOffset={32}
                        defaultOpened={pathname.startsWith('/underwriting')}
                        styles={{
                            ...navLinkStyles,
                            root: {
                                ...navLinkStyles.root,
                                marginTop: rem(8),
                                marginBottom: rem(8),
                            }
                        }}
                    >
                        <NavLink
                            component={Link}
                            href="/underwriting-analysis"
                            label="Underwriting Analysis"
                            leftSection={<IconFileAnalytics size={16} stroke={1.5} />}
                            active={active === "Underwriting_Analysis"}
                            onClick={() => setActive('Underwriting_Analysis')}
                            styles={{
                                root: {
                                    borderRadius: rem(6),
                                    marginBottom: rem(2),
                                    '&[dataActive]': {
                                        backgroundColor: 'var(--mantine-color-blue-0)',
                                        color: 'var(--mantine-color-blue-7)',
                                    },
                                    '&:hover': {
                                        backgroundColor: 'var(--mantine-color-gray-0)',
                                    }
                                }
                            }}
                        />
                        <NavLink
                            component={Link}
                            href="/underwriting/capacity-upload"
                            label="Capacity Upload"
                            leftSection={<IconCoin size={16} stroke={1.5} />}
                            active={active === "Capacity_Upload"}
                            onClick={() => setActive('Capacity_Upload')}
                            styles={{
                                root: {
                                    borderRadius: rem(6),
                                    marginBottom: rem(2),
                                    '&[dataActive]': {
                                        backgroundColor: 'var(--mantine-color-blue-0)',
                                        color: 'var(--mantine-color-blue-7)',
                                    },
                                    '&:hover': {
                                        backgroundColor: 'var(--mantine-color-gray-0)',
                                    }
                                }
                            }}
                        />
                    </NavLink>

                    <NavLink
                        component={Link}
                        href="/reports"
                        label="Report Center"
                        leftSection={<IconReport size={18} stroke={1.5} />}
                        active={active === "Report_Center"}
                        onClick={() => setActive('Report_Center')}
                        styles={navLinkStyles}
                    />

                    {/* Admin section - Only for admins */}
                    {isAdmin && (
                        <NavLink
                            component={Link}
                            href="/admin"
                            label="Admin"
                            leftSection={<IconSettings size={18} stroke={1.5} />}
                            active={active === "Admin"}
                            onClick={() => setActive('Admin')}
                            styles={{
                                ...navLinkStyles,
                                root: {
                                    ...navLinkStyles.root,
                                    marginTop: rem(16),
                                    borderTop: '1px solid var(--mantine-color-gray-3)',
                                    paddingTop: rem(16),
                                }
                            }}
                        />
                    )}
                </>
            )}
        </AppShell.Navbar>
    );
};

export default SimpleNavbar;
