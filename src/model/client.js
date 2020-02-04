export default class Client {
    _id = undefined;
    address = {};
    name = '';
    surname = '';
    email = '';
    contactSchedule = '';
    documentId = '';
    cuit = '';
    phone = '';
    birthdate = '';
    workPhone = '';
    cellPhone = '';
    observations = '';
    category = 'propietario';
    deleted = false;
    favorite = [];

    constructor(obj) {
        Object.assign(this, obj);
    }
}
