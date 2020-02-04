import {call, put} from 'redux-saga/effects';
import {delay} from 'redux-saga';
import {
  notifyClientSavedSuccessfully,
  notifyClientSaveFailed,
  receiveClients,
  notifyClientDeletedSuccessfully,
  receiveClientsOptions,
  receiveClientFavorite,
  receiveActionResult
} from '../actions';
import ClientService from '../services/client';

export function* saveClient({client}) {
    const ret = yield call(ClientService.save, client);
    if (ret.success) {
        yield put(notifyClientSavedSuccessfully());
    } else {
        yield put(notifyClientSaveFailed());
    }
}

export function* fetchClients(filterParams) {
    const {clients, totalCount} = yield call(ClientService.fetch, filterParams);
    yield put(receiveClients(clients, totalCount));
}

export function* deleteClient({clientId}) {
    yield call(ClientService.delete, clientId);
    yield put(notifyClientDeletedSuccessfully(clientId));
}

export function* searchClients({term, hasUser}) {
    const clients = yield call(ClientService.search, term, hasUser);
    yield put(receiveClientsOptions(clients));
}

export function* favoriteToClients({data}) {
    const ret = yield call(ClientService.favorite_to_clients, data);
}

export function* removeFavoriteFromClient({data}) {
    const result = yield call(ClientService.remove_favorite_from_client, data);
    yield put(receiveActionResult(result));
}

export function* requestClientFavorite({data}) {
    const clientFavorite = yield call(ClientService.get_client_favorite, data);
    yield put(receiveClientFavorite(clientFavorite));
}

