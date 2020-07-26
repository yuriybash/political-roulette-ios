import {createStore, applyMiddleware, compose} from 'redux';
import immutableStateInvariant from 'redux-immutable-state-invariant';

// import thunk from "redux-thunk";

import rootReducer from './reducers';

export default function configureStore(preloadedState) {
  // const middlewares = [thunk];
  const middlewares = [];

  if (process.env.NODE_ENV !== 'production') {
    middlewares.push(immutableStateInvariant);
  }

  const middlewareEnhancer = applyMiddleware(...middlewares);

  const enhancers = [middlewareEnhancer];
  const composedEnhancer = compose(...enhancers);

  const store = createStore(rootReducer, preloadedState);

  return store;
}
