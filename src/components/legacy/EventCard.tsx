import { Event } from '@/types';
import Link from 'next/link';

interface EventCardProps {
  event: Event;
}

export default function EventCard({ event }: EventCardProps) {
  const statusColors = {
    active: 'bg-success/10 text-success border-success/20',
    upcoming: 'bg-processing/10 text-processing border-processing/20',
    completed: 'bg-neutral-200 text-neutral-600 border-neutral-300',
  };

  const inventoryColor = 
    event.inventoryConsumed >= 90 ? 'text-error' :
    event.inventoryConsumed >= 70 ? 'text-warning' :
    'text-success';

  return (
    <Link href={`/events/${event.id}`}>
      <div className="card p-6 hover:shadow-md transition-all cursor-pointer group">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-neutral-900 group-hover:text-corporate-blue-100 transition-colors">
              {event.name}
            </h3>
            <p className="text-sm text-neutral-600 mt-1">
              {event.location} | {new Date(event.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – {new Date(event.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[event.status]}`}>
            {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-neutral-200">
          <div>
            <p className="text-xs text-neutral-500 mb-1">Guests</p>
            <p className="text-lg font-semibold text-neutral-900">{event.guestCount}</p>
          </div>

          <div>
            <p className="text-xs text-neutral-500 mb-1">Inventory</p>
            <p className={`text-lg font-semibold ${inventoryColor}`}>{event.inventoryConsumed}%</p>
          </div>
        </div>
      </div>
    </Link>
  );
}
