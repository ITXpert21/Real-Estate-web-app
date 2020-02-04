import {map} from 'lodash';
import Http from './http';

export default class ClientService {
  static async save(client) {
    if (client._id) {
      return Http.put(`api/clients/${client._id}`, {client});
    }
    const result = await Http.post('api/clients', {client});
    return result;
  }

  static async fetch(filterParams) {
    const {clients, totalCount} = await Http.get(`api/clients?page=${filterParams.payload.page}&size=${filterParams.payload.size}&category=${filterParams.payload.category}&search=${filterParams.payload.search}`);
    return {
      clients,
      totalCount
    };
  }

  static async delete(clientId) {
    return Http.put(`api/clients/delete/${clientId}`);
  }

  static async search(term, hasUser = false) {
    const {clients} = await Http.get(`api/clients/search?q=${term}&hasUser=${hasUser}`);
    return map(clients, client => ({
      value: client.value._id, label: `${client.value.name} ${client.value.surname} - ${client.value.email}`,
      favorite: client.value.favorite
    }));
  }

  static async favorite_to_clients(clientsOptions) {
    const result = await Http.post(`api/clients/favorite`, {clientsOptions});
    return result;
  }

  static async remove_favorite_from_client(data) {
    const result = await Http.post(`api/clients/remove_favorite`, data);
    return result;
  }

  static async get_client_favorite(clientId) {
    const {client} = await Http.get(`api/clients/favorite?id=${clientId}`);
    return client.favorite;
  }
}
