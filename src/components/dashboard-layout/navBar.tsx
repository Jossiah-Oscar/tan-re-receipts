import { useState } from 'react';
import {
    AppShell,
    NavLink,
    Text,
    Group,
    Badge,
    Tooltip,
    ActionIcon,
    Divider,
    Box,
    Avatar,
    UnstyledButton,
    Collapse,
    Stack,
    rem,
    useMantineTheme
} from '@mantine/core';
import {
    IconDashboard,
    IconUpload,
    IconReceipt,
    IconBuildingStore,
    IconReport,
    IconDevicesExclamation,
    IconContract,
    IconSettings,
    IconChevronRight,
    IconChevronDown,
    IconBell,
    IconUser,
    IconLogout,
    IconHome,
    IconFileText,
    IconCoin
} from '@tabler/icons-react';

// Mock data - replace with your actual props/context
const EnhancedNavbar = ({ isCEO = false, isAdmin = true, user = { name: 'John Doe', role: 'Admin', avatar: null } }) => {
    const theme = useMantineTheme();
    const [claimSubmenuOpen, setClaimSubmenuOpen] = useState(false);
    const [activeLink, setActiveLink] = useState('/dashboard');

    // Navigation items configuration
    const navigationItems = [
        {
            id: 'dashboard',
            href: '/dashboard',
            label: 'Dashboard',
            icon: IconDashboard,
            color: 'blue',
            badge: null,
            description: 'Overview and analytics'
        },
        ...(!isCEO ? [
            {
                id: 'document-upload',
                href: '/debit-upload',
                label: 'Document Upload',
                icon: IconUpload,
                color: 'green',
                badge: null,
                description: 'Upload and manage documents'
            },
            {
                id: 'receipts',
                href: '/receipts',
                label: 'Receipts',
                icon: IconReceipt,
                color: 'orange',
                badge: 'New',
                description: 'View and manage receipts'
            },
            {
                id: 'office-store',
                href: '/office-store',
                label: 'Office Store',
                icon: IconBuildingStore,
                color: 'purple',
                badge: null,
                description: 'Office supplies and inventory'
            }
        ] : []),
        {
            id: 'reports',
            href: '/reports',
            label: 'Report Center',
            icon: IconFileText,
            color: 'teal',
            badge: null,
            description: 'Generate and download reports'
        }
    ];

    const claimItems = [
        {
            href: '/claims',
            label: 'Submit to Finance',
            icon: IconDevicesExclamation,
            badge: '3',
            description: 'Submit claims for processing'
        },
        {
            href: '/claims-payment',
            label: 'Claims To Pay',
            icon: IconContract,
            badge: null,
            description: 'Process pending payments'
        }
    ];

    const handleNavClick = (href) => {
        setActiveLink(href);
    };

    const NavItem = ({ item, isActive, onClick, compact = false }) => (
        <Tooltip
            label={item.description}
            position="right"
            withArrow
            disabled={!compact}
            openDelay={500}
        >
            <NavLink
                component="a"
                href={item.href}
                label={
                    <Group gap="sm" justify="space-between" w="100%">
                        <Group gap="sm">
                            <Text size={compact ? "xs" : "sm"} fw={500}>
                                {item.label}
                            </Text>
                        </Group>
                        {item.badge && (
                            <Badge
                                size="xs"
                                variant="filled"
                                color={item.color}
                            >
                                {item.badge}
                            </Badge>
                        )}
                    </Group>
                }
                leftSection={
                    <Box
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: rem(28),
                            height: rem(28),
                            borderRadius: rem(6),
                            backgroundColor: isActive
                                ? `var(--mantine-color-${item.color}-light)`
                                : 'transparent',
                            color: isActive
                                ? `var(--mantine-color-${item.color}-6)`
                                : theme.colors.gray[6],
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <item.icon size={16} stroke={1.5} />
                    </Box>
                }
                onClick={() => onClick(item.href)}
                active={isActive}
                variant="subtle"
                style={{
                    borderRadius: rem(8),
                    marginBottom: rem(4),
                    padding: rem(12),
                    transition: 'all 0.2s ease',
                    border: isActive ? `1px solid var(--mantine-color-${item.color}-3)` : '1px solid transparent',
                    backgroundColor: isActive
                        ? `var(--mantine-color-${item.color}-0)`
                        : 'transparent',
                }}
            />
        </Tooltip>
    );

    const ClaimSubmenu = () => (
        <Box ml={rem(8)}>
            <UnstyledButton
                onClick={() => setClaimSubmenuOpen(!claimSubmenuOpen)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: `${rem(12)} ${rem(16)}`,
                    borderRadius: rem(8),
                    transition: 'all 0.2s ease',
                    backgroundColor: claimSubmenuOpen
                        ? 'var(--mantine-color-red-0)'
                        : 'transparent',
                    border: `1px solid ${claimSubmenuOpen ? 'var(--mantine-color-red-3)' : 'transparent'}`,
                    marginBottom: rem(4)
                }}
            >
                <Group gap="sm">
                    <Box
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: rem(28),
                            height: rem(28),
                            borderRadius: rem(6),
                            backgroundColor: claimSubmenuOpen
                                ? 'var(--mantine-color-red-light)'
                                : 'transparent',
                            color: claimSubmenuOpen
                                ? 'var(--mantine-color-red-6)'
                                : theme.colors.gray[6],
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <IconReport size={16} stroke={1.5} />
                    </Box>
                    <Text size="sm" fw={500}>
                        Claim Management
                    </Text>
                </Group>
                <Group gap="xs">
                    <Badge size="xs" color="red" variant="filled">
                        5
                    </Badge>
                    {claimSubmenuOpen ? (
                        <IconChevronDown size={14} />
                    ) : (
                        <IconChevronRight size={14} />
                    )}
                </Group>
            </UnstyledButton>

            <Collapse in={claimSubmenuOpen}>
                <Stack gap={rem(4)} mt={rem(8)} ml={rem(20)}>
                    {claimItems.map((item, index) => (
                        <NavLink
                            key={index}
                            component="a"
                            href={item.href}
                            label={
                                <Group gap="sm" justify="space-between" w="100%">
                                    <Text size="sm">{item.label}</Text>
                                    {item.badge && (
                                        <Badge size="xs" color="red" variant="light">
                                            {item.badge}
                                        </Badge>
                                    )}
                                </Group>
                            }
                            leftSection={
                                <Box
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: rem(24),
                                        height: rem(24),
                                        borderRadius: rem(4),
                                        color: theme.colors.gray[6]
                                    }}
                                >
                                    <item.icon size={14} stroke={1.5} />
                                </Box>
                            }
                            onClick={() => handleNavClick(item.href)}
                            active={activeLink === item.href}
                            variant="subtle"
                            style={{
                                borderRadius: rem(6),
                                padding: `${rem(8)} ${rem(12)}`,
                                transition: 'all 0.2s ease',
                                backgroundColor: activeLink === item.href
                                    ? 'var(--mantine-color-red-0)'
                                    : 'transparent',
                            }}
                        />
                    ))}
                </Stack>
            </Collapse>
        </Box>
    );

    return (
        <AppShell.Navbar p="md" style={{ backgroundColor: 'var(--mantine-color-gray-0)' }}>
            {/* User Profile Section */}
            <Box mb="lg">
                <Group gap="sm" p="sm" style={{
                    backgroundColor: 'white',
                    borderRadius: rem(12),
                    border: '1px solid var(--mantine-color-gray-2)'
                }}>
                    <Avatar
                        src={user.avatar}
                        size={40}
                        radius="xl"
                        style={{
                            background: 'linear-gradient(45deg, var(--mantine-color-blue-5), var(--mantine-color-cyan-5))',
                            color: 'white'
                        }}
                    >
                        <IconUser size={20} />
                    </Avatar>
                    <Box style={{ flex: 1 }}>
                        <Text size="sm" fw={600} c="dark">
                            {user.name}
                        </Text>
                        <Text size="xs" c="dimmed">
                            {user.role}
                        </Text>
                    </Box>
                    <Group gap="xs">
                        <ActionIcon variant="subtle" size="sm">
                            <IconBell size={16} />
                        </ActionIcon>
                        <ActionIcon variant="subtle" size="sm" color="red">
                            <IconLogout size={16} />
                        </ActionIcon>
                    </Group>
                </Group>
            </Box>

            {/* Navigation Section */}
            <Box mb="lg">
                <Text size="xs" fw={600} c="dimmed" mb="sm" px="sm" tt="uppercase" ls={1}>
                    Navigation
                </Text>
                <Stack gap={rem(2)}>
                    {navigationItems.map((item) => (
                        <NavItem
                            key={item.id}
                            item={item}
                            isActive={activeLink === item.href}
                            onClick={handleNavClick}
                        />
                    ))}

                    {!isCEO && <ClaimSubmenu />}

                    {isAdmin && (
                        <NavItem
                            item={{
                                href: '/admin',
                                label: 'Admin Panel',
                                icon: IconSettings,
                                color: 'dark',
                                badge: null,
                                description: 'System administration'
                            }}
                            isActive={activeLink === '/admin'}
                            onClick={handleNavClick}
                        />
                    )}
                </Stack>
            </Box>

            {/*<Divider my="md" />*/}

            {/* Quick Actions */}
            {/*<Box>*/}
            {/*    <Text size="xs" fw={600} c="dimmed" mb="sm" px="sm" tt="uppercase" ls={1}>*/}
            {/*        Quick Actions*/}
            {/*    </Text>*/}
            {/*    <Group gap="xs" mb="sm">*/}
            {/*        <Tooltip label="Home" withArrow>*/}
            {/*            <ActionIcon*/}
            {/*                variant="light"*/}
            {/*                color="blue"*/}
            {/*                size="lg"*/}
            {/*                style={{ borderRadius: rem(8) }}*/}
            {/*            >*/}
            {/*                <IconHome size={18} />*/}
            {/*            </ActionIcon>*/}
            {/*        </Tooltip>*/}
            {/*        <Tooltip label="New Document" withArrow>*/}
            {/*            <ActionIcon*/}
            {/*                variant="light"*/}
            {/*                color="green"*/}
            {/*                size="lg"*/}
            {/*                style={{ borderRadius: rem(8) }}*/}
            {/*            >*/}
            {/*                <IconUpload size={18} />*/}
            {/*            </ActionIcon>*/}
            {/*        </Tooltip>*/}
            {/*        <Tooltip label="Finance" withArrow>*/}
            {/*            <ActionIcon*/}
            {/*                variant="light"*/}
            {/*                color="orange"*/}
            {/*                size="lg"*/}
            {/*                style={{ borderRadius: rem(8) }}*/}
            {/*            >*/}
            {/*                <IconCoin size={18} />*/}
            {/*            </ActionIcon>*/}
            {/*        </Tooltip>*/}
            {/*    </Group>*/}
            {/*</Box>*/}

            {/* Stats Section */}
            {/*<Box mt="auto" pt="md">*/}
            {/*    <Group justify="space-between" p="sm" style={{*/}
            {/*        backgroundColor: 'white',*/}
            {/*        borderRadius: rem(8),*/}
            {/*        border: '1px solid var(--mantine-color-gray-2)'*/}
            {/*    }}>*/}
            {/*        <Box ta="center" style={{ flex: 1 }}>*/}
            {/*            <Text size="lg" fw={700} c="blue">*/}
            {/*                24*/}
            {/*            </Text>*/}
            {/*            <Text size="xs" c="dimmed">*/}
            {/*                Active*/}
            {/*            </Text>*/}
            {/*        </Box>*/}
            {/*        <Divider orientation="vertical" />*/}
            {/*        <Box ta="center" style={{ flex: 1 }}>*/}
            {/*            <Text size="lg" fw={700} c="green">*/}
            {/*                12*/}
            {/*            </Text>*/}
            {/*            <Text size="xs" c="dimmed">*/}
            {/*                Complete*/}
            {/*            </Text>*/}
            {/*        </Box>*/}
            {/*        <Divider orientation="vertical" />*/}
            {/*        <Box ta="center" style={{ flex: 1 }}>*/}
            {/*            <Text size="lg" fw={700} c="orange">*/}
            {/*                3*/}
            {/*            </Text>*/}
            {/*            <Text size="xs" c="dimmed">*/}
            {/*                Pending*/}
            {/*            </Text>*/}
            {/*        </Box>*/}
            {/*    </Group>*/}
            {/*</Box>*/}
        </AppShell.Navbar>
    );
};

export default EnhancedNavbar;