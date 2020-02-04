import {

    INQUIRIES_FETCH_SUCCEEDED,
    INQUIRIES_FETCH_REQUESTED

} from '../actions';

export default function inquiries(state = {}, action) {
    switch (action.type) {
        case INQUIRIES_FETCH_SUCCEEDED:
                return {...state, inquiries: action.inquiries};

        default:
            return state;
    }
}
