import React, {useEffect} from 'react';
import {StatusBar, StyleSheet, View} from 'react-native';
import {Provider} from 'react-redux';
import {enableScreens} from 'react-native-screens';
import {NavigationContainer} from '@react-navigation/native';
import Loading from './components/Loading';
import storeFactory from './store';
import {SCREEN_HEIGHT, SCREEN_WIDTH} from './constants/Constants';
import moment from 'moment';
import {insertDB} from './services/SampleService';
import {initConfig} from './config/config';

enableScreens();

const App = () => {
  useEffect(() => {
    StatusBar.setBarStyle('dark-content');
    startProcess(); 
  }, []);

  //for test use 
  const startProcess = async () => {
    const location = {
      timestamp: 0,
      coords: {
        latitude: 32.0609676,
        longitude: 34.8327349,
        accuracy: 16.4,
      },
    };
    location.timestamp = moment(location.timestamp).valueOf();
    await initConfig();
    await insertDB(location);
  };

  return (
    <View style={styles.container}>
      <Provider store={storeFactory()}>
        <NavigationContainer>
          <Loading />
        </NavigationContainer>
      </Provider>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
});

export default App;
