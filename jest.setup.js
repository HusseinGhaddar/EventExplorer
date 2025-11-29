/* eslint-disable no-undef */
require('react-native-gesture-handler/jestSetup');

jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));

jest.mock('react-native-mmkv', () => {
  class MockMMKV {
    constructor() {
      this.storage = {};
    }

    getString(key) {
      return this.storage[key] ?? null;
    }

    set(key, value) {
      this.storage[key] = value;
    }

    delete(key) {
      delete this.storage[key];
    }
  }

  return {MMKV: MockMMKV};
});

jest.mock('react-native-maps', () => {
  const React = require('react');
  const {View} = require('react-native');

  const MockMapView = props => React.createElement(View, props, props.children);
  const MockMarker = props => React.createElement(View, props, props.children);

  MockMapView.Marker = MockMarker;
  MockMapView.DEFAULT_PROPS = {};

  return MockMapView;
});

global.__reanimatedWorkletInit = () => {};
