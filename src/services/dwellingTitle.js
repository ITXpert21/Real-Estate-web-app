export default class DwellingTitle {
    static get(dwelling, placeOfUsage = 'details') {
        let title = '';
        let titleFirstPart = '';
        let subtype = dwelling.subtype !== 'Departamento' ? dwelling.subtype : 'Depto.';
        let titleCustomAddressPart = '';
        let shortAddressLastPart = '';

        switch (dwelling.occupationStatus) {
            case 'Disponible':
                titleFirstPart = `en ${dwelling.publicationType}`;
                break;
            case 'Tasaciones':
                titleFirstPart = `en ${dwelling.occupationStatus}`;
                break;
            default:
                titleFirstPart = dwelling.occupationStatus;
                break;
        }

        switch (placeOfUsage) {
            case 'home':
                shortAddressLastPart = `, ${dwelling.address.streetName}`;

                titleCustomAddressPart = dwelling.isCustomAddress ?
                    ` en ${dwelling.customAddress}` :
                    `${shortAddressLastPart}`;

                title = `${subtype} ${titleFirstPart}${titleCustomAddressPart}`;
                break;
            case 'aside':
                shortAddressLastPart = `en ${dwelling.address.streetName} ${dwelling.address.streetNumber || ''}`;
                titleFirstPart = '';

                titleCustomAddressPart = dwelling.isCustomAddress ?
                    ` en ${dwelling.customAddress}` :
                    `${shortAddressLastPart}`;

                title = `${subtype} ${titleFirstPart}${titleCustomAddressPart}`;
                break;
            case 'latest':
                if (dwelling.address) {
                shortAddressLastPart = `en ${dwelling.address.streetName} ${dwelling.address.streetNumber || ''}`;
                }
                titleCustomAddressPart = dwelling.isCustomAddress ?
                    `${dwelling.customAddress}` :
                    `${shortAddressLastPart}`;

                title = `${subtype} ${titleFirstPart} ${titleCustomAddressPart}`;
                break;
            case 'favorite':
                titleCustomAddressPart = dwelling.isCustomAddress ?
                    dwelling.customAddress :
                    `${dwelling.address.streetName} ${dwelling.address.streetNumber}`;

                title = `${subtype} ${titleFirstPart} en ${titleCustomAddressPart}, ${dwelling.address.city}`;
                break;
            case 'mine':
                shortAddressLastPart = ` en ${dwelling.address.streetName}`;

                titleCustomAddressPart = dwelling.isCustomAddress ?
                    ` en ${dwelling.customAddress}` :
                    `${shortAddressLastPart}`;

                title = `${subtype} ${titleFirstPart}${titleCustomAddressPart}`;
                break;
            default:
                // eslint-disable-next-line prefer-destructuring
                subtype = dwelling.subtype;

                titleCustomAddressPart = dwelling.isCustomAddress ?
                    dwelling.customAddress :
                    `${dwelling.address.streetName} ${dwelling.address.streetNumber}`;

                title = `${subtype} ${titleFirstPart} en ${titleCustomAddressPart}, ${dwelling.address.city}`;
                break;
        }
        return title;
    }
}
