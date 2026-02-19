export const mapLocalFiltersToApiFilters = (local: LocalFilterState, rooms: HotelFilters): HotelFilters => {
    const apiFilters: HotelFilters = { ...rooms };

    // 1. Core
    if (local.priceRange) {
        apiFilters.min_price = local.priceRange[0];
        apiFilters.max_price = local.priceRange[1];
        apiFilters.priceRange = { min: local.priceRange[0], max: local.priceRange[1] };
    }

    if (local.stars && local.stars.length > 0) {
        // API expects minimum star rating. We take the lowest selected.
        const minStar = Math.min(...local.stars);
        apiFilters.stars = minStar;
        apiFilters.starRating = minStar;
    }

    if (local.minRating) {
        apiFilters.userRating = local.minRating;
        // Legacy support if needed
        (apiFilters as any).rating = local.minRating;
    }

    if (local.type && local.type.length > 0) {
        // API expects single type or array. Our interface supports array.
        apiFilters.propertyTypes = local.type;
        // Legacy/Direct mapping if needed by buildHotelQuery
        (apiFilters as any).type = local.type[0];
    }

    // 2. Facilities & Amenities Mapping
    // We need to distribute 'amenities' from UI into 'room_amenities' vs 'facilities'
    // based on the Enums.
    const roomAmenitiesList: string[] = [];
    const facilityList: string[] = [];
    const banquetFeaturesList: string[] = [];

    local.amenities.forEach(a => {
        // Check if it's a known room amenity
        if (ROOM_AMENITIES.some(ra => ra.toLowerCase() === a.toLowerCase())) {
            roomAmenitiesList.push(a);
        }
        // Check if it's a known hotel facility
        else if (HOTEL_FACILITIES.some(hf => hf.toLowerCase() === a.toLowerCase())) {
            facilityList.push(a);
        }
        // Check if it's a banquet feature (just in case mixed in UI)
        else if (BANQUET_FEATURES.some(bf => bf.toLowerCase() === a.toLowerCase())) {
            banquetFeaturesList.push(a);
        }
        // Default to facility if unknown, or ignore? Let's default to facility.
        else {
            facilityList.push(a);
        }
    });

    if (roomAmenitiesList.length > 0) {
        apiFilters.roomAmenities = roomAmenitiesList;
        (apiFilters as any).room_amenities = roomAmenitiesList.join(',');
    }

    if (facilityList.length > 0) {
        apiFilters.facilities = facilityList;
        // apiFilters.facilities is string[] in interface? No, string in legacy, string[] in new?
        // Let's check types.ts. facilities?: string[] in new.
    }

    // 3. Venue Settings -> Facilities or Banquet Features?
    // "Venue Setting" in UI seems to be things like "Beachfront" (Location?) or "Ballroom" (Hall Type?)
    // Let's look at FilterPanel usage to be sure, but for now map to location/hall if possible.
    local.venueSetting.forEach(vs => {
        if (LOCATION_TAGS.some(lt => lt.toLowerCase() === vs.toLowerCase())) {
            apiFilters.locationTags = [...(apiFilters.locationTags || []), vs];
        } else if (HALL_TYPES.some(ht => ht.toLowerCase() === vs.toLowerCase())) {
            // If multiple selected, we might overwrite. API expects single hallType currently?
            // The interface has hallType?: string. 
            // If UI allows multiple, we pick first or send array if backend supports it.
            // Guide says: hallType?: string; // "Ballroom"
            if (!apiFilters.hallType) apiFilters.hallType = vs;
        } else {
            // Treat as general facility
            facilityList.push(vs);
        }
    });

    // 4. Food Type -> Dietary
    if (local.foodType.length > 0) {
        apiFilters.dietary = local.foodType;
    }

    // 5. Policies
    if (local.freeCancellation || local.petFriendly) {
        apiFilters.policies = apiFilters.policies || {};
        if (local.petFriendly) apiFilters.policies.pets = true;

        // Free Cancellation is now a top-level param
        if (local.freeCancellation) {
            apiFilters.freeCancellation = true;
        }
    }

    // 6. Guest Capacity overrides
    if (local.guestCapacity) {
        apiFilters.hallCapacity = local.guestCapacity;
    }

    // 7. Room Config Construction
    // Derive roomConfig from legacy fields if present in 'rooms' arg
    // The 'rooms' arg passed to this function usually contains legacy rooms_single etc from page.tsx logic
    const config = [];
    if (rooms.rooms_single) config.push({ occupancy: 1, count: rooms.rooms_single });
    if (rooms.rooms_double) config.push({ occupancy: 2, count: rooms.rooms_double });
    if (rooms.rooms_triple) config.push({ occupancy: 3, count: rooms.rooms_triple });
    if (rooms.rooms_quad) config.push({ occupancy: 4, count: rooms.rooms_quad });

    if (config.length > 0) {
        apiFilters.roomConfig = config;
    }

    // Merge lists back
    if (facilityList.length > 0) apiFilters.facilities = facilityList;
    if (banquetFeaturesList.length > 0) apiFilters.banquetFeatures = banquetFeaturesList;

    return apiFilters;
};

import {
    HotelFilters,
    LocalFilterState,
    ROOM_AMENITIES,
    HOTEL_FACILITIES,
    BANQUET_FEATURES,
    LOCATION_TAGS,
    HALL_TYPES
} from "./types";
