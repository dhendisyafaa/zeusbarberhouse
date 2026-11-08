export class ApiResponseError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'ApiResponseError';
  }
}

export async function fetchApiData<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  let body: { data?: T; error?: { message?: string } } | null = null;
  try {
    body = await response.json() as { data?: T; error?: { message?: string } };
  } catch {
    throw new ApiResponseError('Respons server bukan JSON yang valid.', response.status);
  }

  if (!response.ok) {
    throw new ApiResponseError(
      body?.error?.message || `Permintaan gagal (${response.status}).`,
      response.status,
    );
  }
  if (!body || !Object.hasOwn(body, 'data')) {
    throw new ApiResponseError('Respons server tidak memiliki data.', response.status);
  }
  return body.data as T;
}

export const publicQueryKeys = {
  services: ['public', 'services'] as const,
  branches: ['public', 'branches'] as const,
  paymentOptions: ['public', 'payment-options'] as const,
  barbers: (branchId: string) => ['public', 'barbers', { branchId }] as const,
  vacancies: ['public', 'vacancies'] as const,
  availability: (branchId: string, barberId: string, date: string, duration: number) =>
    ['public', 'availability', { branchId, barberId, date, duration }] as const,
};

export const customerQueryKeys = {
  profile: ['customer', 'profile'] as const,
  bookingProfile: ['customer', 'booking-profile'] as const,
  bookings: ['customer', 'bookings'] as const,
  membership: ['customer', 'membership'] as const,
  transactions: ['customer', 'transactions'] as const,
};
