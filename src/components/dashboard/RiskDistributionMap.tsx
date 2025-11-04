// "use client";
//
// import { useEffect, useRef, useState } from "react";
// import { Paper, Title, Text, Stack, Badge, Group, Loader, Center, Select } from "@mantine/core";
// import { IconMapPin } from "@tabler/icons-react";
// import type { Map as LeafletMap } from "leaflet";
//
// // Mock data for Tanzania regions - replace with real API data
// interface RegionRisk {
//     name: string;
//     lat: number;
//     lng: number;
//     premium: number;
//     exposure: number;
//     claims: number;
//     riskLevel: "low" | "medium" | "high" | "critical";
// }
//
// const TANZANIA_REGIONS: RegionRisk[] = [
//     { name: "Dar es Salaam", lat: -6.7924, lng: 39.2083, premium: 45000000, exposure: 120000000, claims: 15000000, riskLevel: "high" },
//     { name: "Arusha", lat: -3.3869, lng: 36.6830, premium: 25000000, exposure: 65000000, claims: 8000000, riskLevel: "medium" },
//     { name: "Mwanza", lat: -2.5164, lng: 32.9175, premium: 30000000, exposure: 80000000, claims: 12000000, riskLevel: "medium" },
//     { name: "Dodoma", lat: -6.1630, lng: 35.7516, premium: 15000000, exposure: 40000000, claims: 5000000, riskLevel: "low" },
//     { name: "Mbeya", lat: -8.9094, lng: 33.4606, premium: 18000000, exposure: 50000000, claims: 6000000, riskLevel: "low" },
//     { name: "Morogoro", lat: -6.8211, lng: 37.6619, premium: 20000000, exposure: 55000000, claims: 7000000, riskLevel: "medium" },
//     { name: "Tanga", lat: -5.0689, lng: 39.0986, premium: 22000000, exposure: 60000000, claims: 9000000, riskLevel: "medium" },
//     { name: "Zanzibar", lat: -6.1659, lng: 39.2026, premium: 35000000, exposure: 95000000, claims: 18000000, riskLevel: "high" },
//     { name: "Kilimanjaro", lat: -3.0674, lng: 37.3556, premium: 28000000, exposure: 75000000, claims: 10000000, riskLevel: "medium" },
//     { name: "Mtwara", lat: -10.2692, lng: 40.1836, premium: 12000000, exposure: 35000000, claims: 4000000, riskLevel: "low" },
// ];
//
// const getRiskColor = (level: string) => {
//     switch (level) {
//         case "critical": return "#d32f2f";
//         case "high": return "#f57c00";
//         case "medium": return "#fbc02d";
//         case "low": return "#388e3c";
//         default: return "#757575";
//     }
// };
//
// const formatCurrency = (value: number) => {
//     return new Intl.NumberFormat("en-TZ", {
//         style: "currency",
//         currency: "TZS",
//         notation: "compact",
//         maximumFractionDigits: 1,
//     }).format(value);
// };
//
// export default function RiskDistributionMap() {
//     const mapRef = useRef<HTMLDivElement>(null);
//     const mapInstanceRef = useRef<LeafletMap | null>(null);
//     const [selectedRegion, setSelectedRegion] = useState<RegionRisk | null>(null);
//     const [loading, setLoading] = useState(true);
//     const [mapType, setMapType] = useState<"premium" | "exposure" | "claims">("premium");
//     const [error, setError] = useState<string | null>(null);
//
//     useEffect(() => {
//         let isMounted = true;
//
//         const initializeMap = async () => {
//             if (typeof window === "undefined" || !mapRef.current) return;
//
//             // Cleanup existing map instance
//             if (mapInstanceRef.current) {
//                 mapInstanceRef.current.remove();
//                 mapInstanceRef.current = null;
//             }
//
//             try {
//                 const L = await import("leaflet");
//                 await import("leaflet/dist/leaflet.css");
//
//                 if (!isMounted || !mapRef.current) return;
//
//                 // Fix for default marker icons
//                 delete (L.Icon.Default.prototype as any)._getIconUrl;
//                 L.Icon.Default.mergeOptions({
//                     iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
//                     iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
//                     shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
//                 });
//
//                 // Initialize map centered on Tanzania
//                 const mapInstance = L.map(mapRef.current, {
//                     center: [-6.369028, 34.888822],
//                     zoom: 6,
//                     scrollWheelZoom: true,
//                 });
//
//                 // Add tile layer
//                 L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
//                     attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
//                     maxZoom: 18,
//                 }).addTo(mapInstance);
//
//                 // Add markers for each region
//                 TANZANIA_REGIONS.forEach((region) => {
//                     const value = region[mapType];
//                     const markerColor = getRiskColor(region.riskLevel);
//
//                     // Create custom marker
//                     const marker = L.circleMarker([region.lat, region.lng], {
//                         radius: Math.sqrt(value / 1000000) * 2,
//                         fillColor: markerColor,
//                         color: "#fff",
//                         weight: 2,
//                         opacity: 1,
//                         fillOpacity: 0.7,
//                     }).addTo(mapInstance);
//
//                     // Add popup
//                     marker.bindPopup(`
//                         <div style="padding: 8px;">
//                             <strong style="font-size: 14px;">${region.name}</strong><br/>
//                             <div style="margin-top: 4px;">
//                                 <strong>Premium:</strong> ${formatCurrency(region.premium)}<br/>
//                                 <strong>Exposure:</strong> ${formatCurrency(region.exposure)}<br/>
//                                 <strong>Claims:</strong> ${formatCurrency(region.claims)}<br/>
//                                 <strong>Risk Level:</strong> <span style="color: ${markerColor}; font-weight: bold;">${region.riskLevel.toUpperCase()}</span>
//                             </div>
//                         </div>
//                     `);
//
//                     // Add click event
//                     marker.on("click", () => {
//                         if (isMounted) {
//                             setSelectedRegion(region);
//                         }
//                     });
//                 });
//
//                 mapInstanceRef.current = mapInstance;
//
//                 if (isMounted) {
//                     setLoading(false);
//                     setError(null);
//                 }
//
//                 // Force map to resize after a short delay
//                 setTimeout(() => {
//                     if (mapInstance && isMounted) {
//                         mapInstance.invalidateSize();
//                     }
//                 }, 100);
//             } catch (err) {
//                 console.error("Error initializing map:", err);
//                 if (isMounted) {
//                     setError("Failed to load map. Please refresh the page.");
//                     setLoading(false);
//                 }
//             }
//         };
//
//         initializeMap();
//
//         // Cleanup
//         return () => {
//             isMounted = false;
//             if (mapInstanceRef.current) {
//                 mapInstanceRef.current.remove();
//                 mapInstanceRef.current = null;
//             }
//         };
//     }, [mapType]);
//
//     return (
//         <Paper shadow="sm" p="lg" radius="md" withBorder>
//             <Stack gap="md">
//                 <Group justify="space-between">
//                     <div>
//                         <Title order={4}>Risk Distribution Map</Title>
//                         <Text size="sm" c="dimmed">
//                             Geographic distribution of premium, exposure, and claims across Tanzania
//                         </Text>
//                     </div>
//                     <Select
//                         data={[
//                             { value: "premium", label: "Premium Distribution" },
//                             { value: "exposure", label: "Exposure Distribution" },
//                             { value: "claims", label: "Claims Distribution" },
//                         ]}
//                         value={mapType}
//                         onChange={(val) => setMapType(val as "premium" | "exposure" | "claims")}
//                         w={200}
//                     />
//                 </Group>
//
//                 {/* Map Container */}
//                 <div style={{ position: "relative", height: 500, borderRadius: 8, overflow: "hidden", border: "1px solid var(--mantine-color-gray-3)" }}>
//                     {loading && (
//                         <Center h={500} style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(255,255,255,0.9)", zIndex: 10 }}>
//                             <Stack align="center" gap="xs">
//                                 <Loader size="lg" />
//                                 <Text size="sm" c="dimmed">Loading map...</Text>
//                             </Stack>
//                         </Center>
//                     )}
//                     {error && (
//                         <Center h={500} style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(255,255,255,0.95)", zIndex: 10 }}>
//                             <Stack align="center" gap="xs">
//                                 <Text c="red" fw={500}>{error}</Text>
//                                 <Text size="sm" c="dimmed">Check console for details</Text>
//                             </Stack>
//                         </Center>
//                     )}
//                     <div ref={mapRef} style={{ height: "100%", width: "100%", zIndex: 1 }} />
//                 </div>
//
//                 {/* Legend */}
//                 <Group justify="space-between" wrap="wrap">
//                     <Group gap="xs">
//                         <Text size="sm" fw={500}>
//                             Risk Levels:
//                         </Text>
//                         <Badge color="green" variant="filled">
//                             Low
//                         </Badge>
//                         <Badge color="yellow" variant="filled">
//                             Medium
//                         </Badge>
//                         <Badge color="orange" variant="filled">
//                             High
//                         </Badge>
//                         <Badge color="red" variant="filled">
//                             Critical
//                         </Badge>
//                     </Group>
//                     <Text size="xs" c="dimmed">
//                         Bubble size represents {mapType} volume
//                     </Text>
//                 </Group>
//
//                 {/* Selected Region Info */}
//                 {selectedRegion && (
//                     <Paper p="md" withBorder bg="blue.0">
//                         <Group justify="space-between" mb="xs">
//                             <Group gap="xs">
//                                 <IconMapPin size={20} />
//                                 <Text fw={600} size="lg">
//                                     {selectedRegion.name}
//                                 </Text>
//                             </Group>
//                             <Badge color={getRiskColor(selectedRegion.riskLevel).replace("#", "")} variant="filled">
//                                 {selectedRegion.riskLevel.toUpperCase()}
//                             </Badge>
//                         </Group>
//                         <Group grow>
//                             <div>
//                                 <Text size="xs" c="dimmed">
//                                     Premium
//                                 </Text>
//                                 <Text fw={600}>{formatCurrency(selectedRegion.premium)}</Text>
//                             </div>
//                             <div>
//                                 <Text size="xs" c="dimmed">
//                                     Exposure
//                                 </Text>
//                                 <Text fw={600}>{formatCurrency(selectedRegion.exposure)}</Text>
//                             </div>
//                             <div>
//                                 <Text size="xs" c="dimmed">
//                                     Claims
//                                 </Text>
//                                 <Text fw={600}>{formatCurrency(selectedRegion.claims)}</Text>
//                             </div>
//                         </Group>
//                     </Paper>
//                 )}
//             </Stack>
//         </Paper>
//     );
// }
