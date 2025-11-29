import React from 'react';
import {Image, Pressable, StyleSheet, Text, View} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import type {EventSummary} from '../types/events';
import {useThemeColors} from '../theme/colors';

interface Props {
  event: EventSummary;
  isFavorite: boolean;
  onPress: () => void;
  onToggleFavorite: () => void;
}

const EventCard: React.FC<Props> = ({event, isFavorite, onPress, onToggleFavorite}) => {
  const colors = useThemeColors();
  const venueLine =
    [event.venue?.name, event.venue?.city, event.venue?.state].filter(Boolean).join(' • ') ||
    'Venue TBA';

  return (
    <Pressable style={[styles.container, {backgroundColor: colors.card, borderColor: colors.border}]} onPress={onPress}>
      {event.imageUrl ? (
        <Image source={{uri: event.imageUrl}} style={styles.image} resizeMode="cover" />
      ) : (
        <View style={[styles.image, styles.imagePlaceholder, {backgroundColor: colors.surface}]}>
          <MaterialIcons name="image-not-supported" size={32} color={colors.muted} />
        </View>
      )}
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={[styles.title, {color: colors.text}]} numberOfLines={2}>
            {event.name}
          </Text>
          <Pressable style={styles.favoriteButton} hitSlop={14} onPress={onToggleFavorite}>
            <MaterialIcons
              name={isFavorite ? 'favorite' : 'favorite-outline'}
              size={22}
              color={isFavorite ? colors.primary : colors.muted}
            />
          </Pressable>
        </View>
        <Text style={[styles.date, {color: colors.primary}]}>{event.formattedDate}</Text>
        <Text style={[styles.venue, {color: colors.muted}]} numberOfLines={2}>
          {venueLine}
        </Text>
        {event.category ? (
          <View style={[styles.badge, {backgroundColor: `${colors.primary}15`}]}>
            <Text style={[styles.badgeText, {color: colors.primary}]}>{event.category}</Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
  },
  image: {
    height: 180,
    width: '100%',
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
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
    fontSize: 16,
    fontWeight: '600',
  },
  favoriteButton: {
    marginLeft: 12,
  },
  date: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  venue: {
    marginTop: 4,
    fontSize: 13,
  },
  badge: {
    alignSelf: 'flex-start',
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});

export default EventCard;
