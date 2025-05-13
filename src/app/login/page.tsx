"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TextInput, PasswordInput, Button, Paper, Title, Container, Alert } from "@mantine/core";
import {API_BASE_URl_DOC} from "@/config/api";

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
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            if (!res.ok) {
                const body = await res.json();
                throw new Error(body.error || `Status ${res.status}`);
            }

            const { token } = await res.json();
            localStorage.setItem("jwt", token);
            router.replace("/debit-upload");   // redirect to your app’s home page
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container size={420} my={40}>
            <Paper radius="md" p="xl" withBorder>
                <Title order={2} mb="lg">
                    Sign in
                </Title>

                {error && (
                    <Alert title="Login failed" color="red" mb="md">
                        {error}
                    </Alert>
                )}

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
    );
}
