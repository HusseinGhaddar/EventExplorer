import React, {useMemo} from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {RouteProp, useRoute} from '@react-navigation/native';
import MapView, {Marker, PROVIDER_GOOGLE} from 'react-native-maps';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {useGetEventByIdQuery} from '../api/ticketmasterApi';
import type {RootStackParamList} from '../navigation/RootNavigator';
import {useAppDispatch, useAppSelector} from '../store/hooks';
import {toggleFavorite} from '../store/slices/favoritesSlice';
import {useThemeColors} from '../theme/colors';

type Route = RouteProp<RootStackParamList, 'EventDetails'>;

const EventDetailsScreen = () => {
  const colors = useThemeColors();
  const route = useRoute<Route>();
  const dispatch = useAppDispatch();
  const favorites = useAppSelector(state => state.favorites.entities);
  const {eventId, event: initialEvent} = route.params;
  const {data, isFetching, error, isError} = useGetEventByIdQuery(eventId, {
    skip: !eventId,
  });
  const event = data ?? initialEvent;
  const isFavorite = Boolean(event && favorites[event.id]);

  const region = useMemo(() => {
    if (!event?.venue?.latitude || !event.venue.longitude) {
      return undefined;
    }

    return {
      latitude: event.venue.latitude,
      longitude: event.venue.longitude,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    };
  }, [event?.venue?.latitude, event?.venue?.longitude]);

  const handleToggleFavorite = () => {
    if (event) {
      dispatch(toggleFavorite(event));
    }
  };

  const handleOpenTickets = async () => {
    if (!event?.ticketUrl) {
      return;
    }

    const supported = await Linking.canOpenURL(event.ticketUrl);
    if (supported) {
      Linking.openURL(event.ticketUrl);
    } else {
      Alert.alert('Unable to open link', 'This ticket URL cannot be opened on your device.');
    }
  };

  if (!event && isFetching) {
    return (
      <View style={[styles.center, {backgroundColor: colors.background}]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (!event) {
    return (
      <View style={[styles.center, {backgroundColor: colors.background, paddingHorizontal: 24}]}>
        <MaterialIcons name="error-outline" size={36} color={colors.danger} />
        <Text style={[styles.errorText, {color: colors.text, marginTop: 16}]}>
          {isError ? 'Unable to load event details.' : 'Event details are unavailable.'}
        </Text>
        {error && 'data' in error ? (
          <Text style={{color: colors.muted, textAlign: 'center', marginTop: 8}}>
            {error.data?.message ?? JSON.stringify(error.data)}
          </Text>
        ) : null}
      </View>
    );
  }

  const venueLine =
    [event.venue?.name, event.venue?.city, event.venue?.state].filter(Boolean).join(' • ') ||
    'Venue TBA';

  return (
    <ScrollView style={{flex: 1, backgroundColor: colors.background}}>
      {event.imageUrl ? (
        <Image source={{uri: event.imageUrl}} style={styles.headerImage} resizeMode="cover" />
      ) : null}
      <View style={[styles.content, {backgroundColor: colors.background}]}>
        <View style={styles.headerRow}>
          <Text style={[styles.title, {color: colors.text}]}>{event.name}</Text>
          <Pressable style={styles.favoriteButton} onPress={handleToggleFavorite}>
            <MaterialIcons
              name={isFavorite ? 'favorite' : 'favorite-outline'}
              size={26}
              color={isFavorite ? colors.primary : colors.muted}
            />
          </Pressable>
        </View>
        <Text style={[styles.date, {color: colors.primary}]}>{event.formattedDate}</Text>
        <Text style={[styles.venue, {color: colors.muted}]}>{venueLine}</Text>
        {event.category ? (
          <View style={[styles.badge, {backgroundColor: `${colors.primary}15`}]} testID="category-badge">
            <Text style={[styles.badgeText, {color: colors.primary}]}>{event.category}</Text>
          </View>
        ) : null}
        {event.description ? (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, {color: colors.text}]}>About this event</Text>
            <Text style={[styles.paragraph, {color: colors.muted}]}>{event.description}</Text>
          </View>
        ) : null}
        {event.additionalInfo ? (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, {color: colors.text}]}>Please note</Text>
            <Text style={[styles.paragraph, {color: colors.muted}]}>{event.additionalInfo}</Text>
          </View>
        ) : null}
        {event.priceRanges && event.priceRanges.length > 0 ? (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, {color: colors.text}]}>Price range</Text>
            {event.priceRanges.map((range, index) => (
              <Text key={`${range.type}-${index}`} style={[styles.paragraph, {color: colors.muted}]}>
                {range.type ? `${range.type}: ` : ''}
                {typeof range.min === 'number'
                  ? range.min.toLocaleString(undefined, {
                      style: 'currency',
                      currency: range.currency ?? 'USD',
                    })
                  : 'TBD'}
                {typeof range.max === 'number' && range.max !== range.min
                  ? ` - ${range.max.toLocaleString(undefined, {
                      style: 'currency',
                      currency: range.currency ?? 'USD',
                    })}`
                  : ''}
              </Text>
            ))}
          </View>
        ) : null}
        {event.ticketUrl ? (
          <Pressable style={[styles.primaryButton, {backgroundColor: colors.primary}]} onPress={handleOpenTickets}>
            <MaterialIcons name="open-in-new" size={18} color="#fff" />
            <Text style={styles.primaryButtonText}>Buy tickets</Text>
          </Pressable>
        ) : null}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, {color: colors.text}]}>Location</Text>
          {region ? (
            <View style={styles.mapContainer}>
              <MapView
                style={styles.map}
                provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
                initialRegion={region}
                showsCompass
                loadingEnabled>
                <Marker coordinate={region} title={event.venue?.name} description={venueLine} />
              </MapView>
            </View>
          ) : (
            <Text style={[styles.paragraph, {color: colors.muted}]}>
              Location information is not available for this venue yet.
            </Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  headerImage: {
    width: '100%',
    height: 240,
  },
  content: {
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  title: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700',
  },
  favoriteButton: {
    marginLeft: 12,
  },
  date: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '600',
  },
  venue: {
    marginTop: 4,
    fontSize: 14,
  },
  badge: {
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  section: {
    marginTop: 18,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 20,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 24,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
  },
  mapContainer: {
    width: '100%',
    height: 220,
    borderRadius: 16,
    overflow: 'hidden',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default EventDetailsScreen;
