import {createStore, applyMiddleware, compose} from 'redux';
import immutableStateInvariant from 'redux-immutable-state-invariant';

// import thunk from "redux-thunk";

import rootReducer from './reducers';

export default function configureStore(preloadedState) {
  // const middlewares = [thunk];
  console.log("L10")
  const middlewares = [];
  console.log("L12")

  if (process.env.NODE_ENV !== 'production') {
    middlewares.push(immutableStateInvariant);
  }

  const middlewareEnhancer = applyMiddleware(...middlewares);


  const enhancers = [middlewareEnhancer];
  const composedEnhancer = compose(...enhancers);

  console.log("preloaded state: ")
  console.log(preloadedState)


  const store = createStore(rootReducer, preloadedState);

  return store;
}
