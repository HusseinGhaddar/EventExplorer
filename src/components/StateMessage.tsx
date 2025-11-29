import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {useThemeColors} from '../theme/colors';

interface Props {
  title: string;
  description: string;
  iconName?: string;
  actionLabel?: string;
  onAction?: () => void;
}

const StateMessage: React.FC<Props> = ({title, description, iconName = 'event-busy', actionLabel, onAction}) => {
  const colors = useThemeColors();
  return (
    <View style={styles.container}>
      {iconName ? <MaterialIcons name={iconName} size={36} color={colors.muted} /> : null}
      <Text style={[styles.title, {color: colors.text}]}>{title}</Text>
      <Text style={[styles.description, {color: colors.muted}]}>{description}</Text>
      {actionLabel && onAction ? (
        <Pressable style={[styles.button, {backgroundColor: colors.primary}]} onPress={onAction}>
          <Text style={styles.buttonLabel}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  button: {
    marginTop: 16,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 24,
  },
  buttonLabel: {
    color: 'white',
    fontWeight: '600',
  },
});

export default StateMessage;
