export interface Hotel {
    id: string;
    name: string;
    location: string;
    image: string;
    price: number;
    stars: number;
    rating: number;
    description: string;
    amenities: string[];
    type: string;
    discount?: number;
    occupancy: number;
    primary_room_offer_id?: string;
}

// --- Enums & Constants from Integration Guide ---

export const PROPERTY_TYPES = [
    "Hotel", "Resort", "Villa", "Apartment", "Hostel",
    "Plaza", "Suites", "Inn", "Towers", "Gardens", "Boutique"
] as const;

export const HALL_TYPES = [
    "Ballroom", "Lawn", "Poolside", "Banquet Hall",
    "Conference Hall", "Executive Lounge"
] as const;

export const DIETARY_OPTIONS = [
    "Veg", "Non-Veg", "Halal", "Jain", "Kosher", "Gluten-Free"
] as const;

export const ROOM_AMENITIES = [
    "WiFi", "TV", "AC", "Balcony", "Mini Bar", "Bathtub",
    "Kitchenette", "Jacuzzi", "Private Pool", "Butler Service"
] as const;

export const HOTEL_FACILITIES = [
    "WiFi", "Pool", "Restaurant", "Gym", "Spa", "Valet Parking",
    "Bar", "Nightclub", "Prayer Room", "Kids Club", "Playground",
    "Eco-friendly", "Green Certified", "Wheelchair Accessible",
    "Ground Floor Access", "Roll-in Shower", "Co-working Space",
    "High-speed Upload"
] as const;

export const LOCATION_TAGS = [
    "City Center", "Near Metro", "Near Beach"
] as const;

export const BANQUET_FEATURES = [
    "AV", "Projector", "Sound System", "Stage"
] as const;

export interface HotelFilters {
    // Core
    priceRange?: { min: number, max: number };
    starRating?: number;         // 3, 4, 5
    userRating?: number;         // 0-10
    propertyTypes?: string[];    // ["Resort", "Villa"]

    // Room
    guestsPerRoom?: number;
    roomCount?: number;
    roomConfig?: Array<{ occupancy: number, count: number }>; // Complex room config
    roomAmenities?: string[];    // ["Bathtub"]
    freeCancellation?: boolean;  // true/false for free_cancellation param

    // Event / Venue

    // Event / Venue
    hallType?: string;           // "Ballroom"
    hallCapacity?: number;       // 200
    banquetFeatures?: string[];  // ["AV"]
    minHallArea?: number;        // Added to match API cap req
    minCeilingHeight?: number;   // Added to match API cap req

    // Policies & Metadata
    policies?: {
        alcohol?: boolean;
        pets?: boolean;
        late_night?: boolean;
        outside_cake?: boolean;
        outside_decor?: boolean;
    };

    dietary?: string[];          // ["Halal", "Veg"]

    // Facilities (The "Master List" checkboxes)
    facilities?: string[];       // ["Spa", "Prayer Room", "Kids Club"]
    locationTags?: string[];     // ["Near Beach"]

    // Legacy support fields can be kept or removed based on clean-up requirements
    // Keeping minimal legacy for type safety elsewhere if needed strictly, 
    // but ideally we migrate to this structure.
    stars?: number; // legacy alias
    min_price?: number; // legacy alias
    max_price?: number; // legacy alias

    // Legacy room configurations (still used in UI)
    rooms_single?: number;
    rooms_double?: number;
    rooms_triple?: number;
    rooms_quad?: number;
}

export interface LocalFilterState {
    priceRange: [number, number];
    stars: number[];
    minRating: number | null;
    amenities: string[];
    type: string[];
    freeCancellation: boolean;
    mealPlan: string[];
    venueSetting: string[];
    guestCapacity: number | null;
    foodType: string[];
    petFriendly: boolean;
}

export const DEFAULT_FILTERS: LocalFilterState = {
    priceRange: [0, 50000],
    stars: [],
    minRating: null,
    amenities: [],
    type: [],
    freeCancellation: false,
    mealPlan: [],
    venueSetting: [],
    guestCapacity: null,
    foodType: [],
    petFriendly: false,
};

export interface RoomType {
    id: string;
    hotelId: string;
    name: string;
    capacity: number;
    price: number;
    description?: string;
    inventory: number;
    total_fare?: number;
    max_capacity?: number;
    count?: number;
    amenities?: string[];
}

export interface RoomsInventory {
    hotel_id: string;
    room_types: RoomType[];
}

export interface Banquet {
    id: number; // uint
    name: string;
    capacity: number;
    facilities: string[];
    pricePerSlot: number;
}

export interface Catering {
    id: number; // uint
    name: string;
    description: string;
    menuHighlights: string[];
    pricePerPerson: number;
}

export interface HotelDataWrapper<T> {
    data: T[];
}
