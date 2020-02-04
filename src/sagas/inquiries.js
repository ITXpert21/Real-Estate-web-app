import {call, put} from 'redux-saga/effects';
import {
  receiveInquiries
} from '../actions';
import InquiriesService from '../services/inquiries';


export function* fetchInquiries(filterParams) {
  const inquiries = yield call(InquiriesService.fetch, filterParams);
  yield put(receiveInquiries(inquiries));
}