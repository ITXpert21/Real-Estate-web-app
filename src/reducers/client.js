import {
  CLIENT_SAVE_REQUESTED,
  CLIENT_SAVE_SUCCEEDED,
  CLIENT_SAVE_FAILED,
  CLIENT_CLEAR_SAVED,
  CLIENT_CLEAR_REMOVED,
  CLIENT_FETCH_SUCCEEDED,
  CLIENT_DELETE_REQUESTED,
  CLIENT_DELETE_SUCCEEDED,
  CLIENT_SEARCH_SUCCEEDED,
  CLIENT_FETCH_REQUESTED,
  FAVORITE_TO_CLIENTS,
  CLIENT_FAVORITE_RECEIVED,
  RECEIVE_ACTION_RESULT, SET_ACTION_RESULT,
} from '../actions';

export default function client(state = {}, action) {
    switch (action.type) {
        case CLIENT_SAVE_REQUESTED:
            return {...state, saving: true};
        case CLIENT_SAVE_SUCCEEDED:
            return {...state, saving: false, saved: true, unsaved: false};
        case CLIENT_SAVE_FAILED:
            return {...state, saving: false, saved: false, unsaved: true};
        case CLIENT_CLEAR_SAVED:
            return {...state, saved: false, unsaved: false};
        case CLIENT_CLEAR_REMOVED:
            return {...state, deleted: false, deleting: false};
        case CLIENT_FETCH_REQUESTED:
            return {...state, isLoaded: false};
        case CLIENT_FETCH_SUCCEEDED:
            return {
                ...state,
                clients: action.clients,
                totalCount: action.totalCount,
                isLoaded: true
            };
        case CLIENT_DELETE_REQUESTED:
            return {...state, deleting: true, deleted: false};
        case CLIENT_DELETE_SUCCEEDED:
            return {...state, deleting: false, deleted: true, clients: state.clients.filter(client => client._id !== action.clientId)};
        case CLIENT_SEARCH_SUCCEEDED:
            return {...state, clientsOptions: action.clientsOptions};
        case FAVORITE_TO_CLIENTS:
            return {...state};
        case CLIENT_FAVORITE_RECEIVED:
            return {...state, favorite: action.clientFavorite};
        case RECEIVE_ACTION_RESULT:
            return {...state, actionResult: action.data.success};
        case SET_ACTION_RESULT:
            return {...state, actionResult: action.result};
        default:
            return state;
    }
}
