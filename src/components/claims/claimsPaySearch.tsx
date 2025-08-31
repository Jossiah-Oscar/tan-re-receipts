// import {useState} from "react";
// import {Button, Card, Group, Select, Stack, TextInput} from "@mantine/core";
//
// export function ClaimsPaySearch({ onSearch, onSearchStart }: DocumentSearchProps) {
//     const [cedantName, setCedantName] = useState('');
//     const [documentType, setDocumentType] = useState<string | null>(null);
//
//     const handleSearch = () => {
//         onSearchStart();
//         onSearch({ cedantName, documentType: documentType || '' });
//     };
//
//     return (
//         <Card shadow="sm" p="md" radius="md" withBorder mb="lg">
//             <Stack mb="md">
//                 <Group justify="space-between">
//                     <Group grow>
//                         <TextInput
//                             placeholder="Search by Cedant Name"
//                             value={cedantName}
//                             onChange={(e) => setCedantName(e.currentTarget.value)}
//                         />
//                         <Select
//                             placeholder="Select Document Type"
//                             data={['Debit-Note', 'Claim', 'Credit-Note']}
//                             value={documentType}
//                             onChange={setDocumentType}
//                         />
//                     </Group>
//                     <Button onClick={handleSearch}>Search</Button>
//                 </Group>
//             </Stack>
//         </Card>
//
//     );
// }
