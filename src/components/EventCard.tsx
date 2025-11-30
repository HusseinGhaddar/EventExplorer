import React, {useEffect, useRef} from 'react';
import {Animated, Image, Pressable, StyleSheet, Text, View} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import type {EventSummary} from '../types/events';
import {useThemeColors} from '../theme/colors';

interface Props {
  event: EventSummary;
  isFavorite: boolean;
  onPress: () => void;
  onToggleFavorite: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const EventCard: React.FC<Props> = ({event, isFavorite, onPress, onToggleFavorite}) => {
  const colors = useThemeColors();
  const venueLine =
    [event.venue?.name, event.venue?.city, event.venue?.state].filter(Boolean).join(' / ') ||
    'Venue TBA';
  const cardScale = useRef(new Animated.Value(1)).current;
  const iconScale = useRef(new Animated.Value(1)).current;
  const iconOpacity = useRef(new Animated.Value(1)).current;
  const hasAnimatedFavorite = useRef(false);

  const animateFavorite = () => {
    Animated.parallel([
      Animated.sequence([
        Animated.timing(iconScale, {
          toValue: 1.2,
          duration: 110,
          useNativeDriver: true,
        }),
        Animated.spring(iconScale, {
          toValue: 1,
          useNativeDriver: true,
          friction: 4,
          tension: 80,
        }),
      ]),
      Animated.sequence([
        Animated.timing(iconOpacity, {
          toValue: 0.8,
          duration: 90,
          useNativeDriver: true,
        }),
        Animated.timing(iconOpacity, {
          toValue: 1,
          duration: 90,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  };

  useEffect(() => {
    if (!hasAnimatedFavorite.current) {
      hasAnimatedFavorite.current = true;
      return;
    }
    animateFavorite();
  }, [isFavorite]);

  const handlePressIn = () => {
    Animated.spring(cardScale, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 50,
      bounciness: 0,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(cardScale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 35,
      bounciness: 6,
    }).start();
  };

  return (
    <AnimatedPressable
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          transform: [{scale: cardScale}],
        },
      ]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}>
      {event.imageUrl ? (
        <Image
          source={{uri: event.imageUrl}}
          style={styles.image}
          resizeMode="cover"
          accessibilityRole="image"
          accessibilityLabel={`${event.name} cover image`}
        />
      ) : (
        <View style={[styles.image, styles.imagePlaceholder, {backgroundColor: colors.surface}]}>
          <MaterialIcons name="image-not-supported" size={32} color={colors.muted} />
          <Text style={[styles.placeholderText, {color: colors.muted}]}>No image</Text>
        </View>
      )}
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={[styles.title, {color: colors.text}]} numberOfLines={2}>
            {event.name}
          </Text>
          <Pressable style={styles.favoriteButton} hitSlop={14} onPress={onToggleFavorite}>
            <Animated.View style={{transform: [{scale: iconScale}], opacity: iconOpacity}}>
              <MaterialIcons
                name={isFavorite ? 'favorite' : 'favorite-outline'}
                size={22}
                color={isFavorite ? colors.primary : colors.muted}
              />
            </Animated.View>
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
    </AnimatedPressable>
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
    backgroundColor: '#d1d5db',
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 24,
  },
  placeholderText: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '600',
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
