/* global fetch ENDPOINT */

export default class Inquiries {
    static async fetch(searchfilter) {
        const response = await fetch(`${ENDPOINT}inquiries/fetch`, {
            method: 'post',
            credentials: 'same-origin',
            body: JSON.stringify({searchfilter}),
            headers: {
                'content-type': 'application/json'
            }
        });
        return response.json();
    }    

    static async fetchAgency(searchfilter) {
        const response = await fetch(`${ENDPOINT}inquiries/getAgency`, {
            method: 'post',
            credentials: 'same-origin',
            body: JSON.stringify({searchfilter}),
            headers: {
                'content-type': 'application/json'
            }
        });
        return response.json();
    }  

    static async findUser(param) {
        const response = await fetch(`${ENDPOINT}inquiries/finduser`, {
            method: 'post',
            credentials: 'same-origin',
            body: JSON.stringify({param}),
            headers: {
                'content-type': 'application/json'
            }
        });
        return response.json();
    }

    static async findDwellings(dwellingId) {
        const response = await fetch(`${ENDPOINT}inquiries/finddwelling`, {
            method: 'post',
            credentials: 'same-origin',
            body: JSON.stringify({dwellingId}),
            headers: {
                'content-type': 'application/json'
            }
        });
        return response.json();
    }

    static async findInquiries() {
        const response = await fetch(`${ENDPOINT}inquiries/fetch`, {
            method: 'post',
            credentials: 'same-origin',
            //body: JSON.stringify({dwellingId}),
            headers: {
                'content-type': 'application/json'
            }
        });
        return response.json();
    }
    static async addwhatsappcounter(counters) {
        const response = await fetch(`${ENDPOINT}inquiries/addwhatsappcounter`, {
            method: 'post',
            credentials: 'same-origin',
            body: JSON.stringify({counters}),
            headers: {
                'content-type': 'application/json'
            }
        });
        return response.json();
    }

    static async removeTempdata() {
        const response = await fetch(`${ENDPOINT}inquiries/removeTempdata`, {
            method: 'post',
            credentials: 'same-origin',
            headers: {
                'content-type': 'application/json'
            }
        });
        return 1;
    }
}
