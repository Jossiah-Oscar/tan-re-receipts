"use client";



export default function Layout({ children }: { children: React.ReactNode }) {
    // this wrapper only applies to /login
    return (
        // center the login form, no nav or other chrome here
        <div
            style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "100vh",
                backgroundColor: "#f5f5f5",
            }}
        >
            {children}
        </div>
    );
}