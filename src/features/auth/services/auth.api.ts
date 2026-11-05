import { apiClient } from "@/lib/api-client";
import type { LoginFormValues, RegisterFormValues } from "@/lib/validations/auth.schema";

export interface AuthSessionData {
  user: {
    id: string;
    name: string;
    email: string;
  };
  business: {
    id: string;
    name: string;
    slug: string;
    timezone?: string;
  };
}

export const authApi = {
  async login(values: LoginFormValues): Promise<AuthSessionData> {
    return apiClient.post<AuthSessionData>("/api/v1/auth/login", values);
  },

  async register(values: RegisterFormValues): Promise<AuthSessionData> {
    return apiClient.post<AuthSessionData>("/api/v1/auth/register", values);
  },

  async logout(): Promise<void> {
    await apiClient.post("/api/v1/auth/logout");
  },

  async getMe(): Promise<AuthSessionData> {
    return apiClient.get<AuthSessionData>("/api/v1/auth/me");
  },
};

