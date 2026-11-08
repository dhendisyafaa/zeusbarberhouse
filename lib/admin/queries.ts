import type {
  AdminBookingItem,
  BranchOption,
  CapsterDutyItem,
  OperationalMetrics,
  ServiceDistributionItem,
  WeeklyTrendItem,
} from '@/components/admin/admin-types';

export type AdminResource =
  | 'branches'
  | 'services'
  | 'barbers'
  | 'haircut-models'
  | 'bookings'
  | 'schedules';

export type AdminRecord = Record<string, unknown>;

export type AdminReportSummary = {
  metrics: OperationalMetrics;
  weeklyTrends: WeeklyTrendItem[];
};

export type AdminServiceReport = {
  totalOrders: number;
  distribution: ServiceDistributionItem[];
};

export type AdminBarberReport = {
  totalOnDuty: number;
  totalChairs: number;
  roster: CapsterDutyItem[];
};

export type ResourceFilters = {
  page?: number;
  limit?: number;
  filters?: Record<string, string>;
};

export const adminQueryKeys = {
  branches: {
    all: ['admin', 'branches'] as const,
    list: (filters: ResourceFilters = {}) => ['admin', 'branches', 'list', filters] as const,
  },
  resources: {
    all: (resource: AdminResource) => ['admin', resource] as const,
    list: (resource: AdminResource, filters: ResourceFilters = {}) =>
      ['admin', resource, 'list', filters] as const,
  },
  bookings: {
    all: ['admin', 'bookings'] as const,
    list: (filters: ResourceFilters & { branchId?: string; status?: string } = {}) =>
      ['admin', 'bookings', 'list', filters] as const,
  },
  schedules: {
    all: ['admin', 'schedules'] as const,
    list: (type: 'branch' | 'barber') => ['admin', 'schedules', 'list', type] as const,
  },
  reports: {
    all: ['admin', 'reports'] as const,
    summary: (branchId: string) => ['admin', 'reports', 'summary', branchId] as const,
    services: (branchId: string) => ['admin', 'reports', 'services', branchId] as const,
    barbers: (branchId: string) => ['admin', 'reports', 'barbers', branchId] as const,
  },
  membership: {
    all: ['admin', 'memberships'] as const,
    list: (status = 'all') => ['admin', 'memberships', 'list', status] as const,
    policy: ['admin', 'memberships', 'policy'] as const,
    detail: (id: string) => ['admin', 'memberships', id] as const,
    points: (id: string) => ['admin', 'memberships', id, 'points'] as const,
  },
  career: {
    all: ['admin', 'career'] as const,
    vacancies: ['admin', 'career', 'vacancies'] as const,
    applications: (filters: Record<string, string>) =>
      ['admin', 'career', 'applications', filters] as const,
  },
  paymentOptions: {
    all: ['admin', 'payment-options'] as const,
  },
  paymentProof: (bookingId: string) => ['admin', 'bookings', bookingId, 'payment-proof'] as const,
};

export async function fetchAdminData<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { cache: 'no-store', ...init });
  const body = await response.json().catch(() => null) as
    | { data: T; error?: { message?: string } }
    | { error?: { message?: string } }
    | null;

  if (!response.ok) {
    throw new Error(body?.error?.message || `Request failed (${response.status})`);
  }
  if (!body || !('data' in body)) {
    throw new Error('Server returned an invalid response.');
  }
  return body.data;
}

function toSearchParams({ page = 1, limit = 100, filters = {} }: ResourceFilters) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  for (const [key, value] of Object.entries(filters)) {
    if (value) params.set(key, value);
  }
  return params;
}

export function fetchAdminResource<T extends AdminRecord>(
  resource: AdminResource,
  options: ResourceFilters = {},
) {
  return fetchAdminData<T[]>(`/api/admin/${resource}?${toSearchParams(options)}`);
}

export function fetchAdminBranches(options: ResourceFilters = {}) {
  return fetchAdminResource<BranchOption & AdminRecord>('branches', options);
}

export function fetchAdminBookings<T = AdminBookingItem>(
  options: ResourceFilters & { branchId?: string; status?: string } = {},
) {
  const params = toSearchParams(options);
  if (options.branchId) params.set('branchId', options.branchId);
  if (options.status) params.set('status', options.status);
  return fetchAdminData<T[]>(`/api/admin/bookings?${params}`);
}

export function fetchAdminSchedules(type: 'branch' | 'barber') {
  return fetchAdminData<AdminRecord[]>(`/api/admin/schedules?type=${type}`);
}

export function fetchAdminMemberships(status = '') {
  const query = new URLSearchParams({ page: '1', limit: '100' });
  if (status) query.set('status', status);
  return fetchAdminData<AdminRecord[]>(`/api/admin/memberships?${query}`);
}

export function fetchAdminMembershipPolicy() {
  return fetchAdminData<AdminRecord>('/api/admin/memberships/policy');
}

export function fetchAdminMembershipPoints(membershipId: string) {
  return fetchAdminData<{
    entries: AdminRecord[];
    pointBalance: number;
  }>(`/api/admin/memberships/${encodeURIComponent(membershipId)}/points?page=1&limit=100`);
}

export function fetchAdminVacancies() {
  return fetchAdminData<AdminRecord[]>('/api/admin/career/vacancies?page=1&limit=100');
}

export function fetchAdminApplications(filters: Record<string, string> = {}) {
  const query = new URLSearchParams({ page: '1', limit: '100' });
  for (const [key, value] of Object.entries(filters)) {
    if (value) query.set(key, value);
  }
  return fetchAdminData<AdminRecord[]>(`/api/admin/career/applications?${query}`);
}

export function fetchAdminPaymentProof(bookingId: string) {
  return fetchAdminData<{ url: string }>(
    `/api/admin/bookings/${encodeURIComponent(bookingId)}/payment-proof`,
  );
}

export function fetchAdminReportSummary(branchId: string) {
  return fetchAdminData<AdminReportSummary>(
    `/api/admin/reports/summary?branchId=${encodeURIComponent(branchId || 'all')}`,
  );
}

export function fetchAdminServiceReport(branchId: string) {
  return fetchAdminData<AdminServiceReport>(
    `/api/admin/reports/services?branchId=${encodeURIComponent(branchId || 'all')}`,
  );
}

export function fetchAdminBarberReport(branchId: string) {
  return fetchAdminData<AdminBarberReport>(
    `/api/admin/reports/barbers?branchId=${encodeURIComponent(branchId || 'all')}`,
  );
}
