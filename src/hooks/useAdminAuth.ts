"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {useAuth} from "@/context/AuthContext";

export function useAdminAuth() {
    const { roles } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!roles.includes("ADMIN")) {
            router.replace("/debit-upload");
        }
    }, [roles, router]);
}