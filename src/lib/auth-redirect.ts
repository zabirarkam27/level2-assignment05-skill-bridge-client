import { UserRole } from "@/types/routes.type";

export function getDashboardPath(role?: UserRole) {
  if (role === "ADMIN") return "/admin";
  if (role === "TUTOR") return "/tutor/dashboard";
  return "/";
}

export function getAppUrl() {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }

  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return "http://localhost:3000";
}

export function getSocialAuthCallbackUrl() {
  return `${getAppUrl()}/auth/redirect`;
}
