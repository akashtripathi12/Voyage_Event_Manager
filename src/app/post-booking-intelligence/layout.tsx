"use client";

import Navigation from "@/components/legacy/Navigation";
import Sidebar from "@/components/legacy/Sidebar";
import { SidebarProvider, useSidebar } from "@/context/SidebarContext";
import Breadcrumbs from "@/components/ui/Breadcrumbs";

function PostBookingLayoutContent({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar();

  return (
    <>
      <Navigation />
      <Breadcrumbs />
      <Sidebar />
      <main
        className={`transition-all duration-300 ${isCollapsed ? "ml-20" : "ml-64"}`}
      >
        {children}
      </main>
    </>
  );
}

export default function PostBookingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <PostBookingLayoutContent>{children}</PostBookingLayoutContent>
    </SidebarProvider>
  );
}
