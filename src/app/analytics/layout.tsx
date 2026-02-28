"use client";

import Navigation from "@/components/legacy/Navigation";
import Sidebar from "@/components/legacy/Sidebar";
import { SidebarProvider, useSidebar } from "@/context/SidebarContext";
import Breadcrumbs from "@/components/ui/Breadcrumbs";

function AnalyticsLayoutContent({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navigation />
      <Breadcrumbs />
      <main>{children}</main>
    </>
  );
}

export default function AnalyticsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AnalyticsLayoutContent>{children}</AnalyticsLayoutContent>;
}
