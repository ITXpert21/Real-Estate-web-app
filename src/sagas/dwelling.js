/* global Blob */
import {call, put} from 'redux-saga/effects';
import {saveAs} from 'file-saver';

import {
    receiveDwellings,
    receiveFavoriteDwellings,
    notifyDwellingSavedSuccessfully,
    receiveOneDwelling,
    receiveFindedDwellings,
    receiveMoreFindedDwellings,
    notifyCreatorReplacementSuccessfully,
    notifyCreatorsReplacementSuccessfully,
    receiveLoadMoreDwellings,
    receiveLoadFavouritesSuccess,
    notifyMessageSentSuccessfully,
    notifyMessageSentFailed,
    notifyFileConvertedSuccessfully,
    notifyFileConvertedFailed,
    receiveFindedDwellingsByKeyword,
    notifyDwellingHeaderImageSuccessfully
} from '../actions';
import DwellingService from '../services/dwelling';
import UserService from '../services/user';

export function* saveDwelling({dwelling}) {
    yield call(DwellingService.save, dwelling);
    yield put(notifyDwellingSavedSuccessfully());
}

export function* fetchDwellings() {
    const dwellings = yield call(DwellingService.fetch);
    yield put(receiveDwellings(dwellings));
}

export function* fetchFavoriteDwellings() {
    const userProfile = yield call(UserService.getProfile);
    const dwellings = yield call(DwellingService.fetchFavorite, userProfile._id);
    yield put(receiveFavoriteDwellings(dwellings));
    // yield put(receiveDwellings(dwellings));
}

export function* findDwelling({id}) {
    const {dwelling} = yield call(DwellingService.find, id);
    yield put(receiveOneDwelling(dwelling));
}

export function* searchDwellings({searchParams}) {
    const {dwellings, totalCount, locations} = yield call(DwellingService.findSearch, searchParams);
    yield put(receiveFindedDwellings(dwellings, totalCount, locations));
}

export function* searchDwellingsByKeyword({searchParams}) {
    const {dwellings, totalCount, locations} = yield call(DwellingService.findSearch, searchParams);
    yield put(receiveFindedDwellingsByKeyword(dwellings, totalCount, locations));
}

export function* searchMoreDwellings({searchParams}) {
    const {dwellings, totalCount} = yield call(DwellingService.findSearch, searchParams);
    yield put(receiveMoreFindedDwellings(dwellings, totalCount));
}

export function* fetchLoadMoreDwellings({searchParams}) {
    const {dwellings, totalCount} = yield call(DwellingService.fetchLoadMore, searchParams);
    yield put(receiveLoadMoreDwellings(dwellings, totalCount));
}

export function* sendCommunicationMessage({data}) {
    const ret = yield call(DwellingService.sendMessage, data);
    if (ret.success) {
        yield put(notifyMessageSentSuccessfully());
    } else {
        yield put(notifyMessageSentFailed());
    }
}

export function* savePdfFile({data}) {
    const ret = yield call(DwellingService.savePdfFile, data.html);
    if (ret.success) {
        const myBlob = new Blob([new Uint8Array(ret.data.data)]);
        if (data.siocId) {
            saveAs(myBlob, `sioc_propiedad_${data.siocId}.pdf`);
        } else {
            saveAs(myBlob, 'lista_de_propiedades.pdf');
        }

        yield put(notifyFileConvertedSuccessfully());
    } else {
        yield put(notifyFileConvertedFailed());
    }
}

export function* requestFavoriteDwellingsMore({searchParams}) {
    let dwellingsFavouriteDefault = [];
    try {
        if (searchParams) {
            dwellingsFavouriteDefault = yield call(DwellingService.fetchFavoriteMore, searchParams);
        }

        yield put(receiveLoadFavouritesSuccess(dwellingsFavouriteDefault));
    } catch (error) {
        yield put({type: 'Fetch Failed', error});
    }
}

export function* replaceCreator({changeParams}) {
    const dwelling = yield call(DwellingService.replaceCreator, changeParams);
    yield put(receiveOneDwelling(dwelling));
    yield put(notifyCreatorReplacementSuccessfully());
}

export function* replaceAllCreators({changeParams}) {
    const usersByRole = yield call(DwellingService.replaceAllCreators, changeParams);
    yield put(notifyCreatorsReplacementSuccessfully());
}

export function* saveDwellingHeaderImage({data}) {
    const result = yield call(DwellingService.saveHeaderImage, data);
    yield put(notifyDwellingHeaderImageSuccessfully(result));
}
