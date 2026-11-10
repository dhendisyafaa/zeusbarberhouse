"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, RefreshCw } from "lucide-react";
import { AdminSidebar } from "./admin-sidebar";
import { AdminHeader } from "./admin-header";
import { SoftLockAlertBanner } from "./soft-lock-alert-banner";
import { MetricCards } from "./metric-cards";
import { RevenueTrendChart } from "./revenue-trend-chart";
import { ServiceDistributionChart } from "./service-distribution-chart";
import { VerificationQueue } from "./verification-queue";
import { CapsterDutyGrid } from "./capster-duty-grid";
import { ReceiptPreviewModal } from "./receipt-preview-modal";
import type {
  AdminBookingItem,
  BranchOption,
} from "./admin-types";
import {
  adminQueryKeys,
  fetchAdminBookings,
  fetchAdminBranches,
  fetchAdminBarberReport,
  fetchAdminData,
  fetchAdminReportSummary,
  fetchAdminServiceReport,
} from "@/lib/admin/queries";

export function AdminDashboardWorkbench() {
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [selectedReceiptBooking, setSelectedReceiptBooking] = useState<AdminBookingItem | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [mutationError, setMutationError] = useState("");
  const queryClient = useQueryClient();
  const branchesQuery = useQuery({
    queryKey: adminQueryKeys.branches.list({ page: 1, limit: 100 }),
    queryFn: () => fetchAdminBranches({ page: 1, limit: 100 }),
  });
  const summaryQuery = useQuery({
    queryKey: adminQueryKeys.reports.summary(selectedBranch),
    queryFn: () => fetchAdminReportSummary(selectedBranch),
    placeholderData: (previousData) => previousData,
  });
  const servicesQuery = useQuery({
    queryKey: adminQueryKeys.reports.services(selectedBranch),
    queryFn: () => fetchAdminServiceReport(selectedBranch),
    placeholderData: (previousData) => previousData,
  });
  const barbersQuery = useQuery({
    queryKey: adminQueryKeys.reports.barbers(selectedBranch),
    queryFn: () => fetchAdminBarberReport(selectedBranch),
    placeholderData: (previousData) => previousData,
  });
  const bookingsQuery = useQuery({
    queryKey: adminQueryKeys.bookings.list({
      status: "AWAITING_CONFIRMATION",
      branchId: selectedBranch,
      page: 1,
      limit: 100,
    }),
    placeholderData: (previousData) => previousData,
    queryFn: () => fetchAdminBookings({
      status: "AWAITING_CONFIRMATION",
      branchId: selectedBranch,
      page: 1,
      limit: 100,
    }),
  });
  const branches = (branchesQuery.data || []) as BranchOption[];
  const metrics = summaryQuery.data?.metrics;
  const weeklyTrends = summaryQuery.data?.weeklyTrends || [];
  const serviceDistribution = servicesQuery.data?.distribution || [];
  const serviceOrderCount = servicesQuery.data?.totalOrders || 0;
  const roster = barbersQuery.data?.roster || [];
  const verificationQueue = bookingsQuery.data || [];
  const isLoading = summaryQuery.isPending || servicesQuery.isPending ||
    barbersQuery.isPending || bookingsQuery.isPending;
  const isRefreshing = summaryQuery.isFetching || servicesQuery.isFetching ||
    barbersQuery.isFetching || bookingsQuery.isFetching;
  const queryError = summaryQuery.error || servicesQuery.error ||
    barbersQuery.error || bookingsQuery.error || branchesQuery.error;
  const mutation = useMutation({
    mutationFn: async ({ bookingId, status }: {
      bookingId: string;
      status: "CONFIRMED" | "REJECTED";
    }) => fetchAdminData<AdminBookingItem>(`/api/admin/bookings/${bookingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status,
        note: status === "CONFIRMED"
          ? "Pembayaran diverifikasi oleh admin"
          : "Bukti pembayaran ditolak oleh admin",
      }),
    }),
    onMutate: async ({ bookingId }) => {
      const key = adminQueryKeys.bookings.list({
        status: "AWAITING_CONFIRMATION",
        branchId: selectedBranch,
        page: 1,
        limit: 100,
      });
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<AdminBookingItem[]>(key);
      queryClient.setQueryData<AdminBookingItem[]>(key, (items) =>
        items?.filter((booking) => booking.id !== bookingId),
      );
      return { key, previous };
    },
    onError: (error, _variables, context) => {
      if (context) queryClient.setQueryData(context.key, context.previous);
      setMutationError(error instanceof Error ? error.message : "Status booking gagal diperbarui.");
    },
    onSuccess: () => setMutationError(""),
    onSettled: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: adminQueryKeys.bookings.all }),
        queryClient.invalidateQueries({ queryKey: adminQueryKeys.reports.all }),
      ]);
    },
  });
  const updateBooking = async (
    bookingId: string,
    status: "CONFIRMED" | "REJECTED",
  ): Promise<boolean> => {
    try {
      await mutation.mutateAsync({ bookingId, status });
      return true;
    } catch {
      return false;
    }
  };

  const handleOpenReceiptModal = (booking: AdminBookingItem) => {
    setSelectedReceiptBooking(booking);
    setIsReceiptModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background font-sans text-foreground antialiased selection:bg-primary selection:text-primary-foreground">
      <AdminSidebar
        activeTab="dashboard-overview"
      />
      <div className="min-w-0 pl-0 lg:pl-72">
        <AdminHeader
          branches={branches}
          selectedBranch={selectedBranch}
          onBranchChange={setSelectedBranch}
        />
        <main className="w-full min-w-0 px-4 pb-16 pt-20 sm:px-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold uppercase tracking-wide">Dashboard Operasional</h1>
              <p className="mt-1 text-sm text-muted-foreground">Ringkasan dari data booking dan transaksi aktual.</p>
            </div>
            <button
              type="button"
              onClick={() => void Promise.all([
                queryClient.invalidateQueries({ queryKey: adminQueryKeys.branches.all }),
                queryClient.invalidateQueries({ queryKey: adminQueryKeys.bookings.all }),
                queryClient.invalidateQueries({ queryKey: adminQueryKeys.reports.all }),
              ])}
              disabled={isLoading || isRefreshing}
              className="inline-flex items-center gap-2 border border-border px-3 py-2 text-sm hover:border-primary disabled:opacity-60"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              Muat ulang
            </button>
          </div>

          {queryError || mutationError ? (
            <div role="alert" className="mb-5 flex items-center gap-2 border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{mutationError || (queryError instanceof Error ? queryError.message : "Data dashboard gagal dimuat.")}</span>
            </div>
          ) : null}
          {isRefreshing && !isLoading && (
            <p role="status" className="mb-3 text-xs text-muted-foreground">Memperbarui data… Menampilkan data cache sementara.</p>
          )}
          {queryError && metrics && !isRefreshing && (
            <p role="status" className="mb-3 text-xs text-warning">Pembaruan gagal; menampilkan data terakhir yang berhasil dimuat.</p>
          )}

          {isLoading && !metrics ? (
            <p className="py-16 text-center text-sm text-muted-foreground">Memuat dashboard...</p>
          ) : null}

          {!isLoading && !metrics && !queryError ? (
            <p className="py-16 text-center text-sm text-muted-foreground">Belum ada data dashboard.</p>
          ) : null}

          {metrics ? (
            <div className="flex flex-col gap-5">
              <SoftLockAlertBanner unverifiedCount={verificationQueue.length} />
              <MetricCards metrics={metrics} />
              <div
                className="h-1 w-full bg-repeat-x bg-[length:16px_4px]"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(90deg, var(--destructive) 0, var(--destructive) 8px, var(--primary) 8px, var(--primary) 16px)",
                }}
              />
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
                <div className="min-w-0 lg:col-span-8">
                  <RevenueTrendChart trends={weeklyTrends} />
                </div>
                <div className="min-w-0 lg:col-span-4">
                  <ServiceDistributionChart
                    totalOrders={serviceOrderCount}
                    distribution={serviceDistribution}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 pt-1 xl:grid-cols-12" id="verifikasi-section">
                <div className="min-w-0 xl:col-span-7">
                  <VerificationQueue
                    bookings={verificationQueue}
                    onOpenReceipt={handleOpenReceiptModal}
                    onApprove={(bookingId) => updateBooking(bookingId, "CONFIRMED")}
                    onReject={(bookingId) => updateBooking(bookingId, "REJECTED")}
                  />
                </div>
                <div className="min-w-0 xl:col-span-5">
                  <CapsterDutyGrid roster={roster} />
                </div>
              </div>
            </div>
          ) : null}
        </main>
      </div>
      <ReceiptPreviewModal
        booking={selectedReceiptBooking}
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        onApprove={(bookingId) => updateBooking(bookingId, "CONFIRMED")}
        onReject={(bookingId) => updateBooking(bookingId, "REJECTED")}
      />
    </div>
  );
}
