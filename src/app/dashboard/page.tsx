'use client';

import { mockMetrics } from '@/modules/dashboard/services/mockData';
import { MetricCard } from '@/components/ui/Card';
import { EventCard } from '@/components/ui/EventCard';
import EventModal from '@/components/legacy/EventModal';
import { useEvents } from '@/context/EventContext';
import { useState } from 'react';
import ProtectedRoute from '@/components/legacy/auth/ProtectedRoute';
import { useAuth, UserRole } from '@/context/AuthContext';
import LogoutButton from '@/components/legacy/auth/LogoutButton';

export default function DashboardPage() {
  const { events } = useEvents();
  const [showEventModal, setShowEventModal] = useState(false);

  return (
    <ProtectedRoute requiredRole={UserRole.AGENT}>
      <div className="min-h-screen bg-neutral-50">
        {/* Header */}
        <div className="bg-white border-b border-neutral-200 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">Dashboard</h1>
              <p className="text-sm text-neutral-600 mt-1">
                Operational command center for group inventory management
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowEventModal(true)}
                className="px-6 py-3 bg-corporate-blue-100 hover:bg-corporate-blue-200 text-white font-semibold rounded-lg transition-colors shadow-sm"
              >
                + Create Event
              </button>
              <LogoutButton />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-8 py-8">
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
            {mockMetrics.map((metric) => (
              <MetricCard 
                key={metric.label} 
                label={metric.label}
                value={metric.value}
                change={metric.change}
                trend={metric.trend}
              />
            ))}
          </div>

          {/* Events Section */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">
              Active Events ({events.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </div>

        {/* Event Modal */}
        <EventModal isOpen={showEventModal} onClose={() => setShowEventModal(false)} />
      </div>
    </ProtectedRoute>
  );
}
