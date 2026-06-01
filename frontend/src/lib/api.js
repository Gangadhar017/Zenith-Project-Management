export const SOCKET_BASE = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:8000";
export const API_BASE = process.env.NEXT_PUBLIC_API_URL || `${SOCKET_BASE}/api`;
