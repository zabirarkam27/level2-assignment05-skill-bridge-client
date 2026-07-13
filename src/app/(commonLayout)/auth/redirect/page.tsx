"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getDashboardPath } from "@/lib/auth-redirect";
import { UserRole } from "@/types/routes.type";

async function getSessionRole() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/auth/get-session`,
    {
      credentials: "include",
      cache: "no-store",
    },
  );

  if (!res.ok) return undefined;

  const session = await res.json();
  return session?.user?.role as UserRole | undefined;
}

function AuthRedirectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  useEffect(() => {
    if (error) {
      toast.error("Google login failed. Please try again.");
      router.replace("/login");
      return;
    }

    let isMounted = true;

    const redirectByRole = async () => {
      const role = await getSessionRole();

      if (!isMounted) return;

      router.replace(getDashboardPath(role));
      router.refresh();
    };

    redirectByRole();

    return () => {
      isMounted = false;
    };
  }, [error, router]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-4 text-center">
      <Loader2 className="h-6 w-6 animate-spin text-[#611f69]" />
      <p className="text-sm text-muted-foreground">Finishing Google login...</p>
    </div>
  );
}

export default function AuthRedirectPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-4 text-center">
          <Loader2 className="h-6 w-6 animate-spin text-[#611f69]" />
          <p className="text-sm text-muted-foreground">
            Finishing Google login...
          </p>
        </div>
      }
    >
      <AuthRedirectContent />
    </Suspense>
  );
}
