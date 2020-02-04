import Http from './http';

import {Dwelling} from '../model';

export default class DwellingService {
    static async fetch() {
        const {dwellings} = await Http.get('api/dwellings');
        return dwellings;
    }
    static async fetchFavorite(user) {
        const {dwellings} = await Http.get(`api/dwellings/favorite/${user}`);
        return dwellings;
    }
    static async save(dwelling) {
        if (dwelling._id) {
            return Http.put(`api/dwellings/${dwelling._id}`, {dwelling});
        }
        return Http.post('api/dwellings', {dwelling});
    }

    static async find(siocId) {
        const {dwelling} = await Http.get(`api/dwellings/${siocId}`);
        return {
            dwelling: new Dwelling(dwelling)
        };
    }

    static async findSearch(searchParams) {
        const {dwellings, totalCount, locations} = await Http.post('api/dwellings/search', {searchParams});

        return {dwellings, totalCount, locations};
    }

    static async findSiocId(siocId) {
        return Http.get(`api/dwellings/search/${siocId}`);
    }

    static async fetchLoadMore(searchParams) {
        const {dwellings, totalCount} = await Http.post('api/dwellings/loadmore', {searchParams});
        return {dwellings, totalCount};
    }

    static async fetchFavoriteMore(searchParams) {
        const {dwellings} = await Http.get('api/dwellings/clientFavorite/' + searchParams.client);
        return dwellings;
    }

    static async replaceCreator(changeParams) {
        const {dwelling} = await Http.put(`api/dwellings/replaceCreator/${changeParams.id}`, changeParams);
        return dwelling;
    }

    static async replaceAllCreators(changeParams) {
        return await Http.post('api/dwellings/replaceCreator/', changeParams);
    }

    static async sendMessage(data) {
        return Http.post('api/dwellings/message', data);
    }

    static async savePdfFile(data) {
        return Http.post('api/dwellings/convert-html', {data});
    }

    static async saveHeaderImage(data) {
        const {dwellingId, headerImage} = data;
        return Http.put(`api/dwellings/headerImage/${dwellingId}`, {headerImage});
    }
}
