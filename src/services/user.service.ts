import { env } from "@/env";
import { cookies } from "next/headers";

const AUTH_URL = env.NEXT_PUBLIC_AUTH_URL;

export const userService = {
  getSession: async function () {
    try {
      const cookieStore = await cookies();

      const res = await fetch(`${AUTH_URL}/api/auth/get-session`, {
        headers: {
          Cookie: cookieStore.toString(),
        },
        cache: "no-store",
      });

      if (!res.ok) {
        return { data: null, error: "Session fetch failed" };
      }

      const session = await res.json();

      if (session === null) {
        return { data: null, error: "Session is missing" };
      }

      return { data: session, error: null };
    } catch {
      return { data: null, error: { message: "Something Went Wrong" } };
    }
  },
};
