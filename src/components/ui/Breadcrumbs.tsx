"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEvents } from "@/context/EventContext";
import { useMemo } from "react";

// Maps specific paths to more readable names
const pathNameMap: Record<string, string> = {
  dashboard: "Home",
  events: "Events",
  hotels: "Hotels",
  flights: "Flights",
  transfers: "Transfers",
  guests: "Guests",
  analytics: "Analytics",
  cart: "Event Cart",
  negotiation: "Negotiation",
  "post-booking-intelligence": "Intelli-Insights",
};

export default function Breadcrumbs() {
  const pathname = usePathname();
  const { events } = useEvents();

  // Parse path segments
  const breadcrumbs = useMemo(() => {
    if (!pathname || pathname === "/") return [];

    const segments = pathname.split("/").filter(Boolean);

    // Portal routes don't show breadcrumbs as it's a guest-facing simplified view
    if (segments.includes("portal")) {
      return [];
    }

    let url = "";
    const rawItems = segments.map((segment, index) => {
      url += `/${segment}`;

      if (segment.toLowerCase() === "events") {
        return null;
      }

      let label = segment;

      // Check if it's a known UUID-like pattern for an Event ID
      // UUID regex pattern
      const isUUID =
        /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
          segment,
        );

      if (isUUID) {
        // Try to find the event name
        const event = events.find((e) => e.id === segment);
        if (event) {
          label = event.name;
        } else {
          label = "Event Details"; // Fallback
        }
      } else if (pathNameMap[segment.toLowerCase()]) {
        // Use predefined readable name
        label = pathNameMap[segment.toLowerCase()];
      } else {
        // Capitalize default segment
        label =
          segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");
      }

      // If it's the dashboard route, skip it if we decide to add a distinct "Home" later,
      // but the pathNameMap handles 'dashboard' -> 'Home'

      return {
        label,
        url,
        isLast: false,
      };
    });

    const items = rawItems.filter(Boolean) as {
      label: string;
      url: string;
      isLast: boolean;
    }[];

    if (items.length > 0) {
      items[items.length - 1].isLast = true;
    }

    // Option to always prepend a Home link if not on dashboard
    if (segments[0] !== "dashboard") {
      items.unshift({
        label: "Home",
        url: "/dashboard",
        isLast: items.length === 0,
      });
    }

    return items;
  }, [pathname, events]);

  if (breadcrumbs.length === 0) return null;

  return (
    <nav
      className="flex px-4 md:px-8 py-3 text-sm text-neutral-600 bg-white/80 backdrop-blur-md border-b border-neutral-200 shadow-sm sticky top-16 z-40 overflow-x-auto whitespace-nowrap mt-16"
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center space-x-2 md:space-x-3 max-w-7xl mx-auto w-full">
        {breadcrumbs.map((crumb, index) => (
          <li key={crumb.url} className="flex items-center">
            {index > 0 && (
              <svg
                className="w-4 h-4 text-neutral-400 mx-1 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            )}

            {crumb.isLast ? (
              <span
                className="font-medium text-blue-700 pointer-events-none px-1"
                aria-current="page"
              >
                {crumb.label}
              </span>
            ) : (
              <Link
                href={crumb.url}
                className="inline-flex items-center px-1 font-medium hover:text-blue-600 transition-colors"
                title={crumb.label}
              >
                {crumb.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
