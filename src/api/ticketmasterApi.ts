import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react';
import {TICKETMASTER_API_KEY} from '@env';
import type {
  EventDetail,
  EventSearchArgs,
  EventSearchResult,
  EventSummary,
  EventVenue,
  PriceRange,
} from '../types/events';

const BASE_URL = 'https://app.ticketmaster.com/discovery/v2';
const API_KEY = TICKETMASTER_API_KEY?.trim();

interface TicketmasterImage {
  url: string;
  width?: number;
  ratio?: string;
}

interface TicketmasterVenue {
  id?: string;
  name?: string;
  city?: {name?: string};
  state?: {name?: string; stateCode?: string};
  country?: {name?: string};
  address?: {line1?: string};
  location?: {longitude?: string; latitude?: string};
}

interface TicketmasterClassification {
  segment?: {name?: string};
}

interface TicketmasterEvent {
  id: string;
  name: string;
  url?: string;
  info?: string;
  description?: string;
  pleaseNote?: string;
  images?: TicketmasterImage[];
  priceRanges?: PriceRange[];
  classifications?: TicketmasterClassification[];
  dates?: {
    start?: {
      dateTime?: string;
      localDate?: string;
      localTime?: string;
    };
  };
  _embedded?: {
    venues?: TicketmasterVenue[];
  };
}

interface TicketmasterPage {
  size: number;
  totalElements: number;
  totalPages: number;
  number: number;
}

interface TicketmasterSearchResponse {
  _embedded?: {
    events?: TicketmasterEvent[];
  };
  page: TicketmasterPage;
}

const formatEventDate = (dateInput?: string) => {
  if (!dateInput) {
    return 'Date TBD';
  }

  const date = new Date(dateInput);

  if (Number.isNaN(date.getTime())) {
    return dateInput;
  }

  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date);
  } catch {
    return date.toLocaleString();
  }
};

const transformVenue = (venue?: TicketmasterVenue): EventVenue | undefined => {
  if (!venue) {
    return undefined;
  }

  return {
    id: venue.id,
    name: venue.name,
    city: venue.city?.name,
    state: venue.state?.name ?? venue.state?.stateCode,
    country: venue.country?.name,
    address: venue.address?.line1,
    latitude: venue.location?.latitude ? Number(venue.location.latitude) : undefined,
    longitude: venue.location?.longitude ? Number(venue.location.longitude) : undefined,
  };
};

const transformEventSummary = (event: TicketmasterEvent): EventSummary => {
  const image = event.images?.sort((a, b) => (b.width ?? 0) - (a.width ?? 0))[0];
  const date =
    event.dates?.start?.dateTime ??
    (event.dates?.start?.localDate && event.dates?.start?.localTime
      ? `${event.dates.start.localDate}T${event.dates.start.localTime}`
      : event.dates?.start?.localDate);

  return {
    id: event.id,
    name: event.name,
    date: date ?? 'TBD',
    formattedDate: formatEventDate(date),
    category: event.classifications?.[0]?.segment?.name,
    imageUrl: image?.url,
    venue: transformVenue(event._embedded?.venues?.[0]),
  };
};

const transformEventDetail = (event: TicketmasterEvent): EventDetail => {
  const summary = transformEventSummary(event);
  return {
    ...summary,
    description: event.description ?? event.info,
    additionalInfo: event.pleaseNote,
    ticketUrl: event.url,
    priceRanges: event.priceRanges,
  };
};

export const ticketmasterApi = createApi({
  reducerPath: 'ticketmasterApi',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: headers => {
      headers.set('Accept', 'application/json');
      return headers;
    },
  }),
  endpoints: builder => ({
    searchEvents: builder.query<EventSearchResult, EventSearchArgs>({
      query: ({keyword, city, page = 0, size = 20, classificationName}) => {
        if (!API_KEY) {
          throw new Error('Ticketmaster API key is missing. Please set it in your .env file.');
        }

        return {
          url: '/events.json',
          params: {
            apikey: API_KEY,
            keyword: keyword || undefined,
            city: city || undefined,
            page,
            size,
            sort: 'date,asc',
            classificationName:
              classificationName && classificationName.toLowerCase() !== 'all'
                ? classificationName
                : undefined,
          },
        };
      },
      transformResponse: (response: TicketmasterSearchResponse): EventSearchResult => {
        const events = response._embedded?.events ?? [];
        return {
          events: events.map(transformEventSummary),
          page: response.page.number,
          totalPages: response.page.totalPages,
          totalElements: response.page.totalElements,
        };
      },
    }),
    getEventById: builder.query<EventDetail, string>({
      query: eventId => {
        if (!API_KEY) {
          throw new Error('Ticketmaster API key is missing. Please set it in your .env file.');
        }

        return {
          url: `/events/${eventId}.json`,
          params: {
            apikey: API_KEY,
          },
        };
      },
      transformResponse: (response: TicketmasterEvent): EventDetail => transformEventDetail(response),
    }),
  }),
});

export const {
  useLazySearchEventsQuery,
  useGetEventByIdQuery,
  useSearchEventsQuery,
} = ticketmasterApi;
