/* global fetch ENDPOINT */

export default class ResetPasswordService {
    static async forgot(email) {
        const response = await fetch(`${ENDPOINT}forgot-password`, {
            method: 'post',
            credentials: 'same-origin',
            body: JSON.stringify({email}),
            headers: {
                'content-type': 'application/json'
            }
        });

        if (response.status !== 200) {
            throw response.statusText;
        } else {
            return response.json();
        }
    }

    static async reset(payload) {
        const response = await fetch(`${ENDPOINT}update-password`, {
            method: 'post',
            credentials: 'same-origin',
            body: JSON.stringify(payload),
            headers: {
                'content-type': 'application/json'
            }
        });

        if (response.status !== 200) {
            throw response.statusText;
        } else {
            return response.json();
        }
    }
}
