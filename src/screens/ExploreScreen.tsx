import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useNavigation} from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {useLazySearchEventsQuery} from '../api/ticketmasterApi';
import type {EventSummary} from '../types/events';
import EventCard from '../components/EventCard';
import StateMessage from '../components/StateMessage';
import {useAppDispatch, useAppSelector} from '../store/hooks';
import {resetFilters, updateFilters, type EventCategory} from '../store/slices/filtersSlice';
import {toggleFavorite} from '../store/slices/favoritesSlice';
import {setThemePreference} from '../store/slices/themeSlice';
import type {RootStackParamList} from '../navigation/RootNavigator';
import {useThemeColors} from '../theme/colors';
import type {ThemePreference} from '../types/theme';

const CATEGORY_OPTIONS = [
  {label: 'All', value: 'all'},
  {label: 'Music', value: 'music'},
  {label: 'Sports', value: 'sports'},
  {label: 'Arts & Theatre', value: 'arts & theatre'},
  {label: 'Film', value: 'film'},
  {label: 'Misc', value: 'miscellaneous'},
] as const;

const categoryToClassification: Record<EventCategory, string | undefined> = {
  all: undefined,
  music: 'Music',
  sports: 'Sports',
  'arts & theatre': 'Arts & Theatre',
  film: 'Film',
  miscellaneous: 'Miscellaneous',
};

const RANDOM_CITIES = [
  'New York',
  'Los Angeles',
  'Chicago',
  'San Francisco',
  'Austin',
  'London',
  'Paris',
  'Berlin',
  'Tokyo',
  'Sydney',
];

type Navigation = NativeStackNavigationProp<RootStackParamList>;

const THEME_ORDER: ThemePreference[] = ['system', 'light', 'dark'];
const THEME_MODE_LABELS: Record<ThemePreference, string> = {
  system: 'Auto',
  light: 'Light',
  dark: 'Dark',
};
const THEME_MODE_ICONS: Record<ThemePreference, string> = {
  system: 'brightness-medium',
  light: 'light-mode',
  dark: 'dark-mode',
};

const ExploreScreen = () => {
  const colors = useThemeColors();
  const navigation = useNavigation<Navigation>();
  const dispatch = useAppDispatch();
  const filters = useAppSelector(state => state.filters);
  const favorites = useAppSelector(state => state.favorites.entities);
  const themePreference = useAppSelector(state => state.theme.mode);
  const [events, setEvents] = useState<EventSummary[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [hasMoreResults, setHasMoreResults] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [triggerSearch, {data, isFetching, isError, error}] = useLazySearchEventsQuery();
  const seededRandomCity = useRef(false);

  const searchDisabled = !filters.keyword.trim() && !filters.city.trim();
  const isInitialLoading = isFetching && events.length === 0;

  useEffect(() => {
    if (!data) {
      return;
    }
    setEvents(prev => (data.page === 0 ? data.events : [...prev, ...data.events]));
    setCurrentPage(data.page);
    setHasMoreResults(data.page < data.totalPages - 1);
  }, [data]);

  useEffect(() => {
    if (!isFetching) {
      setIsRefreshing(false);
    }
  }, [isFetching]);

  useEffect(() => {
    if (seededRandomCity.current) {
      return;
    }
    const hasFilters = filters.keyword.trim() || filters.city.trim();
    if (hasFilters || hasSearched) {
      return;
    }
    const city = RANDOM_CITIES[Math.floor(Math.random() * RANDOM_CITIES.length)];
    seededRandomCity.current = true;
    dispatch(updateFilters({city}));
  }, [dispatch, filters.city, filters.keyword, hasSearched]);

  useEffect(() => {
    const keyword = filters.keyword.trim();
    const city = filters.city.trim();

    if (!keyword && !city) {
      return;
    }

    const debounceId = setTimeout(() => handleSearch(0, {dismissKeyboard: false}), 400);

    return () => clearTimeout(debounceId);
  }, [filters.keyword, filters.city, filters.category, handleSearch]);

  const handleSearch = useCallback(
    (page = 0, options?: {dismissKeyboard?: boolean}) => {
      const keyword = filters.keyword.trim();
      const city = filters.city.trim();

      if (!keyword && !city) {
        return;
      }

      if (page === 0) {
        setEvents([]);
        setHasMoreResults(true);
        setIsRefreshing(hasSearched);
      } else {
        setIsRefreshing(false);
      }

      setHasSearched(true);

      triggerSearch({
        keyword,
        city,
        page,
        classificationName: filters.category ? categoryToClassification[filters.category] : undefined,
      });

      if (options?.dismissKeyboard ?? true) {
        Keyboard.dismiss();
      }
    },
    [filters, triggerSearch, hasSearched],
  );

  const loadNextPage = useCallback(() => {
    if (isFetching || !hasMoreResults) {
      return;
    }
    handleSearch(currentPage + 1);
  }, [handleSearch, currentPage, hasMoreResults, isFetching]);

  const errorMessage = useMemo(() => {
    if (!isError || !error) {
      return undefined;
    }

    if ('status' in error) {
      if (typeof error.status === 'string') {
        return error.error;
      }
      return `Request failed with status ${error.status}`;
    }

    return error.message ?? 'Something went wrong.';
  }, [error, isError]);

  const onResetFilters = () => {
    dispatch(resetFilters());
    setEvents([]);
    setHasSearched(false);
    setHasMoreResults(true);
  };

  const cycleThemePreference = useCallback(() => {
    const currentIndex = THEME_ORDER.indexOf(themePreference);
    const next = THEME_ORDER[(currentIndex + 1) % THEME_ORDER.length];
    dispatch(setThemePreference(next));
  }, [dispatch, themePreference]);

  const renderEvent = ({item}: {item: EventSummary}) => (
    <EventCard
      event={item}
      isFavorite={Boolean(favorites[item.id])}
      onPress={() => navigation.navigate('EventDetails', {eventId: item.id, event: item})}
      onToggleFavorite={() => dispatch(toggleFavorite(item))}
    />
  );

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <View style={[styles.searchContainer, {backgroundColor: colors.card, borderColor: colors.border}]}>
      <View style={styles.searchHeader}>
        <Text style={[styles.sectionTitle, {color: colors.text}]}>Search events</Text>
        <Pressable
          style={[
            styles.themeButton,
            {
              borderColor: colors.border,
              backgroundColor: colors.surface,
            },
          ]}
          onPress={cycleThemePreference}
          accessibilityRole="button"
          accessibilityLabel="Toggle color theme">
          <MaterialIcons name={THEME_MODE_ICONS[themePreference]} size={18} color={colors.text} />
          <Text style={[styles.themeButtonText, {color: colors.text}]}>
            {THEME_MODE_LABELS[themePreference]}
          </Text>
        </Pressable>
      </View>
        <TextInput
          placeholder="Keyword (artist, team, genre)"
          placeholderTextColor={colors.muted}
          style={[styles.input, {borderColor: colors.border, color: colors.text}]}
          value={filters.keyword}
          onChangeText={text => dispatch(updateFilters({keyword: text}))}
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
          onSubmitEditing={() => handleSearch(0)}
        />
        <TextInput
          placeholder="City"
          placeholderTextColor={colors.muted}
          style={[styles.input, {borderColor: colors.border, color: colors.text}]}
          value={filters.city}
          onChangeText={text => dispatch(updateFilters({city: text}))}
          autoCorrect={false}
          autoCapitalize="words"
          returnKeyType="search"
          onSubmitEditing={() => handleSearch(0)}
        />
        <View style={styles.categoryList}>
          {CATEGORY_OPTIONS.map(option => {
            const selected = filters.category === option.value;
            return (
              <Pressable
                key={option.value}
                onPress={() => dispatch(updateFilters({category: option.value}))}
                style={[
                  styles.categoryChip,
                  {
                    backgroundColor: selected ? `${colors.primary}20` : colors.surface,
                    borderColor: selected ? colors.primary : colors.border,
                  },
                ]}>
                <Text style={{color: selected ? colors.primary : colors.muted, fontWeight: '600'}}>
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <View style={styles.actionsRow}>
          <Pressable
            disabled={searchDisabled}
            onPress={() => handleSearch(0)}
            style={[
              styles.button,
              styles.buttonSpacing,
              {backgroundColor: searchDisabled ? colors.border : colors.primary},
            ]}>
            <Text style={{color: searchDisabled ? colors.muted : '#fff', fontWeight: '600'}}>Search</Text>
          </Pressable>
          <Pressable style={[styles.buttonOutline, {borderColor: colors.border}]} onPress={onResetFilters}>
            <Text style={{color: colors.text, fontWeight: '600'}}>Reset</Text>
          </Pressable>
        </View>
      </View>
      {errorMessage && events.length > 0 ? (
        <View style={[styles.errorBanner, {backgroundColor: `${colors.danger}12`, borderColor: colors.danger}]}>
          <Text style={{color: colors.danger}}>{errorMessage}</Text>
        </View>
      ) : null}
      <FlatList
        data={events}
        keyExtractor={item => item.id}
        renderItem={renderEvent}
        contentContainerStyle={[
          styles.listContent,
          events.length === 0 && !isInitialLoading ? styles.centerContent : undefined,
        ]}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => handleSearch(0)} tintColor={colors.primary} />}
        onEndReachedThreshold={0.4}
        onEndReached={loadNextPage}
        ListFooterComponent={
          isFetching && events.length > 0 ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : null
        }
        ListEmptyComponent={
          isInitialLoading ? (
            <ActivityIndicator color={colors.primary} size="large" style={{marginTop: 24}} />
          ) : isError ? (
            <StateMessage
              title="Unable to fetch events"
              description={errorMessage ?? 'Please check your connection and try again.'}
              iconName="error-outline"
              actionLabel="Try again"
              onAction={() => handleSearch(0)}
            />
          ) : hasSearched ? (
            <StateMessage
              title="No events found"
              description="Try adjusting the city or keyword and search again."
              iconName="sentiment-dissatisfied"
              actionLabel="Adjust filters"
              onAction={onResetFilters}
            />
          ) : (
            <StateMessage
              title="Start exploring"
              description="Search by city or keyword to find live events happening near you."
              iconName="travel-explore"
              actionLabel="Search events"
              onAction={() => handleSearch(0)}
            />
          )
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    margin: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  themeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  themeButtonText: {
    marginLeft: 6,
    fontSize: 12,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
    fontSize: 14,
  },
  categoryList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
    marginBottom: 12,
  },
  categoryChip: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    marginRight: 8,
    marginTop: 8,
  },
  actionsRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  button: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
  },
  buttonOutline: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  buttonSpacing: {
    marginRight: 12,
  },
  errorBanner: {
    marginHorizontal: 16,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 48,
  },
  centerContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  footerLoader: {
    paddingVertical: 24,
  },
});

export default ExploreScreen;
