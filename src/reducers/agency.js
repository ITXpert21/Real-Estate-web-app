import {
  AGENCY_SAVE_SUCCEEDED,
  AGENCY_SAVE_FAILED,
  AGENCY_CLEAR_SAVED,
  AGENCY_SAVE_REQUESTED,
  AGENCY_FETCH_SUCCEEDED,
  AGENCY_DELETE_REQUESTED,
  AGENCY_DELETE_SUCCEEDED,
  AGENCY_SUSPEND_REQUESTED,
  AGENCY_SUSPEND_SUCCEEDED
} from '../actions';

export default function dwelling(state = {}, action) {
    switch (action.type) {
        case AGENCY_FETCH_SUCCEEDED:
            return {...state, agencies: action.agencies};
        case AGENCY_SAVE_REQUESTED:
            return {...state, saving: true};
        case AGENCY_SAVE_SUCCEEDED:
            return {...state, agency: null, saving: false, saved: true, unsaved: false};
        case AGENCY_SAVE_FAILED:
            return {...state, saving: false, saved: false, unsaved: true};
        case AGENCY_CLEAR_SAVED:
            return {...state, saved: false, unsaved: false};
        case AGENCY_DELETE_REQUESTED:
            return {...state, deleting: true};
        case AGENCY_DELETE_SUCCEEDED:
            return {...state, deleting: false, agencies: state.agencies.filter(agency => agency._id != action.agencyId)};
        case AGENCY_SUSPEND_REQUESTED:
            console.log('reducer AGENCY_SUSPEND_REQUESTED', action);
            return {...state, suspending: true};
        case AGENCY_SUSPEND_SUCCEEDED:
            const agencies = [...state.agencies];
            const agency = agencies.find(agency => agency._id === action.agencyId);
            agency.deleted = !agency.deleted;
            const index = agencies.findIndex(agency => agency._id === action.agencyId);
            agencies[index] = agency;
            return {...state, agencies: agencies, suspending: false};
        default:
            return state;
    }
}
