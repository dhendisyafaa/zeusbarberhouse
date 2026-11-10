"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import Image from "next/image";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AdminSidebar } from "./admin-sidebar";
import {
  adminQueryKeys,
  fetchAdminBookings,
  fetchAdminBranches,
  fetchAdminBarberReport,
  fetchAdminReportSummary,
  fetchAdminResource,
  fetchAdminServiceReport,
  fetchAdminSchedules,
} from "@/lib/admin/queries";
import { AdminMembershipWorkbench } from "./admin-membership-workbench";
import { AdminCareerWorkbench } from "./admin-career-workbench";
import { AdminPaymentOptionsWorkbench } from "./admin-payment-options-workbench";

type Resource =
  | "bookings"
  | "branches"
  | "services"
  | "barbers"
  | "haircut-models"
  | "schedules"
  | "reports"
  | "membership"
  | "payment-options"
  | "career";
type ConfiguredResource = Exclude<
  Resource,
  | "bookings"
  | "schedules"
  | "reports"
  | "membership"
  | "payment-options"
  | "career"
>;
type RecordData = Record<string, unknown>;
type Option = { id: string; name: string };
type Field = {
  name: string;
  label: string;
  type?: "text" | "number" | "textarea" | "checkbox" | "select" | "file";
  required?: boolean;
  options?: { value: string; label: string }[];
  optionSource?: "branches";
};
type ResourceConfig = {
  title: string;
  description: string;
  endpoint: string;
  columns: { key: string; label: string }[];
  createFields: Field[];
  updateFields?: Field[];
  filters?: {
    label: string;
    param: string;
    options: { value: string; label: string }[];
  }[];
  archiveLabel?: string;
  multipart?: boolean;
};

const dayNames = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const bookingStatuses = [
  "AWAITING_CONFIRMATION",
  "PENDING_PAYMENT",
  "CONFIRMED",
  "REJECTED",
  "COMPLETED",
  "CANCELLED",
];
function allowedBookingTransitions(status: unknown) {
  if (status === "AWAITING_CONFIRMATION") return ["CONFIRMED", "REJECTED"];
  if (status === "CONFIRMED") return ["COMPLETED"];
  return [];
}
const field = (
  name: string,
  label: string,
  type: Field["type"] = "text",
  required = false,
): Field => ({
  name,
  label,
  type,
  required,
});
const branchField = (required = true): Field => ({
  name: "branchId",
  label: "Branch",
  type: "select",
  required,
  optionSource: "branches",
});

const configs: Record<ConfiguredResource, ResourceConfig> = {
  branches: {
    title: "Branches",
    description:
      "Manage branch details and archive locations that are no longer active.",
    endpoint: "/api/admin/branches",
    columns: [
      { key: "name", label: "Name" },
      { key: "slug", label: "Slug" },
      { key: "city", label: "City" },
      { key: "address", label: "Address" },
      { key: "phone", label: "Phone" },
      { key: "isActive", label: "Status" },
    ],
    createFields: [
      field("name", "Name", "text", true),
      field("slug", "Slug", "text", true),
      field("address", "Address", "textarea", true),
      field("city", "City", "text", true),
      field("phone", "Phone"),
      field("mapsUrl", "Google Maps URL"),
    ],
    updateFields: [
      field("name", "Name"),
      field("slug", "Slug"),
      field("address", "Address", "textarea"),
      field("city", "City"),
      field("phone", "Phone"),
      field("mapsUrl", "Google Maps URL"),
      field("isActive", "Active", "checkbox"),
    ],
    archiveLabel: "Arsipkan cabang",
  },
  services: {
    title: "Services",
    description:
      "Maintain the service catalog, prices, durations, display order, and availability.",
    endpoint: "/api/admin/services",
    columns: [
      { key: "name", label: "Name" },
      { key: "priceRupiah", label: "Price (IDR)" },
      { key: "durationMinutes", label: "Minutes" },
      { key: "sortOrder", label: "Order" },
      { key: "isActive", label: "Status" },
    ],
    createFields: [
      field("name", "Name", "text", true),
      field("description", "Description", "textarea"),
      field("priceRupiah", "Price (IDR)", "number", true),
      field("durationMinutes", "Duration (minutes)", "number", true),
      field("sortOrder", "Display order", "number"),
    ],
    updateFields: [
      field("name", "Name"),
      field("description", "Description", "textarea"),
      field("priceRupiah", "Price (IDR)", "number"),
      field("durationMinutes", "Duration (minutes)", "number"),
      field("sortOrder", "Display order", "number"),
      field("isActive", "Active", "checkbox"),
    ],
    filters: [
      {
        label: "All services",
        param: "isActive",
        options: [
          { value: "", label: "All services" },
          { value: "true", label: "Active" },
          { value: "false", label: "Archived" },
        ],
      },
    ],
    archiveLabel: "Archive service",
  },
  barbers: {
    title: "Barbers",
    description:
      "Kelola profil capster, cabang, dan foto yang diunggah langsung.",
    endpoint: "/api/admin/barbers",
    columns: [
      { key: "photoUrl", label: "Foto" },
      { key: "name", label: "Name" },
      { key: "branch.name", label: "Branch" },
      { key: "bio", label: "Bio" },
      { key: "isActive", label: "Status" },
    ],
    createFields: [
      branchField(),
      field("name", "Name", "text", true),
      field("bio", "Bio", "textarea"),
      field("photo", "Foto", "file", true),
    ],
    updateFields: [
      branchField(),
      field("name", "Name"),
      field("bio", "Bio", "textarea"),
      field("photo", "Foto baru (opsional)", "file"),
      field("isActive", "Active", "checkbox"),
    ],
    archiveLabel: "Archive barber",
    multipart: true,
  },
  "haircut-models": {
    title: "Haircut Models",
    description: "Kelola galeri haircut dengan foto yang diunggah langsung.",
    endpoint: "/api/admin/haircut-models",
    columns: [
      { key: "imageUrl", label: "Gambar" },
      { key: "title", label: "Title" },
      { key: "description", label: "Description" },
      { key: "createdAt", label: "Created" },
    ],
    createFields: [
      field("title", "Judul", "text", true),
      field("description", "Deskripsi", "textarea"),
      field("image", "Gambar", "file", true),
    ],
    updateFields: [
      field("title", "Judul", "text", true),
      field("description", "Deskripsi", "textarea"),
      field("image", "Gambar baru (opsional)", "file"),
    ],
    archiveLabel: "Hapus model",
    multipart: true,
  },
};

async function responseData<T>(response: Response): Promise<T> {
  const body = (await response.json().catch(() => null)) as {
    data: T;
    error?: { message?: string };
  } | null;
  if (!response.ok) {
    throw new Error(
      body?.error?.message || `Request failed (${response.status})`,
    );
  }
  if (!body || !("data" in body))
    throw new Error("Server returned an invalid response.");
  return body.data;
}

async function sendRequest(
  url: string,
  method: string,
  body?: Record<string, unknown> | FormData,
) {
  const response = await fetch(url, {
    method,
    ...(body instanceof FormData
      ? { body }
      : body
        ? {
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          }
        : {}),
  });
  if (response.status === 204 && response.ok) return;
  await responseData(response);
}

function getValue(row: RecordData, path: string): unknown {
  return path.split(".").reduce<unknown>((current, key) => {
    if (typeof current !== "object" || current === null) return undefined;
    return (current as RecordData)[key];
  }, row);
}

function displayValue(value: unknown): string {
  if (typeof value === "boolean") return value ? "Active" : "Inactive";
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "number") return value.toLocaleString("id-ID");
  if (typeof value === "string" && /^\d{4}-\d\d-\d\dT/.test(value)) {
    return new Date(value).toLocaleString("id-ID");
  }
  return String(value);
}

function PageShell({
  resource,
  title,
  description,
  children,
}: {
  resource: Resource;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#09090B] text-[#FAFAFA] font-sans antialiased">
      <AdminSidebar activeTab={resource} />
      <div className="min-w-0 pl-0 lg:pl-72">
        <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between border-b border-[#27272A] bg-[#1A1A1D]/95 pl-14 pr-4 backdrop-blur-md sm:px-6 sm:pl-16 lg:pl-6">
          <div className="text-xs uppercase tracking-widest text-[#A1A1AA]">
            Admin <span className="mx-2 text-[#52525B]">/</span> {title}
          </div>
          <span className="border border-[#27272A] bg-[#09090B] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#A1A1AA]">
            Resource Console
          </span>
        </header>
        <main className="min-w-0 space-y-6 px-4 py-6 sm:px-6 sm:py-8">
          <div>
            <h1 className="font-heading text-3xl font-bold uppercase tracking-wide">
              {title}
            </h1>
            <p className="mt-2 max-w-3xl text-sm text-[#A1A1AA]">
              {description}
            </p>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}

function Alert({
  children,
  kind = "error",
}: {
  children: ReactNode;
  kind?: "error" | "success";
}) {
  return (
    <div
      role={kind === "error" ? "alert" : "status"}
      className={`border px-4 py-3 text-sm ${kind === "error" ? "border-[#FF2A2A]/50 bg-[#FF2A2A]/10 text-[#FFB4B4]" : "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"}`}
    >
      {children}
    </div>
  );
}

function Card({ children, title }: { children: ReactNode; title?: string }) {
  return (
    <section className="overflow-hidden border border-[#27272A] bg-[#1A1A1D]">
      {title && (
        <h2 className="border-b border-[#27272A] px-5 py-4 text-sm font-bold uppercase tracking-wider">
          {title}
        </h2>
      )}
      {children}
    </section>
  );
}

function LoadingState() {
  return (
    <div
      className="border border-[#27272A] bg-[#1A1A1D] px-5 py-8 text-sm text-[#A1A1AA]"
      role="status"
    >
      Loading data…
    </div>
  );
}

function EmptyState({ children = "No records found." }: { children?: string }) {
  return <div className="px-5 py-8 text-sm text-[#A1A1AA]">{children}</div>;
}

function ResourcePage({ resource }: { resource: keyof typeof configs }) {
  const config = configs[resource];
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [editing, setEditing] = useState<RecordData | null>(null);
  const [formValues, setFormValues] = useState<
    Record<string, string | boolean | File | null>
  >({});
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();
  const rowsQuery = useQuery({
    queryKey: adminQueryKeys.resources.list(resource, {
      page,
      limit: 100,
      filters: filterValues,
    }),
    queryFn: () =>
      fetchAdminResource<RecordData>(resource, {
        page,
        limit: 100,
        filters: filterValues,
      }),
    placeholderData: (previousData) => previousData,
  });
  const branchOptionsQuery = useQuery({
    queryKey: adminQueryKeys.branches.list({ page: 1, limit: 100 }),
    queryFn: () => fetchAdminBranches({ page: 1, limit: 100 }),
    enabled: config.createFields.some(
      (item) => item.optionSource === "branches",
    ),
  });
  const rows = rowsQuery.data || [];
  const branches = (branchOptionsQuery.data || []) as Option[];
  const mutation = useMutation({
    mutationFn: ({
      method,
      url,
      payload,
    }: {
      method: string;
      url: string;
      payload?: Record<string, unknown> | FormData;
    }) => sendRequest(url, method, payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: adminQueryKeys.resources.all(resource),
        }),
        queryClient.invalidateQueries({
          queryKey: adminQueryKeys.branches.all,
        }),
        queryClient.invalidateQueries({ queryKey: adminQueryKeys.reports.all }),
      ]);
    },
  });
  const loading = rowsQuery.isPending;
  const isSaving = mutation.isPending;
  const loadError =
    rowsQuery.error instanceof Error
      ? rowsQuery.error.message
      : branchOptionsQuery.error instanceof Error
        ? branchOptionsQuery.error.message
        : "";

  const fields = editing
    ? config.updateFields || config.createFields
    : config.createFields;
  const startCreate = (clearNotice = true) => {
    setEditing(null);
    if (clearNotice) setNotice("");
    setFormValues({});
  };
  const startEdit = (row: RecordData) => {
    setEditing(row);
    setNotice("");
    const values: Record<string, string | boolean | File | null> = {};
    for (const item of config.updateFields || config.createFields) {
      const value = getValue(row, item.name);
      values[item.name] =
        item.type === "checkbox"
          ? Boolean(value)
          : item.type === "file"
            ? null
            : value == null
              ? ""
              : String(value);
    }
    setFormValues(values);
  };
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setNotice("");
    try {
      let payload: Record<string, unknown> | FormData;
      if (config.multipart) {
        const formData = new FormData();
        for (const item of fields) {
          const value = formValues[item.name];
          if (item.type === "file") {
            if (value instanceof File) formData.append(item.name, value);
          } else if (typeof value === "boolean") {
            formData.append(item.name, value ? "true" : "false");
          } else if (typeof value === "string") {
            formData.append(item.name, value.trim());
          }
        }
        payload = formData;
      } else {
        const json: Record<string, unknown> = {};
        for (const item of fields) {
          const value = formValues[item.name];
          if (item.type === "checkbox") {
            json[item.name] = Boolean(value);
          } else if (typeof value === "string" && value.trim() !== "") {
            json[item.name] =
              item.type === "number" ? Number(value) : value.trim();
          }
        }
        payload = json;
      }
      const url = editing
        ? `${config.endpoint}/${encodeURIComponent(String(editing.id))}`
        : config.endpoint;
      await mutation.mutateAsync({
        url,
        method: editing ? "PATCH" : "POST",
        payload,
      });
      setNotice(editing ? "Changes saved." : "Record created.");
      startCreate(false);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Save failed.");
    }
  };
  const archive = async (row: RecordData) => {
    if (
      !window.confirm(
        `${config.archiveLabel || "Archive record"} "${String(row.name || row.title || "")}"?`,
      )
    )
      return;
    setError("");
    setNotice("");
    try {
      await mutation.mutateAsync({
        url: `${config.endpoint}/${encodeURIComponent(String(row.id))}`,
        method: "DELETE",
      });
      setNotice("Record archived.");
      if (editing?.id === row.id) startCreate(false);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Archive failed.");
    }
  };

  return (
    <PageShell
      resource={resource}
      title={config.title}
      description={config.description}
    >
      {(error || loadError) && <Alert>{error || loadError}</Alert>}
      {rowsQuery.isFetching && !rowsQuery.isPending && (
        <p role="status" className="text-xs text-[#A1A1AA]">
          Refreshing records… Showing cached data.
        </p>
      )}
      {rowsQuery.isError && rowsQuery.data && (
        <p role="status" className="text-xs text-amber-300">
          Refresh failed; showing the last loaded records.
        </p>
      )}
      {notice && <Alert kind="success">{notice}</Alert>}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.8fr)]">
        <Card title="Records">
          <div className="flex flex-col gap-3 border-b border-[#27272A] px-4 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:px-5">
            <div className="flex flex-wrap gap-2">
              {config.filters?.map((filter) => (
                <label
                  key={filter.param}
                  className="sr-only"
                  htmlFor={`filter-${filter.param}`}
                >
                  {filter.label}
                </label>
              )).length ? (
                config.filters?.map((filter) => (
                  <select
                    key={filter.param}
                    id={`filter-${filter.param}`}
                    value={filterValues[filter.param] || ""}
                    onChange={(event) => {
                      setPage(1);
                      setFilterValues((current) => ({
                        ...current,
                        [filter.param]: event.target.value,
                      }));
                    }}
                    className="border border-[#27272A] bg-[#09090B] px-3 py-2 text-xs text-[#FAFAFA]"
                  >
                    {filter.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ))
              ) : (
                <span className="text-xs text-[#A1A1AA]">
                  {rows.length} loaded
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <span className="text-xs text-[#A1A1AA]">
                Page {page} · {rows.length} loaded
              </span>
              <button
                type="button"
                disabled={page === 1 || rowsQuery.isFetching}
                onClick={() => setPage((current) => current - 1)}
                className="border border-[#52525B] px-3 py-2 text-xs disabled:opacity-50"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={rows.length < 100 || rowsQuery.isFetching}
                onClick={() => setPage((current) => current + 1)}
                className="border border-[#52525B] px-3 py-2 text-xs disabled:opacity-50"
              >
                Next
              </button>
              <button
                type="button"
                onClick={() => startCreate()}
                className="bg-[#0033A0] px-4 py-2 text-xs font-bold uppercase tracking-wider hover:bg-[#00277F]"
              >
                New record
              </button>
            </div>
          </div>
          {loading ? (
            <LoadingState />
          ) : rowsQuery.isError && !rowsQuery.data ? (
            <EmptyState>Records could not be loaded.</EmptyState>
          ) : rows.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="bg-[#09090B] text-[10px] uppercase tracking-wider text-[#A1A1AA]">
                  <tr>
                    {config.columns.map((column) => (
                      <th key={column.key} className="px-4 py-3 font-semibold">
                        {column.label}
                      </th>
                    ))}
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#27272A]">
                  {rows.map((row) => (
                    <tr
                      key={String(row.id)}
                      className="align-top hover:bg-[#202023]"
                    >
                      {config.columns.map((column) => {
                        const value = getValue(row, column.key);
                        return (
                          <td
                            key={column.key}
                            className="max-w-56 px-4 py-3 text-[#D4D4D8]"
                          >
                            {column.key === "imageUrl" ||
                            column.key === "photoUrl" ? (
                              typeof value === "string" ? (
                                <Image
                                  src={value}
                                  alt={String(row.title ?? row.name ?? "Foto")}
                                  width={112}
                                  height={72}
                                  unoptimized
                                  className="h-16 w-24 object-cover"
                                />
                              ) : (
                                <span className="text-xs text-amber-300">
                                  {column.key === "photoUrl"
                                    ? "Foto belum diunggah."
                                    : "Image missing — upload a replacement."}
                                </span>
                              )
                            ) : (
                              <span className="line-clamp-3 break-words">
                                {displayValue(value)}
                              </span>
                            )}
                          </td>
                        );
                      })}
                      <td className="whitespace-nowrap px-4 py-3">
                        <button
                          type="button"
                          onClick={() => startEdit(row)}
                          className="mr-3 text-xs font-semibold text-blue-300 hover:text-white"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => void archive(row)}
                          className="text-xs font-semibold text-red-300 hover:text-white"
                        >
                          {config.archiveLabel || "Archive"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
        <Card title={editing ? "Update record" : "Create record"}>
          <form onSubmit={submit} className="space-y-4 p-5">
            {fields.map((item) => {
              const value = formValues[item.name];
              if (item.type === "checkbox") {
                return (
                  <label
                    key={item.name}
                    className="flex items-center gap-3 text-sm text-[#D4D4D8]"
                  >
                    <input
                      type="checkbox"
                      checked={Boolean(value)}
                      onChange={(event) =>
                        setFormValues((current) => ({
                          ...current,
                          [item.name]: event.target.checked,
                        }))
                      }
                      className="h-4 w-4 accent-[#0033A0]"
                    />
                    {item.label}
                  </label>
                );
              }
              const options =
                item.optionSource === "branches"
                  ? branches.map((branch) => ({
                      value: branch.id,
                      label: branch.name,
                    }))
                  : item.options || [];
              const controlClass =
                "mt-1 w-full border border-[#27272A] bg-[#09090B] px-3 py-2.5 text-sm text-[#FAFAFA] outline-none focus:border-[#0033A0]";
              const fileValue = value instanceof File ? value : null;
              return (
                <label
                  key={item.name}
                  className="block text-xs font-semibold uppercase tracking-wide text-[#A1A1AA]"
                >
                  {item.label}
                  {item.required && <span className="text-[#FF2A2A]"> *</span>}
                  {item.type === "textarea" ? (
                    <textarea
                      required={item.required}
                      value={String(value ?? "")}
                      onChange={(event) =>
                        setFormValues((current) => ({
                          ...current,
                          [item.name]: event.target.value,
                        }))
                      }
                      rows={3}
                      className={controlClass}
                    />
                  ) : item.type === "select" ? (
                    <select
                      required={item.required}
                      value={String(value ?? "")}
                      onChange={(event) =>
                        setFormValues((current) => ({
                          ...current,
                          [item.name]: event.target.value,
                        }))
                      }
                      className={controlClass}
                    >
                      {item.required ? (
                        <option value="">Select...</option>
                      ) : (
                        <option value="">No branch</option>
                      )}
                      {options.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : item.type === "file" ? (
                    <>
                      <input
                        required={item.required && !editing}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(event) =>
                          setFormValues((current) => ({
                            ...current,
                            [item.name]: event.target.files?.[0] ?? null,
                          }))
                        }
                        className={controlClass}
                      />
                      <span className="mt-1 block normal-case text-[#A1A1AA]">
                        {fileValue?.name ??
                          (editing
                            ? "Pilih file untuk mengganti gambar."
                            : "JPEG, PNG, atau WebP · Maksimal 5 MB")}
                      </span>
                    </>
                  ) : (
                    <input
                      required={item.required}
                      type={item.type === "number" ? "number" : "text"}
                      min={item.type === "number" ? 0 : undefined}
                      value={String(value ?? "")}
                      onChange={(event) =>
                        setFormValues((current) => ({
                          ...current,
                          [item.name]: event.target.value,
                        }))
                      }
                      className={controlClass}
                    />
                  )}
                  {item.optionSource === "branches" &&
                    branches.length === 0 && (
                      <span className="mt-1 block normal-case text-[#FFB4B4]">
                        No branches loaded. Create a branch first or check the
                        API response.
                      </span>
                    )}
                </label>
              );
            })}
            <div className="flex flex-wrap gap-2 pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="bg-[#0033A0] px-4 py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-[#00277F] disabled:opacity-50"
              >
                {isSaving ? "Saving…" : editing ? "Save changes" : "Create"}
              </button>
              {editing && (
                <button
                  type="button"
                  onClick={() => startCreate()}
                  className="border border-[#52525B] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[#D4D4D8] hover:bg-[#27272A]"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </Card>
      </div>
    </PageShell>
  );
}

function BookingsPage() {
  const [branchId, setBranchId] = useState("");
  const [status, setStatus] = useState("");
  const [updates, setUpdates] = useState<
    Record<string, { status: string; note: string }>
  >({});
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();
  const filters = { page, limit: 100, branchId, status };
  const bookingsQuery = useQuery({
    queryKey: adminQueryKeys.bookings.list(filters),
    queryFn: () => fetchAdminBookings<RecordData>(filters),
    placeholderData: (previousData) => previousData,
  });
  const branchQuery = useQuery({
    queryKey: adminQueryKeys.branches.list({ page: 1, limit: 100 }),
    queryFn: () => fetchAdminBranches({ page: 1, limit: 100 }),
  });
  const rows = bookingsQuery.data || [];
  const branches = (branchQuery.data || []) as Option[];
  const bookingMutation = useMutation({
    mutationFn: ({
      id,
      update,
    }: {
      id: string;
      update: { status: string; note: string };
    }) =>
      sendRequest(`/api/admin/bookings/${encodeURIComponent(id)}`, "PATCH", {
        status: update.status,
        ...(update.note.trim() ? { note: update.note.trim() } : {}),
      }),
    onMutate: async ({ id, update }) => {
      const key = adminQueryKeys.bookings.list(filters);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<RecordData[]>(key);
      queryClient.setQueryData<RecordData[]>(key, (items) =>
        items?.map((row) =>
          row.id === id ? { ...row, status: update.status } : row,
        ),
      );
      return { key, previous };
    },
    onError: (reason, _variables, context) => {
      if (context) queryClient.setQueryData(context.key, context.previous);
      setError(
        reason instanceof Error
          ? reason.message
          : "Could not update booking status.",
      );
    },
    onSuccess: () => {
      setError("");
      setNotice("Booking status updated.");
    },
    onSettled: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: adminQueryKeys.bookings.all,
        }),
        queryClient.invalidateQueries({ queryKey: adminQueryKeys.reports.all }),
      ]);
    },
  });
  const updateBooking = async (id: string) => {
    const row = rows.find((item) => item.id === id);
    const allowedStatuses = allowedBookingTransitions(row?.status);
    const update = updates[id] || {
      status: allowedStatuses[0] || "",
      note: "",
    };
    if (!allowedStatuses.includes(update.status)) {
      setError("This booking has no valid admin status transition.");
      return;
    }
    setError("");
    setNotice("");
    try {
      await bookingMutation.mutateAsync({ id, update });
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Could not update booking status.",
      );
    }
  };

  return (
    <PageShell
      resource="bookings"
      title="Bookings"
      description="Review booking yang masuk dan ubah status booking sesuai kondisi real."
    >
      {(error ||
        (bookingsQuery.error instanceof Error
          ? bookingsQuery.error.message
          : "") ||
        (branchQuery.error instanceof Error
          ? branchQuery.error.message
          : "")) && (
        <Alert>
          {error ||
            (bookingsQuery.error instanceof Error
              ? bookingsQuery.error.message
              : branchQuery.error instanceof Error
                ? branchQuery.error.message
                : "")}
        </Alert>
      )}
      {bookingsQuery.isFetching && !bookingsQuery.isPending && (
        <p role="status" className="text-xs text-[#A1A1AA]">
          Refreshing bookings… Showing cached data.
        </p>
      )}
      {bookingsQuery.isError && bookingsQuery.data && (
        <p role="status" className="text-xs text-amber-300">
          Refresh failed; showing the last loaded bookings.
        </p>
      )}
      {notice && <Alert kind="success">{notice}</Alert>}
      <Card title="Booking queue">
        <div className="flex flex-wrap gap-3 border-b border-[#27272A] px-5 py-3">
          <label className="sr-only" htmlFor="booking-branch">
            Filter by branch
          </label>
          <select
            id="booking-branch"
            value={branchId}
            onChange={(event) => {
              setPage(1);
              setBranchId(event.target.value);
            }}
            className="border border-[#27272A] bg-[#09090B] px-3 py-2 text-xs text-[#FAFAFA]"
          >
            <option value="">All branches</option>
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </select>
          <label className="sr-only" htmlFor="booking-status">
            Filter by status
          </label>
          <select
            id="booking-status"
            value={status}
            onChange={(event) => {
              setPage(1);
              setStatus(event.target.value);
            }}
            className="border border-[#27272A] bg-[#09090B] px-3 py-2 text-xs text-[#FAFAFA]"
          >
            <option value="">All statuses</option>
            {bookingStatuses.map((value) => (
              <option key={value} value={value}>
                {value.replaceAll("_", " ")}
              </option>
            ))}
          </select>
          <div className="flex items-center gap-2 self-center">
            <span className="text-xs text-[#A1A1AA]">
              Page {page} · {rows.length} loaded
            </span>
            <button
              type="button"
              disabled={page === 1 || bookingsQuery.isFetching}
              onClick={() => setPage((current) => current - 1)}
              className="border border-[#52525B] px-3 py-2 text-xs disabled:opacity-50"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={rows.length < 100 || bookingsQuery.isFetching}
              onClick={() => setPage((current) => current + 1)}
              className="border border-[#52525B] px-3 py-2 text-xs disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
        {bookingsQuery.isPending ? (
          <LoadingState />
        ) : bookingsQuery.isError && !bookingsQuery.data ? (
          <EmptyState>Bookings could not be loaded.</EmptyState>
        ) : rows.length === 0 ? (
          <EmptyState>No bookings match the selected filters.</EmptyState>
        ) : (
          <div className="space-y-3 p-4">
            {rows.map((row) => {
              const id = String(row.id);
              const customer = row.customer as RecordData | undefined;
              const branch = row.branch as RecordData | undefined;
              const barber = row.barber as RecordData | undefined;
              const items = Array.isArray(row.items)
                ? (row.items as RecordData[])
                : [];
              const services = items
                .map((item) => String(item.serviceNameSnapshot || "Service"))
                .join(", ");
              const allowedStatuses = allowedBookingTransitions(row.status);
              const bookingUpdate = updates[id] || {
                status: allowedStatuses[0] || "",
                note: "",
              };
              return (
                <article
                  key={id}
                  className="border border-[#27272A] bg-[#09090B] p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold">
                        {String(customer?.name || row.guestName || "Guest")}{" "}
                        <span className="text-[#A1A1AA]">
                          ·{" "}
                          {String(
                            customer?.phone || row.guestPhone || "No phone",
                          )}
                        </span>
                      </div>
                      <div className="mt-1 text-xs text-[#A1A1AA]">
                        {displayValue(row.startsAt || row.createdAt)} ·{" "}
                        {String(branch?.name || "Branch unavailable")} ·{" "}
                        {String(barber?.name || "No barber")}
                      </div>
                      <div className="mt-2 text-sm text-[#D4D4D8]">
                        {services || "No service details"}
                      </div>
                    </div>
                    <span className="border border-[#52525B] px-2 py-1 text-[10px] font-bold uppercase tracking-wider">
                      {String(row.status || "UNKNOWN").replaceAll("_", " ")}
                    </span>
                  </div>
                  <div className="mt-4 grid gap-2 sm:grid-cols-[minmax(160px,0.7fr)_minmax(220px,1fr)_auto]">
                    {allowedStatuses.length ? (
                      <>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-[#A1A1AA]">
                          Set status
                          <select
                            value={bookingUpdate.status}
                            onChange={(event) =>
                              setUpdates((current) => ({
                                ...current,
                                [id]: {
                                  ...bookingUpdate,
                                  status: event.target.value,
                                },
                              }))
                            }
                            className="mt-1 w-full border border-[#27272A] bg-[#1A1A1D] px-3 py-2 text-xs text-[#FAFAFA]"
                          >
                            {allowedStatuses.map((value) => (
                              <option key={value} value={value}>
                                {value}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-[#A1A1AA]">
                          Note (optional)
                          <input
                            value={bookingUpdate.note}
                            onChange={(event) =>
                              setUpdates((current) => ({
                                ...current,
                                [id]: {
                                  ...bookingUpdate,
                                  note: event.target.value,
                                },
                              }))
                            }
                            maxLength={500}
                            className="mt-1 w-full border border-[#27272A] bg-[#1A1A1D] px-3 py-2 text-xs text-[#FAFAFA]"
                          />
                        </label>
                        <button
                          type="button"
                          disabled={bookingMutation.isPending}
                          onClick={() => void updateBooking(id)}
                          className="self-end bg-[#0033A0] px-4 py-2 text-xs font-bold uppercase tracking-wider hover:bg-[#00277F] disabled:opacity-50"
                        >
                          {bookingMutation.isPending &&
                          bookingMutation.variables?.id === id
                            ? "Saving…"
                            : "Update status"}
                        </button>
                      </>
                    ) : (
                      <p className="self-center text-xs text-[#A1A1AA]">
                        No admin status changes are available.
                      </p>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </Card>
    </PageShell>
  );
}

type ScheduleType = "branch" | "barber";
function minuteValue(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}
function timeValue(value: unknown) {
  const minutes = Number(value || 0);
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
}

function SchedulesPage() {
  const [type, setType] = useState<ScheduleType>("branch");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [editing, setEditing] = useState<RecordData | null>(null);
  const [values, setValues] = useState<Record<string, string>>({
    entityId: "",
    dayOfWeek: "1",
    openTime: "09:00",
    closeTime: "18:00",
    startTime: "10:00",
    endTime: "20:00",
    breakStartTime: "13:00",
    breakEndTime: "14:00",
  });
  const queryClient = useQueryClient();
  const schedulesQuery = useQuery({
    queryKey: adminQueryKeys.schedules.list(type),
    queryFn: () => fetchAdminSchedules(type),
    placeholderData: (previousData) => previousData,
  });
  const branchQuery = useQuery({
    queryKey: adminQueryKeys.branches.list({ page: 1, limit: 100 }),
    queryFn: () => fetchAdminBranches({ page: 1, limit: 100 }),
  });
  const barbersQuery = useQuery({
    queryKey: adminQueryKeys.resources.list("barbers", { page: 1, limit: 100 }),
    queryFn: () =>
      fetchAdminResource<RecordData>("barbers", { page: 1, limit: 100 }),
  });
  const rows = schedulesQuery.data || [];
  const branches = (branchQuery.data || []).map(({ id, name }) => ({
    id,
    name,
  }));
  const barbers = (barbersQuery.data || []).map((row) => ({
    id: String(row.id),
    name: String(row.name),
  }));
  const mutation = useMutation({
    mutationFn: ({
      method,
      url,
      payload,
    }: {
      method: string;
      url: string;
      payload?: Record<string, unknown>;
    }) => sendRequest(url, method, payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: adminQueryKeys.schedules.all,
        }),
        queryClient.invalidateQueries({
          queryKey: adminQueryKeys.resources.all("branches"),
        }),
        queryClient.invalidateQueries({
          queryKey: adminQueryKeys.resources.all("barbers"),
        }),
        queryClient.invalidateQueries({ queryKey: adminQueryKeys.reports.all }),
      ]);
    },
  });

  const startEdit = (row: RecordData) => {
    setEditing(row);
    setValues({
      entityId: "",
      dayOfWeek: String(row.dayOfWeek ?? 1),
      openTime: timeValue(row.openMinute),
      closeTime: timeValue(row.closeMinute),
      startTime: timeValue(row.startMinute),
      endTime: timeValue(row.endMinute),
      breakStartTime:
        row.breakStartMinute == null ? "" : timeValue(row.breakStartMinute),
      breakEndTime:
        row.breakEndMinute == null ? "" : timeValue(row.breakEndMinute),
    });
  };
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setNotice("");
    const payload: Record<string, unknown> = editing
      ? { scheduleType: type }
      : {
          scheduleType: type,
          [type === "branch" ? "branchId" : "barberId"]: values.entityId,
          dayOfWeek: Number(values.dayOfWeek),
        };
    if (type === "branch") {
      payload.openMinute = minuteValue(values.openTime);
      payload.closeMinute = minuteValue(values.closeTime);
    } else {
      payload.startMinute = minuteValue(values.startTime);
      payload.endMinute = minuteValue(values.endTime);
      if (values.breakStartTime)
        payload.breakStartMinute = minuteValue(values.breakStartTime);
      if (values.breakEndTime)
        payload.breakEndMinute = minuteValue(values.breakEndTime);
    }
    try {
      await mutation.mutateAsync({
        url: editing
          ? `/api/admin/schedules/${encodeURIComponent(String(editing.id))}`
          : "/api/admin/schedules",
        method: editing ? "PATCH" : "POST",
        payload,
      });
      setNotice(editing ? "Schedule updated." : "Schedule created.");
      setEditing(null);
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Schedule save failed.",
      );
    }
  };
  const remove = async (row: RecordData) => {
    if (
      !window.confirm(
        "Permanently remove this schedule? This cannot be undone.",
      )
    )
      return;
    setError("");
    setNotice("");
    try {
      await mutation.mutateAsync({
        url: `/api/admin/schedules/${encodeURIComponent(String(row.id))}?type=${type}`,
        method: "DELETE",
      });
      setNotice("Schedule removed.");
      if (editing?.id === row.id) setEditing(null);
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Could not remove schedule.",
      );
    }
  };
  const entityOptions = type === "branch" ? branches : barbers;
  const entity = (row: RecordData) => row[type] as RecordData | undefined;
  const label = (row: RecordData) => String(entity(row)?.name || "—");

  return (
    <PageShell
      resource="schedules"
      title="Schedules"
      description="Manage recurring branch opening hours and barber shifts. The existing schedule API has no archive operation; removal is permanent."
    >
      {(error ||
        (schedulesQuery.error instanceof Error
          ? schedulesQuery.error.message
          : "") ||
        (branchQuery.error instanceof Error ? branchQuery.error.message : "") ||
        (barbersQuery.error instanceof Error
          ? barbersQuery.error.message
          : "")) && (
        <Alert>
          {error ||
            (schedulesQuery.error instanceof Error
              ? schedulesQuery.error.message
              : branchQuery.error instanceof Error
                ? branchQuery.error.message
                : barbersQuery.error instanceof Error
                  ? barbersQuery.error.message
                  : "")}
        </Alert>
      )}
      {schedulesQuery.isFetching && !schedulesQuery.isPending && (
        <p role="status" className="text-xs text-[#A1A1AA]">
          Refreshing schedules… Showing cached data.
        </p>
      )}
      {schedulesQuery.isError && schedulesQuery.data && (
        <p role="status" className="text-xs text-amber-300">
          Refresh failed; showing the last loaded schedules.
        </p>
      )}
      {notice && <Alert kind="success">{notice}</Alert>}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.8fr)]">
        <Card title="Schedules">
          <div className="border-b border-[#27272A] px-5 py-3">
            <label htmlFor="schedule-type" className="sr-only">
              Schedule type
            </label>
            <select
              id="schedule-type"
              value={type}
              onChange={(event) => {
                setType(event.target.value as ScheduleType);
                setEditing(null);
              }}
              className="border border-[#27272A] bg-[#09090B] px-3 py-2 text-xs text-[#FAFAFA]"
            >
              <option value="branch">Branch hours</option>
              <option value="barber">Barber shifts</option>
            </select>
          </div>
          {schedulesQuery.isPending ? (
            <LoadingState />
          ) : schedulesQuery.isError && !schedulesQuery.data ? (
            <EmptyState>Schedules could not be loaded.</EmptyState>
          ) : rows.length === 0 ? (
            <EmptyState>No schedules configured.</EmptyState>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead className="bg-[#09090B] text-[10px] uppercase tracking-wider text-[#A1A1AA]">
                  <tr>
                    <th className="px-4 py-3">
                      {type === "branch" ? "Branch" : "Barber"}
                    </th>
                    <th className="px-4 py-3">Day</th>
                    <th className="px-4 py-3">Hours</th>
                    {type === "barber" && <th className="px-4 py-3">Break</th>}
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#27272A]">
                  {rows.map((row) => (
                    <tr key={String(row.id)}>
                      <td className="px-4 py-3">{label(row)}</td>
                      <td className="px-4 py-3">
                        {dayNames[Number(row.dayOfWeek)] || "—"}
                      </td>
                      <td className="px-4 py-3">
                        {type === "branch"
                          ? `${timeValue(row.openMinute)}–${timeValue(row.closeMinute)}`
                          : `${timeValue(row.startMinute)}–${timeValue(row.endMinute)}`}
                      </td>
                      {type === "barber" && (
                        <td className="px-4 py-3">
                          {row.breakStartMinute == null
                            ? "—"
                            : `${timeValue(row.breakStartMinute)}–${timeValue(row.breakEndMinute)}`}
                        </td>
                      )}
                      <td className="whitespace-nowrap px-4 py-3">
                        <button
                          type="button"
                          onClick={() => startEdit(row)}
                          className="mr-3 text-xs font-semibold text-blue-300 hover:text-white"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => void remove(row)}
                          className="text-xs font-semibold text-red-300 hover:text-white"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
        <Card title={editing ? "Update schedule" : "Create schedule"}>
          <form onSubmit={submit} className="space-y-4 p-5">
            {!editing && (
              <>
                <label className="block text-xs font-semibold uppercase tracking-wide text-[#A1A1AA]">
                  {type === "branch" ? "Branch" : "Barber"}
                  <select
                    required
                    value={values.entityId}
                    onChange={(event) =>
                      setValues((current) => ({
                        ...current,
                        entityId: event.target.value,
                      }))
                    }
                    className="mt-1 w-full border border-[#27272A] bg-[#09090B] px-3 py-2.5 text-sm text-[#FAFAFA]"
                  >
                    <option value="">Select…</option>
                    {entityOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block text-xs font-semibold uppercase tracking-wide text-[#A1A1AA]">
                  Day of week
                  <select
                    value={values.dayOfWeek}
                    onChange={(event) =>
                      setValues((current) => ({
                        ...current,
                        dayOfWeek: event.target.value,
                      }))
                    }
                    className="mt-1 w-full border border-[#27272A] bg-[#09090B] px-3 py-2.5 text-sm text-[#FAFAFA]"
                  >
                    {dayNames.map((day, index) => (
                      <option key={day} value={index}>
                        {day}
                      </option>
                    ))}
                  </select>
                </label>
              </>
            )}
            {(type === "branch"
              ? [
                  ["openTime", "Opening time"],
                  ["closeTime", "Closing time"],
                ]
              : [
                  ["startTime", "Shift starts"],
                  ["endTime", "Shift ends"],
                  ["breakStartTime", "Break starts (optional)"],
                  ["breakEndTime", "Break ends (optional)"],
                ]
            ).map(([name, text]) => (
              <label
                key={name}
                className="block text-xs font-semibold uppercase tracking-wide text-[#A1A1AA]"
              >
                {text}
                <input
                  type="time"
                  required={!name.startsWith("break")}
                  value={values[name] || ""}
                  onChange={(event) =>
                    setValues((current) => ({
                      ...current,
                      [name]: event.target.value,
                    }))
                  }
                  className="mt-1 w-full border border-[#27272A] bg-[#09090B] px-3 py-2.5 text-sm text-[#FAFAFA]"
                />
              </label>
            ))}
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={mutation.isPending}
                className="bg-[#0033A0] px-4 py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-[#00277F] disabled:opacity-50"
              >
                {mutation.isPending
                  ? "Saving…"
                  : editing
                    ? "Save changes"
                    : "Create schedule"}
              </button>
              {editing && (
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="border border-[#52525B] px-4 py-2.5 text-xs font-bold uppercase tracking-wider"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </Card>
      </div>
    </PageShell>
  );
}

function ReportsPage() {
  const [branchId, setBranchId] = useState("");
  const branchesQuery = useQuery({
    queryKey: adminQueryKeys.branches.list({ page: 1, limit: 100 }),
    queryFn: () => fetchAdminBranches({ page: 1, limit: 100 }),
  });
  const summaryQuery = useQuery({
    queryKey: adminQueryKeys.reports.summary(branchId || "all"),
    queryFn: () => fetchAdminReportSummary(branchId),
    placeholderData: (previousData) => previousData,
  });
  const servicesQuery = useQuery({
    queryKey: adminQueryKeys.reports.services(branchId || "all"),
    queryFn: () => fetchAdminServiceReport(branchId),
    placeholderData: (previousData) => previousData,
  });
  const barbersQuery = useQuery({
    queryKey: adminQueryKeys.reports.barbers(branchId || "all"),
    queryFn: () => fetchAdminBarberReport(branchId),
    placeholderData: (previousData) => previousData,
  });
  const branches = (branchesQuery.data || []) as Option[];
  const data =
    summaryQuery.data && servicesQuery.data && barbersQuery.data
      ? {
          ...summaryQuery.data,
          services: servicesQuery.data,
          barbers: barbersQuery.data,
        }
      : null;
  const isLoading =
    summaryQuery.isPending || servicesQuery.isPending || barbersQuery.isPending;
  const reportError =
    summaryQuery.error ||
    servicesQuery.error ||
    barbersQuery.error ||
    branchesQuery.error;

  return (
    <PageShell
      resource="reports"
      title="Reports"
      description="Read-only operational reports aggregated by the admin reporting API."
    >
      {reportError instanceof Error && <Alert>{reportError.message}</Alert>}
      {(summaryQuery.isFetching ||
        servicesQuery.isFetching ||
        barbersQuery.isFetching) &&
        !isLoading && (
          <p role="status" className="mb-3 text-xs text-[#A1A1AA]">
            Refreshing reports… Showing cached data.
          </p>
        )}
      {reportError &&
        data &&
        !summaryQuery.isFetching &&
        !servicesQuery.isFetching &&
        !barbersQuery.isFetching && (
          <p role="status" className="mb-3 text-xs text-amber-300">
            Refresh failed; showing the last loaded reports.
          </p>
        )}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <label
          htmlFor="report-branch"
          className="text-xs font-bold uppercase tracking-wider text-[#A1A1AA]"
        >
          Branch
        </label>
        <select
          id="report-branch"
          value={branchId}
          onChange={(event) => setBranchId(event.target.value)}
          className="border border-[#27272A] bg-[#1A1A1D] px-3 py-2 text-xs text-[#FAFAFA]"
        >
          <option value="">All branches</option>
          {branches.map((branch) => (
            <option key={branch.id} value={branch.id}>
              {branch.name}
            </option>
          ))}
        </select>
      </div>
      {isLoading ? (
        <LoadingState />
      ) : !data ? (
        <EmptyState>Report data is unavailable.</EmptyState>
      ) : (
        <div className="space-y-6">
          <Card title="Operational summary">
            <div className="grid gap-px bg-[#27272A] sm:grid-cols-2 lg:grid-cols-4">
              {[
                ["Bookings today", data.metrics.totalBookingsToday],
                ["Awaiting confirmation", data.metrics.queueCount],
                ["Revenue today (IDR)", data.metrics.revenueToday],
                ["Active members", data.metrics.totalActiveMembers],
              ].map(([label, value]) => (
                <div key={String(label)} className="bg-[#1A1A1D] p-4">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#A1A1AA]">
                    {displayValue(label)}
                  </div>
                  <div className="mt-2 text-2xl font-bold">
                    {displayValue(value)}
                  </div>
                </div>
              ))}
            </div>
          </Card>
          <div className="grid gap-6 xl:grid-cols-2">
            <Card title="Services report">
              <p className="border-b border-[#27272A] px-4 py-3 text-xs text-[#A1A1AA]">
                Total orders: {displayValue(data.services.totalOrders)}
              </p>
              {data.services.distribution.length === 0 ? (
                <EmptyState>No service data returned by the API.</EmptyState>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-[#09090B] text-[10px] uppercase text-[#A1A1AA]">
                      <tr>
                        <th className="px-4 py-3">Service</th>
                        <th className="px-4 py-3">Price (IDR)</th>
                        <th className="px-4 py-3">Orders</th>
                        <th className="px-4 py-3">Share</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#27272A]">
                      {data.services.distribution.map((row) => (
                        <tr key={String(row.id)}>
                          <td className="px-4 py-3">
                            {displayValue(row.name)}
                          </td>
                          <td className="px-4 py-3">
                            {displayValue(row.priceRupiah)}
                          </td>
                          <td className="px-4 py-3">
                            {displayValue(row.orderCount)}
                          </td>
                          <td className="px-4 py-3">
                            {displayValue(row.percentage)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
            <Card title="Barbers report">
              <p className="border-b border-[#27272A] px-4 py-3 text-xs text-[#A1A1AA]">
                {data.barbers.totalOnDuty} in service /{" "}
                {data.barbers.totalChairs} capsters
              </p>
              {data.barbers.roster.length === 0 ? (
                <EmptyState>No barber data returned by the API.</EmptyState>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-[#09090B] text-[10px] uppercase text-[#A1A1AA]">
                      <tr>
                        <th className="px-4 py-3">Barber</th>
                        <th className="px-4 py-3">Branch</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Cuts today</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#27272A]">
                      {data.barbers.roster.map((row) => (
                        <tr key={String(row.id)}>
                          <td className="px-4 py-3">
                            {displayValue(row.name)}
                          </td>
                          <td className="px-4 py-3">
                            {displayValue(row.branch)}
                          </td>
                          <td className="px-4 py-3">
                            {displayValue(row.statusText)}
                          </td>
                          <td className="px-4 py-3">
                            {displayValue(row.todayCuts)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>
          <Card title="Weekly trends">
            {data.weeklyTrends.length === 0 ? (
              <EmptyState>No trend data returned by the API.</EmptyState>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#09090B] text-[10px] uppercase text-[#A1A1AA]">
                    <tr>
                      <th className="px-4 py-3">Day</th>
                      <th className="px-4 py-3">Bookings</th>
                      <th className="px-4 py-3">Revenue (IDR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#27272A]">
                    {data.weeklyTrends.map((row) => (
                      <tr key={String(row.day)}>
                        <td className="px-4 py-3">{displayValue(row.day)}</td>
                        <td className="px-4 py-3">
                          {displayValue(row.bookings)}
                        </td>
                        <td className="px-4 py-3">
                          {displayValue(row.revenue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      )}
    </PageShell>
  );
}

export function AdminResourceWorkbench({ resource }: { resource: Resource }) {
  if (resource === "bookings") return <BookingsPage />;
  if (resource === "schedules") return <SchedulesPage />;
  if (resource === "reports") return <ReportsPage />;
  if (resource === "membership") return <AdminMembershipWorkbench />;
  if (resource === "payment-options") return <AdminPaymentOptionsWorkbench />;
  if (resource === "career") return <AdminCareerWorkbench />;
  return <ResourcePage resource={resource} />;
}
