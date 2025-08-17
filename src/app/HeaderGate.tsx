"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";

export default function HeaderGate() {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin") ?? false;
  if (isAdmin) return null;
  return <Header />;
} 