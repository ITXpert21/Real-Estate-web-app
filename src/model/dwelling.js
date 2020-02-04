export default class Dwelling {
    _id = undefined;
    siocId = undefined;
    publicationType = '';
    address = {};
    isCustomAddress = false;
    customAddress = '';
    type = '';
    subtype = '';
    currency = '';
    price = '';
    occupationStatus= '';
    dwellingStatus= '';
    siocBanner= false;
    agencyBanner= false;
    spaces = {};
    features = {};
    services = {};
    legal = {};
    images = [];
    generalDescription = '';
    privateDescription = '';
    intraDescription = '';
    agency = {};
    createdBy = {};
    client = {};
    occupationStatusHistory = [];
    tax = {aprTax: 0, absaTax: 0, arbaTax: 0};
    priceHistory = [];
    headerImage = {};
    constructor(obj) {
        Object.assign(this, obj);
    }
}
