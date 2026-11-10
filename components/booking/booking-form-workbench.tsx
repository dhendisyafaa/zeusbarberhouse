"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AlertCircle } from "lucide-react";
import {
  ApiResponseError,
  customerQueryKeys,
  fetchApiData,
  publicQueryKeys,
} from "@/lib/queries/api";
import { BookingStepper } from "./booking-stepper";
import { BookingSummarySlip } from "./booking-summary-slip";
import { SoftLockModal } from "./soft-lock-modal";
import { BranchOption, StepBranch } from "./step-branch";
import { CapsterOption, StepCapster } from "./step-capster";
import { CustomerFormData, StepCustomer } from "./step-customer";
import { StepDateTime } from "./step-datetime";
import { BookingServiceItem, StepServices } from "./step-services";

type BranchApiRow = {
  id: string;
  slug: string;
  name: string;
  city: string;
  address: string;
  phone: string | null;
  schedules: { dayOfWeek: number; openMinute: number; closeMinute: number }[];
};

type BarberApiRow = {
  id: string;
  name: string;
  bio: string | null;
  photoUrl: string | null;
  branchId: string;
  branch: { id: string; name: string; slug: string };
};

type ServiceApiRow = {
  id: string;
  name: string;
  description: string | null;
  durationMinutes: number;
  priceRupiah: number;
};

type AvailabilityResponse = { date: string; slots: string[] };
type BookingCustomerProfile = {
  profile: { id: string; role: string };
  customer: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
  };
};
type BookingResponse = {
  id: string;
  status: string;
  holdExpiresAt: string | null;
  startsAt: string;
  guestAccessToken?: string;
  paymentSummary?: {
    branchName: string;
    datetimeLabel: string;
    totalPrice: number;
  };
};

function formatMinute(minute: number) {
  return `${String(Math.floor(minute / 60)).padStart(2, "0")}:${String(minute % 60).padStart(2, "0")}`;
}

function todayInBandung() {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Jakarta" }).format(
    new Date(),
  );
}

export function BookingFormWorkbench() {
  const searchParams = useSearchParams();
  const [selectedBranchKey, setSelectedBranchKey] = useState(
    searchParams.get("branch") ?? "",
  );
  const [selectedCapsterId, setSelectedCapsterId] = useState("");
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>(() => {
    const serviceId = searchParams.get("service");
    return serviceId ? [serviceId] : [];
  });
  const [selectedDateKey, setSelectedDateKey] = useState(todayInBandung);
  const [selectedTime, setSelectedTime] = useState("");
  const [customerData, setCustomerData] = useState<CustomerFormData>({
    name: "",
    phone: "",
    notes: "",
  });
  const [createdBooking, setCreatedBooking] = useState<BookingResponse | null>(
    null,
  );

  const branchesQuery = useQuery({
    queryKey: publicQueryKeys.branches,
    queryFn: () => fetchApiData<BranchApiRow[]>("/api/public/branches"),
  });
  const servicesQuery = useQuery({
    queryKey: publicQueryKeys.services,
    queryFn: () => fetchApiData<ServiceApiRow[]>("/api/public/services"),
  });
  const customerProfileQuery = useQuery({
    queryKey: customerQueryKeys.bookingProfile,
    queryFn: () =>
      fetchApiData<BookingCustomerProfile>("/api/customer/profile"),
    retry: false,
    staleTime: 0,
    refetchOnMount: "always",
  });
  const customerProfile =
    !customerProfileQuery.isError &&
    customerProfileQuery.data?.profile.role === "CUSTOMER"
      ? customerProfileQuery.data.customer
      : null;
  const isGuestBooking =
    (customerProfileQuery.isError &&
      customerProfileQuery.error instanceof ApiResponseError &&
      [401, 403, 404].includes(customerProfileQuery.error.status)) ||
    (customerProfileQuery.isSuccess &&
      customerProfileQuery.data.profile.role !== "CUSTOMER");
  const profileLoadError =
    customerProfileQuery.isError && !isGuestBooking
      ? customerProfileQuery.error instanceof Error
        ? customerProfileQuery.error.message
        : "Profil akun tidak dapat diperiksa."
      : "";
  const branches = branchesQuery.data ?? [];
  const services = servicesQuery.data;
  const activeBranch =
    branches.find(
      (branch) =>
        branch.id === selectedBranchKey || branch.slug === selectedBranchKey,
    ) ?? branches[0];
  const branchOptions: BranchOption[] = branches.map((branch, index) => ({
    id: branch.id,
    number: `CABANG #${String(index + 1).padStart(2, "0")}`,
    name: branch.name,
    city: branch.city,
    address: branch.address,
    phone: branch.phone,
    hours: branch.schedules.length
      ? (() => {
          const dayOfWeek = new Date(
            `${selectedDateKey}T00:00:00.000Z`,
          ).getUTCDay();
          const schedule = branch.schedules.find(
            (entry) => entry.dayOfWeek === dayOfWeek,
          );
          return schedule
            ? `${formatMinute(schedule.openMinute)}–${formatMinute(schedule.closeMinute)}`
            : "Tutup / jadwal belum tersedia";
        })()
      : "Jadwal belum tersedia",
  }));
  const selectedBranch = branchOptions.find(
    (branch) => branch.id === activeBranch?.id,
  );

  const barbersQuery = useQuery({
    queryKey: publicQueryKeys.barbers(activeBranch?.id ?? ""),
    queryFn: () =>
      fetchApiData<BarberApiRow[]>(
        `/api/public/barbers?branchId=${encodeURIComponent(activeBranch!.id)}`,
      ),
    enabled: Boolean(activeBranch?.id),
  });
  const capsters: CapsterOption[] = (barbersQuery.data ?? []).map((barber) => ({
    id: barber.id,
    name: barber.name,
    nickname: barber.name,
    specialty: barber.bio ?? "",
    photoUrl: barber.photoUrl,
  }));
  const selectedCapster =
    capsters.find((capster) => capster.id === selectedCapsterId) ?? capsters[0];
  const bookingServices: BookingServiceItem[] = useMemo(
    () =>
      (services ?? []).map((service) => ({
        id: service.id,
        title: service.name,
        description: service.description ?? "",
        duration: service.durationMinutes,
        price: service.priceRupiah,
      })),
    [services],
  );
  const selectedServices = useMemo(
    () =>
      bookingServices.filter((service) =>
        selectedServiceIds.includes(service.id),
      ),
    [bookingServices, selectedServiceIds],
  );
  const totalDuration = selectedServices.reduce(
    (total, service) => total + service.duration,
    0,
  );
  const totalPrice = selectedServices.reduce(
    (total, service) => total + service.price,
    0,
  );

  const availabilityQuery = useQuery({
    queryKey: publicQueryKeys.availability(
      activeBranch?.id ?? "",
      selectedCapster?.id ?? "",
      selectedDateKey,
      totalDuration,
    ),
    queryFn: () => {
      const params = new URLSearchParams({
        branchId: activeBranch!.id,
        barberId: selectedCapster!.id,
        date: selectedDateKey,
        durationMinutes: String(totalDuration),
      });
      return fetchApiData<AvailabilityResponse>(
        `/api/public/availability?${params}`,
      );
    },
    enabled: Boolean(
      activeBranch?.id && selectedCapster?.id && totalDuration > 0,
    ),
    placeholderData: (previousData) => previousData,
  });
  const createBookingMutation = useMutation({
    mutationFn: (payload: {
      branchId: string;
      barberId: string;
      serviceIds: string[];
      startsAt: string;
      guestName?: string;
      guestPhone?: string;
      note: string;
    }) =>
      fetchApiData<BookingResponse>("/api/public/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
  });

  const availabilitySlots = availabilityQuery.data?.slots ?? [];
  const isValidToSubmit = Boolean(
    activeBranch &&
    selectedCapster &&
    selectedServices.length > 0 &&
    selectedTime &&
    availabilitySlots.includes(selectedTime) &&
    !availabilityQuery.isFetching &&
    !availabilityQuery.isError &&
    !customerProfileQuery.isPending &&
    !customerProfileQuery.isFetching &&
    !profileLoadError &&
    (!isGuestBooking ||
      (customerData.name.trim() && customerData.phone.trim())) &&
    !createBookingMutation.isPending,
  );

  const toggleService = (serviceId: string) => {
    setSelectedServiceIds((previous) =>
      previous.includes(serviceId)
        ? previous.filter((id) => id !== serviceId)
        : [...previous, serviceId],
    );
    setSelectedTime("");
  };
  const handleCustomerChange = (
    field: keyof CustomerFormData,
    value: string,
  ) => {
    setCustomerData((previous) => ({ ...previous, [field]: value }));
  };
  const resetBookingForm = () => {
    setSelectedBranchKey("");
    setSelectedCapsterId("");
    setSelectedServiceIds([]);
    setSelectedDateKey(todayInBandung());
    setSelectedTime("");
    setCustomerData({ name: "", phone: "", notes: "" });
  };
  const formattedDate = selectedTime
    ? new Intl.DateTimeFormat("id-ID", {
        dateStyle: "full",
        timeZone: "Asia/Jakarta",
      }).format(new Date(`${selectedDateKey}T${selectedTime}:00+07:00`))
    : new Intl.DateTimeFormat("id-ID", {
        dateStyle: "full",
        timeZone: "Asia/Jakarta",
      }).format(new Date(`${selectedDateKey}T00:00:00+07:00`));
  const formattedDateTime = selectedTime
    ? `${formattedDate}, ${selectedTime}`
    : formattedDate;

  const handleCreateBooking = () => {
    if (!isValidToSubmit || !activeBranch || !selectedCapster) return;
    const startsAt = new Date(`${selectedDateKey}T${selectedTime}:00+07:00`);
    createBookingMutation.mutate(
      {
        branchId: activeBranch.id,
        barberId: selectedCapster.id,
        serviceIds: selectedServices.map((service) => service.id),
        startsAt: startsAt.toISOString(),
        ...(isGuestBooking
          ? {
              guestName: customerData.name.trim(),
              guestPhone: customerData.phone.trim(),
            }
          : {}),
        note: customerData.notes.trim(),
      },
      {
        onSuccess: (booking) => {
          setCreatedBooking({
            ...booking,
            paymentSummary: {
              branchName: activeBranch.name,
              datetimeLabel: formattedDateTime,
              totalPrice,
            },
          });
          resetBookingForm();
        },
      },
    );
  };
  const loadError =
    branchesQuery.error ??
    servicesQuery.error ??
    (activeBranch ? barbersQuery.error : null);

  return (
    <div className="flex w-full flex-col">
      <section className="w-full border-b border-[#27272A] bg-[#1A1A1D]">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 px-4 py-8 sm:px-6 md:flex-row md:items-end lg:px-8">
          <div className="flex max-w-3xl flex-col gap-2">
            <h1 className="font-heading text-3xl font-extrabold uppercase leading-none tracking-tight text-[#FAFAFA] sm:text-5xl">
              Booking kursi & jadwal
            </h1>
            <p className="text-sm leading-relaxed text-[#A1A1AA]">
              Slot diperiksa berdasarkan jadwal cabang, jadwal capster, waktu
              istirahat, cuti, dan booking yang masih aktif.
            </p>
          </div>
          <div className="border border-[#27272A] bg-[#09090B] p-4 text-xs">
            <span className="block text-[#A1A1AA]">Batas pembayaran</span>
            <span className="font-heading text-lg font-bold">15 MENIT</span>
          </div>
        </div>
        <BookingStepper currentStep={4} />
      </section>
      <div className="h-[6px] w-full border-b border-[#27272A] bg-[repeating-linear-gradient(45deg,#09090B,#09090B_10px,#0033A0_10px,#0033A0_20px)]" />

      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {(loadError || createBookingMutation.error) && (
          <div
            role="alert"
            className="mb-6 flex items-start gap-2 border border-red-800 bg-red-950/30 p-4 text-sm text-red-200"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              {loadError instanceof Error
                ? loadError.message
                : createBookingMutation.error?.message}
            </span>
          </div>
        )}
        {branchesQuery.isFetching && !branchesQuery.isPending && (
          <p role="status" className="mb-4 text-xs text-[#A1A1AA]">
            Memperbarui daftar cabang…
          </p>
        )}
        <div className="grid items-start gap-8 lg:grid-cols-12 lg:gap-10">
          <div className="flex flex-col gap-10 lg:col-span-8">
            {branchesQuery.isPending ? (
              <p role="status" className="text-sm text-[#A1A1AA]">
                Memuat cabang…
              </p>
            ) : branches.length === 0 ? (
              <p className="text-sm text-[#A1A1AA]">Belum ada cabang aktif.</p>
            ) : (
              <StepBranch
                branches={branchOptions}
                selectedBranchId={activeBranch?.id ?? ""}
                onSelectBranch={(branchId) => {
                  setSelectedBranchKey(branchId);
                  setSelectedCapsterId("");
                  setSelectedTime("");
                }}
              />
            )}

            {barbersQuery.isPending && activeBranch ? (
              <p role="status" className="text-sm text-[#A1A1AA]">
                Memuat capster…
              </p>
            ) : (
              <StepCapster
                capsters={capsters}
                selectedCapsterId={selectedCapster?.id ?? ""}
                onSelectCapster={(id) => {
                  setSelectedCapsterId(id);
                  setSelectedTime("");
                }}
              />
            )}

            {servicesQuery.isPending ? (
              <p role="status" className="text-sm text-[#A1A1AA]">
                Memuat layanan…
              </p>
            ) : (
              <StepServices
                services={bookingServices}
                selectedServiceIds={selectedServiceIds}
                onToggleService={toggleService}
              />
            )}

            <StepDateTime
              selectedDateKey={selectedDateKey}
              selectedTime={selectedTime}
              availableTimes={availabilitySlots}
              canCheckAvailability={Boolean(
                activeBranch?.id &&
                selectedCapster?.id &&
                selectedServices.length > 0,
              )}
              selectedServiceCount={selectedServices.length}
              totalDurationMinutes={totalDuration}
              isLoading={
                Boolean(
                  activeBranch?.id &&
                  selectedCapster?.id &&
                  selectedServices.length,
                ) && availabilityQuery.isFetching
              }
              availabilityError={
                activeBranch &&
                selectedCapster &&
                selectedServices.length > 0 &&
                availabilityQuery.error instanceof Error
                  ? availabilityQuery.error.message
                  : ""
              }
              onRetry={() => void availabilityQuery.refetch()}
              onSelectDate={(date) => {
                setSelectedDateKey(date);
                setSelectedTime("");
              }}
              onSelectTime={setSelectedTime}
            />
            <StepCustomer
              formData={customerData}
              customer={customerProfile}
              isCheckingProfile={
                customerProfileQuery.isPending ||
                customerProfileQuery.isFetching
              }
              profileError={profileLoadError}
              onChange={handleCustomerChange}
              onRetryProfile={() => void customerProfileQuery.refetch()}
            />
          </div>

          <BookingSummarySlip
            branch={selectedBranch}
            capster={selectedCapster}
            dateLabel={formattedDate}
            timeSlot={selectedTime}
            selectedServices={selectedServices}
            totalDurationMinutes={totalDuration}
            onSubmit={handleCreateBooking}
            isValidToSubmit={isValidToSubmit}
          />
        </div>
      </div>

      {createBookingMutation.isPending && (
        <p
          role="status"
          className="fixed bottom-4 right-4 z-40 border border-[#27272A] bg-[#1A1A1D] px-4 py-3 text-sm"
        >
          Mengunci jadwal…
        </p>
      )}
      {createdBooking?.holdExpiresAt && createdBooking.paymentSummary && (
        <SoftLockModal
          isOpen
          onClose={() => setCreatedBooking(null)}
          branchName={createdBooking.paymentSummary.branchName}
          datetimeLabel={createdBooking.paymentSummary.datetimeLabel}
          totalPrice={createdBooking.paymentSummary.totalPrice}
          ticketCode={createdBooking.id.slice(0, 8).toUpperCase()}
          bookingId={createdBooking.id}
          holdExpiresAt={createdBooking.holdExpiresAt}
          guestAccessToken={createdBooking.guestAccessToken}
        />
      )}
    </div>
  );
}
