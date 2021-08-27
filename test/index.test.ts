import {handler} from "../lambda";

describe('Testing the Index', () => {
    it('Checking if it runs', async () => {
        await handler()
        expect(true).toEqual(true);
    });
});