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

global.__reanimatedWorkletInit = () => {};
