const webirr = require('../webirr');

function client() {
    const apiKey = process.env.WEBIRR_TEST_ENV_API_KEY || 'YOUR_API_KEY';
    const merchantId = process.env.WEBIRR_TEST_ENV_MERCHANT_ID || 'YOUR_MERCHANT_ID';

    return new webirr.WeBirrClient(merchantId, apiKey, true);
}

function sampleBill(billReference) {
    return {
        amount: '270.90',
        customerCode: 'cc01',  // it can be email address or phone number if you dont have customer code
        customerName: 'Elias Haileselassie',
        customerPhone: '0911000000',
        time: '2021-07-22 22:14',   // your bill time, always in this format
        description: 'hotel booking',
        billReference, // your unique reference number
        extras: {}
    };
}

function printError(res) {
    console.log(`error: ${res.error}`);
    console.log(`errorCode: ${res.errorCode}`); // can be used to handle specific busines error such as ERROR_INVLAID_INPUT
}

module.exports = {
    client,
    sampleBill,
    printError
};
