import { Hotel, HotelDataWrapper, Banquet, Catering, RoomType, HotelFilters } from '../types';

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
const API_URL = `${backendUrl}/api/v1`;

export const hotelApi = {
    /**
     * Fetch hotels for a specific city
     */
    async getHotelsByCity(cityId: string, token?: string, filters?: HotelFilters): Promise<Hotel[]> {
        const headers: HeadersInit = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const params = new URLSearchParams({ city_id: cityId });

        if (filters) {
            // 1. Core
            if (filters.priceRange) {
                params.append("min_price", filters.priceRange.min.toString());
                params.append("max_price", filters.priceRange.max.toString());
            } else {
                // Fallback to legacy fields if priceRange not set but min_price/max_price are
                if (filters.min_price !== undefined) params.append('min_price', filters.min_price.toString());
                if (filters.max_price !== undefined) params.append('max_price', filters.max_price.toString());
            }

            if (filters.starRating !== undefined) params.append("stars", filters.starRating.toString());
            else if (filters.stars !== undefined) params.append("stars", filters.stars.toString()); // legacy fallback

            if (filters.userRating !== undefined) params.append("rating", filters.userRating.toString());

            if (filters.propertyTypes && filters.propertyTypes.length > 0) {
                params.append("type", filters.propertyTypes[0]);
            }

            // 2. Room
            if (filters.guestsPerRoom !== undefined) params.append("guests_per_room", filters.guestsPerRoom.toString());
            if (filters.roomCount !== undefined) params.append("room_count", filters.roomCount.toString());

            // Complex Config
            if (filters.roomConfig && filters.roomConfig.length > 0) {
                params.append("room_config", JSON.stringify(filters.roomConfig));
            }

            if (filters.roomAmenities && filters.roomAmenities.length > 0) {
                params.append("room_amenities", filters.roomAmenities.join(","));
            }

            if (filters.freeCancellation) {
                params.append("free_cancellation", "true");
            }

            // Legacy Room Params (Keep for now if they are just fallback aliases)
            if (filters.rooms_single) params.append('rooms_single', filters.rooms_single.toString());
            if (filters.rooms_double) params.append('rooms_double', filters.rooms_double.toString());
            if (filters.rooms_triple) params.append('rooms_triple', filters.rooms_triple.toString());
            if (filters.rooms_quad) params.append('rooms_quad', filters.rooms_quad.toString());

            // 3. Event
            if (filters.hallType) params.append("hall_type", filters.hallType);
            if (filters.hallCapacity !== undefined) params.append("hall_capacity", filters.hallCapacity.toString());
            if (filters.banquetFeatures && filters.banquetFeatures.length > 0) {
                params.append("banquet_features", filters.banquetFeatures.join(","));
            }
            if (filters.minHallArea !== undefined) params.append('min_hall_area', filters.minHallArea.toString());
            if (filters.minCeilingHeight !== undefined) params.append('min_ceiling_height', filters.minCeilingHeight.toString());

            // 4. Facilities & Location
            if (filters.facilities && filters.facilities.length > 0) {
                params.append("facilities", filters.facilities.join(","));
            }
            if (filters.locationTags && filters.locationTags.length > 0) {
                params.append("location_tags", filters.locationTags.join(","));
            }

            // 5. Dietary
            if (filters.dietary && filters.dietary.length > 0) {
                params.append("dietary", filters.dietary[0]);
            }

            // 6. Policies
            const policyList: string[] = [];
            if (filters.policies) {
                if (filters.policies.alcohol) policyList.push("alcohol:allowed");
                if (filters.policies.pets) policyList.push("pets:true");
                if (filters.policies.late_night) policyList.push("late_night:true");
                if (filters.policies.outside_cake) policyList.push("outside_cake:true");
                if (filters.policies.outside_decor) policyList.push("outside_decor:true");
            }
            if (policyList.length > 0) {
                params.append("policies", policyList.join(","));
            }
        }

        const response = await fetch(`/api/hotels?${params.toString()}`, { headers });
        if (!response.ok) throw new Error('Failed to fetch hotels');
        const result = await response.json();

        // Map backend PascalCase to camelCase
        const hotelsList = result.data || [];
        return hotelsList.map((h: any) => {
            // Calculate starting price from rooms if available
            const roomPrices = (h.rooms || []).map((r: any) => Number(r.total_fare || r.price || 0)).filter((p: number) => p > 0);
            const minRoomPrice = roomPrices.length > 0 ? Math.min(...roomPrices) : 0;

            return {
                id: h.id || h.hotel_code,
                name: h.name,
                location: h.address || h.location,
                amenities: h.facilities || h.amenities || [],
                stars: h.star_rating || h.stars || 0,
                image: (h.image_urls && h.image_urls[0]) || h.image || '',
                occupancy: h.occupancy || 0,
                // Fallbacks for missing fields in basic list
                price: h.price || minRoomPrice || 0,
                rating: h.rating || 4.5,
                description: h.description || '',
                primary_room_offer_id: (h.rooms && h.rooms.length > 0) ? h.rooms[0].id : null,
                type: h.type || 'Hotel'
            };
        });
    },

    /**
     * Fetch rooms for a specific hotel
     */
    async getRooms(hotelCode: string, token?: string): Promise<RoomType[]> {
        const headers: HeadersInit = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await fetch(`/api/hotels/${hotelCode}/rooms`, { headers });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to fetch rooms for hotel ${hotelCode}: ${response.status} ${errorText}`);
        }
        const result = await response.json();

        const roomsList = result.data || result || [];
        console.log("DEBUG: Raw Rooms Response:", roomsList); // Debug logging
        return (Array.isArray(roomsList) ? roomsList : []).map((r: any) => ({
            id: r.id,
            hotelId: r.hotel_id || r.hotelId || hotelCode,
            name: r.name,
            price: r.total_fare || r.price || 0,
            capacity: r.max_capacity || r.capacity || 0,
            inventory: r.count || r.inventory || 0,
            description: r.description || ''
        }));
    },

    /**
     * Fetch banquets for a specific hotel
     */
    async getBanquets(hotelCode: string, token?: string): Promise<Banquet[]> {
        const headers: HeadersInit = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await fetch(`/api/hotels/${hotelCode}/banquets`, { headers });
        if (!response.ok) throw new Error('Failed to fetch banquets');
        const result = await response.json();

        const banquetsList = result.data || result || [];
        return (Array.isArray(banquetsList) ? banquetsList : []).map((b: any) => ({
            id: b.id,
            name: b.name,
            capacity: b.capacity || 0,
            pricePerSlot: b.price_per_day || b.pricePerSlot || 0,
            facilities: b.facilities || []
        }));
    },

    /**
     * Fetch catering options for a specific hotel
     */
    async getCatering(hotelCode: string, token?: string): Promise<Catering[]> {
        const headers: HeadersInit = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await fetch(`/api/hotels/${hotelCode}/catering`, { headers });
        if (!response.ok) throw new Error('Failed to fetch catering');
        const result = await response.json();

        const cateringList = result.data || result || [];
        return (Array.isArray(cateringList) ? cateringList : []).map((c: any) => ({
            id: c.id,
            name: c.name,
            description: c.type || c.description || '', // Mapping Type to description since backend keeps it simple
            pricePerPerson: c.price_per_plate || c.pricePerPerson || 0,
            menuHighlights: c.menu_highlights || c.menuHighlights || []
        }));
    }
};
