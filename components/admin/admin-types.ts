export type OperationalMetrics = {
  totalBookingsToday: number;
  growthPercentage: number;
  completedCount: number;
  inProgressCount: number;
  queueCount: number;
  revenueToday: number;
  revenueTarget: number;
  targetAchievedPercent: number;
  chairUtilizationPercent: number;
  activeChairs: number;
  totalChairs: number;
  vipVisitsToday: number;
  pointsIssuedToday: number;
  totalActiveMembers: number;
  softLockAlertCount: number;
};

export type WeeklyTrendItem = {
  day: string;
  revenue: number;
  bookings: number;
  isPeak?: boolean;
};

export type ServiceDistributionItem = {
  id: string;
  name: string;
  priceRupiah: number;
  percentage: number;
  orderCount: number;
  color: string;
};

export type CapsterDutyItem = {
  id: string;
  name: string;
  nickname: string;
  branch: string;
  branchCode: string;
  chairNo: string;
  status: 'IN_SERVICE' | 'AVAILABLE' | 'ON_BREAK';
  statusText: string;
  customerName: string;
  serviceName: string;
  startTime: string;
  estimatedFinish: string;
  elapsedMinutes: number;
  totalMinutes: number;
  progressPercent: number;
  todayCuts: number;
};

export type AdminBookingItem = {
  id: string;
  branchId: string;
  barberId: string;
  customerId?: string | null;
  guestName?: string | null;
  guestPhone?: string | null;
  startsAt: string;
  endsAt: string;
  status: 'PENDING_PAYMENT' | 'AWAITING_CONFIRMATION' | 'CONFIRMED' | 'REJECTED' | 'COMPLETED' | 'CANCELLED';
  holdExpiresAt?: string | null;
  note?: string | null;
  createdAt: string;
  branch: {
    id: string;
    name: string;
    slug?: string;
  };
  barber: {
    id: string;
    name: string;
  };
  customer?: {
    id: string;
    name: string;
    phone?: string | null;
  } | null;
  items: Array<{
    id?: string;
    serviceNameSnapshot: string;
    unitPriceRupiahSnapshot: number;
    durationMinutesSnapshot?: number;
  }>;
  transaction?: {
    id: string;
    status: string;
    totalAmountRupiah: number;
    payments?: Array<{
      id: string;
      method: 'CASH' | 'BANK_TRANSFER' | 'QRIS';
      status: string;
      amountRupiah: number;
      proofStoragePath?: string | null;
      proofUploadedAt?: string | null;
    }>;
  } | null;
};

export type BranchOption = {
  id: string;
  name: string;
  slug: string;
};
