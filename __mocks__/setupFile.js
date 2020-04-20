import mockAsyncStorage from '@react-native-community/async-storage/jest/async-storage-mock';
import { NativeModules } from 'react-native';

global.fetch = require('jest-fetch-mock');

NativeModules.RNCNetInfo = {
  getCurrentState: jest.fn(() => Promise.resolve()),
  addListener: jest.fn(),
  removeListeners: jest.fn(),
  getBundleId: jest.fn()
};


NativeModules.SettingsManager = {
  settings: {
    AppleLocale: 'he'
  }
};

NativeModules.I18nManager = {
  localeIdentifier: 'he'
};

jest.mock('@react-native-community/async-storage', () => mockAsyncStorage);

jest.mock('../src/database/Database.js', () => {
  const listSamples = jest.fn();

  const UserLocationsDatabase = function () {
    return { listSamples };
  };
  const containsObjectID = jest.fn();
  const addSickRecord = jest.fn();

  const IntersectionSickDatabase = function () {
    return { containsObjectID, addSickRecord };
  };

  const listAllWifiRecords = jest.fn();

  const WifiMacAddressDatabase = function () {
    return { listAllWifiRecords };
  };

  return { UserLocationsDatabase, IntersectionSickDatabase, WifiMacAddressDatabase };
});

jest.mock('react-native-device-info', () => {
  return {
    getVersion: jest.fn(() => Promise.resolve('1.0')),
    getApplicationName: jest.fn(() => Promise.resolve('My App')),
    getBundleId: jest.fn()
  };
});

jest.mock('react-native-network-info', () => {
  return {
    getBSSID: jest.fn(() => Promise.resolve('68:ff:7b:1c:dc:bf')),
    getSSID: jest.fn(() => Promise.resolve('Bechor'))
  };
});

jest.mock('react-native-wifi-reborn', () => {
  return {
    loadWifiList: jest.fn(() => Promise.resolve({
      ssid: 'Bechor',
      bssid: '68:ff:7b:1c:dc:bf',
      rssi: -30,
      startTime: 1586791810171,
      endTime: 0,
      connected: 1
    }))
  };
});

jest.mock('react-native-firebase', () => {
  const firebase = {
    messaging: jest.fn(() => {
      return {
        hasPermission: jest.fn(() => Promise.resolve(true)),
        subscribeToTopic: jest.fn(),
        unsubscribeFromTopic: jest.fn(),
        requestPermission: jest.fn(() => Promise.resolve(true)),
        getToken: jest.fn(() => Promise.resolve('myMockToken'))
      };
    }),
    notifications: jest.fn(() => {
      return {
        onNotification: jest.fn(),
        onNotificationDisplayed: jest.fn()
      };
    })
  };

  firebase.notifications.Android = {
    Channel: jest.fn(() => ({
      setDescription: jest.fn(),
      setSound: jest.fn(),
      enableVibration: jest.fn(),
      setVibrationPattern: jest.fn()
    })),
    Importance: {
      Max: {}
    }
  };

  return firebase;
});


jest.mock('react-native-background-timer', () => {
  return {
    runBackgroundTimer: jest.fn()
  };
});


jest.mock('../src/config/config.ts', () => {
  const originalModule = require('../src/config/default_config.json');
  return {
    __esModule: true,
    namedExport: jest.fn(),
    default: jest.fn(() => originalModule['com.hamagen.dev']),
  };
});
