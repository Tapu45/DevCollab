"use client";

import React from "react";
import { usePathname } from "next/navigation";
import AppLayout from "@/components/Layout/AppLayout";

export default function RouteLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/";

  // Pages/paths to skip wrapping with AppLayout
  const excluded = ["/", "/auth", "/login", "/signup"];
  const shouldSkip = excluded.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  if (shouldSkip) return <>{children}</>;

  return <AppLayout>{children}</AppLayout>;
}