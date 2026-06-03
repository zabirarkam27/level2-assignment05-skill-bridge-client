"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Award,
  Download,
  ExternalLink,
  Eye,
  Printer,
  Share2,
} from "lucide-react";
import { toast } from "sonner";
import QRCode from "qrcode";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Certificate } from "@/types/routes.type";

type CertificateListProps = {
  mode: "student" | "admin";
};

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("en-BD", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const htmlEscape = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

function getVerificationHref(certificate: Certificate) {
  return `/certificate/${certificate.certificateNo}`;
}

function getVerificationUrl(certificate: Certificate) {
  if (typeof window === "undefined") return getVerificationHref(certificate);
  return `${window.location.origin}${getVerificationHref(certificate)}`;
}

function createQrSvg(value: string, size = 92) {
  const qr = QRCode.create(value, { errorCorrectionLevel: "M" }) as {
    modules: { size: number; data: ArrayLike<boolean | number> };
  };
  const cells = qr.modules.size;
  const cell = size / cells;
  const rects: string[] = [];

  for (let row = 0; row < cells; row += 1) {
    for (let col = 0; col < cells; col += 1) {
      if (Boolean(qr.modules.data[row * cells + col])) {
        rects.push(
          `<rect x="${(col * cell).toFixed(3)}" y="${(row * cell).toFixed(
            3,
          )}" width="${cell.toFixed(3)}" height="${cell.toFixed(3)}" />`,
        );
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" role="img" aria-label="Certificate verification QR code"><rect width="${size}" height="${size}" fill="#ffffff"/> <g fill="#020617">${rects.join("")}</g></svg>`;
}

function CertificateQr({ certificate }: { certificate: Certificate }) {
  return (
    <div
      className="border border-[#c39a35] bg-white p-1"
      dangerouslySetInnerHTML={{
        __html: createQrSvg(getVerificationUrl(certificate), 84),
      }}
    />
  );
}

function CertificatePreview({ certificate }: { certificate: Certificate }) {
  const studentName = certificate.student?.name ?? "Student";
  const courseTitle = certificate.course?.title ?? "Course";
  const category = certificate.course?.category?.name ?? "Professional Learning";
  const instructor =
    certificate.course?.tutor?.name ?? "SkillBridge Instructor";

  return (
    <div className="bg-slate-100 px-3 py-5 print:bg-white sm:px-4 sm:py-8">
      <div
        id="certificate-preview"
        className="mx-auto aspect-[1.414/1] max-w-5xl overflow-hidden border-[6px] border-[#c39a35] bg-[#fffaf0] p-2 shadow-2xl print:shadow-none sm:border-[10px] sm:p-4"
      >
        <div className="flex h-full flex-col border border-[#e3c36f] px-3 py-3 text-center sm:px-8 sm:py-7">
          <div className="flex items-start justify-between gap-4">
            <div className="text-left">
              <p className="text-base font-bold text-[#611f69] sm:text-2xl">SkillBridge</p>
              <p className="mt-1 text-[8px] font-semibold uppercase tracking-[0.16em] text-amber-700 sm:text-xs sm:tracking-[0.24em]">
                Official Certification
              </p>
            </div>
            <div className="text-center">
              <CertificateQr certificate={certificate} />
              <p className="mt-1 text-[10px] font-bold uppercase text-slate-500">
                Scan to Verify
              </p>
            </div>
          </div>

          <div className="flex flex-1 flex-col justify-center">
            <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-500 sm:text-sm sm:tracking-[0.32em]">
              Certificate of Completion
            </p>
            <h2 className="mt-3 break-words text-xl font-bold text-slate-950 sm:mt-6 sm:text-4xl">
              {studentName}
            </h2>
            <div className="mx-auto mt-2 h-px w-32 bg-[#c39a35] sm:mt-4 sm:w-72" />
            <p className="mt-3 text-[10px] text-slate-500 sm:mt-8 sm:text-sm">
              For successfully completing
            </p>
            <h3 className="mx-auto mt-2 max-w-3xl break-words text-base font-bold text-slate-950 sm:mt-3 sm:text-3xl">
              {courseTitle}
            </h3>
            <p className="mt-2 text-[10px] font-semibold text-amber-700 sm:mt-3 sm:text-sm">
              {category}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 text-left text-[9px] sm:gap-4 sm:text-sm">
            <div>
              <p className="text-xs font-bold uppercase text-slate-400">
                Issued Date
              </p>
              <p className="mt-1 font-semibold text-slate-900">
                {formatDate(certificate.issuedAt)}
              </p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-slate-400">
                Certificate No
              </p>
              <p className="mt-1 break-words font-semibold text-slate-900">
                {certificate.certificateNo}
              </p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-slate-400">
                Instructor
              </p>
              <p className="mt-1 font-semibold text-slate-900">{instructor}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CertificateList({ mode }: CertificateListProps) {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [selectedCertificate, setSelectedCertificate] =
    useState<Certificate | null>(null);

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/certificates`,
          { credentials: "include" },
        );
        const data = await res.json();
        setCertificates(Array.isArray(data.data) ? data.data : []);
      } catch {
        setCertificates([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCertificates();
  }, []);

  const downloadCertificate = async (certificate: Certificate) => {
    setDownloadingId(certificate.id);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/certificates/${certificate.id}/download`,
        { credentials: "include" },
      );

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || "Certificate download failed");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `skillbridge-certificate-${certificate.certificateNo}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Certificate download failed",
      );
    } finally {
      setDownloadingId(null);
    }
  };

  const shareOnLinkedIn = (certificate: Certificate) => {
    const course = certificate.course?.title ?? "a SkillBridge course";
    const verifyUrl = getVerificationUrl(certificate);
    const text = `I successfully completed ${course} on SkillBridge. Verify my certificate: ${verifyUrl}`;
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
        verifyUrl,
      )}&summary=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  const renderCertificateHtml = (certificate: Certificate) => {
    const studentName = htmlEscape(certificate.student?.name ?? "Student");
    const courseTitle = htmlEscape(certificate.course?.title ?? "Course");
    const category = htmlEscape(
      certificate.course?.category?.name ?? "Professional Learning",
    );
    const instructor = htmlEscape(
      certificate.course?.tutor?.name ?? "SkillBridge Instructor",
    );
    const certificateNo = htmlEscape(certificate.certificateNo);
    const issuedAt = htmlEscape(formatDate(certificate.issuedAt));
    const qrSvg = createQrSvg(getVerificationUrl(certificate), 90);

    return `
      <html>
        <head>
          <title>${certificateNo}</title>
          <style>
            * { box-sizing: border-box; }
            body { margin: 0; background: #f1f5f9; font-family: Arial, sans-serif; color: #0f172a; }
            .page { min-height: 100vh; display: grid; place-items: center; padding: 32px; }
            .certificate { width: min(1100px, 100%); aspect-ratio: 1.414 / 1; background: #fffaf0; border: 10px solid #c39a35; padding: 18px; box-shadow: 0 24px 60px rgba(15, 23, 42, 0.18); }
            .inner { height: 100%; border: 1px solid #e3c36f; padding: 32px 42px; text-align: center; display: flex; flex-direction: column; }
            .top { display: flex; justify-content: space-between; align-items: flex-start; gap: 20px; }
            .brand { text-align: left; }
            .brand h1 { margin: 0; color: #611f69; font-size: 30px; }
            .brand p { margin: 8px 0 0; color: #a16207; font-size: 11px; font-weight: 700; letter-spacing: 0.24em; text-transform: uppercase; }
            .qr-wrap { text-align: center; }
            .qr { border: 1px solid #c39a35; background: white; padding: 4px; line-height: 0; }
            .qr svg { display: block; }
            .qr-label { margin: 6px 0 0; color: #64748b; font-size: 10px; font-weight: 800; text-transform: uppercase; }
            .middle { flex: 1; display: flex; flex-direction: column; justify-content: center; }
            .eyebrow { margin: 0; color: #64748b; font-size: 14px; font-weight: 800; letter-spacing: 0.32em; text-transform: uppercase; }
            .student { margin: 34px 0 0; font-size: 48px; color: #020617; }
            .line { width: 360px; max-width: 70%; height: 1px; background: #c39a35; margin: 18px auto 0; }
            .body { margin: 38px 0 0; color: #64748b; font-size: 15px; }
            .course { margin: 14px auto 0; max-width: 820px; color: #020617; font-size: 34px; }
            .category { margin: 14px 0 0; color: #a16207; font-weight: 800; font-size: 14px; }
            .meta { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; text-align: left; font-size: 14px; }
            .meta p { margin: 0; }
            .label { color: #94a3b8; font-size: 11px; font-weight: 800; text-transform: uppercase; }
            .value { margin-top: 7px !important; color: #0f172a; font-weight: 800; overflow-wrap: anywhere; }
            @page { size: landscape; margin: 10mm; }
            @media print {
              body { background: white; }
              .page { min-height: auto; padding: 0; }
              .certificate { width: 100%; box-shadow: none; }
            }
          </style>
        </head>
        <body>
          <div class="page">
            <div class="certificate">
              <div class="inner">
                <div class="top">
                  <div class="brand">
                    <h1>SkillBridge</h1>
                    <p>Official Certification</p>
                  </div>
                  <div class="qr-wrap"><div class="qr">${qrSvg}</div><p class="qr-label">Scan to Verify</p></div>
                </div>
                <div class="middle">
                  <p class="eyebrow">Certificate of Completion</p>
                  <h2 class="student">${studentName}</h2>
                  <div class="line"></div>
                  <p class="body">For successfully completing</p>
                  <h3 class="course">${courseTitle}</h3>
                  <p class="category">${category}</p>
                </div>
                <div class="meta">
                  <div><p class="label">Issued Date</p><p class="value">${issuedAt}</p></div>
                  <div><p class="label">Certificate No</p><p class="value">${certificateNo}</p></div>
                  <div><p class="label">Instructor</p><p class="value">${instructor}</p></div>
                </div>
              </div>
            </div>
          </div>
        </body>
      </html>`;
  };

  const printCertificate = (certificate: Certificate) => {
    const win = window.open("", "_blank", "width=1120,height=820");
    if (!win) {
      toast.error("Please allow popups to print certificate");
      return;
    }

    win.document.write(renderCertificateHtml(certificate));
    win.document.close();
    win.focus();
    win.print();
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white">
            <Award className="h-6 w-6 text-[#611f69] dark:text-[#c084fc]" />
            {mode === "admin" ? "Certificates" : "My Certificates"}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {mode === "admin"
              ? `${certificates.length} issued certificates`
              : "Your completed course certificates"}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-28 animate-pulse rounded-xl border border-gray-100 bg-white dark:border-gray-700 dark:bg-gray-800"
            />
          ))}
        </div>
      ) : certificates.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-white px-6 py-16 text-center text-gray-400 dark:border-gray-700 dark:bg-gray-800">
          <Award className="mx-auto mb-3 h-12 w-12 opacity-40" />
          <p className="text-sm">
            {mode === "admin"
              ? "No certificate has been issued yet."
              : "Complete a course session to unlock your certificate."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {certificates.map((certificate) => (
            <div
              key={certificate.id}
              className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <Badge variant="success">Completed</Badge>
                    <Badge variant="secondary">
                      {certificate.certificateNo}
                    </Badge>
                  </div>
                  <h2 className="truncate text-base font-semibold text-gray-900 dark:text-white">
                    {certificate.course?.title ?? "Course"}
                  </h2>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Issued: {formatDate(certificate.issuedAt)}
                    {certificate.course?.category?.name
                      ? ` - ${certificate.course.category.name}`
                      : ""}
                  </p>
                  {mode === "admin" && (
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Student: {certificate.student?.name ?? "Student"} -{" "}
                      {certificate.student?.email ?? "No email"}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedCertificate(certificate)}
                  >
                    <Eye className="mr-1.5 h-3.5 w-3.5" />
                    View
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => downloadCertificate(certificate)}
                    disabled={downloadingId === certificate.id}
                    className="bg-[#611f69] text-white hover:bg-[#4a174f] dark:bg-[#c084fc] dark:text-black"
                  >
                    <Download className="mr-1.5 h-3.5 w-3.5" />
                    {downloadingId === certificate.id ? "..." : "Download"}
                  </Button>
                  {mode === "student" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => shareOnLinkedIn(certificate)}
                    >
                      <Share2 className="mr-1.5 h-3.5 w-3.5" />
                      Share
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog
        open={!!selectedCertificate}
        onOpenChange={(open) => !open && setSelectedCertificate(null)}
      >
        <DialogContent className="max-h-[94vh] max-w-6xl overflow-y-auto p-0">
          {selectedCertificate && (
            <>
              <DialogHeader className="sr-only">
                <DialogTitle>SkillBridge Certificate</DialogTitle>
              </DialogHeader>
              <CertificatePreview certificate={selectedCertificate} />
              <div className="flex flex-wrap justify-center gap-3 border-t border-slate-200 bg-white px-6 py-5 dark:border-gray-700 dark:bg-gray-900">
                <Button
                  variant="outline"
                  disabled={downloadingId === selectedCertificate.id}
                  onClick={() => downloadCertificate(selectedCertificate)}
                >
                  <Download className="mr-2 h-4 w-4" />
                  {downloadingId === selectedCertificate.id
                    ? "Preparing..."
                    : "Download PDF"}
                </Button>
                <Button onClick={() => printCertificate(selectedCertificate)}>
                  <Printer className="mr-2 h-4 w-4" />
                  Print
                </Button>
                <Button asChild variant="outline">
                  <Link
                    href={getVerificationHref(selectedCertificate)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Verify Page
                  </Link>
                </Button>
                {mode === "student" && (
                  <Button
                    variant="outline"
                    onClick={() => shareOnLinkedIn(selectedCertificate)}
                  >
                    <Share2 className="mr-2 h-4 w-4" />
                    Share
                  </Button>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
