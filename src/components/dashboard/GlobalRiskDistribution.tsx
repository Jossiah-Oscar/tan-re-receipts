"use client";

import { useMemo, useState } from "react";
import {
    Paper,
    Title,
    Text,
    Stack,
    Badge,
    Group,
    TextInput,
    Card,
    ThemeIcon,
    Center,
    Loader,
    Tooltip as MantineTooltip,
} from "@mantine/core";
import {
    IconWorld,
    IconSearch,
    IconFileText,
    IconCoin,
    IconMapPin,
} from "@tabler/icons-react";
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import type { CountryRisk } from "@/store/useDashboardStore";

// Type definitions for react-simple-maps
interface GeoProperties {
    name: string;
    [key: string]: any;
}

interface Geo {
    rsmKey: string;
    properties: GeoProperties;
    geometry: any;
    type: string;
}

interface GlobalRiskDistributionProps {
    data: CountryRisk[];
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        notation: "compact",
        maximumFractionDigits: 1,
    }).format(value);
};

const formatNumber = (value: number) => {
    return new Intl.NumberFormat("en-US", {
        notation: "compact",
        maximumFractionDigits: 1,
    }).format(value);
};

// GeoJSON world map topology URL
const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

export default function GlobalRiskDistribution({ data }: GlobalRiskDistributionProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
    const [selectedCountry, setSelectedCountry] = useState<CountryRisk | null>(null);

    // Calculate totals
    const totals = useMemo(() => {
        return {
            totalPremium: data.reduce((sum, c) => sum + c.premium, 0),
            totalContracts: data.reduce((sum, c) => sum + c.contractCount, 0),
            totalCountries: data.length,
        };
    }, [data]);

    // Create a lookup map for country data
    const countryDataMap = useMemo(() => {
        const map = new Map<string, CountryRisk>();
        data.forEach((country) => {
            // Normalize country names for matching
            const normalized = country.countryName.toLowerCase().trim();
            map.set(normalized, country);
        });
        return map;
    }, [data]);

    // Get risk level based on premium percentage
    const getRiskLevel = (premium: number) => {
        const percentage = (premium / totals.totalPremium) * 100;
        if (percentage > 15) return { level: "Critical", color: "#ef4444" };
        if (percentage > 10) return { level: "High", color: "#f97316" };
        if (percentage > 5) return { level: "Medium", color: "#eab308" };
        return { level: "Low", color: "#22c55e" };
    };

    // Get color for a geography
    const getGeoColor = (geoName: string) => {
        const normalized = geoName.toLowerCase().trim();
        const countryData = countryDataMap.get(normalized);

        if (!countryData) {
            return "#e5e7eb"; // Gray for countries without data
        }

        const riskInfo = getRiskLevel(countryData.premium);
        return riskInfo.color;
    };

    // Get country data by geo name
    const getCountryData = (geoName: string): CountryRisk | null => {
        const normalized = geoName.toLowerCase().trim();
        return countryDataMap.get(normalized) || null;
    };

    // Filter data for the list
    const filteredData = useMemo(() => {
        let filtered = data;

        if (searchQuery) {
            filtered = filtered.filter((c) =>
                c.countryName.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        return filtered.sort((a, b) => b.premium - a.premium);
    }, [data, searchQuery]);

    return (
        <Paper shadow="sm" p="lg" radius="md" withBorder>
            <Stack gap="md">
                {/* Header */}
                <Group justify="space-between">
                    <div>
                        <Group gap="xs" mb={4}>
                            <IconWorld size={24} />
                            <Title order={4}>Global Risk Distribution Map</Title>
                        </Group>
                        <Text size="sm" c="dimmed">
                            Interactive world map showing reinsurance coverage by country
                        </Text>
                    </div>
                </Group>

                {/* Summary Stats */}
                <Group grow>
                    <Card shadow="sm" padding="md" radius="md" withBorder>
                        <Group>
                            <ThemeIcon size="lg" radius="md" variant="light" color="blue">
                                <IconMapPin size={20} />
                            </ThemeIcon>
                            <div>
                                <Text size="xs" c="dimmed">
                                    Total Countries
                                </Text>
                                <Text size="lg" fw={700}>
                                    {totals.totalCountries}
                                </Text>
                            </div>
                        </Group>
                    </Card>

                    <Card shadow="sm" padding="md" radius="md" withBorder>
                        <Group>
                            <ThemeIcon size="lg" radius="md" variant="light" color="violet">
                                <IconFileText size={20} />
                            </ThemeIcon>
                            <div>
                                <Text size="xs" c="dimmed">
                                    Total Contracts
                                </Text>
                                <Text size="lg" fw={700}>
                                    {formatNumber(totals.totalContracts)}
                                </Text>
                            </div>
                        </Group>
                    </Card>

                    <Card shadow="sm" padding="md" radius="md" withBorder>
                        <Group>
                            <ThemeIcon size="lg" radius="md" variant="light" color="green">
                                <IconCoin size={20} />
                            </ThemeIcon>
                            <div>
                                <Text size="xs" c="dimmed">
                                    Total Premium
                                </Text>
                                <Text size="lg" fw={700}>
                                    {formatCurrency(totals.totalPremium)}
                                </Text>
                            </div>
                        </Group>
                    </Card>
                </Group>

                {/* Interactive World Map */}
                <Paper p="md" withBorder style={{ backgroundColor: "#f8fafc" }}>
                    <ComposableMap
                        projection="geoMercator"
                        projectionConfig={{
                            scale: 140,
                        }}
                        width={800}
                        height={450}
                    >
                        <ZoomableGroup center={[0, 20]} zoom={1}>
                            <Geographies geography={GEO_URL}>
                                {({ geographies }: { geographies: Geo[] }) =>
                                    geographies.map((geo: Geo) => {
                                        const geoName = geo.properties.name;
                                        const countryData = getCountryData(geoName);
                                        const isHovered = hoveredCountry === geoName;

                                        return (
                                            <Geography
                                                key={geo.rsmKey}
                                                geography={geo}
                                                fill={getGeoColor(geoName)}
                                                stroke="#ffffff"
                                                strokeWidth={0.5}
                                                style={{
                                                    default: {
                                                        outline: "none",
                                                        transition: "all 0.2s",
                                                    },
                                                    hover: {
                                                        fill: countryData ? "#3b82f6" : "#d1d5db",
                                                        outline: "none",
                                                        cursor: countryData ? "pointer" : "default",
                                                        stroke: "#ffffff",
                                                        strokeWidth: 1,
                                                    },
                                                    pressed: {
                                                        fill: "#1e40af",
                                                        outline: "none",
                                                    },
                                                }}
                                                onMouseEnter={() => {
                                                    setHoveredCountry(geoName);
                                                    if (countryData) {
                                                        setSelectedCountry(countryData);
                                                    }
                                                }}
                                                onMouseLeave={() => {
                                                    setHoveredCountry(null);
                                                }}
                                                onClick={() => {
                                                    if (countryData) {
                                                        setSelectedCountry(countryData);
                                                    }
                                                }}
                                            />
                                        );
                                    })
                                }
                            </Geographies>
                        </ZoomableGroup>
                    </ComposableMap>

                    {/* Tooltip/Info Box */}
                    {selectedCountry && (
                        <Card mt="md" shadow="sm" padding="md" radius="md" withBorder bg="blue.0">
                            <Group justify="space-between" mb="xs">
                                <Group>
                                    <IconMapPin size={20} />
                                    <Text fw={600} size="lg">
                                        {selectedCountry.countryName}
                                    </Text>
                                </Group>
                                <Badge color={getRiskLevel(selectedCountry.premium).color.replace("#", "")} variant="filled">
                                    {getRiskLevel(selectedCountry.premium).level} Risk
                                </Badge>
                            </Group>
                            <Group grow>
                                <div>
                                    <Text size="xs" c="dimmed">
                                        Contracts
                                    </Text>
                                    <Text fw={600} size="md">{selectedCountry.contractCount}</Text>
                                </div>
                                <div>
                                    <Text size="xs" c="dimmed">
                                        Premium
                                    </Text>
                                    <Text fw={600} size="md">{formatCurrency(selectedCountry.premium)}</Text>
                                </div>
                                <div>
                                    <Text size="xs" c="dimmed">
                                        Portfolio Share
                                    </Text>
                                    <Text fw={600} size="md">
                                        {((selectedCountry.premium / totals.totalPremium) * 100).toFixed(1)}%
                                    </Text>
                                </div>
                            </Group>
                        </Card>
                    )}
                </Paper>

                {/* Risk Level Legend */}
                <Group justify="center" gap="md">
                    <Group gap="xs">
                        <div style={{ width: 20, height: 20, backgroundColor: "#22c55e", borderRadius: 4 }} />
                        <Text size="xs">Low Risk {"<"} 5%</Text>
                    </Group>
                    <Group gap="xs">
                        <div style={{ width: 20, height: 20, backgroundColor: "#eab308", borderRadius: 4 }} />
                        <Text size="xs">Medium Risk 5-10%</Text>
                    </Group>
                    <Group gap="xs">
                        <div style={{ width: 20, height: 20, backgroundColor: "#f97316", borderRadius: 4 }} />
                        <Text size="xs">High Risk 10-15%</Text>
                    </Group>
                    <Group gap="xs">
                        <div style={{ width: 20, height: 20, backgroundColor: "#ef4444", borderRadius: 4 }} />
                        <Text size="xs">Critical Risk {"> "}15%</Text>
                    </Group>
                    <Group gap="xs">
                        <div style={{ width: 20, height: 20, backgroundColor: "#e5e7eb", borderRadius: 4 }} />
                        <Text size="xs">No Coverage</Text>
                    </Group>
                </Group>

                {/* Country List with Search */}
                <div>
                    <TextInput
                        placeholder="Search countries..."
                        leftSection={<IconSearch size={16} />}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.currentTarget.value)}
                        mb="md"
                    />

                    <Paper p="md" withBorder style={{ maxHeight: 300, overflowY: "auto" }}>
                        <Stack gap="xs">
                            {filteredData.map((country, index) => {
                                const riskInfo = getRiskLevel(country.premium);
                                const premiumPercentage = (country.premium / totals.totalPremium) * 100;

                                return (
                                    <Card
                                        key={country.countryName}
                                        shadow="sm"
                                        padding="sm"
                                        radius="md"
                                        withBorder
                                        style={{
                                            cursor: "pointer",
                                            backgroundColor: selectedCountry?.countryName === country.countryName ? "#eff6ff" : "white",
                                        }}
                                        onClick={() => setSelectedCountry(country)}
                                    >
                                        <Group justify="space-between">
                                            <Group>
                                                <Badge
                                                    size="sm"
                                                    variant={index < 3 ? "filled" : "light"}
                                                    color={
                                                        index === 0 ? "yellow" :
                                                        index === 1 ? "gray" :
                                                        index === 2 ? "orange" : "blue"
                                                    }
                                                >
                                                    #{index + 1}
                                                </Badge>
                                                <Text fw={500} size="sm">
                                                    {country.countryName}
                                                </Text>
                                            </Group>
                                            <Group gap="md">
                                                <Text size="xs" c="dimmed">
                                                    {country.contractCount} contracts
                                                </Text>
                                                <Text size="sm" fw={600}>
                                                    {formatCurrency(country.premium)}
                                                </Text>
                                                <Badge size="sm" color={riskInfo.color.replace("#", "")} variant="light">
                                                    {premiumPercentage.toFixed(1)}%
                                                </Badge>
                                            </Group>
                                        </Group>
                                    </Card>
                                );
                            })}
                        </Stack>
                    </Paper>
                </div>
            </Stack>
        </Paper>
    );
}
