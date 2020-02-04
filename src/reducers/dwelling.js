import {
    DWELLING_FIND_SUCCEEDED,
    DWELLING_SAVE_REQUESTED,
    DWELLING_SAVE_SUCCEEDED,
    DWELLINGS_FETCH_SUCCEEDED,
    CLEAR_DWELLINGS,
    DWELLINGS_LOADING,
    DWELLINGS_SEARCH_REQUESTED,
    DWELLINGS_SEARCH_SUCCEEDED,
    SEARCH_DWELLINGS_BY_KEYWORD,
    SEARCH_DWELLINGS_BY_KEYWORD_SUCCEEDED,
    DWELLING_CREATOR_REPLACEMENT_REQUESTED,
    DWELLINGS_CREATORS_REPLACEMENT_REQUESTED,
    SAVE_PARTIAL_DWELLING,
    DWELLING_FIND_REQUESTED,
    LOAD_MORE_DWELLINGS_FETCH_REQUESTED,
    LOAD_MORE_DWELLINGS_FETCH_SUCCEEDED,
    SEARCH_LOAD_MORE_DWELLINGS_FETCH_REQUESTED,
    SEARCH_LOAD_MORE_DWELLINGS_FETCH_SUCCEEDED,
    RECEIVE_FAVOURITE_LOAD_SUCCESSED,
    CLEAN_SEARCH_PARAMS,
    CLEAN_DWELLING_REQUESTED,
    MESSAGE_SEND_REQUESTED,
    MESSAGE_SEND_SUCCEEDED,
    MESSAGE_SEND_FAILED,
    MESSAGE_SEND_CLEAR,
    FILE_CONVERT_REQUESTED,
    FILE_CONVERT_SUCCEEDED,
    FILE_CONVERT_FAILED,
    VISIT_DWELLING,
    DWELLING_HEADER_IMAGE_SAVE_REQUESTED,
    DWELLING_HEADER_IMAGE_SAVE_SUCCEEDED
} from '../actions';
import {Dwelling} from '../model';

export default function dwelling(state = {saving: false, saved: false, visitedDwellings: []}, action) {
    switch (action.type) {
        case DWELLINGS_FETCH_SUCCEEDED:
            return {...state, dwellings: action.dwellings, loading: false};
        case CLEAR_DWELLINGS:
            return {...state, dwellings: []};
        case DWELLINGS_LOADING:
            return {...state, loading: true};
        case SAVE_PARTIAL_DWELLING:
            return {...state, dwelling: action.dwelling};
        case DWELLING_FIND_REQUESTED:
            return {...state, loading: true};
        case DWELLING_FIND_SUCCEEDED:
            return {...state, loading: false, dwelling: action.dwelling};
        case DWELLING_SAVE_REQUESTED:
            return {...state, saving: true, saved: false};
        case DWELLING_SAVE_SUCCEEDED:
            return {
                ...state,
                saving: false,
                saved: true
            };
        case CLEAN_DWELLING_REQUESTED:
            return {
                ...state,
                saving: false,
                dwelling: new Dwelling(),
                saved: false
            };
        case DWELLINGS_SEARCH_REQUESTED:
            return {
                ...state,
                searchParams: action.searchParams,
                loading: true
            };
        case DWELLINGS_SEARCH_SUCCEEDED:
            return {
                ...state,
                searchedDwellings: action.dwellings,
                loading: false,
                totalCount: action.totalCount,
                locations: action.locations
            };
        case SEARCH_LOAD_MORE_DWELLINGS_FETCH_REQUESTED:
            return {
                ...state,
                searchParams: action.searchParams,
                loadingFetchMoreDwellings: true
            };
        case SEARCH_LOAD_MORE_DWELLINGS_FETCH_SUCCEEDED:
            return {
                ...state,
                searchedDwellings: action.dwellings,
                loadingFetchMoreDwellings: false,
                totalCount: action.totalCount
            };
        case SEARCH_DWELLINGS_BY_KEYWORD:
            return {
                ...state,
                searchParams: action.searchParams,
                loadingDwellingsByKeyword: true
            };
        case SEARCH_DWELLINGS_BY_KEYWORD_SUCCEEDED:
            return {
                ...state,
                searchedDwellings: action.dwellings,
                totalCount: action.totalCount,
                locations: action.locations,
                loadingDwellingsByKeyword: false
            };
        case DWELLING_CREATOR_REPLACEMENT_REQUESTED:
            return {...state, changeParams: action.changeParams};
        case DWELLINGS_CREATORS_REPLACEMENT_REQUESTED:
            return {...state, changeParams: action.changeParams};
        case LOAD_MORE_DWELLINGS_FETCH_REQUESTED:
            return {
                ...state,
                searchParams: action.searchParams,
                loading: true
            };
        case LOAD_MORE_DWELLINGS_FETCH_SUCCEEDED:
            return {
                ...state,
                dwellings: action.dwellings,
                loading: false,
                totalCount: action.totalCount
            };
        case RECEIVE_FAVOURITE_LOAD_SUCCESSED:
            return {...state, dwellings_favourite: action.dwellings_favourite};
        case CLEAN_SEARCH_PARAMS:
            return {...state, searchParams: null};
        case MESSAGE_SEND_REQUESTED:
            return {...state, sendingMessage: true, messageSent: false};
        case MESSAGE_SEND_SUCCEEDED:
            return {
                ...state,
                sendingMessage: false,
                messageSent: true,
                messageFailed: false
            };
        case MESSAGE_SEND_FAILED:
            return {
                ...state,
                sendingMessage: false,
                messageSent: false,
                messageFailed: true
            };
        case MESSAGE_SEND_CLEAR:
            return {
                ...state,
                sendingMessage: false,
                messageSent: false,
                messageFailed: false
            };
        case FILE_CONVERT_REQUESTED:
            return {
                ...state,
                savingFile: true,
                fileSaved: false,
                fileFailed: false
            };
        case FILE_CONVERT_SUCCEEDED:
            return {
                ...state,
                savingFile: false,
                fileSaved: true,
                fileFailed: false
            };
        case FILE_CONVERT_FAILED:
            return {
                ...state,
                savingFile: false,
                fileSaved: false,
                fileFailed: true
            };
        case VISIT_DWELLING: {
            const visitedDwellings = [...state.visitedDwellings, action.payload];
            return {
                ...state,
                visitedDwellings
            };
        }
        case DWELLING_HEADER_IMAGE_SAVE_REQUESTED:
            return {...state};
        case DWELLING_HEADER_IMAGE_SAVE_SUCCEEDED: {
            return {...state, result: action.result};
        }
        default:
            return state;
    }
}
