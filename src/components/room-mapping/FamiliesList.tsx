"use client";

import { AllocatedFamily, UnallocatedFamily, RoomInventory } from "@/types/allocation";
import { useState, useMemo } from "react";

interface FamiliesListProps {
  allocatedFamilies: AllocatedFamily[];
  unallocatedFamilies: UnallocatedFamily[];
  inventory: RoomInventory[];
  onAllocate: (familyId: string, roomOfferId: string) => void;
  onUpdate: (allocationId: string, roomOfferId: string) => void;
  isReadOnly: boolean;
}

export default function FamiliesList({
  allocatedFamilies,
  unallocatedFamilies,
  inventory,
  onAllocate,
  onUpdate,
  isReadOnly,
}: FamiliesListProps) {
  const [selectedRooms, setSelectedRooms] = useState<Record<string, string>>({});

  const handleRoomSelect = (familyId: string, roomId: string) => {
    setSelectedRooms((prev) => ({ ...prev, [familyId]: roomId }));
  };

  // Combine for rendering, but keep track of status
  // We can render unallocated first, then allocated.
  // Or just map through both.
  
  const renderFamilyItem = (
      family: UnallocatedFamily | AllocatedFamily, 
      isAssigned: boolean
  ) => {
      const familyId = family.family_id;
      const selectedRoomId = selectedRooms[familyId] || "";
      const familySize = family.guests.length;

      // Type guard helper
      const allocatedFamily = isAssigned ? (family as AllocatedFamily) : null;
      const currentRoomOfferId = allocatedFamily?.room_offer_id;
      const currentRoomName = allocatedFamily?.room_name;

      const targetRoom = inventory.find((r) => r.room_offer_id === selectedRoomId);
      
      let canSubmit = false;
      if (selectedRoomId) {
           if (targetRoom) {
               const isFull = targetRoom.available <= 0;
               const isTooSmall = familySize > targetRoom.max_capacity;
               // If it's the SAME room, we shouldn't really disable, but "Change" to same room is no-op.
               // But availability check: if we are ALREADY in it, we don't consume *new* capacity.
               // However, for simplicity, if we select a DIFFERENT room, check availability.
               
               if (selectedRoomId !== currentRoomOfferId) {
                   if (!isFull && !isTooSmall) canSubmit = true;
               }
           }
      }

      const handleSubmit = () => {
          if (!canSubmit) return;
          if (isAssigned && allocatedFamily) {
              onUpdate(allocatedFamily.allocation_id, selectedRoomId);
          } else {
              onAllocate(familyId, selectedRoomId);
          }
          // Reset selection for this family
          handleRoomSelect(familyId, "");
      };

      return (
        <div key={familyId} className="p-6 hover:bg-neutral-50 transition-colors border-b border-neutral-100 last:border-0">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h3 className="font-semibold text-neutral-900 flex items-center gap-2">
                {family.guests[0]?.guest_name || "Unknown Family"}
                {family.guests.length > 1 && (
                    <span className="text-neutral-500 font-normal text-sm">
                        (+{family.guests.length - 1} others)
                    </span>
                )}
              </h3>
              <div className="flex flex-wrap gap-1 mt-2">
                {family.guests.map((g) => (
                  <span key={g.guest_id} className="text-xs px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded-full border border-neutral-200">
                    {g.guest_name}
                  </span>
                ))}
              </div>
            </div>
            <div className="text-right">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                isAssigned 
                  ? "bg-green-50 text-green-700 border-green-200" 
                  : "bg-amber-50 text-amber-700 border-amber-200"
              }`}>
                {isAssigned ? "Assigned" : "Unassigned"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1">
              <select
                className="w-full h-10 px-3 rounded-lg border border-neutral-300 text-sm focus:ring-2 focus:ring-corporate-blue-500 focus:border-corporate-blue-500 transition-all disabled:bg-neutral-100 disabled:text-neutral-400"
                value={selectedRoomId}
                onChange={(e) => handleRoomSelect(familyId, e.target.value)}
                disabled={isReadOnly}
              >
                <option value="">
                  {isAssigned 
                    ? `Current: ${currentRoomName}` 
                    : "Select a room..."}
                </option>
                {inventory.map((room) => {
                  const isCurrent = room.room_offer_id === currentRoomOfferId;
                  const isFull = room.available <= 0 && !isCurrent; // Don't mark full if it's current (conceptually)
                  const isTooSmall = familySize > room.max_capacity;
                  
                  return (
                    <option 
                      key={room.room_offer_id} 
                      value={room.room_offer_id}
                      disabled={!isCurrent && (isFull || isTooSmall)}
                      className={isCurrent ? "font-bold bg-neutral-100" : ""}
                    >
                      {room.room_name} • {room.available} left • Max {room.max_capacity}
                      {isFull ? " (Full)" : ""}
                      {isTooSmall ? " (Too small)" : ""}
                      {isCurrent ? " (Current)" : ""}
                    </option>
                  );
                })}
              </select>
            </div>
            <button
              onClick={handleSubmit}
              disabled={isReadOnly || !canSubmit}
              className={`h-10 px-4 rounded-lg text-sm font-medium transition-all min-w-[120px] ${
                 isReadOnly || !canSubmit
                 ? "bg-neutral-100 text-neutral-400 cursor-not-allowed"
                 : isAssigned
                   ? "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                   : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
              }`}
            >
              {isAssigned ? "Change Room" : "Assign Room"}
            </button>
          </div>
        </div>
      );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden flex flex-col h-full">
      <div className="px-6 py-4 border-b border-neutral-200 bg-neutral-50/50 flex justify-between items-center">
        <div>
            <h2 className="text-lg font-bold text-neutral-900">Families</h2>
            <p className="text-sm text-neutral-500">
            {unallocatedFamilies.length} unassigned • {allocatedFamilies.length} assigned
            </p>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto min-h-[500px]">
        {unallocatedFamilies.length > 0 && (
            <div className="bg-amber-50/30 border-b border-amber-100">
                <div className="px-6 py-2 text-xs font-bold text-amber-800 uppercase tracking-wide">
                    ⚠️ Unassigned ({unallocatedFamilies.length})
                </div>
                {unallocatedFamilies.map(f => renderFamilyItem(f, false))}
            </div>
        )}
        
        {allocatedFamilies.map(f => renderFamilyItem(f, true))}
        
        {unallocatedFamilies.length === 0 && allocatedFamilies.length === 0 && (
            <div className="p-12 text-center text-neutral-500">
                No families found for this event.
            </div>
        )}
      </div>
    </div>
  );
}
