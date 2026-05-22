"use client";

import { useRouter } from "next/navigation";

export function useLogout() {
  const router = useRouter();

  const logout = async (refetch?: () => void) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/sign-out`,
        {
          method: "POST",
          credentials: "include",
        },
      );

      if (res.ok) {
        refetch?.();
        router.push("/login");
        router.refresh();
      }
    } catch {
      router.push("/login");
    }
  };

  return logout;
}
