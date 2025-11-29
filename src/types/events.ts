// src/types/events.ts

export interface EventVenue {
  id?: string;
  name?: string;
  city?: string;
  state?: string;
  country?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
}

export interface EventSummary {
  id: string;
  name: string;
  date: string;
  formattedDate: string;
  category?: string;
  imageUrl?: string;
  venue?: EventVenue;
}

export interface PriceRange {
  currency?: string;
  min?: number;
  max?: number;
  type?: string;
}

export interface EventDetail extends EventSummary {
  description?: string;
  additionalInfo?: string;
  ticketUrl?: string;
  priceRanges?: PriceRange[];
}

export interface EventSearchResult {
  events: EventSummary[];
  page: number;
  totalPages: number;
  totalElements: number;
}

export interface EventSearchArgs {
  keyword?: string;
  city?: string;
  page?: number;
  size?: number;
  classificationName?: string;
}
