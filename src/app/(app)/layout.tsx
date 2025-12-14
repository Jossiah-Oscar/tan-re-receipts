"use client";

import {
    AppShell,
    Burger,
    Group,
    MantineProvider,
    ColorSchemeScript,
    NavLink,
    Text,
    Avatar,
    Stack,
    Badge
} from "@mantine/core";

import {useDisclosure} from "@mantine/hooks";
import {useAuth} from "@/context/AuthContext";
import SimpleNavbar from "@/components/dashboard-layout/navBar";
import Logo from "@/resources/assets/logo3.jpg";
import Image from "next/image";


export default function Layout({ children }: { children: React.ReactNode }) {
    const [opened, { toggle }] = useDisclosure();
    const {username, roles} = useAuth();
    const isFinanca = roles.includes("FINANCE");
    const isAdmin = roles.includes("ADMIN");
    const isCEO = roles.includes("CEO");
    const user={ name: username, role: roles[0], avatar: null }

    // Get environment from build-time env variable
    const environment = process.env.NEXT_PUBLIC_ENVIRONMENT || 'LOCAL';
    const isLocal = environment === 'LOCAL';
    const isUAT = environment === 'UAT';
    const isProduction = environment === 'PRODUCTION';

    // Show badge for non-production environments
    const showEnvironmentBadge = !isProduction;


    return (

            <AppShell
                header={{ height: 60 }}
                navbar={{ width: 250, breakpoint: 'sm', collapsed: { mobile: !opened } }}
                // padding="xs"
            >
                <AppShell.Header>
                    <Group h="100%" px="lg" justify="space-between">
                        {/* Left side: logo and environment badge */}
                        <Group gap="md">
                            <Image src={Logo} alt="Illustration" width={110} height={300}/>
                            {showEnvironmentBadge && (
                                <Badge
                                    size="lg"
                                    color={isLocal ? 'blue' : 'orange'}
                                    variant="filled"
                                    styles={{
                                        root: {
                                            textTransform: 'uppercase',
                                            fontWeight: 700,
                                            letterSpacing: '0.5px'
                                        }
                                    }}
                                >
                                    {isLocal ? 'Local Development' : 'UAT Environment'}
                                </Badge>
                            )}
                        </Group>

                        {/* Right side: user section */}
                        <Group gap="xs">
                            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
                            <Avatar  />
                            <Stack gap="xs">
                                <Text size="md">{user.name}</Text>
                                {/* <Text size="xs">{user.role}</Text> */}
                            </Stack>
                        </Group>
                    </Group>
                </AppShell.Header>

                <SimpleNavbar isCEO={isCEO} isAdmin={isAdmin} userName={user.name} />


                {/*<AppShell.Navbar p="sm">*/}
                {/*    <NavLink*/}
                {/*        component={Link}*/}
                {/*        href="/dashboard"*/}
                {/*        label="Dashboard"*/}
                {/*        leftSection={<IconDashboard size={16} stroke={1.5} />}*/}
                {/*    />*/}

                {/*    /!* Only show these if NOT CEO *!/*/}
                {/*    {!isCEO && (*/}
                {/*        <>*/}
                {/*            <NavLink*/}
                {/*                component={Link}*/}
                {/*                href="/debit-upload"*/}
                {/*                label="Document Upload"*/}
                {/*                leftSection={<IconUpload size={16} stroke={1.5} />}*/}
                {/*            />*/}
                {/*            <NavLink*/}
                {/*                component={Link}*/}
                {/*                href="/receipts"*/}
                {/*                label="Receipts"*/}
                {/*                leftSection={<IconReceipt size={16} stroke={1.5} />}*/}
                {/*            />*/}
                {/*            <NavLink*/}
                {/*                component={Link}*/}
                {/*                href="/office-store"*/}
                {/*                label="Office Store"*/}
                {/*                leftSection={<IconBuildingStore size={16} stroke={1.5} />}*/}
                {/*            />*/}
                {/*            <NavLink*/}
                {/*                href="#required-for-focus"*/}
                {/*                label="Claim"*/}
                {/*                leftSection={<IconReport size={16} stroke={1.5} />}*/}
                {/*                childrenOffset={28}*/}
                {/*            >*/}
                {/*                <NavLink*/}
                {/*                    component={Link}*/}
                {/*                    href="/claims"*/}
                {/*                    label="Submit to Finance"*/}
                {/*                    leftSection={<IconDevicesExclamation size={16} stroke={1.5} />}*/}
                {/*                />*/}
                {/*                <NavLink*/}
                {/*                    component={Link}*/}
                {/*                    href="/claims-payment"*/}
                {/*                    label="Claims To Pay"*/}
                {/*                    leftSection={<IconContract size={16} stroke={1.5} />}*/}
                {/*                />*/}
                {/*            </NavLink>*/}

                {/*            <NavLink*/}
                {/*                component={Link}*/}
                {/*                href="/reports"*/}
                {/*                label="Report Center"*/}
                {/*                leftSection={<IconReport size={16} stroke={1.5} />}*/}
                {/*            />*/}

                {/*            {isAdmin && (*/}
                {/*                <NavLink*/}
                {/*                    component={Link}*/}
                {/*                    href="/admin"*/}
                {/*                    label="Admin"*/}
                {/*                    leftSection={<IconSettings size={16} stroke={1.5} />}*/}
                {/*                />*/}
                {/*            )}*/}
                {/*        </>*/}
                {/*    )}*/}
                {/*</AppShell.Navbar>*/}
                <AppShell.Main>{children}</AppShell.Main>
            </AppShell>
// </MantineProvider>
    );
}
