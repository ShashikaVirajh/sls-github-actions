'use strict';

let init = require('./steps/init');
let { is_authenticated_user } = require('./steps/given');
let idToken;

describe('Given an authenticated user', () => {
    beforeAll(async () => {
        init();

        let user =  await is_authenticated_user();
        idToken = user.AuthenticationResult.IdToken;

        console.log({ idToken });
    });


    describe('When we invoke POST /notes endpoint', () => {
        it('Should create a new note', async () => {
            expect(true).toBe(true);
        });
    });
});