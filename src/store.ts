import {createStore, applyMiddleware, compose} from 'redux';
import thunkMiddleware from 'redux-thunk';
import {offline} from '@redux-offline/redux-offline';
// @ts-ignore
import offlineConfig from '@redux-offline/redux-offline/src/defaults';
import reducers from './reducers';

let storeInstance: any;

export default function() {
  if (storeInstance) {
    return storeInstance;
  }

  const configOffline = {
    ...offlineConfig,
    rehydrate: true,
    persistOptions: {
      whitelist: [],
    },
  };

  let composeEnhancers = compose;

  if (__DEV__) {
    composeEnhancers =
      (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
  }

  storeInstance = createStore(
    reducers,
    {},
    composeEnhancers(applyMiddleware(thunkMiddleware), offline(configOffline)),
  );

  return storeInstance;
}
