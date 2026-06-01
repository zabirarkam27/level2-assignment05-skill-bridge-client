import Link from "next/link";
import { Award, CheckCircle2, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Certificate } from "@/types/routes.type";

type VerifyResponse = {
  success: boolean;
  message?: string;
  data?: Certificate;
};

async function getCertificate(certificateNo: string) {
  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  const res = await fetch(
    `${apiBase}/certificates/verify/${encodeURIComponent(certificateNo)}`,
    { cache: "no-store" },
  );
  const data = (await res.json().catch(() => ({}))) as VerifyResponse;

  if (!res.ok || !data.success || !data.data) {
    return null;
  }

  return data.data;
}

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("en-BD", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

export default async function CertificateVerificationPage({
  params,
}: {
  params: Promise<{ certificateNo: string }>;
}) {
  const { certificateNo } = await params;
  const certificate = await getCertificate(certificateNo);

  return (
    <main className="min-h-[70vh] bg-slate-50 px-4 py-12 dark:bg-gray-950">
      <div className="mx-auto max-w-3xl">
        {!certificate ? (
          <div className="rounded-xl border border-red-100 bg-white p-8 text-center shadow-sm dark:border-red-900/40 dark:bg-gray-900">
            <Award className="mx-auto mb-4 h-12 w-12 text-red-500" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Certificate Not Found
            </h1>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              This certificate number could not be verified.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-emerald-100 bg-white shadow-xl dark:border-emerald-900/40 dark:bg-gray-900">
            <div className="bg-[#611f69] px-8 py-7 text-white dark:bg-[#c084fc] dark:text-black">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium opacity-80">
                    SkillBridge Verification
                  </p>
                  <h1 className="mt-1 text-3xl font-bold">
                    Certificate Verified
                  </h1>
                </div>
                <Badge variant="success" className="bg-emerald-100 text-emerald-700">
                  <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                  Valid
                </Badge>
              </div>
            </div>

            <div className="p-8">
              <div className="mb-8 text-center">
                <Award className="mx-auto mb-4 h-16 w-16 text-[#611f69] dark:text-[#c084fc]" />
                <p className="text-sm uppercase tracking-[0.28em] text-gray-400">
                  Awarded To
                </p>
                <h2 className="mt-3 text-3xl font-bold text-gray-900 dark:text-white">
                  {certificate.student?.name}
                </h2>
                <p className="mt-5 text-sm text-gray-500 dark:text-gray-400">
                  For successfully completing
                </p>
                <h3 className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
                  {certificate.course?.title}
                </h3>
              </div>

              <div className="grid gap-4 rounded-xl bg-slate-50 p-5 dark:bg-gray-800 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase text-gray-400">
                    Certificate No
                  </p>
                  <p className="mt-1 break-words text-sm font-semibold text-gray-900 dark:text-white">
                    {certificate.certificateNo}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-gray-400">
                    Issued Date
                  </p>
                  <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                    {formatDate(certificate.issuedAt)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-gray-400">
                    Course Category
                  </p>
                  <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                    {certificate.course?.category?.name ?? "SkillBridge"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-gray-400">
                    Instructor
                  </p>
                  <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                    {certificate.course?.tutor?.name ?? "SkillBridge Instructor"}
                  </p>
                </div>
              </div>

              <div className="mt-8 flex justify-center">
                <Button asChild variant="outline">
                  <Link href="/courses">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Explore SkillBridge Courses
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
