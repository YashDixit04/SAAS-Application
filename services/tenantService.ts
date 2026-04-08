/**
 * Tenant Service — v2 (Backend-connected)
 * Calls the real NestJS backend for tenant data.
 */

import { apiClient } from '../lib/apiClient';

export interface Tenant {
  id: string;
  name: string;
  domain?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

class TenantService {
  async getTenants(query?: { page?: number; limit?: number; search?: string }): Promise<PaginatedResponse<Tenant>> {
    const params = new URLSearchParams();
    if (query?.page) params.set('page', String(query.page));
    if (query?.limit) params.set('limit', String(query.limit));
    if (query?.search) params.set('search', query.search);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return apiClient.get<PaginatedResponse<Tenant>>(`/tenants${qs}`);
  }

  async getTenantById(id: string): Promise<Tenant> {
    return apiClient.get<Tenant>(`/tenants/${id}`);
  }

  async createTenant(data: { name: string; domain?: string }): Promise<Tenant> {
    return apiClient.post<Tenant>('/tenants', data);
  }

  async updateTenant(id: string, data: Partial<{ name: string; domain: string }>): Promise<Tenant> {
    return apiClient.patch<Tenant>(`/tenants/${id}`, data);
  }

  async deleteTenant(id: string): Promise<void> {
    return apiClient.delete<void>(`/tenants/${id}`);
  }
}

export const tenantService = new TenantService();
export default tenantService;
