import { APIError } from "@/apiClient/apiError";
import { isRecord } from "@/apiClient/helpers";

export function isAborted(error: unknown, signal?: AbortSignal | null): boolean {
  if (signal?.aborted) return true;
  return error instanceof DOMException && error.name === "AbortError";
}

export const request = {
  get: async (path: string, params?: Record<string, string>, options?: RequestInit): Promise<unknown> => {
    const url = new URL(path, window.location.origin);
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        url.searchParams.set(key, value);
      }
    }
    const urlString = `${url.pathname}${url.search}`;
    let response: Response;
    try {
      response = await fetch(url, { cache: "no-store", ...options });
    } catch (error) {
      if (isAborted(error, options?.signal)) throw error;
      throw new APIError("network", `Could not reach api ${urlString}`, { cause: error });
    }

    if (!response.ok) {
      const details: unknown = await response.json().catch(() => null);
      const message = isRecord(details) && typeof details.error === "string" ? details.error : `api ${urlString} responded ${response.status}`;
      throw new APIError("http", message, { status: response.status, cause: details });
    }

    try {
      return await response.json();
    } catch (error) {
      if (isAborted(error, options?.signal)) throw error;
      throw new APIError("invalid-response", `api ${urlString} returned malformed JSON`, { cause: error });
    }
  },
};
