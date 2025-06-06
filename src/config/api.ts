
import axios from "axios";

export const API_BASE_URL = 'http://192.168.1.45:3001';
// export const API_BASE_URL = 'http://localhost:3001';



export const API_BASE_URl_DOC = 'http://192.168.1.45:3003';

// export const API_BASE_URl_DOC = 'http://localhost:3003';




export interface ApiError {
    status: number;
    message: string;
    payload?: any;
}

/**
 * Centralized fetch wrapper:
 *  • prepends base URL
 *  • JSON-encodes body
 *  • auto-attaches Bearer JWT if present in localStorage
 *  • throws ApiError on non-2xx

export async function apiFetch<T = any>(
    path: string,
    init: RequestInit = {}
): Promise<T> {
    const token = typeof window !== "undefined"
        ? localStorage.getItem("jwt")
        : null;

    const headers: Record<string,string> = {
        "Content-Type": "application/json",
        ...(init.headers as Record<string,string> || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    const res = await fetch(`${API_BASE_URl_DOC}${path}`, {
        ...init,
        headers,
        body: init.body ? JSON.stringify(init.body) : undefined,
    });

    let data: any = null;
    try { data = await res.json(); } catch {}

    if (!res.ok) {
        throw {
            status: res.status,
            message: data?.error || res.statusText,
            payload: data,
        } as ApiError;
    }

    return data as T;
}
 */

function getToken(): string | null {
    return typeof window !== "undefined"
        ? localStorage.getItem("jwt")
        : null;
}

export type FetchOptions = Omit<RequestInit, "body"> & {
    requiresAuth?: boolean;
    body?: Record<string, unknown> | FormData | unknown[];
};


export async function apiFetch<T = any>(
    endpoint: string,
    options: FetchOptions = {}
): Promise<T> {
    const url = `${API_BASE_URl_DOC}${endpoint}`;
    const { requiresAuth, body: optBody, ...restOpts } = options;

    // 1) Build headers
    const headers = new Headers(restOpts.headers);
    if (requiresAuth !== false) {
        const token = getToken();
        if (!token) {
            localStorage.removeItem("jwt");
            window.location.href = "/login";
            throw new Error("Authentication required.");
        }
        headers.set("Authorization", `Bearer ${token}`);
    }

    // 2) Prepare a valid BodyInit
    let body: BodyInit | undefined;
    if (optBody instanceof FormData) {
        // file upload
        body = optBody;
    } else if (optBody !== undefined) {
        // JSON payload
        headers.set("Content-Type", "application/json");
        body = JSON.stringify(optBody);
    }

    // 3) Call fetch with a proper RequestInit
    const init: RequestInit = {
        ...restOpts,
        headers,
        body,
    };

    const response = await fetch(url, init);

    // 4) Handle 401/403
    if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("jwt");
        window.location.href = "/login";
        throw new Error("Session expired. Please log in again.");
    }

    // 5) Handle other errors
    if (!response.ok) {
        const text = await response.text();
        throw new Error(`HTTP ${response.status} - ${text}`);
    }

    // 6) Return the appropriate type
    const contentType = response.headers.get("Content-Type") || "";
    if (contentType.includes("application/json")) {
        return await response.json();
    }
    if (contentType.includes("application/octet-stream")) {
        return (await response.blob()) as unknown as T;
    }
    return (await response.text()) as unknown as T;
}