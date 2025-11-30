// src/screens/EventDetailsScreen.tsx
import React, {ReactNode, useCallback, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
  Image,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {RouteProp, useRoute} from '@react-navigation/native';
import {useGetEventByIdQuery} from '../api/ticketmasterApi';
import type {EventVenue, PriceRange} from '../types/events';
import {useThemeColors, type ThemeColors} from '../theme/colors';

type RootStackParamList = {
  EventDetails: {eventId: string};
};

type EventDetailsRouteProp = RouteProp<RootStackParamList, 'EventDetails'>;

const formatAddress = (venue?: EventVenue) => {
  if (!venue) {
    return undefined;
  }
  return [venue.address, venue.city, venue.state, venue.country]
    .filter(Boolean)
    .join(', ');
};

const toCurrency = (value?: number, currency?: string) => {
  if (value == null) {
    return undefined;
  }

  if (!currency) {
    return value.toString();
  }

  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      maximumFractionDigits: value % 1 === 0 ? 0 : 2,
    }).format(value);
  } catch {
    return `${value} ${currency}`;
  }
};

const formatPriceRange = (range: PriceRange) => {
  const min = toCurrency(range.min, range.currency);
  const max = toCurrency(range.max, range.currency);

  if (min && max) {
    return min === max ? min : `${min} - ${max}`;
  }

  return min ?? max ?? 'Pricing TBD';
};

interface InfoRowProps {
  icon: string;
  label: string;
  value?: ReactNode;
}

const EventDetailsScreen: React.FC = () => {
  const route = useRoute<EventDetailsRouteProp>();
  const {eventId} = route.params;
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const {data, isLoading, isError, refetch} = useGetEventByIdQuery(eventId);

  const InfoRow: React.FC<InfoRowProps> = ({icon, label, value}) => {
    if (!value) {
      return null;
    }

    return (
      <View style={styles.infoRow}>
        <MaterialIcons name={icon} size={18} color={colors.muted} style={styles.infoIcon} />
        <View style={styles.infoTextContainer}>
          <Text style={styles.infoLabel}>{label}</Text>
          <Text style={styles.infoValue}>{value}</Text>
        </View>
      </View>
    );
  };

  const openTickets = useCallback(() => {
    if (data?.ticketUrl) {
      Linking.openURL(data.ticketUrl);
    }
  }, [data?.ticketUrl]);

  const openInMaps = useCallback(() => {
    const venue: EventVenue | undefined = data?.venue;
    if (!venue) {
      return;
    }

    const {latitude, longitude, address, city} = venue;

    if (latitude && longitude) {
      const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
      Linking.openURL(url);
      return;
    }

    if (address || city) {
      const query = encodeURIComponent(`${address ?? ''} ${city ?? ''}`.trim());
      const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
      Linking.openURL(url);
    }
  }, [data?.venue]);

  const venue = data?.venue;
  const locationLine = formatAddress(venue);

  const descriptionText = data?.description?.trim();
  const safeDescription =
    descriptionText && descriptionText.length > 0 ? descriptionText : 'No description available.';
  const additionalInfoRaw = data?.additionalInfo?.trim();
  const additionalInfoDisplay =
    additionalInfoRaw && additionalInfoRaw.length > 0 ? additionalInfoRaw : undefined;

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
        <Text style={styles.subtitle}>Loading event...</Text>
      </View>
    );
  }

  if (isError || !data) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Failed to load event</Text>
        <TouchableOpacity onPress={refetch} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      {data.imageUrl ? (
        <Image
          source={{uri: data.imageUrl}}
          style={styles.heroImage}
          resizeMode="cover"
          accessibilityRole="image"
          accessibilityLabel={`${data.name} poster`}
        />
      ) : null}

      <Text style={styles.title}>{data.name}</Text>
      <Text style={styles.subtitle}>{data.formattedDate}</Text>
      {data.category ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{data.category}</Text>
        </View>
      ) : null}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Event details</Text>
        <InfoRow icon="schedule" label="Date & time" value={data.formattedDate} />
        <InfoRow
          icon="confirmation-number"
          label="Tickets"
          value={data.ticketUrl ? 'Available online' : 'Check venue website'}
        />
        {venue ? (
          <>
            <InfoRow icon="festival" label="Venue" value={venue.name ?? 'Venue TBA'} />
            <InfoRow
              icon="place"
              label="Location"
              value={locationLine ?? 'Location to be announced'}
            />
          </>
        ) : (
          <InfoRow icon="place" label="Location" value="Location to be announced" />
        )}
        {venue ? (
          <TouchableOpacity
            onPress={openInMaps}
            style={styles.secondaryButton}
            accessibilityRole="button">
            <Text style={styles.secondaryButtonText}>Open in Google Maps</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>About this event</Text>
        <Text style={styles.cardText}>{safeDescription}</Text>
        {additionalInfoDisplay ? (
          <View style={styles.additionalInfo}>
            <Text style={styles.cardSubtitle}>Additional info</Text>
            <Text style={styles.cardText}>{additionalInfoDisplay}</Text>
          </View>
        ) : null}
      </View>

      {data.priceRanges && data.priceRanges.length > 0 ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Price ranges</Text>
          {data.priceRanges.map((range, index) => (
            <View key={`${range.type ?? 'price'}-${index}`} style={styles.priceRow}>
              <Text style={styles.priceLabel}>{range.type ?? 'General'}</Text>
              <Text style={styles.priceValue}>{formatPriceRange(range)}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {data.ticketUrl && (
        <TouchableOpacity
          onPress={openTickets}
          style={styles.primaryButton}
          accessibilityRole="button">
          <Text style={styles.primaryButtonText}>Buy tickets</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      backgroundColor: colors.background,
    },
    container: {
      padding: 16,
      paddingBottom: 32,
      backgroundColor: colors.background,
    },
    heroImage: {
      width: '100%',
      height: 220,
      borderRadius: 16,
      marginBottom: 16,
      backgroundColor: colors.surface,
    },
    title: {
      fontSize: 22,
      fontWeight: '700',
      marginBottom: 4,
      color: colors.text,
    },
    subtitle: {
      fontSize: 14,
      color: colors.muted,
      marginBottom: 16,
    },
    badge: {
      alignSelf: 'flex-start',
      backgroundColor: `${colors.primary}1A`,
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 999,
      marginBottom: 16,
    },
    badgeText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.primary,
      textTransform: 'uppercase',
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 12,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 4,
      color: colors.text,
    },
    cardSubtitle: {
      fontSize: 14,
      fontWeight: '600',
      marginTop: 12,
      marginBottom: 4,
      color: colors.text,
    },
    cardText: {
      fontSize: 14,
      color: colors.text,
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginTop: 10,
    },
    infoIcon: {
      marginTop: 2,
      marginRight: 10,
    },
    infoTextContainer: {
      flex: 1,
    },
    infoLabel: {
      fontSize: 12,
      textTransform: 'uppercase',
      color: colors.muted,
    },
    infoValue: {
      fontSize: 15,
      color: colors.text,
      fontWeight: '500',
    },
    primaryButton: {
      marginTop: 16,
      backgroundColor: colors.primary,
      paddingVertical: 12,
      borderRadius: 24,
      alignItems: 'center',
    },
    primaryButtonText: {
      color: '#fff',
      fontWeight: '600',
      fontSize: 16,
    },
    secondaryButton: {
      marginTop: 8,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.primary,
      alignSelf: 'flex-start',
    },
    secondaryButtonText: {
      color: colors.primary,
      fontSize: 14,
      fontWeight: '500',
    },
    additionalInfo: {
      marginTop: 8,
    },
    priceRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 4,
    },
    priceLabel: {
      fontSize: 14,
      color: colors.muted,
      fontWeight: '500',
    },
    priceValue: {
      fontSize: 14,
      color: colors.text,
      fontWeight: '600',
    },
  });

export default EventDetailsScreen;
