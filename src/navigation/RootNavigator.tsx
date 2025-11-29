import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import MainTabNavigator from './MainTabNavigator';
import EventDetailsScreen from '../screens/EventDetailsScreen';
import type {EventSummary} from '../types/events';

export type RootStackParamList = {
  Tabs: undefined;
  EventDetails: {
    eventId: string;
    event?: EventSummary;
  };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Tabs" component={MainTabNavigator} options={{headerShown: false}} />
      <Stack.Screen
        name="EventDetails"
        component={EventDetailsScreen}
        options={{title: 'Event Details', animation: 'fade_from_bottom'}}
      />
    </Stack.Navigator>
  );
};

export default RootNavigator;
