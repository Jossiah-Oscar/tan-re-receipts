"use client";

import {useState} from "react";
import {useRouter} from "next/navigation";
import {Button, Container, Flex, Group, Paper, PasswordInput, Stack, Text, TextInput, Title} from "@mantine/core";
import {API_BASE_URl_DOC} from "@/config/api";
// import {useAuth} from "@/app/recources/context/AuthContext";
import Logo from "@/resources/assets/logo3.jpg";
import Image from 'next/image';

// export default function LoginPage() {
//     const router = useRouter();
//     const [username, setUsername] = useState("");
//     const [password, setPassword] = useState("");
//     const [error, setError] = useState<string | null>(null);
//     const [loading, setLoading] = useState(false);
//
//     const handleSubmit = async (e: React.FormEvent) => {
//         e.preventDefault();
//         setError(null);
//         setLoading(true);
//         try {
//             const res = await fetch(`${API_BASE_URl_DOC}/auth/login`, {
//                 method: "POST",
//                 headers: {"Content-Type": "application/json"},
//                 body: JSON.stringify({username, password}),
//             });
//
//             if (!res.ok) {
//                 const body = await res.json();
//                 throw new Error(body.error || `Status ${res.status}`);
//             }
//
//             const {token} = await res.json();
//             localStorage.setItem("jwt", token);
//             localStorage.setItem("username", username);
//             router.replace("/debit-upload");   // redirect to your app’s home page
//         } catch (err: any) {
//             setError(err.message);
//         } finally {
//             setLoading(false);
//         }
//     };
//
//     return (
//         <Container size={420} my={40}>
//             <Paper radius="md" p="xl" withBorder>
//                 <Title order={2} mb="lg">
//                     Sign in
//                 </Title>
//
//                 {error && (
//                     <Alert title="Login failed" color="red" mb="md">
//                         {error}
//                     </Alert>
//                 )}
//
//                 <form onSubmit={handleSubmit}>
//                     <TextInput
//                         label="Username"
//                         placeholder="Your username"
//                         required
//                         value={username}
//                         onChange={(e) => setUsername(e.currentTarget.value)}
//                     />
//                     <PasswordInput
//                         label="Password"
//                         placeholder="Your password"
//                         required
//                         mt="md"
//                         value={password}
//                         onChange={(e) => setPassword(e.currentTarget.value)}
//                     />
//                     <Button type="submit" fullWidth mt="xl" loading={loading}>
//                         Log in
//                     </Button>
//                 </form>
//             </Paper>
//         </Container>
//     );
// }


export default function LoginPage() {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URl_DOC}/auth/login`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({username, password}),
            });

            if (!res.ok) {
                const body = await res.json();
                throw new Error(body.error || `Status ${res.status}`);
            }

            const {token} = await res.json();
            localStorage.setItem("jwt", token);
            localStorage.setItem("username", username);
            router.replace("/debit-upload");   // redirect to your app’s home page
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Flex mih="100vh">
            {/* Left Side */}
            <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                // backgroundColor: '#f5f5f5'
            }}>
                <Image src={Logo} alt="Illustration" width={500} height={500}/>
            </div>

            {/* Right Side */}
            <Stack justify="center" my={40} style={{flex: 1}}>
                <Group justify="center" >
                <Title style={{fontWeight: 'bold'}}>
                    Welcome back
                </Title>
                    </Group>

                <Container size={420} my={20}>
                    <Paper radius="md" p="xl" withBorder>
                        <form onSubmit={handleSubmit}>
                            <TextInput
                                label="Username"
                                placeholder="Your username"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.currentTarget.value)}
                            />
                            <PasswordInput
                                label="Password"
                                placeholder="Your password"
                                required
                                mt="md"
                                value={password}
                                onChange={(e) => setPassword(e.currentTarget.value)}
                            />
                            <Button type="submit" fullWidth mt="xl" loading={loading}>
                                Log in
                            </Button>
                        </form>
                    </Paper>
                </Container>

                {/* Ratings Section */}
                <Group justify="center" >
                    <Text size="sm" color="dimmed" mt="lg" mb="md">
                        Trusted by industry leaders
                    </Text>
                </Group>


                <Container size={420} mb={10} style={{textAlign: 'center'}}>
                    <div style={{marginBottom: 10}}>
                        <strong>AM Best Rating:</strong> B (Fair) & bb+ (Fair)
                    </div>
                    <div style={{marginBottom: 10}}>
                        <strong>GCR RATINGS:</strong> B- & AA-
                    </div>
                    <div>
                        <strong>ISO 9001:2015 Certified</strong>
                    </div>
                </Container>
                {/* Core Values Section */}
                {/*<Text align="center" size="sm" color="dimmed" mt="lg" mb="md">*/}
                {/*    Our Core Values*/}
                {/*</Text>*/}

                {/*<Group justify="center">*/}
                {/*    <div>*/}
                {/*        <Text size="sm" color="dimmed" mt="xs" mb="xs">Professionalism</Text>*/}
                {/*    </div>*/}
                {/*    <div>*/}
                {/*        <Text size="sm" color="dimmed" mt="xs" mb="xs">*/}
                {/*            Integrity*/}
                {/*            <Text/>*/}
                {/*    </div>*/}
                {/*    <div>*/}
                {/*        <Text size="sm" color="dimmed" mt="xs" mb="xs">*/}
                {/*            Customer Focus*/}
                {/*            <Text/>*/}
                {/*    </div>*/}
                {/*</Group>*/}
            </Stack>
        </Flex>
);
}