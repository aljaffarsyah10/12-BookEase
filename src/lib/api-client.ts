export class ApiClientError extends Error {
  code: string;
  status: number;
  details?: unknown;

  constructor(
    code: string,
    message: string,
    status: number,
    details?: unknown
  ) {
    super(message);
    this.name = "ApiClientError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

async function request<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(url, {
    ...options,
    headers,
  });

  const json: ApiResponse<T> = await res.json().catch(() => ({
    success: false,
    data: null as unknown as T,
    error: {
      code: "PARSE_ERROR",
      message: "Gagal memproses respons dari server.",
    },
  }));

  if (!res.ok || !json.success) {
    throw new ApiClientError(
      json.error?.code || "REQUEST_FAILED",
      json.error?.message || res.statusText || "Terjadi kesalahan pada permintaan.",
      res.status,
      json.error?.details
    );
  }

  return json.data;
}

export const apiClient = {
  get<T>(url: string, options?: RequestInit): Promise<T> {
    return request<T>(url, { ...options, method: "GET" });
  },

  post<T>(url: string, body?: unknown, options?: RequestInit): Promise<T> {
    return request<T>(url, {
      ...options,
      method: "POST",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  },

  patch<T>(url: string, body?: unknown, options?: RequestInit): Promise<T> {
    return request<T>(url, {
      ...options,
      method: "PATCH",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  },

  put<T>(url: string, body?: unknown, options?: RequestInit): Promise<T> {
    return request<T>(url, {
      ...options,
      method: "PUT",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  },

  delete<T>(url: string, options?: RequestInit): Promise<T> {
    return request<T>(url, { ...options, method: "DELETE" });
  },
};

