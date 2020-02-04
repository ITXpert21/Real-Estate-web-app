import {
    VISIT_SAVE_REQUESTED,
    VISITS_FETCH_REQUESTED,
    VISITS_FETCH_SUCCEEDED,
    MORE_VISITS_FETCH_SUCCEEDED
} from '../actions';

export default function visit(state = {}, action) {
    switch (action.type) {
        case VISIT_SAVE_REQUESTED:
            return {...state, visit: action.visit};
        case VISITS_FETCH_REQUESTED:
            return {...state, visitsLoading: true, visitsLoaded: false};
        case VISITS_FETCH_SUCCEEDED:
            if (action.status === 'nuevo') {
                return {
                    ...state,
                    newVisits: action.visits,
                    visitsLoading: false,
                    visitsLoaded: true
                };
            } else if (action.status === 'confirmado') {
                return {
                    ...state,
                    confirmedVisits: action.visits,
                    visitsLoading: false,
                    visitsLoaded: true
                };
            } else if (action.status === 'finalizado') {
                return {
                    ...state,
                    finalizedVisits: action.visits,
                    visitsLoading: false,
                    visitsLoaded: true
                };
            } else if (action.status === 'friendShare') {
                return {
                    ...state,
                    friendVisits: action.visits,
                    visitsLoading: false,
                    visitsLoaded: true
                };
            }
            return {
                ...state,
                cancelledVisits: action.visits,
                visitsLoading: false,
                visitsLoaded: true
            };
        case MORE_VISITS_FETCH_SUCCEEDED:
            if (action.status === 'nuevo') {
                return {...state, newVisits: [...state.newVisits, ...action.visits]};
            } else if (action.status === 'confirmado') {
                return {...state, confirmedVisits: [...state.confirmedVisits, ...action.visits]};
            } else if (action.status === 'finalizado') {
                return {...state, finalizedVisits: [...state.finalizedVisits, ...action.visits]};
            }
            return {...state, cancelledVisits: [...state.cancelledVisits, ...action.visits]};
        default:
            return state;
    }
}
