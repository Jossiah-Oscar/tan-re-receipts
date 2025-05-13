export async function login(username: string, password: string) {
    const res = await fetch("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    });
    if (!res.ok) throw new Error("Invalid credentials");
    const { token } = await res.json();
    localStorage.setItem("jwt", token);
}