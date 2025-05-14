
import axios from "axios";

export const API_BASE_URL = 'http://192.168.1.45:3001';
// export const API_BASE_URL = 'http://localhost:3001';



// export const API_BASE_URl_DOC = 'http://192.168.1.45:3003';

export const API_BASE_URl_DOC = 'http://localhost:3003';




// const api = axios.create({ baseURL: "API_BASE_URl_DOC" });
//
// api.interceptors.request.use((cfg: { headers: any; }) => {
//     const token = localStorage.getItem("jwt");
//     if (token) cfg.headers!["Authorization"] = `Bearer ${token}`;
//     return cfg;
// });
//
// export default api;

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
 */
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