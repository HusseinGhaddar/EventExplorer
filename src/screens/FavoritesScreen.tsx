import React, {useMemo} from 'react';
import {FlatList, StyleSheet, Text, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import EventCard from '../components/EventCard';
import StateMessage from '../components/StateMessage';
import {useAppDispatch, useAppSelector} from '../store/hooks';
import {toggleFavorite} from '../store/slices/favoritesSlice';
import {useThemeColors} from '../theme/colors';
import type {RootStackParamList} from '../navigation/RootNavigator';
import type {EventSummary} from '../types/events';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

const FavoritesScreen = () => {
  const navigation = useNavigation<Navigation>();
  const dispatch = useAppDispatch();
  const colors = useThemeColors();
  const favoritesMap = useAppSelector(state => state.favorites.entities);

  const favorites = useMemo(() => {
    return Object.values(favoritesMap).sort((a, b) => {
      const timeA = new Date(a.date).getTime();
      const timeB = new Date(b.date).getTime();
      return (Number.isNaN(timeA) ? 0 : timeA) - (Number.isNaN(timeB) ? 0 : timeB);
    });
  }, [favoritesMap]);

  const renderItem = ({item}: {item: EventSummary}) => (
    <EventCard
      event={item}
      isFavorite
      onPress={() => navigation.navigate('EventDetails', {eventId: item.id, event: item})}
      onToggleFavorite={() => dispatch(toggleFavorite(item))}
    />
  );

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <View style={styles.header}>
        <Text style={[styles.title, {color: colors.text}]}>Favorite events</Text>
        <Text style={[styles.subtitle, {color: colors.muted}]}>
          Saved events stay available offline. Tap any card for full details.
        </Text>
      </View>
      <FlatList
        data={favorites}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={[
          styles.listContent,
          favorites.length === 0 ? styles.centerContent : undefined,
        ]}
        ListEmptyComponent={
          <StateMessage
            title="No favorites yet"
            description="Favorite interesting events to create your personal watch list."
            iconName="favorite-border"
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
  },
  subtitle: {
    marginTop: 4,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  centerContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
});

export default FavoritesScreen;
