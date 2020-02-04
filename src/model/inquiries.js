export default class Inquiries {
    _id = undefined;
    dwellingId = '';
    agencyId = '';
    whatsappcounter = '';
    mailcounter = '';
    date = '';
    constructor(obj) {
        Object.assign(this, obj);
    }
}
