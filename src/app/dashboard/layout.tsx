"use client";

import Navigation from "@/components/legacy/Navigation";
import Sidebar from "@/components/legacy/Sidebar";
import { SidebarProvider, useSidebar } from "@/context/SidebarContext";
import Breadcrumbs from "@/components/ui/Breadcrumbs";

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navigation />
      <Breadcrumbs />
      <main>{children}</main>
    </>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayoutContent>{children}</DashboardLayoutContent>;
}
