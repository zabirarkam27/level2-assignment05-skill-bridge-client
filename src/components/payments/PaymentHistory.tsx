"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { CreditCard, Download, Eye, Printer, ReceiptText, Search } from "lucide-react";
import { PaymentHistoryItem } from "@/types/routes.type";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DataListControls,
  SortDirection,
} from "@/components/data-list/DataListControls";
import { compareValues, paginateItems } from "@/lib/data-list";

type PaymentHistoryProps = {
  role: "student" | "tutor" | "admin";
};

const statusVariant: Record<
  PaymentHistoryItem["status"],
  "default" | "success" | "destructive" | "warning"
> = {
  INITIATED: "warning",
  PAID: "success",
  FAILED: "destructive",
  CANCELLED: "destructive",
};

const paymentSortOptions = [
  { label: "Newest", value: "createdAt" },
  { label: "Amount", value: "amount" },
  { label: "Status", value: "status" },
  { label: "Course", value: "course" },
  { label: "Transaction", value: "transactionId" },
];

function formatAmount(payment: PaymentHistoryItem) {
  return `${payment.currency.toUpperCase()} ${payment.amount}`;
}

const htmlEscape = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

function getCounterparty(payment: PaymentHistoryItem, role: PaymentHistoryProps["role"]) {
  if (role === "student") return payment.tutor?.user?.name ?? "Tutor";
  if (role === "tutor") return payment.student?.name ?? "Student";
  return `${payment.student?.name ?? "Student"} -> ${payment.tutor?.user?.name ?? "Tutor"}`;
}

export default function PaymentHistory({ role }: PaymentHistoryProps) {
  const [payments, setPayments] = useState<PaymentHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [selectedInvoice, setSelectedInvoice] =
    useState<PaymentHistoryItem | null>(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments`, {
          credentials: "include",
          cache: "no-store",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to load payments");
        setPayments(Array.isArray(data.data) ? data.data : []);
      } catch (error) {
        setPayments([]);
        toast.error(error instanceof Error ? error.message : "Failed to load payments");
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search, sortBy, sortDirection, pageSize]);

  const filteredPayments = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return payments;

    return payments.filter((payment) =>
      [
        payment.transactionId,
        payment.status,
        payment.course?.title,
        payment.course?.category?.name,
        payment.student?.name,
        payment.student?.email,
        payment.tutor?.user?.name,
        payment.tutor?.user?.email,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query)),
    );
  }, [payments, search]);

  const sortedPayments = useMemo(
    () =>
      [...filteredPayments].sort((first, second) => {
        const getValue = (payment: PaymentHistoryItem) => {
          if (sortBy === "amount") return payment.amount;
          if (sortBy === "status") return payment.status;
          if (sortBy === "course") return payment.course?.title;
          if (sortBy === "transactionId") return payment.transactionId;
          return new Date(payment.createdAt);
        };

        return compareValues(getValue(first), getValue(second), sortDirection);
      }),
    [filteredPayments, sortBy, sortDirection],
  );
  const paginatedPayments = useMemo(
    () => paginateItems(sortedPayments, page, pageSize),
    [sortedPayments, page, pageSize],
  );

  const downloadInvoice = async (payment: PaymentHistoryItem) => {
    setDownloading(payment.id);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/payments/${payment.id}/invoice`,
        { credentials: "include" },
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to download invoice");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `skillbridge-invoice-${payment.transactionId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Invoice download failed");
    } finally {
      setDownloading(null);
    }
  };

  const renderInvoiceHtml = (payment: PaymentHistoryItem) => {
    const invoiceId = `INV-${payment.id.slice(0, 8).toUpperCase()}`;
    const sessionDate = payment.booking?.dateTime
      ? new Date(payment.booking.dateTime).toLocaleString("en-BD")
      : payment.createdAt;
    const safeInvoice = {
      invoiceId: htmlEscape(invoiceId),
      status: htmlEscape(payment.status),
      transactionId: htmlEscape(payment.transactionId),
      gateway: htmlEscape(payment.gateway),
      invoiceDate: htmlEscape(new Date(payment.createdAt).toLocaleString("en-BD")),
      studentName: htmlEscape(payment.student?.name ?? "N/A"),
      studentEmail: htmlEscape(payment.student?.email ?? "N/A"),
      tutorName: htmlEscape(payment.tutor?.user?.name ?? "N/A"),
      sessionDate: htmlEscape(sessionDate),
      course: htmlEscape(payment.course?.title ?? "N/A"),
      category: htmlEscape(payment.course?.category?.name ?? "N/A"),
      bookingStatus: htmlEscape(payment.booking?.status ?? "Not created yet"),
      amount: htmlEscape(formatAmount(payment)),
    };

    return `
      <html>
        <head>
          <title>${invoiceId}</title>
          <style>
            body { margin: 0; background: #f1f5f9; font-family: Arial, sans-serif; color: #0f172a; }
            .page { padding: 40px 16px; }
            .invoice { max-width: 760px; margin: 0 auto; overflow: hidden; border-radius: 24px; background: white; box-shadow: 0 20px 45px rgba(15, 23, 42, 0.18); }
            .header { background: linear-gradient(90deg, #4f46e5, #9333ea, #6d28d9); color: white; padding: 32px; display: flex; justify-content: space-between; gap: 20px; }
            .header h1 { margin: 0; font-size: 30px; }
            .header p { color: #e0e7ff; margin: 8px 0 0; font-size: 14px; }
            .badge { align-self: flex-start; border-radius: 999px; background: rgba(52, 211, 153, 0.2); color: #d1fae5; padding: 10px 18px; font-weight: 700; border: 1px solid rgba(110, 231, 183, 0.4); }
            .meta { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; border-bottom: 1px solid #e2e8f0; padding: 24px 32px; }
            .content { padding: 32px; }
            .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 24px; }
            .box { border-radius: 18px; background: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; }
            .box h2 { margin: 0 0 16px; font-size: 12px; letter-spacing: 0.08em; color: #64748b; }
            .label { margin: 0; font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; color: #94a3b8; font-weight: 700; }
            .value { margin: 5px 0 14px; font-size: 14px; font-weight: 700; color: #1e293b; overflow-wrap: anywhere; }
            .summary { margin-top: 24px; border: 1px solid #e2e8f0; border-radius: 18px; overflow: hidden; }
            .summary h2 { margin: 0; background: #f8fafc; border-bottom: 1px solid #e2e8f0; padding: 16px 20px; font-size: 16px; }
            .row { display: flex; justify-content: space-between; gap: 20px; padding: 16px 20px; border-bottom: 1px solid #e2e8f0; }
            .row:last-child { border-bottom: 0; }
            .row span:first-child { color: #64748b; }
            .row span:last-child { font-weight: 700; text-align: right; }
            .total { margin-top: 32px; border-radius: 24px; background: #020617; color: white; padding: 24px; display: flex; justify-content: space-between; align-items: center; }
            .total .amount { margin: 6px 0 0; font-size: 40px; font-weight: 900; }
            .paid { background: rgba(255,255,255,0.1); border-radius: 16px; padding: 14px 20px; text-align: right; }
            .paid strong { color: #6ee7b7; }
            .footer { text-align: center; color: #64748b; margin-top: 30px; font-size: 14px; }
            @media print { body { background: white; } .page { padding: 0; } .invoice { box-shadow: none; border-radius: 0; } }
          </style>
        </head>
        <body>
          <div class="page">
            <div class="invoice">
              <div class="header">
                <div>
                  <h1>SkillBridge Invoice</h1>
                  <p>Thank you for learning with SkillBridge.</p>
                </div>
                <div class="badge">${safeInvoice.status}</div>
              </div>
              <div class="meta">
                <div><p class="label">Invoice ID</p><p class="value">${safeInvoice.invoiceId}</p></div>
                <div><p class="label">Transaction ID</p><p class="value">${safeInvoice.transactionId}</p></div>
                <div><p class="label">Gateway</p><p class="value">${safeInvoice.gateway}</p></div>
                <div><p class="label">Invoice Date</p><p class="value">${safeInvoice.invoiceDate}</p></div>
              </div>
              <div class="content">
                <div class="grid">
                  <section class="box">
                    <h2>STUDENT DETAILS</h2>
                    <p class="label">Name</p><p class="value">${safeInvoice.studentName}</p>
                    <p class="label">Email</p><p class="value">${safeInvoice.studentEmail}</p>
                  </section>
                  <section class="box">
                    <h2>SESSION DETAILS</h2>
                    <p class="label">Tutor</p><p class="value">${safeInvoice.tutorName}</p>
                    <p class="label">Session Date</p><p class="value">${safeInvoice.sessionDate}</p>
                  </section>
                </div>
                <section class="summary">
                  <h2>Course Summary</h2>
                  <div class="row"><span>Course</span><span>${safeInvoice.course}</span></div>
                  <div class="row"><span>Category</span><span>${safeInvoice.category}</span></div>
                  <div class="row"><span>Booking Status</span><span>${safeInvoice.bookingStatus}</span></div>
                </section>
                <div class="total">
                  <div><p>Total Paid</p><p class="amount">${safeInvoice.amount}</p></div>
                  <div class="paid"><p>Payment</p><strong>${safeInvoice.status}</strong></div>
                </div>
                <p class="footer">This invoice confirms your SkillBridge booking and payment record.</p>
              </div>
            </div>
          </div>
        </body>
      </html>`;
  };

  const printInvoice = (payment: PaymentHistoryItem) => {
    const win = window.open("", "_blank", "width=900,height=1000");
    if (!win) {
      toast.error("Please allow popups to print invoice");
      return;
    }
    win.document.write(renderInvoiceHtml(payment));
    win.document.close();
    win.focus();
    win.print();
  };

  return (
    <div className="max-w-5xl">
      <div className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white">
          <CreditCard className="h-6 w-6 text-[#611f69] dark:text-[#c084fc]" />
          Payment History
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Track Stripe payments, booking links, and invoice records.
        </p>
      </div>

      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Filter payments, users, transaction..."
            className="h-10 w-full rounded-md border border-input bg-background py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#611f69]/40"
          />
        </div>
        {!loading && (
          <DataListControls
            totalItems={sortedPayments.length}
            page={page}
            pageSize={pageSize}
            sortBy={sortBy}
            sortDirection={sortDirection}
            sortOptions={paymentSortOptions}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            onSortByChange={setSortBy}
            onSortDirectionChange={setSortDirection}
          />
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-24 animate-pulse rounded-xl border border-gray-100 bg-white dark:border-gray-700 dark:bg-gray-800"
            />
          ))}
        </div>
      ) : sortedPayments.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 py-16 text-center text-gray-400 dark:border-gray-700">
          <ReceiptText className="mx-auto mb-3 h-10 w-10 opacity-50" />
          <p className="text-sm">No payment records found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {paginatedPayments.map((payment) => (
            <div
              key={payment.id}
              className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold text-gray-900 dark:text-white">
                      {payment.course?.title ?? "Tutoring Session"}
                    </h2>
                    <Badge variant={statusVariant[payment.status]}>
                      {payment.status}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {getCounterparty(payment, role)}
                  </p>
                  <p className="mt-2 text-xs text-gray-400">
                    Transaction: {payment.transactionId}
                  </p>
                  {payment.booking && (
                    <p className="mt-1 text-xs text-gray-400">
                      Booking: {payment.booking.status} ·{" "}
                      {new Date(payment.booking.dateTime).toLocaleString("en-BD")}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <p className="text-lg font-bold text-[#611f69] dark:text-[#c084fc]">
                    {formatAmount(payment)}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(payment.createdAt).toLocaleDateString("en-BD")}
                  </p>
                  {payment.status === "PAID" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedInvoice(payment)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View Invoice
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog
        open={!!selectedInvoice}
        onOpenChange={(open) => !open && setSelectedInvoice(null)}
      >
        <DialogContent className="max-h-[92vh] max-w-4xl overflow-y-auto p-0">
          {selectedInvoice && (
            <>
              <DialogHeader className="sr-only">
                <DialogTitle>SkillBridge Invoice</DialogTitle>
              </DialogHeader>
              <div className="bg-slate-100 px-3 py-5 sm:px-4 sm:py-8">
                <div className="mx-auto max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl">
                  <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-700 px-5 py-6 text-white sm:px-8 sm:py-8">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                          SkillBridge Invoice
                        </h1>
                        <p className="mt-1 text-sm text-indigo-100">
                          Thank you for learning with SkillBridge.
                        </p>
                      </div>
                      <div className="rounded-full bg-emerald-400/20 px-5 py-2 text-sm font-semibold text-emerald-100 ring-1 ring-emerald-300/40">
                        {selectedInvoice.status}
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 border-b border-slate-200 px-5 py-5 sm:grid-cols-2 sm:px-8 sm:py-6">
                    <InvoiceInfo label="Invoice ID" value={`INV-${selectedInvoice.id.slice(0, 8).toUpperCase()}`} />
                    <InvoiceInfo label="Transaction ID" value={selectedInvoice.transactionId} />
                    <InvoiceInfo label="Gateway" value={selectedInvoice.gateway} />
                    <InvoiceInfo label="Invoice Date" value={new Date(selectedInvoice.createdAt).toLocaleString("en-BD")} />
                  </div>

                  <div className="px-5 py-6 sm:px-8 sm:py-8">
                    <div className="grid gap-6 md:grid-cols-2">
                      <section className="rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200">
                        <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-500">
                          Student Details
                        </h2>
                        <InvoiceInfo label="Name" value={selectedInvoice.student?.name ?? "N/A"} />
                        <InvoiceInfo label="Email" value={selectedInvoice.student?.email ?? "N/A"} />
                      </section>
                      <section className="rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200">
                        <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-500">
                          Session Details
                        </h2>
                        <InvoiceInfo label="Tutor" value={selectedInvoice.tutor?.user?.name ?? "N/A"} />
                        <InvoiceInfo
                          label="Session Date"
                          value={
                            selectedInvoice.booking?.dateTime
                              ? new Date(selectedInvoice.booking.dateTime).toLocaleString("en-BD")
                              : selectedInvoice.createdAt
                          }
                        />
                      </section>
                    </div>

                    <section className="mt-6 rounded-2xl border border-slate-200">
                      <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
                        <h2 className="font-semibold text-slate-900">Course Summary</h2>
                      </div>
                      <div className="divide-y divide-slate-200">
                        <InvoiceRow label="Course" value={selectedInvoice.course?.title ?? "N/A"} />
                        <InvoiceRow label="Category" value={selectedInvoice.course?.category?.name ?? "N/A"} />
                        <InvoiceRow label="Booking Status" value={selectedInvoice.booking?.status ?? "Not created yet"} />
                      </div>
                    </section>

                    <div className="mt-8 rounded-3xl bg-slate-950 p-5 text-white sm:p-6">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm text-slate-400">Total Paid</p>
                          <p className="mt-1 break-words text-3xl font-extrabold sm:text-4xl">
                            {formatAmount(selectedInvoice)}
                          </p>
                        </div>
                        <div className="rounded-2xl bg-white/10 px-5 py-3 text-right">
                          <p className="text-xs text-slate-300">Payment</p>
                          <p className="font-bold text-emerald-300">
                            {selectedInvoice.status}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 flex flex-wrap justify-center gap-3">
                      <Button
                        variant="outline"
                        disabled={downloading === selectedInvoice.id}
                        onClick={() => downloadInvoice(selectedInvoice)}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        {downloading === selectedInvoice.id ? "Preparing..." : "Download PDF"}
                      </Button>
                      <Button onClick={() => printInvoice(selectedInvoice)}>
                        <Printer className="mr-2 h-4 w-4" />
                        Print
                      </Button>
                    </div>

                    <p className="mt-8 text-center text-sm text-slate-500">
                      This invoice confirms your SkillBridge booking and payment record.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function InvoiceInfo({ label, value }: { label: string; value: string }) {
  return (
    <div className="mb-3 last:mb-0">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-semibold text-slate-800">
        {value}
      </p>
    </div>
  );
}

function InvoiceRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="font-semibold text-slate-900">{value}</span>
    </div>
  );
}
