import { useState } from 'react';
import {
    Group,
    Text,
    ActionIcon,
    Tooltip,
    Badge,
    Menu,
    Avatar,
    UnstyledButton,
    TextInput,
    Indicator,
    Box,
    Burger,
    rem,
    useMantineTheme,
    Divider
} from '@mantine/core';
import {
    IconBell,
    IconSearch,
    IconSettings,
    IconUser,
    IconLogout,
    IconChevronDown,
    IconMail,
    IconHelp,
    IconMoon,
    IconSun,
    IconBrandSlack,
    IconCalendar,
    IconPlus
} from '@tabler/icons-react';

const EnhancedHeader = ({
                            user = { name: 'John Doe', role: 'Admin', avatar: null },
                            onMenuToggle,
                            opened = false,
                            notifications = 3,
                            onThemeToggle,
                            isDark = false
                        }) => {
    const theme = useMantineTheme();
    const [searchValue, setSearchValue] = useState('');

    const notificationItems = [
        {
            id: 1,
            title: 'New claim submitted',
            description: 'John Smith submitted expense claim #EXP-2024-001',
            time: '2 min ago',
            unread: true,
            type: 'claim'
        },
        {
            id: 2,
            title: 'Receipt approved',
            description: 'Your receipt for office supplies has been approved',
            time: '1 hour ago',
            unread: true,
            type: 'approval'
        },
        {
            id: 3,
            title: 'Monthly report ready',
            description: 'December financial report is now available',
            time: '3 hours ago',
            unread: false,
            type: 'report'
        }
    ];

    const quickActions = [
        {
            icon: IconPlus,
            label: 'New Claim',
            color: 'blue',
            action: () => console.log('New claim')
        },
        {
            icon: IconCalendar,
            label: 'Schedule Meeting',
            color: 'green',
            action: () => console.log('Schedule meeting')
        },
        {
            icon: IconBrandSlack,
            label: 'Team Chat',
            color: 'purple',
            action: () => console.log('Team chat')
        }
    ];

    return (
        <Group h="100%" px="md" justify="space-between" style={{
            backgroundColor: 'white',
            borderBottom: '1px solid var(--mantine-color-gray-2)',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
        }}>
            {/* Left Section */}
            <Group gap="md">
                <Burger
                    opened={opened}
                    onClick={onMenuToggle}
                    hiddenFrom="sm"
                    size="sm"
                    style={{
                        '&:hover': {
                            backgroundColor: 'var(--mantine-color-gray-1)'
                        }
                    }}
                />

                {/* Logo/Brand */}
                <Group gap="xs" visibleFrom="sm">
                    <Box
                        style={{
                            width: rem(32),
                            height: rem(32),
                            borderRadius: rem(8),
                            background: 'linear-gradient(45deg, var(--mantine-color-blue-5), var(--mantine-color-cyan-5))',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 700,
                            fontSize: rem(14)
                        }}
                    >
                        FM
                    </Box>
                    <Box>
                        <Text size="sm" fw={700} c="dark">
                            Finance Manager
                        </Text>
                        <Text size="xs" c="dimmed">
                            Dashboard
                        </Text>
                    </Box>
                </Group>
            </Group>

            {/* Center Section - Search */}
            <Box visibleFrom="md" style={{ flex: 1, maxWidth: rem(400), marginInline: rem(20) }}>
                <TextInput
                    placeholder="Search claims, receipts, reports..."
                    leftSection={<IconSearch size={16} />}
                    value={searchValue}
                    onChange={(event) => setSearchValue(event.currentTarget.value)}
                    style={{
                        '& .mantine-TextInput-input': {
                            backgroundColor: 'var(--mantine-color-gray-0)',
                            border: '1px solid var(--mantine-color-gray-3)',
                            borderRadius: rem(8),
                            '&:focus': {
                                borderColor: 'var(--mantine-color-blue-5)',
                                boxShadow: '0 0 0 2px var(--mantine-color-blue-1)'
                            }
                        }
                    }}
                />
            </Box>

            {/* Right Section */}
            <Group gap="xs">
                {/* Quick Actions */}
                <Group gap="xs" visibleFrom="md">
                    {quickActions.map((action, index) => (
                        <Tooltip key={index} label={action.label} withArrow>
                            <ActionIcon
                                variant="subtle"
                                color={action.color}
                                size="lg"
                                onClick={action.action}
                                style={{
                                    borderRadius: rem(8),
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        transform: 'translateY(-1px)',
                                        boxShadow: `0 4px 8px var(--mantine-color-${action.color}-2)`
                                    }
                                }}
                            >
                                <action.icon size={18} />
                            </ActionIcon>
                        </Tooltip>
                    ))}
                    <Divider orientation="vertical" mx="xs" />
                </Group>

                {/* Theme Toggle */}
                <Tooltip label={isDark ? 'Light Mode' : 'Dark Mode'} withArrow>
                    <ActionIcon
                        variant="subtle"
                        color="gray"
                        size="lg"
                        onClick={onThemeToggle}
                        style={{ borderRadius: rem(8) }}
                    >
                        {isDark ? <IconSun size={18} /> : <IconMoon size={18} />}
                    </ActionIcon>
                </Tooltip>

                {/* Notifications */}
                <Menu shadow="md" width={320} position="bottom-end" offset={8}>
                    <Menu.Target>
                        <Tooltip label="Notifications" withArrow>
                            <Indicator
                                color="red"
                                size={16}
                                offset={4}
                                disabled={notifications === 0}
                                label={notifications > 9 ? '9+' : notifications}
                            >
                                <ActionIcon
                                    variant="subtle"
                                    color="gray"
                                    size="lg"
                                    style={{ borderRadius: rem(8) }}
                                >
                                    <IconBell size={18} />
                                </ActionIcon>
                            </Indicator>
                        </Tooltip>
                    </Menu.Target>
                    <Menu.Dropdown>
                        <Menu.Label>
                            <Group justify="space-between">
                                <Text size="sm" fw={600}>Notifications</Text>
                                <Badge size="xs" color="red">{notifications}</Badge>
                            </Group>
                        </Menu.Label>
                        <Menu.Divider />
                        {notificationItems.map((item) => (
                            <Menu.Item
                                key={item.id}
                                style={{
                                    padding: rem(12),
                                    borderLeft: item.unread ? `3px solid var(--mantine-color-blue-5)` : '3px solid transparent'
                                }}
                            >
                                <Box>
                                    <Group justify="space-between" mb={rem(4)}>
                                        <Text size="sm" fw={item.unread ? 600 : 400} lineClamp={1}>
                                            {item.title}
                                        </Text>
                                        {item.unread && (
                                            <Box
                                                style={{
                                                    width: rem(8),
                                                    height: rem(8),
                                                    borderRadius: '50%',
                                                    backgroundColor: 'var(--mantine-color-blue-5)'
                                                }}
                                            />
                                        )}
                                    </Group>
                                    <Text size="xs" c="dimmed" lineClamp={2} mb={rem(4)}>
                                        {item.description}
                                    </Text>
                                    <Text size="xs" c="dimmed">
                                        {item.time}
                                    </Text>
                                </Box>
                            </Menu.Item>
                        ))}
                        <Menu.Divider />
                        <Menu.Item
                            style={{
                                textAlign: 'center',
                                color: 'var(--mantine-color-blue-6)',
                                fontWeight: 500
                            }}
                        >
                            View all notifications
                        </Menu.Item>
                    </Menu.Dropdown>
                </Menu>

                {/* User Menu */}
                <Menu shadow="md" width={220} position="bottom-end" offset={8}>
                    <Menu.Target>
                        <UnstyledButton
                            style={{
                                padding: rem(8),
                                borderRadius: rem(8),
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                    backgroundColor: 'var(--mantine-color-gray-1)'
                                }
                            }}
                        >
                            <Group gap="sm">
                                <Avatar
                                    src={user.avatar}
                                    size={32}
                                    radius="xl"
                                    style={{
                                        background: 'linear-gradient(45deg, var(--mantine-color-blue-5), var(--mantine-color-cyan-5))',
                                        color: 'white'
                                    }}
                                >
                                    <IconUser size={16} />
                                </Avatar>
                                <Box visibleFrom="sm">
                                    <Text size="sm" fw={500} lineClamp={1}>
                                        {user.name}
                                    </Text>
                                    <Text size="xs" c="dimmed" lineClamp={1}>
                                        {user.role}
                                    </Text>
                                </Box>
                                <IconChevronDown size={14} style={{ color: theme.colors.gray[6] }} />
                            </Group>
                        </UnstyledButton>
                    </Menu.Target>
                    <Menu.Dropdown>
                        <Menu.Label>
                            <Group>
                                <Avatar
                                    src={user.avatar}
                                    size={24}
                                    radius="xl"
                                    style={{
                                        background: 'linear-gradient(45deg, var(--mantine-color-blue-5), var(--mantine-color-cyan-5))',
                                        color: 'white'
                                    }}
                                >
                                    <IconUser size={12} />
                                </Avatar>
                                <Box>
                                    <Text size="sm" fw={500}>{user.name}</Text>
                                    <Text size="xs" c="dimmed">{user.role}</Text>
                                </Box>
                            </Group>
                        </Menu.Label>
                        <Menu.Divider />
                        <Menu.Item leftSection={<IconUser size={16} />}>
                            Profile Settings
                        </Menu.Item>
                        <Menu.Item leftSection={<IconSettings size={16} />}>
                            Account Settings
                        </Menu.Item>
                        <Menu.Item leftSection={<IconMail size={16} />}>
                            Messages
                            <Badge size="xs" color="blue" ml="auto">2</Badge>
                        </Menu.Item>
                        <Menu.Item leftSection={<IconHelp size={16} />}>
                            Help & Support
                        </Menu.Item>
                        <Menu.Divider />
                        <Menu.Item
                            leftSection={<IconLogout size={16} />}
                            color="red"
                        >
                            Logout
                        </Menu.Item>
                    </Menu.Dropdown>
                </Menu>
            </Group>
        </Group>
    );
};

export default EnhancedHeader;