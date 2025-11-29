/**
 * Root App
 * Wires: Gesture handler + Safe area + Redux + Navigation
 */

import React from 'react';
import {StatusBar, useColorScheme} from 'react-native';
import {
  NavigationContainer,
  DarkTheme,
  DefaultTheme,
} from '@react-navigation/native';
import {Provider} from 'react-redux';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {GestureHandlerRootView} from 'react-native-gesture-handler';

import RootNavigator from './src/navigation/RootNavigator';
import store from './src/store';

function App(): React.JSX.Element {
  const scheme = useColorScheme();

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <Provider store={store}>
        <SafeAreaProvider>
          <NavigationContainer
            theme={scheme === 'dark' ? DarkTheme : DefaultTheme}>
            <StatusBar
              barStyle={scheme === 'dark' ? 'light-content' : 'dark-content'}
            />
            <RootNavigator />
          </NavigationContainer>
        </SafeAreaProvider>
      </Provider>
    </GestureHandlerRootView>
  );
}

export default App;
