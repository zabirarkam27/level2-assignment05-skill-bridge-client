"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import * as z from "zod";
import { authClient } from "@/lib/auth-client";

const formSchema = z.object({
  name: z.string().min(4, "Name must be at least 4 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["STUDENT", "TUTOR"]),
});

export function SignupForm(props: React.ComponentProps<typeof Card>) {
  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "STUDENT" as "STUDENT" | "TUTOR",
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      const toastId = toast.loading("Creating account...");

      try {
        const signUpPayload = {
          email: value.email,
          password: value.password,
          name: value.name,
          role: value.role,
        };

        const { error } = await authClient.signUp.email(signUpPayload);

        if (error) {
          toast.error(error.message, { id: toastId });
          return;
        }

        if (value.role === "TUTOR") {
          toast.success(
            "Application submitted! Please verify your email. An admin will review your request before you can log in.",
            { id: toastId, duration: 6000 },
          );
        } else {
          toast.success(
            "Account created! Please check your email to verify your address.",
            { id: toastId },
          );
        }

        setTimeout(() => {
          window.location.href = "/login";
        }, 1500);
      } catch {
        toast.error("Registration failed", { id: toastId });
      }
    },
  });

  const handleGoogleSignup = async () => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: `${process.env.NEXT_PUBLIC_APP_URL}`,
    });
  };

  return (
    <Card {...props} className="border-[#611f69]/20 dark:border-[#c084fc]/30">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-[#611f69] dark:text-[#e9d5ff]">
          Create an account
        </CardTitle>
        <CardDescription>
          Enter your details to get started with SkillBridge
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className="space-y-4"
        >
          <FieldGroup>
            <form.Field name="name">
              {(field) => {
                const invalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={invalid}>
                    <FieldLabel>Full Name</FieldLabel>
                    <Input
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="John Doe"
                      className="focus-visible:ring-[#611f69] dark:focus-visible:ring-[#c084fc]"
                    />
                    {invalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="email">
              {(field) => {
                const invalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={invalid}>
                    <FieldLabel>Email</FieldLabel>
                    <Input
                      type="email"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="m@example.com"
                      className="focus-visible:ring-[#611f69] dark:focus-visible:ring-[#c084fc]"
                    />
                    {invalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="password">
              {(field) => {
                const invalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={invalid}>
                    <FieldLabel>Password</FieldLabel>
                    <Input
                      type="password"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="focus-visible:ring-[#611f69] dark:focus-visible:ring-[#c084fc]"
                    />
                    <FieldDescription>Minimum 8 characters</FieldDescription>
                    {invalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="role">
              {(field) => (
                <Field>
                  <FieldLabel>Account Type</FieldLabel>
                  <select
                    title="Account Type"
                    aria-label="Account Type"
                    value={field.state.value}
                    onChange={(e) =>
                      field.handleChange(e.target.value as "STUDENT" | "TUTOR")
                    }
                    className="
                      h-10 w-full rounded-md border bg-background px-3 text-sm
                      focus:outline-none focus:ring-2
                      focus:ring-[#611f69]
                      dark:focus:ring-[#c084fc]
                    "
                  >
                    <option value="STUDENT">Student</option>
                    <option value="TUTOR">Tutor</option>
                  </select>
                </Field>
              )}
            </form.Field>

            <Field className="space-y-3 pt-2">
              <Button
                type="submit"
                disabled={form.state.isSubmitting}
                className="
                  w-full bg-[#611f69] text-white
                  hover:bg-[#4a174f]
                  dark:bg-[#c084fc]
                  dark:text-black
                  dark:hover:bg-[#d8b4fe]
                "
              >
                {form.state.isSubmitting
                  ? "Creating account..."
                  : "Create Account"}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleSignup}
                className="
                  w-full
                  border-[#611f69]/40 text-[#611f69]
                  hover:bg-[#611f69]/10
                  dark:border-[#c084fc]/40
                  dark:text-[#e9d5ff]
                  dark:hover:bg-white/10
                "
              >
                Sign up with Google
              </Button>

              <FieldDescription className="text-center">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-medium text-[#611f69] hover:underline dark:text-[#d8b4fe]"
                >
                  Sign in
                </Link>
              </FieldDescription>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
