"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setLoading(true);
    try {
      const { error } = await authClient.requestPasswordReset({
        email,
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
      });

      if (error) {
        throw new Error(error.message);
      }

      setSent(true);
    } catch (err: any) {
      toast.error(err.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card className="border-[#611f69]/40 dark:border-[#c084fc]/40">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold text-[#611f69] dark:text-[#e9d5ff]">
              {sent ? "Check your email" : "Forgot password?"}
            </CardTitle>
            <CardDescription>
              {sent
                ? "We've sent a password reset link to your email"
                : "Enter your email and we'll send you a reset link"}
            </CardDescription>
          </CardHeader>

          {sent ? (
            <CardContent className="flex flex-col items-center gap-4 py-6">
              <CheckCircle className="w-16 h-16 text-green-500" />
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                A reset link has been sent to <strong>{email}</strong>. Please check your inbox and spam folder.
              </p>
              <Button
                variant="outline"
                onClick={() => { setSent(false); setEmail(""); }}
                className="mt-2"
              >
                Send again
              </Button>
            </CardContent>
          ) : (
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="pl-10 focus-visible:ring-[#611f69]/40 dark:focus-visible:ring-[#c084fc]/40 h-10"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-3">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#611f69] text-white hover:bg-[#4a174f] dark:bg-[#c084fc] dark:text-black dark:hover:bg-[#d8b4fe]"
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </Button>
              </CardFooter>
            </form>
          )}

          <div className="pb-6 text-center">
            <Link
              href="/login"
              className="text-sm text-muted-foreground hover:text-[#611f69] dark:hover:text-[#d8b4fe] transition-colors inline-flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to login
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
