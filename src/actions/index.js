export const SIGN_OUT_REQUESTED = 'SIGN_OUT_REQUESTED';

export function requestSignOut() {
    return {type: SIGN_OUT_REQUESTED};
}

export const CLEAN_DWELLING_REQUESTED = ' CLEAN_DWELLING_REQUESTED';

export function requestCleanDwelling() {
    return {type: CLEAN_DWELLING_REQUESTED};
}

export const SAVE_PARTIAL_DWELLING = 'SAVE_PARTIAL_DWELLING';

export function savePartialDwelling(dwelling) {
    return {type: SAVE_PARTIAL_DWELLING, dwelling};
}

export const DWELLING_SAVE_REQUESTED = 'DWELLING_SAVE_REQUESTED ';
export const DWELLING_SAVE_SUCCEEDED = 'DWELLING_SAVE_SUCCEEDED ';

export function requestSaveDwelling(dwelling) {
    return {type: DWELLING_SAVE_REQUESTED, dwelling};
}

export function notifyDwellingSavedSuccessfully() {
    return {type: DWELLING_SAVE_SUCCEEDED};
}

export const DWELLINGS_FETCH_REQUESTED = 'DWELLINGS_FETCH_REQUESTED';
export const DWELLINGS_FETCH_SUCCEEDED = 'DWELLINGS_FETCH_SUCCEEDED';

export function requestDwellings() {
    return {type: DWELLINGS_FETCH_REQUESTED};
}

export function receiveDwellings(dwellings) {
    return {type: DWELLINGS_FETCH_SUCCEEDED, dwellings};
}

export const CLEAR_DWELLINGS = 'CLEAR_DWELLINGS';

export function clearDwellings() {
    return {type: CLEAR_DWELLINGS};
}

export const DWELLINGS_LOADING = 'DWELLINGS_LOADING';

export function dwellingsLoading() {
    return {type: DWELLINGS_LOADING};
}

export const FAVORITE_DWELLINGS_FETCH_REQUESTED = 'FAVORITE_DWELLINGS_FETCH_REQUESTED';
export const FAVORITE_DWELLINGS_FETCH_SUCCEEDED = 'FAVORITE_DWELLINGS_FETCH_SUCCEEDED';

export function requestFavoriteDwellings() {
    return {type: FAVORITE_DWELLINGS_FETCH_REQUESTED};
}

export function receiveFavoriteDwellings(dwellings) {
    return {type: FAVORITE_DWELLINGS_FETCH_SUCCEEDED, dwellings};
}


export const DWELLING_FIND_REQUESTED = 'DWELLING_FIND_REQUESTED';
export const DWELLING_FIND_SUCCEEDED = 'DWELLING_FIND_SUCCEEDED';

export function requestDwelling(id) {
    return {type: DWELLING_FIND_REQUESTED, id};
}

export function receiveOneDwelling(dwelling) {
    return {type: DWELLING_FIND_SUCCEEDED, dwelling};
}

export const MESSAGE_SEND_REQUESTED = 'MESSAGE_SEND_REQUESTED';
export const MESSAGE_SEND_SUCCEEDED = 'MESSAGE_SEND_SUCCESS';
export const MESSAGE_SEND_FAILED = 'MESSAGE_SEND_FAILED';
export const MESSAGE_SEND_CLEAR = 'MESSAGE_SEND_CLEAR';

export function requestSendMessage(data) {
    return {type: MESSAGE_SEND_REQUESTED, data};
}

export function notifyMessageSentSuccessfully() {
    return {type: MESSAGE_SEND_SUCCEEDED};
}

export function notifyMessageSentFailed() {
    return {type: MESSAGE_SEND_FAILED};
}

export function clearMessageSent() {
    return {type: MESSAGE_SEND_CLEAR};
}

export const FILE_CONVERT_REQUESTED = 'FILE_CONVERT_REQUESTED';
export const FILE_CONVERT_SUCCEEDED = 'FILE_CONVERT_SUCCEEDED';
export const FILE_CONVERT_FAILED = 'FILE_CONVERT_FAILED';

export function requestFileConvert(data) {
    return {type: FILE_CONVERT_REQUESTED, data};
}

export function notifyFileConvertedSuccessfully() {
    return {type: FILE_CONVERT_SUCCEEDED};
}

export function notifyFileConvertedFailed() {
    return {type: FILE_CONVERT_FAILED};
}

export const DWELLINGS_SEARCH_REQUESTED = 'DWELLINGS_SEARCH_REQUESTED';
export const DWELLINGS_SEARCH_SUCCEEDED = 'DWELLINGS_SEARCH_SUCCEEDED';

export function requestFindDwellings(searchParams) {
    return {type: DWELLINGS_SEARCH_REQUESTED, searchParams};
}

export function receiveFindedDwellings(dwellings, totalCount = 0, locations) {
    return {type: DWELLINGS_SEARCH_SUCCEEDED, dwellings, totalCount, locations};
}

export const DWELLING_CREATOR_REPLACEMENT_REQUESTED = 'DWELLING_CREATOR_REPLACEMENT_REQUESTED';
export const DWELLING_CREATOR_REPLACEMENT_SUCCEEDED = 'DWELLING_CREATOR_REPLACEMENT_SUCCEEDED';

export function requestReplaceCreator(changeParams) {
    return {type: DWELLING_CREATOR_REPLACEMENT_REQUESTED, changeParams};
}

export function notifyCreatorReplacementSuccessfully() {
    return {type: DWELLING_CREATOR_REPLACEMENT_SUCCEEDED};
}

export const DWELLINGS_CREATORS_REPLACEMENT_REQUESTED = 'DWELLINGS_CREATORS_REPLACEMENT_REQUESTED';
export const DWELLINGS_CREATORS_REPLACEMENT_SUCCEEDED = 'DWELLINGS_CREATORS_REPLACEMENT_SUCCEEDED';

export function requestReplaceAllCreators(changeParams) {
    return {type: DWELLINGS_CREATORS_REPLACEMENT_REQUESTED, changeParams};
}

export function notifyCreatorsReplacementSuccessfully() {
    return {type: DWELLINGS_CREATORS_REPLACEMENT_SUCCEEDED};
}

export const DWELLING_HEADER_IMAGE_SAVE_REQUESTED = 'DWELLING_HEADER_IMAGE_SAVE_REQUESTED';
export const DWELLING_HEADER_IMAGE_SAVE_SUCCEEDED = 'DWELLING_HEADER_IMAGE_SAVE_SUCCEEDED';
export function requestSaveDwellingHeaderImage(data) {
    return {type: DWELLING_HEADER_IMAGE_SAVE_REQUESTED, data};
}

export function notifyDwellingHeaderImageSuccessfully(result) {
    return {type: DWELLING_HEADER_IMAGE_SAVE_SUCCEEDED, result};
}

export const USER_PROFILE_REQUESTED = 'USER_PROFILE_REQUESTED';
export const USER_PROFILE_SUCCEEDED = 'USER_PROFILE_SUCCEEDED';

export function requestUserProfile() {
    return {type: USER_PROFILE_REQUESTED};
}

export function receiveUserProfile(userProfile) {
    return {type: USER_PROFILE_SUCCEEDED, userProfile};
}

export const USER_SAVE_REQUESTED = 'USER_SAVE_REQUESTED';
export const USER_SAVE_SUCCEEDED = 'USER_SAVE_SUCCEEDED';
export const USER_SAVE_FAILED = 'USER_SAVE_FAILED';
export const USER_CLEAR_SAVED = 'USER_CLEAR_SAVED';
export const USER_ADD_FAVORITE = 'USER_ADD_FAVORITE';
export const FAVORITE_TO_CLIENTS = 'FAVORITE_TO_CLIENTS';

export function requestSaveUser(user) {
    return {type: USER_SAVE_REQUESTED, user};
}

export function requestAddFavorite(data) {
    return {type: USER_ADD_FAVORITE, data};
}

export function requestFavoriteToClients(data) {
    return {type: FAVORITE_TO_CLIENTS, data};
}

export const REMOVE_FAVORITE_FROM_CLIENT = 'REMOVE_FAVORITE_FROM_CLIENT';
export function requestRemoveFavoriteFromClient(data) {
    return {type: REMOVE_FAVORITE_FROM_CLIENT, data};
}
export const SET_ACTION_RESULT = 'SET_ACTION_RESULT';
export function setActionResult(result) {
    return {type: SET_ACTION_RESULT, result};
}
export const RECEIVE_ACTION_RESULT = 'RECEIVE_ACTION_RESULT';
export function receiveActionResult(data) {
    return {type: RECEIVE_ACTION_RESULT, data};
}

export const CLIENT_FAVORITE_REQUESTED = 'CLIENT_FAVORITE_REQUESTED';
export const CLIENT_FAVORITE_RECEIVED = 'CLIENT_FAVORITE_RECEIVED';
export function requestClientFavorite(data) {
    return {type: CLIENT_FAVORITE_REQUESTED, data};
}

export function receiveClientFavorite(clientFavorite) {
  return {type: CLIENT_FAVORITE_RECEIVED, clientFavorite};
}

export function notifyUserSavedSuccessfully() {
    return {type: USER_SAVE_SUCCEEDED};
}

export function notifyUserSaveFailed() {
    return {type: USER_SAVE_FAILED};
}

export function clearUserSaved() {
    return {type: USER_CLEAR_SAVED};
}

export const USERS_BYROLE_REQUESTED = 'USERS_BYROLE_REQUESTED';
export const USERS_BYROLE_SUCCEEDED = 'USERS_BYROLE_SUCCEEDED';

export function requestUsersByRole(role) {
    return {type: USERS_BYROLE_REQUESTED, role};
}

export function receiveUsersByRole(usersByRole) {
    return {type: USERS_BYROLE_SUCCEEDED, usersByRole};
}

export const CLEAR_USERS_BY_ROLE = 'CLEAR_USERS_BY_ROLE';

export function clearUsersByRole() {
    return {type: CLEAR_USERS_BY_ROLE};
}

export const USERS_SEARCH_REQUESTED = 'USERS_SEARCH_REQUESTED';
export const USERS_SEARCH_SUCCEEDED = 'EMPLOYEES_SEARCH_SUCCEEDED';

export function requestSearchUsers(term, userType, agency) {
    return {
        type: USERS_SEARCH_REQUESTED,
        term,
        userType,
        agency
    };
}

export function receiveUsersOptions(usersOptions, userType) {
    return {type: USERS_SEARCH_SUCCEEDED, usersOptions, userType};
}

export const USER_ROLE_CHANGE_REQUESTED = 'USER_ROLE_CHANGE_REQUESTED';
export const USER_ROLE_CHANGE_SUCCEEDED = 'USER_ROLE_CHANGE_SUCCEEDED';

export function requestChangeUserRole(changeParams) {
    return {type: USER_ROLE_CHANGE_REQUESTED, changeParams};
}

export function notifyUserRoleChangedSuccessfully(usersOptions) {
    return {type: USER_ROLE_CHANGE_SUCCEEDED, usersOptions};
}

export const CLEAR_USERS = 'CLEAR_USERS';

export function clearUsers() {
    return {type: CLEAR_USERS};
}

export const LOAD_MORE_USERS_FETCH_REQUESTED = 'LOAD_MORE_USERS_FETCH_REQUESTED';
export const LOAD_MORE_USERS_FETCH_SUCCEEDED = 'LOAD_MORE_USERS_FETCH_SUCCEEDED';

export function requestLoadMoreUsers(searchParams) {
    return {type: LOAD_MORE_USERS_FETCH_REQUESTED, searchParams};
}

export function receiveLoadMoreUsers(users) {
    return {type: LOAD_MORE_USERS_FETCH_SUCCEEDED, users};
}

export const LOAD_MORE_DWELLINGS_FETCH_REQUESTED = 'LOAD_MORE_DWELLINGS_FETCH_REQUESTED';
export const LOAD_MORE_DWELLINGS_FETCH_SUCCEEDED = 'LOAD_MORE_DWELLINGS_FETCH_SUCCEEDED';

export function requestLoadMoreDwellings(searchParams) {
    return {type: LOAD_MORE_DWELLINGS_FETCH_REQUESTED, searchParams};
}

export const SEARCH_LOAD_MORE_DWELLINGS_FETCH_REQUESTED = 'SEARCH_LOAD_MORE_DWELLINGS_FETCH_REQUESTED';
export const SEARCH_LOAD_MORE_DWELLINGS_FETCH_SUCCEEDED = 'SEARCH_LOAD_MORE_DWELLINGS_FETCH_SUCCEEDED';

export function requestSearchLoadMoreDwellings(searchParams) {
    return {type: SEARCH_LOAD_MORE_DWELLINGS_FETCH_REQUESTED, searchParams};
}

export const SEARCH_DWELLINGS_BY_KEYWORD = 'SEARCH_DWELLINGS_BY_KEYWORD';
export const SEARCH_DWELLINGS_BY_KEYWORD_SUCCEEDED = 'SEARCH_DWELLINGS_BY_KEYWORD_SUCCEEDED';

export function requestSearchDwellingsByKeyword(searchParams) {
    return {type: SEARCH_DWELLINGS_BY_KEYWORD, searchParams};
}

export function receiveFindedDwellingsByKeyword(dwellings, totalCount, locations) {
    return {
        type: SEARCH_DWELLINGS_BY_KEYWORD_SUCCEEDED,
        dwellings,
        totalCount,
        locations
    };
}

export function receiveMoreFindedDwellings(dwellings, totalCount = 0) {
    return {type: SEARCH_LOAD_MORE_DWELLINGS_FETCH_SUCCEEDED, dwellings, totalCount};
}

export function receiveLoadMoreDwellings(dwellings, totalCount = 0) {
    return {type: LOAD_MORE_DWELLINGS_FETCH_SUCCEEDED, dwellings, totalCount};
}

export const SET_MAP_REFS = 'SET_MAP_REFS';

export function setMapRefs(currentPosition) {
    return {type: SET_MAP_REFS, currentPosition};
}

export const AGENCY_FETCH_REQUESTED = 'AGENCY_FETCH_REQUESTED ';
export const AGENCY_FETCH_SUCCEEDED = 'AGENCY_FETCH_SUCCEEDED ';

export function requestAgencies() {
    return {type: AGENCY_FETCH_REQUESTED};
}


export function receiveAgencies(agencies) {
    return {type: AGENCY_FETCH_SUCCEEDED, agencies};
}

export const INQUIRIES_FETCH_REQUESTED = 'INQUIRIES_FETCH_REQUESTED ';
export const INQUIRIES_FETCH_SUCCEEDED = 'INQUIRIES_FETCH_SUCCEEDED ';

export function requestInquiries(filterParams) {
    return {type: INQUIRIES_FETCH_REQUESTED, filterParams};
}

export function receiveInquiries(inquiries) {

    return {type: INQUIRIES_FETCH_SUCCEEDED, inquiries};
}


export const AGENCY_SAVE_REQUESTED = 'AGENCY_SAVE_REQUESTED ';
export const AGENCY_SAVE_SUCCEEDED = 'AGENCY_SAVE_SUCCEEDED ';
export const AGENCY_SAVE_FAILED = 'AGENCY_SAVE_FAILED';
export const AGENCY_CLEAR_SAVED = 'AGENCY_SAVE_FAILED';

export function requestSaveAgency(agency) {
    return {type: AGENCY_SAVE_REQUESTED, agency};
}

export function notifyAgencySavedSuccessfully() {
    return {type: AGENCY_SAVE_SUCCEEDED};
}

export function notifyAgencySaveFailed() {
    return {type: AGENCY_SAVE_FAILED};
}

export function clearAgencySaved() {
    return {type: AGENCY_CLEAR_SAVED};
}

export const AGENCY_DELETE_REQUESTED = 'AGENCY_DELETE_REQUESTED';
export const AGENCY_DELETE_SUCCEEDED = 'AGENCY_DELETE_SUCCEEDED';

export function requestDeleteAgency(agency) {
    return {type: AGENCY_DELETE_REQUESTED, agency};
}

export function notifyAgencyDeletedSuccessfully(agencyId) {
    return {type: AGENCY_DELETE_SUCCEEDED, agencyId};
}

export const AGENCY_SUSPEND_REQUESTED = 'AGENCY_SUSPEND_REQUESTED';
export const AGENCY_SUSPEND_SUCCEEDED = 'AGENCY_SUSPEND_SUCCEEDED';

export function requestSuspendAgency(agencyId) {
  return {type: AGENCY_SUSPEND_REQUESTED, agencyId};
}

export function notifyAgencySuspendedSuccessfully(agencyId) {
  return {type: AGENCY_SUSPEND_SUCCEEDED, agencyId};
}

export const USER_FETCH_REQUESTED = 'USER_FETCH_REQUESTED ';
export const USER_FETCH_SUCCEEDED = 'USER_FETCH_SUCCEEDED ';

export function requestUsers() {
    return {type: USER_FETCH_REQUESTED};
}

export function receiveUsers(users) {
    return {type: USER_FETCH_SUCCEEDED, users};
}

export const USER_FIND_REQUESTED = 'USER_FIND_REQUESTED ';
export const USER_FIND_SUCCEEDED = 'USER_FIND_SUCCEEDED ';

export function requestUser(id) {
    return {type: USER_FIND_REQUESTED, id};
}

export function receiveOneUser(user) {
    return {type: USER_FIND_SUCCEEDED, user};
}

export const USER_DELETE_REQUESTED = 'USER_DELETE_REQUESTED';
export const USER_DELETE_SUCCEEDED = 'USER_DELETE_SUCCEEDED';

export function requestDeleteUser(userId) {
    return {type: USER_DELETE_REQUESTED, userId};
}

export function notifyUserDeletedSuccessfully(userId) {
    return {type: USER_DELETE_SUCCEEDED, userId};
}

export const CLIENT_SAVE_REQUESTED = 'CLIENT_SAVE_REQUESTED';
export const CLIENT_SAVE_SUCCEEDED = 'CLIENT_SAVE_SUCCEEDED';
export const CLIENT_SAVE_FAILED = 'CLIENT_SAVE_FAILED';
export const CLIENT_CLEAR_SAVED = 'CLIENT_CLEAR_SAVED';
export const CLIENT_CLEAR_REMOVED = 'CLIENT_CLEAR_REMOVED';

export function requestSaveClient(client) {
    return {type: CLIENT_SAVE_REQUESTED, client};
}

export function notifyClientSavedSuccessfully() {
    return {type: CLIENT_SAVE_SUCCEEDED};
}

export function notifyClientSaveFailed() {
    return {type: CLIENT_SAVE_FAILED};
}

export function clearClientSaved() {
    return {type: CLIENT_CLEAR_SAVED};
}

export function clearClientRemoved() {
    return {type: CLIENT_CLEAR_REMOVED};
}

export const CLIENT_FETCH_REQUESTED = 'CLIENT_FETCH_REQUESTED ';
export const CLIENT_FETCH_SUCCEEDED = 'CLIENT_FETCH_SUCCEEDED ';

export function requestClients(filterParams) {
    return {type: CLIENT_FETCH_REQUESTED, payload: filterParams};
}

export function receiveClients(clients, totalCount) {
    return {type: CLIENT_FETCH_SUCCEEDED, clients, totalCount};
}

export const CLIENT_DELETE_REQUESTED = 'CLIENT_DELETE_REQUESTED ';
export const CLIENT_DELETE_SUCCEEDED = 'CLIENT_DELETE_SUCCEEDED ';

export function requestDeleteClient(clientId) {
    return {type: CLIENT_DELETE_REQUESTED, clientId};
}

export function notifyClientDeletedSuccessfully(clientId) {
    return {type: CLIENT_DELETE_SUCCEEDED, clientId};
}

export const CLIENT_SEARCH_REQUESTED = 'CLIENT_SEARCH_REQUESTED';
export const CLIENT_SEARCH_SUCCEEDED = 'CLIENT_SEARCH_SUCCEEDED';

export function requestSearchClients(term, hasUser = false) {
    return {type: CLIENT_SEARCH_REQUESTED, term, hasUser};
}

export function receiveClientsOptions(clientsOptions) {
    return {type: CLIENT_SEARCH_SUCCEEDED, clientsOptions};
}


export const VISITS_FETCH_REQUESTED = 'VISITS_FETCH_REQUESTED';
export const VISITS_FETCH_SUCCEEDED = 'VISITS_FETCH_SUCCEEDED';

export function requestVisits(searchParams) {
    return {type: VISITS_FETCH_REQUESTED, searchParams};
}

export function receiveVisits(visits, status) {
    return {type: VISITS_FETCH_SUCCEEDED, visits, status};
}

export const MORE_VISITS_FETCH_REQUESTED = 'MORE_VISITS_FETCH_REQUESTED';
export const MORE_VISITS_FETCH_SUCCEEDED = 'MORE_VISITS_FETCH_SUCCEEDED';

export function requestMoreVisits(searchParams) {
    return {type: MORE_VISITS_FETCH_REQUESTED, searchParams};
}

export function receiveMoreVisits(visits, status) {
    return {type: MORE_VISITS_FETCH_SUCCEEDED, visits, status};
}

export const VISIT_STATUS_CHANGE_REQUESTED = 'VISIT_STATUS_CHANGE_REQUESTED';
export const VISIT_STATUS_CHANGE_SUCCEEDED = 'VISIT_STATUS_CHANGE_SUCCEEDED';

export function changeVisitStatus(visit) {
    return {type: VISIT_STATUS_CHANGE_REQUESTED, visit};
}

export function notifyVisitStatusChangedSuccesfully(visits, status) {
    return {type: VISIT_STATUS_CHANGE_SUCCEEDED, visits, status};
}

export const VISIT_SAVE_REQUESTED = 'VISIT_SAVE_REQUESTED';

export function saveVisit(visit) {
    return {type: VISIT_SAVE_REQUESTED, visit};
}

export const VISIT_UPDATE_REQUESTED = 'VISIT_UPDATE_REQUESTED';

export function updateVisit(visit)
{
    return {type: VISIT_UPDATE_REQUESTED, visit};
}

export const REQUEST_FAVOURITE_LOAD_REQUESTED = 'REQUEST_FAVOURITE_LOAD_REQUESTED';
export const RECEIVE_FAVOURITE_LOAD_SUCCESSED = 'RECEIVE_FAVOURITE_LOAD_SUCCESSED';

export function requestLoadFavourites(searchParams) {
    return {type: REQUEST_FAVOURITE_LOAD_REQUESTED, searchParams};
}

export function receiveLoadFavouritesSuccess(dwellings_favourite) {
    return {type: RECEIVE_FAVOURITE_LOAD_SUCCESSED, dwellings_favourite};
}

export const CLEAN_SEARCH_PARAMS = 'CLEAN_SEARCH_PARAMS';

export function cleanSearchParams() {
    return {type: CLEAN_SEARCH_PARAMS};
}

export const VISIT_DWELLING = 'VISIT_DWELLING';

export function visitDwelling(dwellingId) {
    return {type: VISIT_DWELLING, payload: dwellingId};
}
