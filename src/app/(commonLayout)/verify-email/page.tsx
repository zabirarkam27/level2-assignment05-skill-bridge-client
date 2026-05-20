"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

export default function VerifyEmailPage() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token");
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      router.replace("/login?verified=false");
      return;
    }

    const verifyEmail = async () => {
      try {
        const { error } = await authClient.verifyEmail({
          query: {
            token,
            callbackURL: `${process.env.NEXT_PUBLIC_APP_URL}/login`,
          },
        });

        if (error) {
          throw new Error(error.message);
        }

        setSuccess(true);
        setTimeout(() => {
        router.replace("/dashboard");
        }, 1500);
      } catch (error: unknown) {
        console.error("Verification failed:", error);
        setTimeout(() => {
          router.replace("/login?verified=false");
        }, 2000);
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, [token, router]);

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card className="border-[#611f69]/40 dark:border-[#c084fc]/40">
          <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
            {loading ? (
              <>
                <Loader2 className="w-12 h-12 text-[#611f69] dark:text-[#c084fc] animate-spin" />
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                  Verifying your email...
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Please wait while we verify your email address.
                </p>
              </>
            ) : success ? (
              <>
                <CheckCircle className="w-12 h-12 text-green-500" />
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                  Email Verified!
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Your email has been verified successfully. You&apos;ll be redirected to login...
                </p>
              </>
            ) : (
              <>
                <XCircle className="w-12 h-12 text-red-500" />
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                  Verification Failed
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  The verification link is invalid or has expired.
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}