import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import { connectRouter, routerMiddleware } from 'connected-react-router';
import { firebaseReducer, reactReduxFirebase } from 'react-redux-firebase';
import thunk from 'redux-thunk';
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';
import 'firebase/messaging';

import { composeWithDevTools } from 'redux-devtools-extension/developmentOnly';

import createHistory from 'history/createBrowserHistory';

import appReducer from '@/reducers/app';
import authReducer from '@/reducers/auth';
import reducers from '@/reducers';

console.log('start');
firebase.initializeApp(process.env.firebase);

const history = createHistory();

const rootReducer = combineReducers({
  app: appReducer,
  auth: authReducer,
  firebase: firebaseReducer,
  ...reducers,
});

const createStoreWithFirebase = compose(
  reactReduxFirebase(firebase, process.env.firebase),
  composeWithDevTools(applyMiddleware(routerMiddleware(history), thunk)),
)(createStore);

const store = createStoreWithFirebase(connectRouter(history)(rootReducer));

console.log('abc', store, history);

export { history };
export default store;
