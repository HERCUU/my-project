import { CONFIG } from "./config";
import { getAccessToken } from "./auth";

interface FetchOptions extends RequestInit {
  requiresAuth?: boolean;
}

export async function apiClient<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { requiresAuth = false, headers, ...restOptions } = options;
  const defaultHeaders: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (requiresAuth) {
    const token = getAccessToken();
    if (token) {
      defaultHeaders["Authorization"] = `Bearer ${token}`;
    }
  }

  const baseUrl = CONFIG.API_BASE_URL || "http://2.3.1.19:5000";

  const response = await fetch(`${baseUrl}${endpoint}`, {
    headers: { ...defaultHeaders, ...headers },
    ...restOptions,
  });

  const contentType = response.headers.get("content-type");
  let data: any;

  if (contentType && contentType.includes("application/json")) {
    data = await response.json();
  } else {
    throw new Error(
      `Cannot connect to Backend API. Check if server on port 5000 is running. (Status: ${response.status})`
    );
  }

  if (!response.ok) {
    const errorMessage = Array.isArray(data.message)
      ? data.message.join(", ")
      : data.message || "An unexpected error occurred.";
    throw new Error(errorMessage);
  }

  return data as T;
}