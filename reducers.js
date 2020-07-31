import {combineReducers} from 'redux';
import {INITIAL_CONNECT_ATTEMPT} from './constants/actionTypes';

function visibleStateReducer(state = {}, action) {
  switch (action.type) {
    case INITIAL_CONNECT_ATTEMPT:
      console.log('initial connect attempt action');
      return {
        ...state,
        waiting_for_opponent: true,
        on_homepage: false,
        in_call: false,
      };
    default:
      console.log('default case in visibleStateReducer');
      return state;
  }
}

function streamInfoReducer(state = {}, action) {
  switch (action.type) {
    default:
      console.log('default case in streamInfoReducer');
      return state;
  }
}

const rootReducer = combineReducers({
  visible_state: visibleStateReducer,
  stream_info: streamInfoReducer,
});

export default rootReducer;
