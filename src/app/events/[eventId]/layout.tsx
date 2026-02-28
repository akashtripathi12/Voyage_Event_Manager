"use client";

import { usePathname } from "next/navigation";
import Navigation from "@/components/legacy/Navigation";
import Sidebar from "@/components/legacy/Sidebar";
import { SidebarProvider, useSidebar } from "@/context/SidebarContext";
import Breadcrumbs from "@/components/ui/Breadcrumbs";

function EventLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isGuestsPage = pathname?.includes("/guests");
  const isPortalRoute = pathname?.includes("/portal");

  // Portal routes have their own layout, so don't apply agent layout
  if (isPortalRoute || isGuestsPage) {
    return <>{children}</>;
  }

  return (
    <>
      <Navigation />
      <Breadcrumbs />
      <main className="p-8">{children}</main>
    </>
  );
}

export default function EventLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <EventLayoutContent>{children}</EventLayoutContent>;
}
