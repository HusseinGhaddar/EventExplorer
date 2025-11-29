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

// Some environments are failing to inject the env var at runtime.
// To keep the app functional, we fall back to the known key if needed.
const API_KEY = (TICKETMASTER_API_KEY || 'nw1Nn0ykN3p8ZdZQnvGHnP92Ik0WeLtC').trim();

// Optional: log once so you can see in DevTools whether the env is coming through.
if (__DEV__) {
  // eslint-disable-next-line no-console
  console.log(
    '[Ticketmaster] Using API key from',
    TICKETMASTER_API_KEY ? '.env' : 'fallback string',
  );
}

interface TicketmasterImage {
  url: string;
  width?: number;
  height?: number;
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
  genre?: {name?: string};
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
    latitude: venue.location?.latitude
      ? Number(venue.location.latitude)
      : undefined,
    longitude: venue.location?.longitude
      ? Number(venue.location.longitude)
      : undefined,
  };
};

const selectEventImage = (images?: TicketmasterImage[]): string | undefined => {
  if (!images?.length) {
    return undefined;
  }

  const normalizedImages = images
    .filter(img => Boolean(img.url))
    .map(img => ({
      ...img,
      url: img.url?.trim() ?? '',
    }))
    .filter(img => img.url.length > 0);

  if (normalizedImages.length === 0) {
    return undefined;
  }

  const preferredPool =
    normalizedImages.filter(img => (img.ratio ?? '').includes('16_9')) ||
    normalizedImages;

  const sorted = (preferredPool.length > 0 ? preferredPool : normalizedImages)
    .slice()
    .sort((a, b) => (b.width ?? 0) - (a.width ?? 0));

  const best = sorted[0];
  if (!best?.url) {
    return undefined;
  }

  if (best.url.startsWith('https://')) {
    return best.url;
  }

  if (best.url.startsWith('http://')) {
    return `https://${best.url.slice('http://'.length)}`;
  }

  if (best.url.startsWith('//')) {
    return `https:${best.url}`;
  }

  return best.url;
};

const transformEventSummary = (event: TicketmasterEvent): EventSummary => {
  const imageUrl = selectEventImage(event.images);

  const date =
    event.dates?.start?.dateTime ??
    (event.dates?.start?.localDate && event.dates?.start?.localTime
      ? `${event.dates.start.localDate}T${event.dates.start.localTime}`
      : event.dates?.start?.localDate);

  const classification = event.classifications?.[0];
  const segment = classification?.segment?.name;
  const genre = classification?.genre?.name;
  const category =
    segment && genre ? `${segment} / ${genre}` : segment || genre || undefined;

  return {
    id: event.id,
    name: event.name,
    date: date ?? 'TBD',
    formattedDate: formatEventDate(date),
    category,
    imageUrl,
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
      query: ({keyword, city, page = 0, size = 20, classificationName}) => ({
        url: '/events.json',
        params: {
          apikey: API_KEY,
          keyword: keyword || undefined,
          city: city || undefined,
          page,
          size,
          sort: 'date,asc',
          classificationName:
            classificationName &&
            classificationName.toLowerCase() !== 'all'
              ? classificationName
              : undefined,
        },
      }),
      transformResponse: (
        response: TicketmasterSearchResponse,
      ): EventSearchResult => {
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
      query: eventId => ({
        url: `/events/${eventId}.json`,
        params: {
          apikey: API_KEY,
        },
      }),
      transformResponse: (response: TicketmasterEvent): EventDetail =>
        transformEventDetail(response),
    }),
  }),
});

export const {
  useLazySearchEventsQuery,
  useGetEventByIdQuery,
  useSearchEventsQuery,
} = ticketmasterApi;
